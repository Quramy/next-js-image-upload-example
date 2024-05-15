import { PrismaClient } from "@prisma/client";

export const primsa = new PrismaClient({
  log: ["error", "warn", "info", "query"],
});
