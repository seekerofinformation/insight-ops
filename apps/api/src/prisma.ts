import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { readRequiredSecret } from "./config/read-secret.js";

const databaseUrl = readRequiredSecret("DATABASE_URL");

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const prisma = new PrismaClient({ adapter });
