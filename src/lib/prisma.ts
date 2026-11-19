import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Next.js development hot reload can preserve a PrismaClient created from the
// previous schema. Replace that cached client after generating new models.
const cachedClient = globalForPrisma.prisma as
  | (PrismaClient & { financeAccount?: unknown; category?: unknown })
  | undefined;

export const prisma = cachedClient?.financeAccount && cachedClient.category
  ? cachedClient
  : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
