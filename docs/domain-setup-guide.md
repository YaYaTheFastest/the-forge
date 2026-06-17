# Domain Acquisition Guide for RockinJRacing.com

**Goal**: Get a custom domain like rockinj racing.com pointing to your Digital Ocean droplet so the Forge app is accessible at https://rockinj racing.com from anywhere (phone, any computer), with free HTTPS.

**Estimated Cost**: 
- ~$9-13 for the first year (depending on registrar and promotions).
- ~$10-15 per year for renewal.
- No extra cost from Digital Ocean (your existing droplet covers hosting). SSL certificate is free via Let's Encrypt.

**Recommended Registrar**: Cloudflare (lowest ongoing price, excellent free DNS, no markup on .com domains). Alternative: Namecheap (easy UI, often cheap first year).

## Step-by-Step Instructions (Cloudflare)

1. Go to https://dash.cloudflare.com/sign-up (or log in if you have an account).

2. Create a free account with your email (no credit card needed yet).

3. Once logged in, in the left menu, click **Registrar** (or search for it).

4. In the search bar, type `rockinj racing.com` and hit Enter/Search.

5. If available:
   - Click "Add to cart" or "Register".
   - Review pricing (should show first year cost, e.g., $8.98 or similar with promo).
   - Proceed to checkout. Create or use existing payment method.
   - Complete the purchase (takes 1-5 minutes; you'll get a confirmation email).

6. After purchase:
   - The domain will appear under your Registrar list.
   - Click on the domain name.
   - Go to the **DNS** tab.
   - Click "Add record".
     - Type: A
     - Name: @ (this is for the root domain, rockinj racing.com)
     - IPv4 address: 161.35.97.99
     - TTL: Auto
     - Proxy status: **DNS only** (gray cloud, important for now)
   - Add another for www if desired:
     - Type: CNAME
     - Name: www
     - Target: @ (or rockinj racing.com)
     - Proxy: DNS only

7. Wait for DNS propagation (usually 5-60 minutes, up to a few hours). You can check at https://dnschecker.org with your domain.

8. Once DNS is live, SSH to your droplet:
   ```
   ssh root@161.35.97.99
   ```
   (Use your SSH key or password.)

9. Run the domain setup script (replace YOUR_DOMAIN with rockinj racing.com):
   ```
   cd /root/the-forge/scripts
   chmod +x setup-droplet-nginx.sh
   ./setup-droplet-nginx.sh
   ```
   Edit the script first to set `DOMAIN="rockinj racing.com"` and your email.

10. Test: In browser, go to https://rockinjracing.com. You will be prompted for HTTP Basic Auth (username/password) — the site is restricted for security. Enter the credentials you created with `htpasswd` on the droplet. Once in, you will see the Forge with the floating chat button.

**Notes**:
- If the domain is taken, alternatives like rockinj racing.app or rockinjracing.net are cheap too.
- After setup, the floating Grok chat on the live site can handle questions and apply updates directly to the droplet's vault (no Mac needed for those).
- For full automation, the Mac Hermes watcher (see other docs) will feed tasks to your desktop app.

If you hit any error (e.g., during certbot), paste the output here and I'll give the exact fix command.

Once purchased and DNS set, reply "purchased" and I'll give the precise droplet commands.