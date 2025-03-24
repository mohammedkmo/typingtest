# Typing Speed Test

A modern and elegant typing test application built with Next.js and TypeScript. Test your typing speed and accuracy, save your results, and compete on the leaderboard.

## Features

- **Typing Test**: Real-time words per minute (WPM) and accuracy tracking
- **User Authentication**: Sign in with email, GitHub, or Google
- **Leaderboard**: Global rankings and personal history
- **Beautiful UI**: Multiple theme options including dark and light modes
- **Responsive Design**: Works on all device sizes

## Technologies

- Next.js 14+
- TypeScript
- Prisma ORM
- MySQL Database
- NextAuth.js
- TailwindCSS
- Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MySQL server running

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/typing-game.git
cd typing-game
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
DATABASE_URL="mysql://user:password@localhost:3306/typing_game"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional OAuth providers
GITHUB_ID=
GITHUB_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Management

- To view and edit database: `npm run db:studio`
- To update database schema: `npm run db:push`
- To regenerate Prisma client: `npm run db:generate`

## Deployment

This application can be deployed on platforms like Vercel or Netlify. Make sure to:

1. Set up environment variables in your deployment platform
2. Configure authentication callback URLs 
3. Set up a MySQL database (e.g., PlanetScale, AWS RDS, DigitalOcean Managed Databases, etc.)

## License

This project is licensed under the MIT License - see the LICENSE file for details. # typingtest
