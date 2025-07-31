import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';

// Demo users configuration
const DEMO_USERS = [
  {
    email: 'demo@example.com',
    password: 'demo123',
    displayName: 'Demo User'
  },
  {
    email: 'john@example.com',
    password: 'password123',
    displayName: 'John Smith'
  },
  {
    email: 'jane@example.com',
    password: 'password123',
    displayName: 'Jane Doe'
  }
];

export async function GET(request: NextRequest) {
  try {
    // List all users
    const response = await stackServerApp.listUsers();
    
    // Handle different response formats
    const userList = Array.isArray(response) ? response : (response.items || []);
    
    // Check which demo users exist
    const demoUserStatus = DEMO_USERS.map(demoUser => {
      const exists = userList.some(u => u.primaryEmail === demoUser.email);
      return {
        email: demoUser.email,
        exists
      };
    });
    
    return NextResponse.json({
      success: true,
      totalUsers: userList.length,
      demoUserStatus,
      users: userList.map(u => ({
        id: u.id,
        email: u.primaryEmail,
        displayName: u.displayName,
        emailVerified: u.primaryEmailVerified
      }))
    });
  } catch (error: any) {
    console.error('Error listing users:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'create') {
      const results = [];
      
      for (const userData of DEMO_USERS) {
        try {
          console.log(`Creating user: ${userData.email}`);
          
          const result = await stackServerApp.createUser({
            primaryEmail: userData.email,
            password: userData.password,
            primaryEmailVerified: true,
            displayName: userData.displayName,
            clientMetadata: {
              isDemoAccount: true
            }
          });
          
          results.push({
            email: userData.email,
            success: true,
            id: result.id
          });
        } catch (error: any) {
          results.push({
            email: userData.email,
            success: false,
            error: error.message
          });
        }
      }
      
      return NextResponse.json({
        success: true,
        results
      });
    } else if (action === 'delete') {
      // Stack Auth doesn't provide a direct delete method in the client SDK
      // You would need to use their admin API for this
      return NextResponse.json({
        success: false,
        error: 'User deletion requires Stack Auth admin API access'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "create" or "delete"'
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in demo user management:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}