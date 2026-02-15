# Table Connector App

## How to Deploy on GitHub Pages

This repository is configured to deploy directly from the `main` branch using the `/docs` folder.

1.  Push your changes to the `main` branch.
2.  Go to your repository **Settings** on GitHub.
3.  Click on **Pages** in the left sidebar.
4.  Under **Build and deployment**, select **Source** as **Deploy from a branch**.
5.  Under **Branch**, select `main` and then choose `/docs` as the folder (instead of `/ (root)`).
6.  Click **Save**.

Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Why am I seeing a white screen or "MIME type text/jsx" error?

If you see an error like `Failed to load module script... MIME type of "text/jsx"`, it means GitHub Pages is serving the **source code** (the root folder) instead of the **built application** (the `/docs` folder). Please follow the steps above to change the deployment source to `/docs`.
