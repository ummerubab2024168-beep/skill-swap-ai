import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';
import SwapRequest from '@/models/SwapRequest';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    // 1. Check Authorization Header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // 2. Verify JWT Token
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const currentUserId = decoded.id;

    // 3. Parse request body to get skillId
    const body = await req.json();
    const { skillId } = body;

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    // 4. Connect to MongoDB
    await dbConnect();

    // 5. Find the selected skill
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const receiverId = skill.owner;

    // 6. Validation: Prevent sending a request to your own skill
    if (receiverId.toString() === currentUserId.toString()) {
      return NextResponse.json({ error: 'You cannot send a swap request for your own skill' }, { status: 400 });
    }

    // 7. Validation: Prevent duplicate pending requests for the same skill by the same sender
    const existingRequest = await SwapRequest.findOne({
      sender: currentUserId,
      skill: skillId,
      status: 'Pending',
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'A pending swap request already exists for this skill' }, { status: 400 });
    }

    // 8. Create and Save New Swap Request
    const newSwapRequest = await SwapRequest.create({
      sender: currentUserId,
      receiver: receiverId,
      skill: skillId,
      status: 'Pending',
    });

    return NextResponse.json({ 
      message: 'Swap request sent successfully', 
      data: newSwapRequest 
    }, { status: 201 });

  } catch (error) {
    console.error('Send Swap Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}