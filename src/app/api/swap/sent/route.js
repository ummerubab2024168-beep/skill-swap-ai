import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SwapRequest from '@/models/SwapRequest';
import User from '@/models/User';
import Skill from '@/models/Skill';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const requests = await SwapRequest.find({ sender: decoded.id })
      .populate('receiver', 'name email location')
      .populate('skill', 'title category proficiencyLevel description')
      .sort({ createdAt: -1 });

    return NextResponse.json({ data: requests }, { status: 200 });
  } catch (error) {
    console.error('Fetch Sent Requests Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}