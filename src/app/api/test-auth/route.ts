import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No user found',
        cookies: request.headers.get('cookie')
      });
    }
    
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.primaryEmail,
        displayName: user.displayName
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Testing authentication for:', email);
    
    // Try to authenticate the user
    try {
      // Stack Auth doesn't provide a direct authentication method in the server SDK
      // Authentication is handled through their client components
      // We can only verify if the user exists
      
      const users = await stackServerApp.listUsers();
      const userExists = users.some(u => u.primaryEmail === email);
      
      return NextResponse.json({
        success: true,
        message: `User ${email} exists: ${userExists}`,
        note: 'Authentication must be done through Stack Auth client components',
        totalUsers: users.length,
        matchingUsers: users.filter(u => u.primaryEmail === email).length
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: error.message
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request'
    }, { status: 400 });
  }
}