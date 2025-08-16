# Technology Stack

## Frontend Framework

- **Next.js 15.4.3**: React-based full-stack framework with App Router
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe JavaScript development

## Styling & UI

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Design System**: Reusable components in `src/components/design-system/`
- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: Theme provider with dark/light modes

## Authentication & Security

- **NextAuth.js 5.0**: Authentication library with multiple providers
- **bcryptjs**: Password hashing
- **JWT**: Token-based authentication
- **Rate Limiting**: API protection with configurable limits
- **Security Headers**: CSP, CORS, and other security measures

## Database & Data

- **PostgreSQL**: Primary database with connection pooling
- **Local Storage**: Demo mode data persistence
- **Zod**: Runtime type validation and schema validation

## Charts & Visualization

- **Recharts**: React charting library for payoff visualizations
- **Custom PayoffChart**: Specialized mortgage/HELOC comparison charts

## Testing

- **Jest**: Unit testing framework
- **Playwright**: End-to-end testing
- **React Testing Library**: Component testing utilities

## Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting (implied by consistent formatting)
- **SWC**: Fast TypeScript/JavaScript compiler

## Deployment & Infrastructure

- **Docker**: Containerization support
- **PM2**: Process management (ecosystem.config.js)
- **Nginx**: Reverse proxy configuration
- **GitHub Actions**: CI/CD pipeline
