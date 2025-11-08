# **App Name**: ExpenseWise

## Core Features:

- User Authentication: Secure user authentication using Firebase Auth.
- Expense Management: Add, edit, and delete expenses with category assignment and receipt uploads to Firebase Storage.
- Real-time Data Sync: Real-time expense data synchronization across devices with Firestore.
- Budgeting: Set budgets and track spending against them.
- Data Visualization: Visualize financial data with charts, including income vs. expenses and category-based breakdowns, dynamically generated for the month and year selected.
- Reporting and Export: Generate monthly/yearly spending reports and export data to CSV/PDF formats.
- Intelligent Budgeting Tool: Generative AI tool provides personalized budget recommendations based on user spending habits, detected by analyzing past transaction data. This tool identifies areas where users can potentially save money by incorporating spending habits to create and suggest relevant and realistic saving opportunities, like reallocating funds across categories.  It takes into consideration monthly income and suggests budget allocations using user-provided parameters and current market prices.

## Style Guidelines:

- Primary color: Light green (#A7D1AB) to evoke a sense of financial well-being and growth.
- Background color: Very light green (#F0FAF2), almost white, to give a clean, modern feel.
- Accent color: A muted teal (#70A4A3) for interactive elements and important notifications.
- Body and headline font: 'Inter', a sans-serif font, for a clean, modern, and highly readable user experience.
- Use minimalistic, line-based icons for expense categories and actions, to maintain a clean and intuitive interface.
- Emphasize a clean and intuitive layout with clear section divisions. Use Tailwind CSS grid and flexbox utilities for responsiveness and easy customization.
- Incorporate subtle transitions and animations on user interactions (e.g., adding/editing expenses) to provide visual feedback without overwhelming the user.