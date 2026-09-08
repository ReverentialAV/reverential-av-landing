# Deployment Guide: Reverential Landing Page

**Live URL:** www.reverentialav.in  
**Domain Registrar:** Spaceship  
**Hosting:** Cloudflare Pages (free)  
**Email:** Cloudflare Email Routing (configured for hello@reverentialav.in, thomas@reverentialav.in)

---

## Overview

This guide walks through:
1. Creating a GitHub repository
2. Setting up Cloudflare Pages
3. Configuring DNS in Spaceship
4. Testing the live site

**Total time:** ~15 minutes (DNS propagation 5 mins to 48 hours)

---

## Part 1: Create a GitHub Repository

### Step 1.1: Create a GitHub account (if you don't have one)

1. Go to https://github.com
2. Click **Sign up**
3. Follow the onscreen prompts
4. Verify your email

### Step 1.2: Create a new repository

1. On GitHub, click the **+** icon (top right) → **New repository**
2. Repository name: `reverential-landing`
3. Description: "Landing page for Reverential AV Integration"
4. Visibility: **Public** (recommended for SEO and static sites)
5. **Do NOT** initialize with README (we have one)
6. Click **Create repository**

### Step 1.3: Push your files to GitHub

On your computer, open Terminal or Command Prompt and run:

```bash
# Navigate to your project folder
cd path/to/reverential-landing

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: landing page with Web3Forms integration"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/reverential-landing.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Done.** Your files are now on GitHub.

---

## Part 2: Connect Cloudflare Pages to GitHub

### Step 2.1: Create a Cloudflare account (if needed)

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with email
3. Accept Cloudflare's terms
4. Verify email

### Step 2.2: Create a Cloudflare Pages project

1. In Cloudflare Dashboard, go to **Pages** (left sidebar)
2. Click **Create a project**
3. Click **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select your `reverential-landing` repository
6. Click **Begin setup**

### Step 2.3: Configure build settings

In the build configuration screen:

| Setting | Value |
|---------|-------|
| **Framework** | None |
| **Build command** | (leave blank) |
| **Build output directory** | `.` (dot, current directory) |
| **Environment variables** | (none needed) |

Click **Save and Deploy**.

**Status:** Cloudflare will deploy your site. It may show a Cloudflare-generated URL like `reverential-landing-abc123.pages.dev`.

---

## Part 3: Configure DNS in Spaceship

### Step 3.1: Log in to Spaceship

1. Go to https://www.spaceship.com
2. Log in with your account
3. Find your domain `reverentialav.in` in the dashboard

### Step 3.2: Note Cloudflare's nameservers

Before changing DNS, get Cloudflare's nameservers:

1. In Cloudflare Dashboard, go to your domain page
2. Look for **Nameservers** (usually shown as a yellow banner when you first connect a domain)
3. You should see two nameservers:
   - `eva.ns.cloudflare.com`
   - `noah.ns.cloudflare.com`

(These are standard Cloudflare nameservers. Exact names may vary.)

### Step 3.3: Update nameservers in Spaceship

1. In Spaceship, find your domain `reverentialav.in`
2. Click **DNS** or **Nameservers** (exact wording varies)
3. Look for **Custom Nameservers** or **Change Nameservers**
4. Replace all nameservers with Cloudflare's:
   - Remove existing nameservers
   - Add `eva.ns.cloudflare.com`
   - Add `noah.ns.cloudflare.com`
5. Click **Save** or **Confirm**

**Note:** Your current Cloudflare Email Routing is configured on these nameservers, so the change will not affect your email aliases.

### Step 3.4: Wait for DNS propagation

DNS changes propagate over time:
- **Fast path:** 5–10 minutes (most cases)
- **Full propagation:** 48 hours (maximum)

You can check status at https://dnschecker.org:
1. Enter `reverentialav.in`
2. Select **NS** record type
3. Check propagation across multiple DNS servers

---

## Part 4: Connect your domain in Cloudflare

Once DNS nameservers are updated in Spaceship, tell Cloudflare about your domain:

### Step 4.1: Add domain to Cloudflare

1. In Cloudflare Dashboard, go to **Websites**
2. Click **Add a domain**
3. Enter `reverentialav.in`
4. Click **Continue**
5. Choose **Free** plan
6. Review DNS records (should be minimal)
7. Click **Complete setup**

Cloudflare will check for nameserver changes in Spaceship and automatically activate once detected.

### Step 4.2: Configure Pages domain

1. Go back to **Pages**
2. Select your `reverential-landing` project
3. Go to **Custom domain**
4. Click **Set up custom domain**
5. Enter `www.reverentialav.in`
6. Click **Continue**
7. Verify the CNAME record and click **Activate domain**

Cloudflare will create the required DNS records automatically.

### Step 4.3: (Optional) Redirect reverentialav.in to www

To make both `reverentialav.in` and `www.reverentialav.in` work:

1. In Cloudflare Pages project settings
2. Go to **Custom domains**
3. Add `reverentialav.in` as well
4. Let Cloudflare create the redirect

---

## Part 5: Test the live site

### Step 5.1: Wait for propagation

After updating nameservers in Spaceship:
- Wait 5–10 minutes for fast propagation
- Check status at https://dnschecker.org if you're unsure

### Step 5.2: Visit your site

Open a browser and go to:
- https://www.reverentialav.in
- https://reverentialav.in

Both should load the landing page.

### Step 5.3: Test interactivity

1. Click sector tabs — they should switch
2. Click method accordion — it should expand
3. Click FAQ — it should expand
4. Fill out the contact form and submit

**Note:** Form submission requires Web3Forms access key (see Part 1 of README.md).

---

## Configuring Web3Forms

Your form will not work until you add a Web3Forms access key:

1. Go to https://web3forms.com
2. Sign up (free)
3. Create a new form and copy the **Access Key**
4. Edit `index.html` locally
5. Find: `const accessKey = '[FILL: WEB3FORMS ACCESS KEY]';`
6. Replace with: `const accessKey = 'your_actual_key_here';`
7. Commit and push:
   ```bash
   git add index.html
   git commit -m "Add Web3Forms access key"
   git push origin main
   ```
8. Cloudflare automatically redeploys

Form submissions will now arrive in your Web3Forms inbox.

---

## Troubleshooting

### DNS not propagating?

- **Check in Spaceship:** Verify nameservers are exactly `eva.ns.cloudflare.com` and `noah.ns.cloudflare.com`
- **Use DNS checker:** https://dnschecker.org to see propagation status
- **Wait longer:** DNS can take up to 48 hours in rare cases
- **Clear browser cache:** Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

### Cloudflare shows "Error 521 — Web server is down"

This means Cloudflare can't reach the Pages project. Usually fixed by:
- Waiting 5 minutes for initial deployment
- Checking Cloudflare Pages project status (should show "Deployed")
- Redeploying: Go to **Pages** → **Deployments** → **Retry**

### Form submissions not arriving

- Check Web3Forms dashboard (https://web3forms.com) for submission logs
- Verify access key is correct (no `[FILL]` placeholder)
- Check spam folder
- Test Web3Forms directly at https://web3forms.com/test

### Site shows "Waiting for nameserver changes"

This appears if Cloudflare hasn't detected the nameserver change yet:
- Wait 5–10 minutes and refresh
- Manually verify nameservers in Spaceship DNS settings
- Use https://dnschecker.org to confirm propagation

---

## Making Updates

Once live, updating the site is simple:

```bash
# Edit index.html locally
nano index.html  (or use any text editor)

# Commit and push
git add index.html
git commit -m "Update [section name]"
git push origin main
```

Cloudflare automatically redeploys on every push to `main`.

---

## Support

- **Cloudflare docs:** https://developers.cloudflare.com/pages/
- **GitHub docs:** https://docs.github.com/
- **Web3Forms:** https://web3forms.com/docs
- **Your email:** hello@reverentialav.in

---

## Summary Checklist

- [ ] GitHub repository created and files pushed
- [ ] Cloudflare Pages project connected
- [ ] Nameservers updated in Spaceship to Cloudflare's
- [ ] DNS propagation verified (5 mins–48 hours)
- [ ] Domain added to Cloudflare
- [ ] Custom domain configured in Pages
- [ ] Site loads at www.reverentialav.in
- [ ] Sector tabs, accordions, form fields tested
- [ ] Web3Forms access key added for contact form
- [ ] Form submission tested

---

**Status:** Ready to go live.

Deployed: September 2026
