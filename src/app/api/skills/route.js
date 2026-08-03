// src/app/api/skills/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    // 1. Database Connect
    await dbConnect();

    // 2. Auth Check (Token verification)
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Request Body parse
    const body = await req.json();

    // 4. Create Skill linked to User
    const newSkill = await Skill.create({
      ...body,
      owner: decoded.id
    });

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save skill' }, { status: 500 });
  }
}
// src/app/api/skills/route.js ke andar ye add karein

export async function GET(req) {
  try {
    await dbConnect();
    
    // Auth Check
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Sirf us user ki skills nikalna jiska token hai
    const skills = await Skill.find({ owner: decoded.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(skills, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}