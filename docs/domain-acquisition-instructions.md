# How to Acquire rockinjracing.com (Clear Step-by-Step) - Purchased from Squarespace

**Cost estimate (as of 2026):** 
- First year: Usually $8–$13 (often with promo for new domains).
- Renewals: ~$10–$15/year.
- No extra monthly cost from Digital Ocean. SSL (https) is free via Let's Encrypt.

**Recommended registrar:** Cloudflare (cheapest long-term, excellent free DNS, no upselling, privacy-friendly). Alternative: Namecheap (very beginner-friendly).

## Step 1: Go to Cloudflare Registrar
1. Open your browser and go to: https://dash.cloudflare.com/sign-up
2. Sign up for a free account (or log in if you have one). Use the same email as your Forge if you want.
3. Verify your email if prompted.

## Step 2: Search and Buy the Domain
1. Once logged in, in the left menu click **Registrar** (or go directly to https://dash.cloudflare.com/registrar).
2. In the big search bar, type exactly: `rockinj racing.com` and hit Enter or click the search icon.
3. If available:
   - You'll see the price (e.g. $8.98 or similar for first year).
   - Click **Add to cart** or the price button.
4. Review the cart (it will show first-year price + any add-ons – you can skip most).
5. Click **Continue to checkout**.
6. Enter payment info (card, Apple Pay, etc.) and complete purchase.
7. You'll get a confirmation email. The domain is now yours (registration usually takes 1-5 minutes).

## Step 3: Set Up DNS (Point to Your Droplet)
1. After purchase, the domain appears under **Registrar > Manage Domains**.
2. Click on **rockinj racing.com**.
3. Go to the **DNS** tab.
4. Click **Add record**.
   - Type: **A**
   - Name: `@` (this means the bare domain rockinj racing.com)
   - IPv4 address: `161.35.97.99` (your droplet IP)
   - TTL: Auto
   - Proxy status: **DNS only** (grey cloud – do NOT turn orange yet)
5. Click **Save**.
6. (Optional but recommended for www.rockinj racing.com):
   - Add another record:
     - Type: **CNAME**
     - Name: `www`
     - Target: `@` or `rockinj racing.com`
     - TTL: Auto
     - Proxy: DNS only

7. Wait 5–60 minutes for DNS to propagate worldwide. You can check progress at https://dnschecker.org (enter rockinj racing.com and look for A record pointing to 161.35.97.99).

## Step 4: Tell Me When Done
Reply here with something like:
"Domain purchased and DNS set" (or just "purchased").

I'll then give you the exact 4–5 copy-paste commands to run on your droplet to:
- Install nginx (web server)
- Set up automatic HTTPS (free SSL)
- Make https://rockinj racing.com work and point to your Forge app + floating chat.

**Tips to avoid overwhelm:**
- You only need the A record for the root domain to get started.
- If the domain shows as taken or expensive, let me know – we can pick a cheap alternative like rockinj racing.app.
- Cloudflare will email you everything; no rush.

This is the only paid piece for the domain. Everything else (droplet hosting, SSL, chat) is already covered or free.

Once you confirm purchase, we'll do the droplet side in one short session. Then the live site will be at https://rockinj racing.com with the in-app Grok chat fully functional for questions and direct updates.