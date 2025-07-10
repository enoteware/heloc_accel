# HELOC Accelerator

A Next.js application that helps homeowners analyze and compare traditional mortgage payoff strategies with HELOC (Home Equity Line of Credit) acceleration strategies.

## Features

- **Mortgage Analysis**: Compare traditional vs HELOC acceleration strategies
- **Interactive Calculations**: Real-time financial calculations and projections
- **Visual Charts**: Clear visualizations of payoff timelines and savings
- **User Authentication**: Secure user accounts to save scenarios
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: VPS with Node.js and PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 13+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/heloc-accelerator.git
   cd heloc-accelerator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your database and authentication settings.

4. Set up the database:
   ```bash
   npm run db:migrate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This application is designed to be deployed on a VPS with:

1. Node.js runtime
2. PostgreSQL database
3. Nginx reverse proxy
4. PM2 process manager

See the deployment documentation for detailed setup instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub.
