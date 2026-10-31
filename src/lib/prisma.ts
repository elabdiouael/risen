import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaGlobal?: PrismaClient;
};

/** Pooled en priorité (serverless), sinon direct */
function resolveUrl(): string | undefined {
  return (
    process.env.DATABASE_URL_POOLED ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL
  );
}

function getClient(): PrismaClient {
  if (globalForPrisma.prismaGlobal) return globalForPrisma.prismaGlobal;

  const connectionString = resolveUrl();
  if (!connectionString) {
    throw new Error("Aucune URL de base de données trouvée.");
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

/** Client lazy : créé à la première requête */
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;