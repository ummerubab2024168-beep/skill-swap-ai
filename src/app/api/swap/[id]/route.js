import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SwapRequest from '@/models/SwapRequest';
import jwt from 'jsonwebtoken';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

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

    // 3. Parse request body to get status action ('Accepted', 'Rejected', or 'Cancelled')
    const body = await req.json();
    const { status } = body;

    if (!['Accepted', 'Rejected', 'Cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
    }

    // 4. Connect to MongoDB
    await dbConnect();

    // 5. Find the Swap Request
    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return NextResponse.json({ error: 'Swap request not found' }, { status: 404 });
    }

    // 6. Validation & Role Checks
    if (status === 'Cancelled') {
      // Only sender can cancel, and only if it's currently Pending
      if (swapRequest.sender.toString() !== currentUserId.toString()) {
        return NextResponse.json({ error: 'Only the sender can cancel this request' }, { status: 403 });
      }
      if (swapRequest.status !== 'Pending') {
        return NextResponse.json({ error: 'Only pending requests can be cancelled' }, { status: 400 });
      }
    } else {
      // Accept or Reject: Only receiver can do this
      if (swapRequest.receiver.toString() !== currentUserId.toString()) {
        return NextResponse.json({ error: 'Only the receiver can accept or reject this request' }, { status: 403 });
      }
      // Cannot modify requests that are already finalized
      if (swapRequest.status !== 'Pending') {
        return NextResponse.json({ error: 'This request has already been processed' }, { status: 400 });
      }
    }

    // 7. Update Status (Mongoose will automatically update updatedAt due to timestamps: true)
    swapRequest.status = status;
    await swapRequest.save();

    return NextResponse.json({ 
      message: `Swap request ${status.toLowerCase()} successfully`, 
      data: swapRequest 
    }, { status: 200 });

  } catch (error) {
    console.error('Update Swap Request Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}