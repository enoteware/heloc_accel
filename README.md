# HELOC Accelerator

A comprehensive web application for analyzing HELOC (Home Equity Line of Credit) acceleration strategies to pay off mortgages faster and save on interest payments.

## 🚀 Features

### Core Functionality

- **HELOC Acceleration Calculator**: Compare traditional mortgage payments vs HELOC acceleration strategy
- **Interactive Results**: Visual charts showing mortgage balance over time with Chart.js
- **Scenario Management**: Save, edit, and manage multiple calculation scenarios

### User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Form Prefill**: One-click demo data population for quick testing
- **Real-time Validation**: Comprehensive form validation with helpful error messages
- **Accessibility**: WCAG-compliant design with proper contrast ratios and ARIA labels

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom Design System
- **Authentication**: Stack Auth for secure user management
- **Charts**: Chart.js with React Chart.js 2
- **Database**: PostgreSQL with NEON
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel-ready

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

## 🎯 Features

### Calculator Features

1. **Input Your Data**: Enter mortgage details, income, and expenses
2. **Fill Demo Data**: Use the prefill button for quick testing
3. **Calculate Strategy**: Compare traditional vs HELOC acceleration
4. **Save Scenarios**: Store calculations for future reference
5. **View Results**: Interactive charts and detailed analysis

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
