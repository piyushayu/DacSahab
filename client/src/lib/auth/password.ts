import "server-only";

import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function burnPasswordCheck(password: string): Promise<void> {
  const dummy =
    "$2b$12$C6UzMDM.H6dfI/f/IKcEe.9n4r3Q0W8Q4G7p5fJ1oQ2b8V0m8s8QK";
  await bcrypt.compare(password, dummy);
}
