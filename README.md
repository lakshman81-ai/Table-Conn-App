# Table Connector App

## Deployment

This repository uses **GitHub Actions** to automatically build and deploy the application.

### How it works
1.  Push your code changes to the `main` branch.
2.  GitHub Actions will automatically run the build process.
3.  The built application will be pushed to a special branch called `gh-pages`.

### Configuration (One-Time Setup)

1.  Go to your repository **Settings** on GitHub.
2.  Click on **Pages** in the left sidebar.
3.  Under **Build and deployment**, select **Source** as **Deploy from a branch**.
4.  Under **Branch**, select `gh-pages` and `/ (root)`.
5.  Click **Save**.

Your site will be live at `https://<username>.github.io/<repo-name>/`.
