import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';
import SwapRequest from '@/models/SwapRequest';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    // 1. Check Authorization Header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // 2. Verify Token
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const currentUserId = decoded.id;

    // 3. Connect to MongoDB
    await dbConnect();

    // 4. Fetch skills where owner does NOT match the logged-in user
    const skills = await Skill.find({ owner: { $ne: currentUserId } })
      .populate('owner', 'name location')
      .select('title category proficiencyLevel description owner')
      .lean();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ message: 'No skills found from other users', data: [] }, { status: 200 });
    }

    // 5. Fetch all active requests (Pending or Accepted) sent by the current user
    const userActiveRequests = await SwapRequest.find({
      sender: currentUserId,
      status: { $in: ['Pending', 'Accepted'] }
    });

    // Map skill ID to its request status ('Pending' or 'Accepted')
    const requestStatusMap = {};
    userActiveRequests.forEach(req => {
      requestStatusMap[req.skill.toString()] = req.status;
    });

    // 6. Format the response and include request status
    const formattedSkills = skills.map(skill => {
      const skillIdStr = skill._id.toString();
      const requestStatus = requestStatusMap[skillIdStr] || null;

      return {
        _id: skill._id,
        skillName: skill.title,
        category: skill.category,
        level: skill.proficiencyLevel,
        description: skill.description,
        ownerName: skill.owner?.name || 'Unknown',
        ownerLocation: skill.owner?.location || 'Unknown',
        hasRequested: !!requestStatus, // true if Pending or Accepted
        requestStatus: requestStatus // 'Pending', 'Accepted', or null
      };
    });

    return NextResponse.json({ data: formattedSkills }, { status: 200 });

  } catch (error) {
    console.error('Browse Skills API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}