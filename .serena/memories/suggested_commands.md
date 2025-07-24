# Essential Development Commands

## Development Server
```bash
npm run dev                    # Start development server on localhost:3000
npm run build                  # Build production version
npm run start                  # Start production server
```

## Testing
```bash
npm run test                   # Run Jest unit tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage report
npm run test:e2e               # Run Playwright end-to-end tests
npm run test:e2e:ui            # Run E2E tests with UI
npm run test:e2e:headed        # Run E2E tests in headed mode
npm run test:e2e:debug         # Debug E2E tests
```

## Code Quality
```bash
npm run lint                   # Run ESLint
npm run analyze                # Analyze bundle size
npm run build:analyze          # Build with bundle analysis
```

## Database Management
```bash
npm run db:setup               # Set up database (auto-detects Docker/native)
npm run db:setup:docker        # Set up with Docker
npm run db:setup:native        # Set up with native PostgreSQL
npm run db:status              # Check database status
npm run db:backup              # Backup local database
npm run db:sync:to-cloud       # Sync local to cloud
npm run db:sync:from-cloud     # Sync cloud to local
npm run db:create-user         # Create test user
npm run db:cli                 # Database CLI tool
npm run db:users               # List database users
npm run db:migrate             # Run database migrations
```

## macOS-Specific Commands
```bash
# System utilities (Darwin)
ls -la                         # List files with details
find . -name "*.ts" -type f    # Find TypeScript files
grep -r "pattern" src/         # Search in source files
ps aux | grep node            # Find Node.js processes
lsof -i :3000                 # Check what's using port 3000
```

## Git Workflow
```bash
git status                     # Check repository status
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push origin branch-name    # Push to remote
git pull origin main           # Pull latest changes
```