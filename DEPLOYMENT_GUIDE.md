
# Solaris Navigator - Deployment Guide

This guide provides step-by-step instructions for deploying the Solaris Navigator application.

## Section 1: Recommended Deployment (Automated with Firebase)

This method is recommended for its simplicity and tight integration with the Google Cloud ecosystem. It sets up a Continuous Integration/Continuous Deployment (CI/CD) pipeline, so every time you push a change to your GitHub repository, the app is automatically rebuilt and redeployed.

### Prerequisites

1.  **Node.js:** Ensure you have Node.js (version 18 or later) installed on your local machine or Cloud Workstation.
2.  **Firebase Account:** You need a Firebase project. If you don't have one, you can create one for free at the [Firebase Console](https://console.firebase.google.com/).
3.  **Firebase CLI:** Install the Firebase Command Line Interface globally by running:
    ```bash
    npm install -g firebase-tools
    ```
4.  **GitHub Account & Repository:** You will need a GitHub account and a new, empty repository to host your application's source code.

---

### Deployment Steps

#### Step 0: Push Your Project to YOUR GitHub Repository

First, you need to get the code from your development environment into your own repository on GitHub.

1.  **Create a new, empty repository on GitHub.com.** Do not add a README, .gitignore, or license file yet.
2.  **Initialize Git in your project folder.** In your terminal, at the root of the project, run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of Solaris Navigator"
    ```
3.  **Connect your project to your GitHub repository.** Replace `<Your-GitHub-Username>` and `<Your-Repository-Name>` with your actual details.
    ```bash
    git remote add origin https://github.com/<Your-GitHub-Username>/<Your-Repository-Name>.git
    git branch -M main
    ```
4.  **Push your code to GitHub:**
    ```bash
    git push -u origin main
    ```
    Your code is now in your personal GitHub repository.

#### Step 1: Initialize Firebase in Your Project

If your project isn't already configured for Firebase, open your terminal in the project's root directory and run:

```bash
firebase login
```

Follow the prompts to log in with your Google account. Then, initialize Firebase Hosting:

```bash
firebase init hosting
```

When prompted:

1.  **Select a Firebase project:** Choose the Firebase project you created earlier.
2.  **What do you want to use as your public directory?** Enter `.next`.
3.  **Configure as a single-page app (rewrite all urls to /index.html)?** Enter `No`.
4.  **Set up automatic builds and deploys with GitHub?** Enter `No`. We will do this from the Firebase Console in the next step to avoid potential issues in some terminal environments.

#### Step 2: Connect to GitHub in the Firebase Console

This is where you connect Firebase to the repository you just created.

1.  Go to your project in the **[Firebase Console](https://console.firebase.google.com/)**.
2.  In the left-hand menu, go to **Build > App Hosting**.
3.  Click **"Get started"**.
4.  Follow the prompts to connect your GitHub account and select the repository you created in Step 0.
5.  Firebase will automatically detect that it's a Next.js app and set up the build process. Confirm the settings.

This process will create a GitHub Actions workflow file in your repository (`.github/workflows/firebase-hosting-main.yml`). This workflow will automatically build and deploy your app whenever you push changes to your main branch.

#### Step 3: Add Environment Variables to GitHub

Your application requires the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. This is a secret and should not be stored directly in your code.

1.  Go to your GitHub repository's **Settings** tab.
2.  In the left sidebar, navigate to **Secrets and variables > Actions**.
3.  Click the **New repository secret** button.
4.  **Name:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
5.  **Value:** Paste your Google Maps API key here.
6.  Click **Add secret**.

The GitHub Actions workflow will securely provide this key to your application during the build process.

#### Step 4: Deploy!

To trigger your first deployment, simply make a small change, commit it, and push it to the `main` branch of your GitHub repository:

```bash
# For example, you can edit the README.md file slightly
git add .
git commit -m "Configure for Firebase App Hosting deployment"
git push origin main
```

You can watch the deployment progress in the **Actions** tab of your GitHub repository. Once the workflow completes, your application will be live at `your-firebase-project-id.web.app` and `your-firebase-project-id.firebaseapp.com`.

---

## Section 2: Manual Deployment Walkthrough

This section explains how to build the application locally and deploy the output to a hosting provider that supports Node.js applications.

**Important Note:** This application is a Next.js app, not a static HTML/CSS site. It requires a Node.js server environment to function correctly because it has server-side logic (e.g., for calling the Google Solar API). It **cannot** be hosted on static site providers like GitHub Pages.

### Step 1: Install Dependencies

In your terminal, navigate to the project's root directory and install all the necessary packages:

```bash
npm install
```

### Step 2: Create a Production Build

Run the following command to compile and optimize the application for production:

```bash
npm run build
```

This command will create a `.next` directory in your project root. This directory contains the complete, optimized, and ready-to-run version of your application.

### Step 3: Run the Production Server

To start the application locally in production mode, run:

```bash
npm run start
```

This will start a production-ready web server on `http://localhost:3000`.

### Step 4: Deploying the `.next` Directory

The final step is to deploy the contents of your project to your chosen hosting provider. The key is that your deployment should include:

1.  The entire `.next` directory.
2.  The `node_modules` directory (or your host should run `npm install`).
3.  The `package.json` file.

Most modern Node.js hosting providers will automatically detect the Next.js project, run the `build` command for you, and deploy the application. You typically just need to connect your GitHub repository to their service. **Excellent alternatives to Firebase Hosting include Vercel (from the creators of Next.js) and Netlify, both of which offer a similar automated deployment workflow and a generous free tier.**

For a manual server setup, you would need to:
1.  Copy the entire project folder to your server.
2.  Ensure Node.js is installed on the server.
3.  Run `npm install` and `npm run build`.
4.  Use a process manager like `pm2` to run `npm run start` to keep the application alive.
