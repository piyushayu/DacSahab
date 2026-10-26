import { NextResponse } from "next/server";

import { toSessionAccount } from "@/lib/auth/accounts";
import { getCurrentAccount } from "@/lib/dal";

export async function GET() {
  const current = await getCurrentAccount();
  if (!current) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const account = toSessionAccount(current.record);

  if (current.record.kind === "USER") {
    const { user } = current.record;
    return NextResponse.json({
      authenticated: true,
      account: {
        id: user.id,
        kind: "USER",
        role: user.role,
        name: user.name,
        email: user.email,
        image: user.image,
        onboardingCompleted: user.onboardingCompleted,
      },
      session: account,
    });
  }

  const { doctor } = current.record;
  return NextResponse.json({
    authenticated: true,
    account: {
      id: doctor.id,
      kind: "DOCTOR",
      role: doctor.role,
      name: doctor.name,
      email: doctor.email,
      image: doctor.image,
      onboardingCompleted: doctor.onboardingCompleted,
      verified: doctor.verified,
    },
    session: account,
  });
}
