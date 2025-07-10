# Product Requirements Document: HELOC Accelerator

**Author:** Gemini  
**Date:** July 10, 2025  
**Version:** 1.0

## 1. Introduction & Vision

### 1.1. Vision

To empower homeowners with a clear, interactive, and personalized tool that demystifies the HELOC (Home Equity Line of Credit) acceleration strategy. The application will transform the complex financial calculations from the user's spreadsheet into an intuitive web application, enabling users to visualize the long-term impact of their financial decisions and potentially save significant money and time on their mortgage.

### 1.2. Problem Statement

Many homeowners are unaware of advanced mortgage payoff strategies like using a HELOC. The calculations are complex and difficult to model in a standard spreadsheet, making it hard to compare outcomes accurately. There is a need for a user-friendly tool that can run these simulations, store personal scenarios, and present the results in an easily digestible format.

### 1.3. Scope

This document outlines the requirements for the initial version (V1) of the HELOC Accelerator web application. The core functionality will be to allow users to register, input their mortgage and financial data, and receive a comparative analysis of a traditional mortgage payoff versus an accelerated HELOC strategy.

## 2. Target Audience

- **Financially-savvy Homeowners:** Individuals who have a mortgage and are actively looking for ways to optimize their finances, build equity faster, and reduce long-term debt.
- **DIY Investors:** People who are comfortable managing their own finances and are interested in tools that provide data-driven insights.
- **Homeowners with a HELOC:** Existing HELOC holders who want to understand how to best leverage their credit line to pay down their primary mortgage.

## 3. User Stories & Features

### 3.1. User Authentication

- **US-1 (Registration):** As a new user, I want to create a secure account using my email and password so that I can save my financial scenarios.
- **US-2 (Login):** As a returning user, I want to log in to my account so that I can access my saved data and run new simulations.
- **US-3 (Logout):** As a logged-in user, I want to be able to log out securely to protect my financial information.

### 3.2. Financial Scenario Management

- **US-4 (Input Data):** As a logged-in user, I want to input my mortgage details (balance, interest rate, term), home value, and HELOC information (limit, interest rate) so the application can run accurate calculations.
- **US-5 (Input Cash Flow):** As a logged-in user, I want to input my monthly income (deposits) and expenses so the application can calculate my net surplus for the HELOC strategy.
- **US-6 (Save Data):** As a logged-in user, I want to save my input data to my account so I don't have to re-enter it every time I visit.
- **US-7 (Automatic Calculation):** As a user, I want the application to automatically recalculate the results whenever I change an input value.

### 3.3. Results & Visualization

- **US-8 (Summary View):** As a user, I want to see a high-level summary that compares the "Mortgage-Only" plan to the "HELOC Strategy," showing key metrics like total interest paid, payoff time, and total savings.
- **US-9 (Comparison Chart):** As a user, I want to view a line chart that visually compares the loan balance reduction over time for both strategies, making it easy to see the acceleration.
- **US-10 (Detailed Amortization - Future):** As a user, I want to be able to view a detailed, month-by-month amortization table for both scenarios, similar to the original spreadsheet.

## 4. Functional Requirements

### 4.1. Authentication

- The system shall use a secure method for password hashing and storage.
- User sessions will be managed via secure tokens (e.g., JWT).
- The backend will expose endpoints for user registration, login, and logout.

### 4.2. Calculation Engine

The backend will contain the core business logic to replicate the financial calculations from the provided spreadsheets.

- **Mortgage-Only Plan:** The system will calculate a standard amortization schedule based on user inputs.
- **HELOC Strategy:** The system will simulate the flow of funds as described:
  - Calculate the monthly mortgage payment (P&I).
  - Simulate monthly deposits and expenses to determine net cash surplus.
  - Model lump-sum principal payments from the HELOC to the mortgage.
  - Calculate the revolving HELOC balance, including accrued interest and paydown from the cash surplus.
  - The simulation runs until both the mortgage and HELOC balances reach zero.

### 4.3. Data Persistence

- A PostgreSQL database will be used to store user account information and their financial input data.
- Each user's input data will be linked to their unique user ID.
- The application will fetch a user's saved data upon login. When a user updates their inputs, the new data will be saved (upserted) to the database.

### 4.4. API

A Node.js backend (e.g., using Express.js or Next.js API routes) will serve as the API.

**Endpoints:**

- `POST /api/auth/register`: Create a new user.
- `POST /api/auth/login`: Authenticate a user and return a session token.
- `GET /api/scenario`: Fetch the saved financial inputs for the authenticated user.
- `POST /api/scenario`: Save or update the financial inputs for the authenticated user.
- `POST /api/calculate`: (Optional) An endpoint to run the calculation on the server, though frontend calculation is also viable for V1.

## 5. Non-Functional Requirements

- **Performance:** The application should be fast and responsive. Calculations should execute near-instantly on the client-side or with minimal delay if processed on the server.
- **Security:** All communication between the client and server must be over HTTPS. Sensitive data like passwords must be hashed. Proper authorization will ensure users can only access their own data.
- **Usability:** The user interface must be clean, intuitive, and easy to navigate, even for users who are not financial experts.
- **Scalability:** The architecture should be capable of handling a growing number of users. The VPS setup should be monitored and scalable as needed.

## 6. Technology Stack

- **Frontend:** Next.js (React)
- **Backend:** Node.js (can be built directly into Next.js via API Routes)
- **Database:** PostgreSQL (self-hosted on a VPS)
- **Styling:** Tailwind CSS
- **Charting:** Recharts
- **Deployment:** VPS (e.g., DigitalOcean, Linode, Vultr) running Node.js and PostgreSQL.

## 7. Out of Scope (for V1)

- **Admin Dashboard:** No admin panel for managing users.
- **Multiple Scenarios:** Users can only save one set of inputs per account. The ability to save and name multiple "what-if" scenarios is a future feature.
- **PMI/MIP Calculation:** The complex logic for PMI cutoff will not be included in V1 to simplify the initial build.
- **Third-Party Integrations:** No integration with banking APIs (e.g., Plaid) to pull data automatically.
- **Social/Sharing Features:** No ability to share results publicly or with other users.
- **Mobile App:** This PRD is for a web application only.
