import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

/**
 * URL e token do Turso (SQLite na nuvem).
 * Aceita os nomes padrão (TURSO_DATABASE_URL/TURSO_AUTH_TOKEN)
 * ou os que o projeto usa na Vercel (DATABASE_URL/TOKEN_SECRET).
 */
const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN || process.env.TOKEN_SECRET;

const hasDb = Boolean(url && token);

// Singleton do PrismaClient (evita múltiplas conexões no hot-reload do dev)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient | null = (() => {
  if (!hasDb) return null;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = new PrismaClient({
    adapter: new PrismaLibSql({
      url: url!,
      authToken: token!,
    }),
  });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  return client;
})();