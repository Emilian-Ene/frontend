# Discord Integration Setup

## Steps to Complete Discord Integration:

### 1. Create Discord Server (if you don't have one)
- Go to Discord and create a new server
- Name it "TOPC Trading Community" or similar
- Set up channels:
  - #welcome
  - #general-chat
  - #reviews-and-feedback
  - #support
  - #trading-tips

### 2. Create Invite Link
- In Discord, click your server name
- Click "Invite People"
- Click "Edit invite link"
- Set to "Never Expire"
- Set "Max number of uses" to "No limit"
- Copy the invite link (e.g., https://discord.gg/ABC123XYZ)

### 3. Update Your Website
Replace `YOUR_DISCORD_INVITE` in **index.html** with your actual Discord invite code:

**Line 678:** Discord Review Section button
```html
href="https://discord.gg/YOUR_DISCORD_INVITE"
```

**Line 267:** Header Community button
```html
href="https://discord.gg/YOUR_DISCORD_INVITE"
```

**Line 346:** Mobile menu Discord button
```html
href="https://discord.gg/YOUR_DISCORD_INVITE"
```

### 4. Example
If your Discord invite is: `https://discord.gg/topc-trading`

Change:
```html
href="https://discord.gg/YOUR_DISCORD_INVITE"
```

To:
```html
href="https://discord.gg/topc-trading"
```

### 5. What Was Added to Your Site:

✅ **Header Navigation** - Purple "Community" button (desktop only)
✅ **Mobile Menu** - Discord join button with icon
✅ **Review Section** - Full section with:
  - Large Discord icon
  - "Leave a Review on Discord" CTA button
  - Stats cards (500+ traders, 4.8★ rating, 24/7 support)
  - Link to testimonials page
  
✅ **Features:**
  - Gradient background (indigo/purple)
  - Hover effects on buttons
  - Responsive design (mobile & desktop)
  - External link icons
  - Professional styling matching TOPC theme

### 6. Customize (Optional)

You can update the stats in the review section (line 703-717):
- Change "500+" to your actual trader count
- Change "4.8★" to your actual rating
- Change "24/7" to your support hours

---

## Testing Checklist:

- [ ] Replace all 3 Discord invite links
- [ ] Test Discord button in header (desktop)
- [ ] Test Discord button in mobile menu
- [ ] Test "Leave a Review" button in review section
- [ ] Verify links open in new tab
- [ ] Test on mobile and desktop
- [ ] Commit changes to git

---

**File Modified:** `index.html`
**Locations:** 3 places (header, mobile menu, review section)
**Status:** Ready to deploy after adding Discord invite link
