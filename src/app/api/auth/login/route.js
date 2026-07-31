// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // 1. Library import ki
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // 2. Token generate kiya
    const token = jwt.sign(
      { id: user._id, email: user.email }, // Yeh data token mein store hoga
      process.env.JWT_SECRET,             // Aapki secret key
      { expiresIn: '1h' }                  // Token 1 ghante tak chalega
    );

    // 3. Token response mein wapis bheja
    return NextResponse.json({ message: "Login successful", token }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Error logging in" }, { status: 500 });
  }
}