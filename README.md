# AI Construction Assistant

A modern, minimalist web application that helps users plan their DIY construction projects by recommending the right materials and tools via a conversational interface.

## Features

- **Smart Conversation Flow**: Engages users in a step-by-step dialogue to understand their project needs
- **Personalized Recommendations**: Generates customized lists of materials and tools based on the project details
- **Shopping List Creation**: Allows users to select items they need and create a personalized shopping list
- **Email Capture**: Collects user information for follow-up and lead nurturing
- **Affiliate Marketing**: Automatically generates affiliate links to Amazon for each recommended product

## Tech Stack

- **Next.js**: React framework for building the frontend application
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling the UI components
- **OpenAI API**: For the conversational AI assistant (simulated in this MVP)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/ai-construction.git
cd ai-construction
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
ai-construction/
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── page.tsx           # Main home page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── shopping-list/     # Shopping list page
│   │       └── page.tsx       # Shopping list component
│   ├── components/            # Reusable UI components
│   │   ├── ChatInterface.tsx  # Chat conversation UI
│   │   ├── ResultsDisplay.tsx # Product recommendations display
│   │   └── EmailCaptureForm.tsx # User details form
│   ├── lib/                   # Library code and services
│   │   └── api.ts             # API service for OpenAI
│   └── utils/                 # Utility functions
│       └── affiliateUtils.ts  # Affiliate link generation
├── public/                    # Static files
├── package.json               # Project dependencies
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Development

The project is structured as a single-page application with a multi-step process:

1. **Chat Interface**: Users engage in conversation about their project
2. **Results Display**: Shows recommended materials and tools
3. **Email Capture**: Collects user information
4. **Shopping List**: A dedicated page showing the saved items with affiliate links

## Deployment

This project can be easily deployed using Vercel:

```
npm run build
vercel deploy
```

## License

This project is licensed under the MIT License 