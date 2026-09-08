# Reverential AV Integration Landing Page

Live site for **www.reverentialav.in**

---

## What is in this repo

| File | Purpose |
|---|---|
| `index.html` | The live site. Self-contained: fonts from Google, everything else inline. Deploy this. |
| `src.jsx` | The source component. All copy, colours and layout live here. |
| `README.md` | This file. |
| `.gitignore` | Standard ignores. |

`index.html` is a **compiled artifact** built from `src.jsx`. Do not hand-edit it , 
the JavaScript inside is minified. Edit `src.jsx` and rebuild.

---

## Deploying to Cloudflare Pages

1. Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**
2. Select the `reverential-av-landing` repository
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
4. **Save and Deploy**
5. Project → **Custom domains** → **Set up a custom domain** → `www.reverentialav.in`

The domain already runs on Cloudflare nameservers, so activation is immediate.
Add `reverentialav.in` as a second custom domain so the apex redirects to www.

Every push to `main` redeploys automatically.

---

## Contact form

Wired to **Web3Forms**. Access key is already embedded and live.

Two forms post to it:
- The consultation request (name, organisation, space type, phone, email, message)
- The 12-point checklist request (email only)

Submissions arrive at the address registered on your Web3Forms account.
Name and email are required on the consultation form; the button reports
sending, success and failure states.

---

## Editing the site

Text, colours and layout are all in `src.jsx`.

Common edits and where to find them:

| To change | Search `src.jsx` for |
|---|---|
| Headline | `They can hear the sound` |
| Hero paragraph | `We design and deploy audiovisual` |
| Sector tabs and pain points | `const SECTORS` |
| The six method phases | `const PHASES` |
| FAQ questions and answers | `const FAQS` |
| Credentials paragraph | `Before founding Reverential` |
| Phone, email, WhatsApp | `PHONE_DISPLAY`, `EMAIL`, `WHATSAPP` |
| Brand colours | `const C = {` |

### Rebuilding after an edit

```bash
npm install react react-dom lucide-react esbuild
npx esbuild entry.jsx --bundle --minify --format=iife --target=es2018 \
  --loader:.jsx=jsx --jsx=automatic --outfile=bundle.js \
  --define:process.env.NODE_ENV='"production"'
```

Then inline `bundle.js` into the `<script>` tag at the bottom of `index.html`.

A proper build script is being added so this becomes a single command.

---

## SEO already in place

- Title and meta description targeting churches and auditoriums
- Canonical URL, robots directives, theme colour
- Open Graph and Twitter card tags
- `LocalBusiness` schema with services, areas served and contact details
- Areas served: Chennai, Coimbatore, Tiruchirappalli, Nagercoil, Kochi,
  Thiruvananthapuram, Bengaluru, Hyderabad, plus Tamil Nadu, Kerala,
  Karnataka and India

Still to add: `sitemap.xml`, `robots.txt`, an Open Graph image, and the blog.

---

## Structure and design are locked

Section order, layout, colour palette, typography and the interaction model
are fixed. Copy is editable. Any structural change should be made in `src.jsx`
and verified before deployment.

---

Reverential AV Integration Private Limited / Chennai and Bengaluru
hello@reverentialav.in / +91 99622 32223
