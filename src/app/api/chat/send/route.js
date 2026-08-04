import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
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

    // 3. Parse Request Body
    const body = await req.json();
    const { receiverId, message } = body;

    // 4. Validation
    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Prevent sending message to oneself
    if (receiverId.toString() === currentUserId.toString()) {
      return NextResponse.json({ error: 'You cannot send a message to yourself' }, { status: 400 });
    }

    // 5. Connect to MongoDB
    await dbConnect();

    // 6. Create and Save Message
    const newMessage = await Message.create({
      sender: currentUserId,
      receiver: receiverId,
      message: message.trim(),
    });

    return NextResponse.json({ 
      message: 'Message sent successfully', 
      data: newMessage 
    }, { status: 201 });

  } catch (error) {
    console.error('Send Message Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}