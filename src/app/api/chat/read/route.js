import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const currentUserId = decoded.id;
    const body = await req.json();
    const { senderId } = body;

    if (!senderId) {
      return NextResponse.json({ error: 'Sender ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Mark all unread messages from this sender to current user as read
    await Message.updateMany(
      { sender: senderId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true, message: 'Messages marked as read' }, { status: 200 });

  } catch (error) {
    console.error('Mark as Read Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}