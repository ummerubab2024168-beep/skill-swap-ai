import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Skill from '@/models/Skill';
import jwt from 'jsonwebtoken';

// GET: Fetch single skill by ID
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const skill = await Skill.findOne({ _id: id, owner: decoded.id });
    
    if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    
    return NextResponse.json(skill, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skill' }, { status: 500 });
  }
}

// PUT: Update single skill by ID
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const body = await req.json();

    const updatedSkill = await Skill.findOneAndUpdate(
      { _id: id, owner: decoded.id },
      { $set: body },
      { new: true }
    );

    if (!updatedSkill) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

    return NextResponse.json(updatedSkill, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
  }
}
// DELETE: Delete single skill by ID
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Auth Check
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Delete only if the skill belongs to the logged-in user
    const deletedSkill = await Skill.findOneAndDelete({ _id: id, owner: decoded.id });

    if (!deletedSkill) return NextResponse.json({ error: 'Skill not found or unauthorized' }, { status: 404 });

    return NextResponse.json({ message: 'Skill deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}