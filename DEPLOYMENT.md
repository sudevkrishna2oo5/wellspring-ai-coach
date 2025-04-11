
# Deploying to Vercel

This document provides step-by-step instructions to deploy your FitVibe app to Vercel.

## Prerequisites

1. Create a [Vercel account](https://vercel.com/signup) if you don't already have one
2. Make sure your project is in a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Direct from Git Repository

1. Log in to your Vercel account
2. Click on "Add New..." > "Project"
3. Import your Git repository
4. Configure your project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Configure environment variables:
   - Add all Supabase environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - Any other environment variables your app needs
6. Click "Deploy"

### Option 2: Using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel from the terminal:
   ```bash
   vercel login
   ```
3. Navigate to your project directory and run:
   ```bash
   vercel
   ```
4. Follow the interactive prompts to configure your deployment

## Production Deployment

After your initial deployment, for subsequent production deployments:

1. Push changes to your git repository, or
2. Run `vercel --prod` from your project directory

## Setting up Continuous Deployment

Vercel automatically sets up continuous deployment when you connect your Git repository. Every time you push changes to your main/master branch, Vercel will automatically deploy those changes.

## Custom Domains

1. Go to your project dashboard on Vercel
2. Click on "Settings" > "Domains"
3. Add your custom domain and follow the verification steps

## Troubleshooting

- If you encounter build errors, make sure all dependencies are properly listed in your package.json
- Check that your environment variables are correctly set in the Vercel project settings
- For routing issues, ensure you have proper handling for client-side routing in your React application

Happy deploying! Your FitVibe app should now be accessible globally through Vercel's fast CDN network.
