# Setting Up Environment Variables on Vercel

When deploying your typing game application to Vercel, you'll need to configure the following environment variables to ensure everything works correctly, especially Prisma database connections and authentication.

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Your MySQL database connection string | `mysql://username:password@host:port/database` |
| `NEXTAUTH_URL` | The URL of your deployed application | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | A secret string for NextAuth security | Use a secure random string |
| `NODE_ENV` | The environment setting | `production` |

## Steps to Configure Environment Variables on Vercel

1. **Log in to your Vercel dashboard**

2. **Select your project**

3. **Go to "Settings" tab**

4. **Navigate to "Environment Variables" section**

5. **Add each environment variable:**
   - Click "Add New"
   - Enter the name (e.g., `DATABASE_URL`)
   - Enter the value
   - Set the appropriate environments (Production, Preview, Development)
   - Click "Save"

6. **Repeat for each required variable**

7. **Redeploy your application** after setting all variables:
   - Go to the "Deployments" tab
   - Find your latest deployment
   - Click the three dots (...) and select "Redeploy"

## Important Notes

- **Database Access**: Ensure your database allows connections from Vercel's IP ranges
- **Secure Values**: Use strong, unique values for secrets
- **Environment-Specific Values**: You can set different values for Production, Preview, and Development environments
- **Sensitive Information**: Never commit these values to your repository

## Verifying Your Setup

After deployment, you can verify your environment variables are working by:

1. Checking the Vercel deployment logs
2. Confirming database connections are successful
3. Testing authentication functionality

## Troubleshooting Database Connection Issues

If your application fails to connect to the database on Vercel, try these steps:

1. **Check database credentials**:
   - Verify username, password, and connection string are correct
   - Ensure there are no special characters causing issues

2. **Database accessibility**:
   - Confirm your database allows external connections
   - For MySQL/PlanetScale: Check if you need to allow Vercel's IP ranges

3. **Connection string format**:
   - For MySQL: `mysql://username:password@host:port/database`
   - Ensure URL encoding for special characters in password

4. **SSL requirements**:
   - Some hosting providers require SSL connections
   - Add parameters like `?ssl=true` to your connection string if needed

5. **Firewall settings**:
   - Verify your database server's firewall allows connections from Vercel

6. **Environment variable scope**:
   - Make sure variables are set for all environments (Production/Preview/Development)

7. **Debugging with Prisma**:
   - Add `?connection_limit=5` to your DATABASE_URL to limit connections
   - Consider adding `DEBUG=*` as an environment variable temporarily to see detailed logs

8. **Connection pooling**:
   - For serverless environments, consider using a connection pooling service
   - PlanetScale, Supabase, and Neon have built-in connection pooling

If you're still experiencing issues, you can check Vercel Functions logs for specific error messages which should help identify the exact problem.

If you encounter issues, double-check your environment variable values and database connectivity. 