import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';

export async function GET(req) {
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

    // 3. Get target user ID from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Target User ID is required' }, { status: 400 });
    }

    // 4. Connect to MongoDB
    await dbConnect();

    // 5. Fetch messages between logged-in user and target user, excluding messages deleted for the current user
    const messages = await Message.find({
      $and: [
        {
          $or: [
            { sender: currentUserId, receiver: userId },
            { sender: userId, receiver: currentUserId },
          ],
        },
        {
          deletedFor: { $ne: currentUserId },
        },
      ],
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 })
      .lean(); // Oldest first for chat flow

    return NextResponse.json({ data: messages }, { status: 200 });

  } catch (error) {
    console.error('Fetch Conversation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}