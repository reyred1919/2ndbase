
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'نام کاربری و رمز عبور الزامی است.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'این نام کاربری قبلا ثبت شده است.' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    await db.insert(users).values({
      username: username,
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'کاربر با موفقیت ایجاد شد.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'خطای داخلی سرور' }, { status: 500 });
  }
}
