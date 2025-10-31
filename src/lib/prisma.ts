import { PrismaClient } from '@prisma/client';

const createClient = () =>
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL || 'file:./prisma/dev.db' } },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

declare global {
  var prisma: PrismaClient | undefined;  
}

export const prisma = global.prisma ?? createClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
