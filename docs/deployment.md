# HolidayHacker - Deployment Guide

This guide explains how to deploy the HolidayHacker application using GitHub Pages.

## Prerequisites

- GitHub repository with main branch created
- Node.js 18+ installed locally
- GitHub account with permissions to enable GitHub Pages

## Automated Deployment (GitHub Actions)

The application is configured for automatic deployment to GitHub Pages via GitHub Actions.

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment", set **Source** to "GitHub Actions"
4. Save settings

### 2. Repository Permissions

The GitHub Actions workflow requires the following permissions:
- `contents: write` - to deploy to gh-pages branch
- `pages: write` - to deploy to GitHub Pages
- `id-token: write` - for OIDC authentication

### 3. Automatic Deployment Process

Once configured, deployment happens automatically when you push to the `main` branch:

1. **Trigger**: Push to main branch
2. **Build**: Node.js 18 setup → npm ci → npm run build
3. **Deploy**: Deploy dist/ folder to GitHub Pages

### 4. Accessing the Application

After successful deployment, the app will be available at:
```
https://[username].github.io/holidayhacker/
```

## Manual Testing

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (test)
npm run build
npm run preview
```

### Testing Deployment

1. **Test Build Process**:
   ```bash
   npm run build
   ```
   Verify files are created in `dist/` folder with correct paths.

2. **Test Preview**:
   ```bash
   npm run preview
   ```
   Visit `http://localhost:4173` to test production build locally.

3. **Test SPA Routing**:
   - Verify 404.html exists for proper routing fallback
   - Test direct page navigation works correctly

## Configuration Details

### Vite Configuration

The `vite.config.ts` is configured for GitHub Pages:

```typescript
export default defineConfig({
  base: '/holidayhacker/', // GitHub Pages base path
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
});
```

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` includes:

- **Triggers**: Push to main branch
- **Node.js 18**: Latest LTS version
- **Build**: npm ci → NODE_ENV=production npm run build
- **Deploy**: GitHub Pages deployment with proper permissions
- **Error Handling**: Deployment status reporting

## Troubleshooting

### Common Issues

1. **404 Errors on Navigation**
   - Ensure 404.html exists in dist/ folder
   - Verify GitHub Pages is serving from gh-pages branch

2. **Asset Loading Errors**
   - Check base path in vite.config.ts
   - Verify asset URLs include `/holidayhacker/` prefix

3. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify package.json scripts are correct
   - Check GitHub Actions workflow logs

4. **Permission Errors**
   - Ensure repository has GitHub Pages enabled
   - Verify GitHub Actions permissions are configured

### Debugging Steps

1. **Check Build Output**:
   ```bash
   npm run build
   ls -la dist/
   ```

2. **Validate Asset Paths**:
   Check that asset URLs in index.html include the base path:
   ```html
   <script src="/holidayhacker/assets/index-[hash].js"></script>
   ```

3. **Check GitHub Actions**:
   - Go to Actions tab in GitHub repository
   - Review deployment workflow logs
   - Check for permission or build errors

## Environment Variables

The deployment process uses:

- `NODE_ENV=production` for optimized builds
- GitHub Actions automatically handles authentication via OIDC

No secrets are required - the deployment is fully automated through GitHub's built-in CI/CD.

## Performance Optimization

The build process includes:

- **Asset Minification**: JavaScript and CSS are minified
- **Asset Hashing**: File names include content hashes for caching
- **Source Maps**: Generated for debugging (production builds)
- **Gzip Compression**: Handled automatically by GitHub Pages

## Security Considerations

- **Static Hosting**: No server-side code reduces attack surface
- **HTTPS**: Enforced automatically by GitHub Pages
- **CSP Headers**: Can be configured via GitHub Pages settings if needed
- **No API Keys**: Client-side application, no server secrets

## Rolling Back Changes

To rollback a deployment:

1. **Revert to Previous Commit**:
   ```bash
   git checkout [previous-commit-hash]
   git push -f origin main
   ```

2. **Or Disable Pages Temporarily**:
   - Go to Settings → Pages
   - Disable temporarily to switch back to previous version

## Monitoring

- **GitHub Actions**: Automatically logs deployment success/failure
- **GitHub Pages Status**: Available in repository settings
- **Analytics**: Can be added via GitHub Pages integration with third-party services

---

**For issues**: Check GitHub Actions logs first, then verify configuration in this guide.