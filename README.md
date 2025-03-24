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

## Deployment on Vercel with Prisma

### Prerequisites

1. A Vercel account
2. A MySQL database (e.g., PlanetScale, Amazon RDS, or any other MySQL provider)
3. Your project pushed to a GitHub repository

### Setup for Vercel Deployment

1. **Preparing Your Project**

   We've already configured the project for Vercel deployment by:
   - Adding Prisma generate to the build command in `package.json`
   - Creating a `vercel.json` configuration file

2. **Environment Variables Setup**

   You'll need to set the following environment variables in your Vercel project:
   
   ```
   DATABASE_URL=mysql://username:password@host:port/database
   NEXTAUTH_URL=https://your-production-url.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

3. **Deployment Steps**

   1. Push your code to GitHub
   2. Log in to your Vercel account
   3. Click "Add New" → "Project"
   4. Import your GitHub repository
   5. Configure the project:
      - Set the Framework Preset to "Next.js"
      - Add the environment variables mentioned above
   6. Click "Deploy"

4. **Post-Deployment**

   Once deployed, you need to run the Prisma migrations on your production database:
   
   ```bash
   # Use this if you're using prisma migrate
   npx prisma migrate deploy
   
   # Or this if you're using prisma db push
   npx prisma db push
   ```

   You can also run these commands directly through the Vercel interface by going to your project settings → "Deployments" → "Functions".

5. **Troubleshooting**

   - If you encounter database connection issues, verify that:
     - Your `DATABASE_URL` is correct
     - The database is accessible from Vercel's servers
     - The necessary network configurations are in place
   
   - For Prisma-specific issues, check Vercel logs for:
     - Prisma generate errors
     - Database connection errors

### Keeping Your Database Schema in Sync

When making changes to your Prisma schema, follow these steps to update your production database:

1. Make changes to `prisma/schema.prisma`
2. Test locally with `npx prisma db push` or `npx prisma migrate dev`
3. Commit and push your changes to GitHub
4. Vercel will automatically run `prisma generate` during the build process
5. Manually run the migration/push commands for your production database

By following these steps, you'll ensure a smooth deployment process for your application on Vercel.

## License

This project is licensed under the MIT License - see the LICENSE file for details. # typingtest
