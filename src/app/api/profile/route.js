import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    return NextResponse.json(user);
  } catch (e) { 
    return NextResponse.json({ error: "Unauthorized: " + e.message }, { status: 401 }); 
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    
    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updateData = await req.json();
    
    if (updateData.skills && typeof updateData.skills === 'string') {
        updateData.skills = updateData.skills.split(',').map(s => s.trim());
    }

    const updatedUser = await User.findByIdAndUpdate(decoded.id, { $set: updateData }, { new: true }).select("-password");
    return NextResponse.json(updatedUser);
  } catch (e) { 
    return NextResponse.json({ error: "Update failed: " + e.message }, { status: 500 }); 
  }
}