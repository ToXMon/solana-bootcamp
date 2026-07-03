# Encode Club Content Package: Proposal DApp Live Demo

**Date:** June 26, 2026
**Author:** Tolu (Tolu A. Shekoni)
**Context:** Encode Club Solana Bootcamp - Exercise 7 (Full DApp Flow)

---

## 1. The X/Twitter Thread (Draft)

**Goal:** Showcase technical depth + build-in-public spirit. Focus on the "glitch to glory" narrative.

### Tweet 1 (The Hook)
> My first reaction to the proposal dApp was that Solana devnet was broken. It wasn’t.

> The frontend was lying.

> 3 layers deep, I found the real bug: a 1-byte enum mismatch making Active proposals look like Drafts.

> Here’s how I fixed a live Solana dApp 👇

### Tweet 2
> 📍 The Context

> I was building the full dApp flow for the Encode Club Solana Bootcamp.

> Simple goal: Create → Vote → Close.

> Status: The UI showed “No proposals yet.”

> Reality: Devnet had 14 accounts sitting there.

> That’s when the hunt started.

### Tweet 3
> 🔎 Layer 1: The RPC Lie

> The app used a `memcmp` filter to fetch accounts.

> Public devnet RPC rejected it: `-32602 INVALID_PARAMS_WITH_MESSAGE`

> The catch block returned `[]`.

> Result: “No proposals” was just a swallowed error.

> ✅ Fix: Fetch all accounts + filter client-side.

### Tweet 4
> 🔎 Layer 2: The Anchor Lie

> Fetching worked. Decoding failed.

> Error: `Account not found: Proposal`

> The Anchor coder couldn't match the account from the IDL spec.

> I stopped asking Anchor to decode and decoded the Borsh layout manually from the Rust struct.

> ✅ Fix: Manual Borsh decoding.

### Tweet 5
> 🔎 Layer 3: The UI Lie (The Fun One)

> After decoding, proposals showed up as `Draft`...

> Even when the on-chain program rejected activation with: `Error Code: NotDraft`

> The frontend was wrong.

> My enum decoder returned `{ active: {} }` but the UI expected `{ active: {}, draft: null }`.

> `undefined !== null` meant everything looked like Draft.

### Tweet 6
> 🏁 The Fix

> Match Anchor’s expected enum shape:

> ```ts
> const state = {
>   draft: stateByte === 0 ? {} : null,
>   active: stateByte === 1 ? {} : null,
>   closed: stateByte === 2 ? {} : null,
> }
> ```

> Tiny shape mismatch. Huge UX bug.

> Now it works.

### Tweet 7
> 📺 The Demo

> I recorded a live demo of the fully working flow:

> 1. Connect Wallet
> 2. Create Proposal (Draft)
> 3. Verify on Solana Explorer
> 4. Activate & Vote

> No more lies.

> Link below 👇

### Tweet 8
> 🧵 What I learned:

> 1. Solana frontends are only as honest as their account decoder.
> 2. Always verify deployments on-chain.
> 3. `undefined !== null` will haunt you.

> Thanks @solana and @encodeclub for the journey.

> #Solana #BuildInPublic #Web3 #EncodeClub

---

## 2. Live Demo Recording Plan

**Platform:** Screen recording (Loom / OBS / QuickTime)
**Target Length:** 60-90 seconds
**Audio:** Voiceover (excited, authentic)

### Step 1: The Hook (0:00 - 0:10)
*   **Visual:** Open your browser to `https://proposal-dapp.tolu-a-shekoni.workers.dev/` (leave it on the "No proposals" empty state first).
*   **Audio:** "I want to show you the final result of my proposal state machine dApp for the Encode Club bootcamp. This one taught me a *lot* about debugging."

### Step 2: The Setup (0:10 - 0:20)
*   **Visual:** Click "Connect Wallet" (ensure you are using your main devnet wallet).
*   **Audio:** "I'm connecting my main devnet wallet. As you can see, the app is live on Cloudflare Workers and it's fetching real data from devnet."

### Step 3: The Creation (0:20 - 0:35)
*   **Visual:** Type a title in "Create a Proposal" (e.g., "Encode Bootcamp Challenge 7"). Click "Create".
*   **Audio:** "I'm creating a new proposal right here. Watch the state..."
*   **Visual:** Confirm transaction in Phantom/Solflare.
*   **Audio:** "...and boom. It's live on-chain as a 'Draft'."

### Step 4: The Verification (0:35 - 0:50)
*   **Visual:** Click the Explorer link (if visible) OR open a new tab and paste your Program ID `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG` into Solana Explorer.
*   **Audio:** "The most important step in Solana dev: verify on-chain. Here it is in Solana Explorer — the transaction is there, the PDA is there."

### Step 5: The Flow (0:50 - 1:10)
*   **Visual:** Go back to the app tab. If the proposal is Draft, click "Activate". If it's Active, scroll to show the Vote button.
*   **Audio:** "Back on the frontend, notice how the UI now correctly shows the state. I'm activating it... and now I can vote."

### Step 6: Outro (1:10 - End)
*   **Visual:** Show the finished UI with the proposal visible and interactive.
*   **Audio:** "That’s it. From 'No proposals yet' bugs to a fully working state machine. I’ll drop the demo video in my thread so you can check it out. Thanks for building with me!"

---

## 3. Post-Deployment Checklist

*   [ ] Record the screen capture using the script above.
*   [ ] Export as MP4 (keep it < 50MB for Twitter/X compatibility).
*   [ ] Upload video to X/Twitter.
*   [ ] Copy the thread drafted above into a new draft tweet.
*   [ ] **Crucial:** Ensure the dApp is running (Cloudflare Workers is usually always on, but double-check).

---

## 4. Technical Details for Comments/Engagement

*   **Live URL:** https://proposal-dapp.tolu-a-shekoni.workers.dev/
*   **Program ID:** `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`
*   **Tech Stack:** Anchor, Solana Program Library, React, Tailwind, Cloudflare Workers.
*   **Hard Bug:** Manual Borsh decoding required because the Anchor coder path failed on the IDL spec version.
