# Table Connector App

## How to Deploy on GitHub Pages

This repository is configured to deploy automatically using **GitHub Actions**.

### One-Time Setup

1.  Go to your repository **Settings** on GitHub.
2.  Click on **Pages** in the left sidebar.
3.  Under **Build and deployment**, change the **Source** from **Deploy from a branch** to **GitHub Actions**.
4.  There is no need to select a branch or folder; the workflow file `.github/workflows/deploy.yml` handles everything.

### Deployment

Every time you push changes to the `main` branch, the deployment workflow will automatically run, build the application, and update the live site.

Your site will be live at `https://<username>.github.io/<repo-name>/`.
