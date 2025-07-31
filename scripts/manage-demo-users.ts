import { StackServerApp } from '@stackframe/stack';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Stack Auth with the same configuration as the app
const stackApp = new StackServerApp({
  tokenStore: 'nextjs-cookie',
  urls: {
    signIn: "/en/handler/sign-in",
    signUp: "/en/handler/sign-up",
    afterSignIn: "/en/calculator",
    afterSignUp: "/en/calculator",
    afterSignOut: "/"
  }
});

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

async function deleteUser(email: string) {
  try {
    // Get all users to find the one with matching email
    const users = await stackApp.listUsers();
    const user = users.find(u => u.primaryEmail === email);
    
    if (user) {
      console.log(`Found user ${email} with ID: ${user.id}`);
      // Stack Auth doesn't have a direct delete method in the client SDK
      // We'll need to use the API directly or mark as inactive
      console.log(`Note: User deletion requires admin API access`);
      return user.id;
    } else {
      console.log(`User ${email} not found`);
      return null;
    }
  } catch (error) {
    console.error(`Error finding user ${email}:`, error);
    return null;
  }
}

async function createUser(userData: typeof DEMO_USERS[0]) {
  try {
    console.log(`Creating user: ${userData.email}`);
    
    // Try to create the user
    const result = await stackApp.createUser({
      primaryEmail: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      clientMetadata: {
        isDemoAccount: true
      }
    });
    
    console.log(`✅ Created user: ${userData.email}`);
    return result;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log(`⚠️  User ${userData.email} already exists`);
    } else {
      console.error(`❌ Error creating user ${userData.email}:`, error.message);
    }
    return null;
  }
}

async function main() {
  console.log('Stack Auth Demo User Management\n');
  
  const action = process.argv[2];
  
  if (action === 'list') {
    console.log('Listing all users...\n');
    try {
      const users = await stackApp.listUsers();
      console.log(`Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`- ${user.primaryEmail} (ID: ${user.id})`);
      });
    } catch (error) {
      console.error('Error listing users:', error);
    }
  } else if (action === 'create') {
    console.log('Creating demo users...\n');
    
    for (const userData of DEMO_USERS) {
      await createUser(userData);
    }
    
    console.log('\nDemo user creation complete!');
    console.log('\nYou can now login with:');
    DEMO_USERS.forEach(user => {
      console.log(`- Email: ${user.email}, Password: ${user.password}`);
    });
  } else if (action === 'delete') {
    console.log('Finding demo users for deletion...\n');
    
    for (const userData of DEMO_USERS) {
      await deleteUser(userData.email);
    }
    
    console.log('\nNote: User deletion requires admin API access.');
    console.log('You may need to delete users manually from the Stack Auth dashboard.');
  } else {
    console.log('Usage: npm run manage-users [list|create|delete]');
    console.log('  list   - List all users');
    console.log('  create - Create demo users');
    console.log('  delete - Find demo users (deletion requires admin access)');
  }
}

// Run the script
main().catch(console.error);