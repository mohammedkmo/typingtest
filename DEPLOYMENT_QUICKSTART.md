# Quick Deployment Guide for Typing Game

This guide provides step-by-step instructions for deploying your Typing Game application on Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- MySQL database (we recommend PlanetScale for serverless compatibility)

## Deployment Steps

### 1. Prepare Your Code

Make sure your repository contains:
- Updated `package.json` with Prisma generate in build script ✅
- `vercel.json` configuration file ✅
- Working `.env` file locally (don't commit secrets to GitHub)

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push
```

### 3. Set Up on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

### 4. Configure Environment Variables

Add the following environment variables:

| Name | Value | Description |
|------|-------|-------------|
| `DATABASE_URL` | `mysql://user:pass@host:port/db` | Your MySQL connection string |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel app URL |
| `NEXTAUTH_SECRET` | `random-secure-string` | Secret for NextAuth sessions |
| `NODE_ENV` | `production` | Environment setting |

### 5. Deploy

Click "Deploy" and wait for the build to complete.

### 6. Update Database Schema

After successful deployment, run:

```bash
npm run db:update
```

This script will guide you through updating your production database schema.

### 7. Verify Deployment

1. Visit your deployed application
2. Test authentication functionality
3. Verify database connections with:
   ```bash
   npm run db:test-connection
   ```

## Troubleshooting

If you encounter issues:

1. Check Vercel logs for build or runtime errors
2. Verify environment variables are set correctly
3. Test database connection with the test script
4. See detailed guidance in `VERCEL_SETUP.md`

For database connection issues:
```bash
npm run db:test-connection
```

## Updating After Changes

After making changes to your code:

1. Push changes to GitHub
2. Vercel will automatically deploy
3. If you changed database schema:
   ```bash
   npm run db:update
   ```

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [PlanetScale Documentation](https://planetscale.com/docs) (if using PlanetScale) 