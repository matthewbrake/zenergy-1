
# Solaris Navigator - Deployment Guide

This guide provides step-by-step instructions for deploying the Solaris Navigator application using Firebase App Hosting. This method is recommended for its simplicity and tight integration with the Google Cloud ecosystem.

## Prerequisites

1.  **Node.js:** Ensure you have Node.js (version 18 or later) installed on your local machine.
2.  **Firebase Account:** You need a Firebase project. If you don't have one, you can create one for free at the [Firebase Console](https://console.firebase.google.com/).
3.  **Firebase CLI:** Install the Firebase Command Line Interface globally by running:
    ```bash
    npm install -g firebase-tools
    ```
4.  **GitHub Account:** You will need a GitHub account to host your application's source code.

## Deployment Steps

### Step 1: Initialize Firebase in Your Project

If your project isn't already configured for Firebase, open your terminal in the project's root directory and run:

```bash
firebase login
```

Follow the prompts to log in with your Google account. Then, initialize Firebase:

```bash
firebase init hosting
```

When prompted:

1.  **Select a Firebase project:** Choose the Firebase project you created earlier.
2.  **What do you want to use as your public directory?** Enter `out`. (This is Next.js's default static export directory).
3.  **Configure as a single-page app (rewrite all urls to /index.html)?** Enter `No`. Next.js handles its own routing.
4.  **Set up automatic builds and deploys with GitHub?** Enter `Yes`. This is the key to easy, continuous deployment.

### Step 2: Connect to GitHub

1.  **Authorize Firebase:** The CLI will open a browser window asking you to authorize Firebase to access your GitHub account.
2.  **Choose Repository:** Select the GitHub repository where your application code is stored (e.g., `your-username/solaris-navigator`).
3.  **Set up workflow:**
    *   **What script should be run before every deploy?** Leave this blank unless you have specific pre-deploy tasks.
    *   **Do you want to add a script to automatically install npm dependencies?** Enter `Yes`.
    *   **What is the name of the directory where your app's public assets are?** Enter `out`.

This process will create a GitHub Actions workflow file in your repository (`.github/workflows/firebase-hosting-pull-request.yml` and/or `firebase-hosting-main.yml`). This workflow will automatically build and deploy your app whenever you push changes to your main branch.

### Step 3: Configure `package.json` for Export

This application is a static Next.js app, which is perfect for fast, scalable hosting. We need to tell Next.js how to build the app into static HTML/CSS/JS files.

Ensure your `package.json` file contains the following `build` script:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
},
```

The `next build` command will automatically create the static site in the `./out` directory, which is what Firebase App Hosting will deploy.

### Step 4: Add Environment Variables to GitHub

Your application requires the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. This is a secret and should not be stored directly in your code.

1.  Go to your GitHub repository's **Settings** tab.
2.  In the left sidebar, navigate to **Secrets and variables > Actions**.
3.  Click the **New repository secret** button.
4.  **Name:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
5.  **Value:** Paste your Google Maps API key here.
6.  Click **Add secret**.

The GitHub Actions workflow will securely provide this key to your application during the build process.

### Step 5: Deploy!

To trigger your first deployment, simply push your code to the `main` branch of your GitHub repository:

```bash
git add .
git commit -m "Configure for Firebase App Hosting deployment"
git push origin main
```

You can watch the deployment progress in the **Actions** tab of your GitHub repository. Once the workflow completes, your application will be live at `your-firebase-project-id.web.app` and `your-firebase-project-id.firebaseapp.com`.

### Future Deployments

From now on, every time you push a change to your `main` branch, the GitHub Action will automatically trigger, rebuilding and redeploying your application. It's a completely hands-off process!

