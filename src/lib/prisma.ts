import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaGlobal?: PrismaClient;
};

function getClient(): PrismaClient {
  if (globalForPrisma.prismaGlobal) return globalForPrisma.prismaGlobal;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL manquante.");
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10_000,
    }),
  });

  globalForPrisma.prismaGlobal = client;
  return client;
}

/**
 * Client lazy : kaytkhle9 ghir f l awel query.
 * Bach `next build` ma ytta7ch ila DATABASE_URL mazal ma kaynach.
 */
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;