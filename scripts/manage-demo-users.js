const { StackServerApp } = require('@stackframe/stack');
require('dotenv').config({ path: '.env.local' });

// Initialize Stack Auth
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

async function listUsers() {
  try {
    console.log('Fetching users from Stack Auth...\n');
    const response = await stackApp.listUsers();
    const users = response.items || response || [];
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.primaryEmail || user.primary_email} (ID: ${user.id})`);
    });
    
    return users;
  } catch (error) {
    console.error('Error listing users:', error.message);
    return [];
  }
}

async function createUser(userData) {
  try {
    console.log(`\nCreating user: ${userData.email}`);
    
    // Create the user with Stack Auth
    const result = await stackApp.createUser({
      primaryEmail: userData.email,
      password: userData.password,
      emailVerified: true,
      displayName: userData.displayName
    });
    
    console.log(`✅ Successfully created: ${userData.email}`);
    return result;
  } catch (error) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log(`⚠️  User ${userData.email} already exists`);
      
      // Try to update the password instead
      try {
        const users = await stackApp.listUsers();
        const existingUser = users.find(u => 
          u.primaryEmail === userData.email || u.primary_email === userData.email
        );
        
        if (existingUser) {
          console.log(`   Attempting to update password for existing user...`);
          // Note: Password update might require different permissions
          console.log(`   Note: Password update requires user authentication or admin access`);
        }
      } catch (updateError) {
        console.log(`   Could not update password:`, updateError.message);
      }
    } else {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
    return null;
  }
}

async function main() {
  const action = process.argv[2];
  
  console.log('Stack Auth Demo User Management');
  console.log('================================\n');
  
  if (!process.env.STACK_PROJECT_ID || !process.env.STACK_SECRET_SERVER_KEY) {
    console.error('ERROR: Missing Stack Auth environment variables!');
    console.error('Make sure STACK_PROJECT_ID and STACK_SECRET_SERVER_KEY are set in .env.local');
    process.exit(1);
  }
  
  switch (action) {
    case 'list':
      await listUsers();
      break;
      
    case 'create':
      console.log('Creating demo users...');
      
      for (const userData of DEMO_USERS) {
        await createUser(userData);
      }
      
      console.log('\n✨ Demo user setup complete!\n');
      console.log('You can now login with:');
      console.log('=======================');
      DEMO_USERS.forEach(user => {
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${user.password}`);
        console.log('---');
      });
      break;
      
    case 'check':
      console.log('Checking Stack Auth connection...');
      try {
        const users = await listUsers();
        console.log(`\n✅ Successfully connected to Stack Auth!`);
        
        // Check which demo users exist
        console.log('\nDemo user status:');
        for (const demoUser of DEMO_USERS) {
          const exists = users.some(u => 
            u.primaryEmail === demoUser.email || u.primary_email === demoUser.email
          );
          console.log(`- ${demoUser.email}: ${exists ? '✅ Exists' : '❌ Not found'}`);
        }
      } catch (error) {
        console.error('❌ Failed to connect to Stack Auth:', error.message);
      }
      break;
      
    default:
      console.log('Usage: node scripts/manage-demo-users.js [command]');
      console.log('\nCommands:');
      console.log('  list   - List all users in Stack Auth');
      console.log('  create - Create demo users with known passwords');
      console.log('  check  - Check Stack Auth connection and demo user status');
      console.log('\nExample:');
      console.log('  node scripts/manage-demo-users.js create');
  }
}

main().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});