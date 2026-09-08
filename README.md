# Reverential Landing Page

Production landing page for Reverential AV Integration Private Limited.

**Status:** Ready for deployment to Cloudflare Pages.

---

## Quick Start

### 1. Clone this repo
```bash
git clone https://github.com/your-username/reverential-landing.git
cd reverential-landing
```

### 2. Set up Web3Forms (required for contact form)

The contact form requires a Web3Forms API key to function. This is free and takes 2 minutes:

1. Visit https://web3forms.com and create a free account
2. Create a new form and copy the **Access Key**
3. In `index.html`, find the line:
   ```javascript
   const accessKey = '[FILL: WEB3FORMS ACCESS KEY]';
   ```
4. Replace `[FILL: WEB3FORMS ACCESS KEY]` with your actual access key
5. Save the file

### 3. Deploy to Cloudflare Pages

**Option A: Via GitHub (Recommended)**

1. Push your local changes to GitHub:
   ```bash
   git add .
   git commit -m "Add Web3Forms access key"
   git push origin main
   ```

2. In Cloudflare Dashboard:
   - Go to **Pages**
   - Click **Create a project** → **Connect to Git**
   - Select this GitHub repo
   - Framework: **None**
   - Build command: (leave empty)
   - Build output directory: `.` (current directory)
   - Click **Save and Deploy**

3. Cloudflare will automatically deploy on every push to `main`

**Option B: Direct Upload**

1. In Cloudflare Dashboard:
   - Go to **Pages**
   - Click **Upload assets**
   - Drag and drop `index.html`
   - Click **Deploy**

### 4. Point your domain to Cloudflare Pages

In **Spaceship** (your domain registrar):

1. Go to your domain settings
2. Find **Nameservers** (or **DNS** settings)
3. Replace current nameservers with Cloudflare's:
   - `eva.ns.cloudflare.com`
   - `noah.ns.cloudflare.com`
4. Save changes (may take up to 48 hours to propagate, usually 5–10 minutes)

Once DNS propagates, `www.reverentialav.in` and `reverentialav.in` will serve the site.

---

## File Structure

```
reverential-landing/
├── index.html          Production landing page (fully self-contained)
├── README.md           This file
├── .gitignore          Git ignore rules
└── LOCKED_INVENTORY    Asset coordinate reference (for reference only)
```

---

## Editing Content

The site is locked for structure and design, but all text is editable:

1. **Hero section:** Search for "They can hear the sound" in `index.html`
2. **Sector content:** Search for "Churches" section in the HTML
3. **FAQ answers:** Search for "How do we start" in the HTML
4. **Contact details:** Replace `hello@reverentialav.in`, `+91 99622 32223`, `wa.me/919962232223`

After editing, commit and push to GitHub — Cloudflare will auto-deploy:
```bash
git add index.html
git commit -m "Update [section name]"
git push origin main
```

---

## Colour Palette (Locked)

Edit the CSS variables in `index.html` if brand colours change:

```css
:root {
  --black: #0B0B0B;
  --gold: #C6A13A;
  --gold-text: #856A20;
  --ww: #F1F0EC;        /* warm white */
  --surface: #E9E8E4;
  --body: #4A4A4A;
  --muted: #6B6A67;
}
```

---

## Typography (Locked)

- **Serif:** Spectral (headings, display)
- **Sans:** IBM Plex Sans (body, UI)
- **Mono:** IBM Plex Mono (labels, tags, data)

Imported from Google Fonts. Fallbacks included.

---

## Responsive Breakpoints

Tested at:
- Mobile: 320px, 420px
- Tablet: 540px, 760px, 840px
- Desktop: 900px, 960px, 1000px+

No changes needed unless design direction changes.

---

## Form Submission

The contact form submits to Web3Forms. You will receive emails at the address configured in your Web3Forms account.

Form fields:
- Name (required)
- Organisation (required)
- Phone (optional)
- Email (required)
- Space type (required, 7 options)
- Message (optional)
- Checklist email (optional — for 12-point PDF distribution)

---

## Support & Troubleshooting

**Form not working?**
- Check that Web3Forms access key is correctly inserted (no `[FILL]` placeholder remaining)
- Test at https://web3forms.com to ensure your key is valid

**Domain not resolving?**
- DNS changes in Spaceship can take up to 48 hours
- Verify nameservers changed in Spaceship admin panel
- Use https://dnschecker.org to check propagation status

**Build failing on Cloudflare?**
- No build step is required. If you see errors, ensure no build command is set in Pages settings
- The site is a static HTML file with no dependencies

---

## 12-Point Sound System Check

A companion PDF is available at `/reverential-sound-check.pdf` (separate asset).

Link on the site: `https://www.reverentialav.in/reverential-sound-check.html`

---

## Assets & Branding

- **Logo:** Embedded as base64 data URI (no external file required)
- **Fonts:** Google Fonts (included via CDN)
- **Icons:** CSS-only or Unicode characters
- **Performance:** ~51 KB total size, fully self-contained

---

## License

Private site for Reverential AV Integration Private Limited. Do not redistribute without permission.

---

## Created

September 2026

---

For questions or updates, contact **hello@reverentialav.in**
