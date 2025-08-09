import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import Leadership from '@/app/models/Leadership';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const leadership = await Leadership.find({});
    return NextResponse.json(leadership, { status: 200 });
  } catch (error) {
    console.error('Error fetching leadership data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch leadership data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    const leadership = await Leadership.create(body);
    return NextResponse.json(leadership, { status: 201 });
  } catch (error) {
    console.error('Error creating leadership data:', error);
    return NextResponse.json(
      { message: 'Failed to create leadership data' },
      { status: 500 }
    );
  }
} 