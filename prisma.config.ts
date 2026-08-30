import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// NOTA: o CLI da v7 não conecta em libsql:// (Turso) via db push/migrate.
// Para aplicar o schema no Turso use: npm run db:apply (scripts/apply-schema.mjs)
// O datasource abaixo é usado apenas para validação do CLI.
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: 'file:./prisma/dev.db',
  },
});