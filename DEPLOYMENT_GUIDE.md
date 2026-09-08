# Deployment Guide for reverentialav.in

Everything needed to take this repository live on Cloudflare Pages.

---

## Before you start

You already have:

- The domain `reverentialav.in` on Cloudflare nameservers (Active, Free plan)
- Email routing configured, `hello@reverentialav.in` forwarding to Gmail
- A GitHub repository named `reverential-av-landing`
- A Web3Forms account with the access key already embedded in `index.html`

Nothing needs to be installed. No build step runs on Cloudflare.

---

## Step 1, Put the files on GitHub

Upload these six files to the root of `reverential-av-landing`:

```
index.html            the live site, deploy this
src.jsx               the editable source, keep it here
README.md             what this repo is and how to edit it
DEPLOYMENT_GUIDE.md   this file
NEXT_STEPS.txt        the running task list
.gitignore            standard ignores
```

Via the browser, no software needed:

1. Open the repository on github.com
2. **Add file** → **Upload files**
3. Drag all five files in
4. Commit message: `Landing page, Web3Forms wired, SEO groundwork`
5. **Commit changes**

If a file already exists, uploading it again replaces it. That is expected.

---

## Step 2, Create the Cloudflare Pages project

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
2. **Connect to Git**
3. Authorise GitHub if prompted, then select `reverential-av-landing`
4. Build settings:

   | Field | Value |
   |---|---|
   | Framework preset | **None** |
   | Build command | *leave empty* |
   | Build output directory | `/` |
   | Root directory | *leave empty* |

5. **Save and Deploy**

The first deploy takes under a minute. You will get a URL such as
`reverential-av-landing.pages.dev`. Open it and confirm the site loads.

**Do not set a build command.** `index.html` is already compiled. A build
command will fail the deploy.

---

## Step 3, Attach the domain

In the Pages project → **Custom domains** → **Set up a custom domain**

Add both, one at a time:

1. `www.reverentialav.in`
2. `reverentialav.in`

Cloudflare creates the DNS records itself. Because the nameservers already
point at Cloudflare, activation is immediate rather than the usual wait.

Adding both means the apex and the www address both resolve. Cloudflare
serves the site on each.

---

## Step 4, Check it works

Open `https://www.reverentialav.in` and confirm:

- [ ] The page loads, dark header, warm white body
- [ ] The decay curve chart draws, and its toggles switch the curves
- [ ] The seven sector tabs change the panel content when clicked
- [ ] The six method phases expand and collapse
- [ ] The FAQ entries open
- [ ] The WhatsApp button opens a chat to +91 99622 32223
- [ ] The consultation form sends, and the button reports success
- [ ] The checklist email form sends
- [ ] It reads correctly on your phone

Send yourself a test submission through the form. It should arrive at the
address registered on your Web3Forms account. Check spam on the first one.

---

## Editing the site later

`index.html` is compiled and minified. Do not edit it directly.

All copy lives in `src.jsx`. To change text:

1. Edit `src.jsx`
2. Rebuild:

```bash
npm install react react-dom lucide-react esbuild
npx esbuild entry.jsx --bundle --minify --format=iife --target=es2018 \
  --loader:.jsx=jsx --jsx=automatic --outfile=bundle.js \
  --define:process.env.NODE_ENV='"production"'
```

3. Replace the contents of the `<script>` tag at the bottom of `index.html`
   with the new `bundle.js`
4. Push `index.html` and `src.jsx`

A single-command build script is being added so this becomes one step.

Where things live in `src.jsx`:

| To change | Search for |
|---|---|
| Headline | `They can hear the sound` |
| Hero paragraph | `We design and deploy audiovisual` |
| Sector tabs and pain points | `const SECTORS` |
| The six method phases | `const PHASES` |
| FAQ questions and answers | `const FAQS` |
| Credentials and track record | `Before founding Reverential` |
| Phone, email, WhatsApp | `PHONE_DISPLAY`, `EMAIL`, `WHATSAPP` |
| Brand colours | `const C = {` |

---

## The contact forms

Both post to Web3Forms. The access key is embedded in `index.html`.

- **Consultation form** sends name, organisation, type of space, phone,
  email and message. Name and email are required.
- **Checklist form** sends the email address and a note that the 12-point
  check was requested. Sending the PDF is manual for now.

The button reports sending, success and failure. If a submission fails the
visitor is told to use WhatsApp instead.

To change where submissions arrive, update the address on your Web3Forms
account rather than the site.

---

## If something goes wrong

**The deploy fails.** Check that the build command is empty and the output
directory is `/`. Anything else will fail on a repository with no build.

**The page is blank.** JavaScript is required. Check the browser console.
Confirm `index.html` uploaded completely, it should be roughly 295 KB.

**The domain shows a Cloudflare error.** Give it a few minutes. Confirm the
custom domain is listed as Active in the Pages project, not just in DNS.

**Form submissions do not arrive.** Check spam. Confirm the key in
`index.html` matches your Web3Forms dashboard. Web3Forms only delivers to
the address the account was created with.

**The site looks wrong after an edit.** You probably edited `index.html`
directly. Restore it from the previous commit and edit `src.jsx` instead.

---

## Still to be done

These are not blockers for going live.

- [ ] Add CIN and GSTIN to the footer once issued
- [ ] Open Graph image, 1200 x 630, so shared links preview properly
- [ ] `robots.txt` and `sitemap.xml`
- [ ] Blog, being set up now
- [ ] Google Search Console verification
- [ ] Google Business Profile for Chennai and Bengaluru

---

Reverential AV Integration Private Limited
hello@reverentialav.in / +91 99622 32223
