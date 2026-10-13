# Date Invitation

A romantic, interactive date invitation site — she picks the day, time, and place, and you get emailed her answer.

## 1. Get a free email key (2 minutes, no account needed)

1. Go to https://web3forms.com
2. Enter your email address and click "Create Access Key"
3. Check your inbox, confirm your email, copy the access key it gives you

## 2. Add the key locally

Rename `.env.example` to `.env` and paste your key in:

```
VITE_WEB3FORMS_KEY=your-actual-key-here
```

## 3. Test it locally (optional but recommended)

```bash
npm install
npm run dev
```

Open the local URL it prints, go through the flow, and confirm you get the email.

## 4. Deploy to Vercel

**Option A — GitHub + Vercel dashboard (recommended, no CLI needed)**

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "date invitation site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/date-invitation.git
   git push -u origin main
   ```
2. Go to https://vercel.com → "Add New Project" → import that repo
3. Vercel will auto-detect Vite — leave the build settings as-is
4. Before deploying, add an Environment Variable:
   - Key: `VITE_WEB3FORMS_KEY`
   - Value: your Web3Forms access key
5. Click Deploy. You'll get a live `.vercel.app` URL in under a minute.

**Option B — Vercel CLI (if you have Node + npm installed)**

```bash
npm install -g vercel
vercel login
vercel
# follow the prompts, then set the env var:
vercel env add VITE_WEB3FORMS_KEY
vercel --prod
```

## 5. Custom domain (optional)

In the Vercel dashboard → your project → Settings → Domains, you can attach any domain you own, or just use the free `.vercel.app` one.

## Notes

- The free Web3Forms tier covers 250 submissions/month — way more than you'll need for one invitation.
- If you ever want her answer in a Google Sheet instead of (or in addition to) email, the same pattern works — swap the `sendEmail` function in `src/App.jsx` for a Zapier webhook call.
