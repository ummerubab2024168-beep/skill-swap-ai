import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; 
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log("Request Body:", body); // Ye check karein kya data aa raha hai

    const { name, email, password } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const newUser = await User.create({ name, email, password });
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });

  } catch (error) {
    // YE LINE ASALI ERROR DIKHAYEGI
    console.error("DEBUG ERROR:", error); 
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}