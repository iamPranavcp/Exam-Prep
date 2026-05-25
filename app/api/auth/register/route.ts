import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !password || password.length < 6) {
    return NextResponse.json({ error: "Enter a valid email and a password with at least 6 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });

  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash: await bcrypt.hash(password, 10) },
  });
  await setSession(user.id);
  return NextResponse.json({ ok: true });
}
