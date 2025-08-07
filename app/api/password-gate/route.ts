import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const prototypePassword = process.env.PROTOTYPE_PASSWORD;
    
    // If no prototype password is set, allow access
    if (!prototypePassword) {
      return NextResponse.json({ success: true });
    }
    
    // Check if password matches
    if (password === prototypePassword) {
      // Set a secure HTTP-only cookie that expires in 7 days
      const cookieStore = await cookies();
      cookieStore.set('prototype-access', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}