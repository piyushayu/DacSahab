import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const ADMIN_EMAIL = "admin@dacsahab.local";
const ADMIN_PASSWORD = "Admin@12345";

async function main() {
  const existing = await prisma.loginIdentity.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: "DacSahab Admin",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    },
  });

  await prisma.loginIdentity.create({
    data: { email: ADMIN_EMAIL, kind: "USER", userId: user.id },
  });

  console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
