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

const Adminemail = process.env.ADMIN_EMAIL as string || "admin@gmail.com";
const Adminpassword = process.env.ADMIN_PASSWORD as string || "admin1234";

async function main() {
  const existing = await prisma.loginIdentity.findUnique({
    where: { email: Adminemail },
  });

  if (existing) {
    console.log("Email already exist");
    return;
  }

  const passwordHash = await bcrypt.hash(Adminpassword, 12);

  const user = await prisma.user.create({
    data: {
      email: Adminemail,
      name: "DacSahab Admin",
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    },
  });

  await prisma.loginIdentity.create({
    data: { email: Adminemail, kind: "USER", userId: user.id },
  });

  console.log(`Admin created: ${Adminemail} `);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
