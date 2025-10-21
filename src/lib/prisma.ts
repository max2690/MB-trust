import { PrismaClient } from '@prisma/client';

const createClient = () =>
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
