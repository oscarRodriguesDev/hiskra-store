import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Aplica o schema do Prisma no banco Turso (libSQL) via HTTP.
// O `prisma db push` padrão não conecta em libsql://, então usamos
// `prisma migrate diff` (offline) + pipeline HTTP do Turso.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { DATABASE_URL, TOKEN_SECRET } = process.env;
if (!DATABASE_URL || !TOKEN_SECRET) {
  console.error('Defina DATABASE_URL (libsql://...) e TOKEN_SECRET no .env');
  process.exit(1);
}

// 1) Gera o SQL do schema (invoca o CLI do Prisma via Node, cross-platform)
const prismaCli = path.join(root, 'node_modules', 'prisma', 'build', 'index.js');
const sql = execFileSync(
  process.execPath,
  [prismaCli, 'migrate', 'diff', '--from-empty', '--to-schema', 'prisma/schema.prisma', '--script'],
  { cwd: root, encoding: 'utf8' }
);

// 2) Torna idempotente e aplica no Turso via pipeline HTTP
const httpUrl = DATABASE_URL.replace('libsql://', 'https://');
const idempotent = sql.replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "');
const stmts = idempotent
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => ({ type: 'execute', stmt: { sql: s, args: [] } }));

// 3) Migração aditiva de colunas que já existem em bancos antigos
//    (o CREATE TABLE IF NOT EXISTS não altera tabelas existentes).
const MIGRATIONS = [
  // Adiciona a coluna "images" (galeria) — NOT NULL com default, idempotente
  `ALTER TABLE ml_store ADD COLUMN images TEXT NOT NULL DEFAULT '[]'`,
];
for (const m of MIGRATIONS) {
  stmts.push({ type: 'execute', stmt: { sql: m, args: [] } });
}

const res = await fetch(`${httpUrl}/v2/pipeline`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN_SECRET}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ requests: stmts }),
  signal: AbortSignal.timeout(30000),
});
const data = await res.json();
const erro = data.results?.find((r) => r.type === 'error');
if (erro) {
  // ALTER TABLE falha com "duplicate column name" quando a coluna já existe — aceitável
  const msg = JSON.stringify(erro.error || '');
  if (!/duplicate column/i.test(msg)) {
    console.error('Falha ao aplicar schema:', msg);
    process.exit(1);
  }
  console.log('Schema aplicado (aviso: coluna já existia — ok)');
} else {
  console.log('Schema aplicado com sucesso no Turso');
}