# How to Push to GitHub

## Step 1: Create a GitHub Repository

1. Go to https://github.com and sign in
2. Click the "+" icon in the top right corner → "New repository"
3. Name your repository (e.g., `T-Shirtify`)
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Run these commands in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
# Add the remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code to GitHub
git push -u origin main
```

## What's Already Done

✅ Git repository initialized
✅ All files committed
✅ Branch renamed to `main`
✅ `.gitignore` file created (excludes node_modules, .env, etc.)

## Important Notes

- **Never commit `.env` file** - It contains sensitive information (database passwords, JWT secrets)
- The `.env` file is already in `.gitignore`
- Make sure to create an `env.example` file (already done) to show what environment variables are needed
- After pushing, you can add a README with setup instructions

## Next Steps After Pushing

1. Add a description to your GitHub repository
2. Consider adding topics/tags (e.g., `react`, `nodejs`, `e-commerce`, `mysql`)
3. Update the README.md with setup instructions
4. Consider adding a LICENSE file

