# Exercise 7 Content Pack — Proposal dApp Debugging

## Core Story

I shipped a Solana proposal dApp, but the live UI kept lying.

The chain had proposals. The page said “No proposals yet.”

Then the page showed proposals as Draft even when the on-chain program rejected activation with `NotDraft`.

The fix was not another React component. It was account decoding.

---

## X Thread

### Tweet 1
I thought my Solana proposal dApp was done.

Then the live demo showed:

“No proposals yet”

Except devnet had proposal accounts on-chain.

The bug was not React.
It was RPC + Anchor IDL + Borsh decoding + enum shape.

Here’s the debugging story 👇

### Tweet 2
The dApp was simple on paper:

Draft → Active → Closed

Instructions:
- create_proposal
- activate
- vote
- close

Frontend:
- wallet connect
- proposal history
- state badges
- vote counts
- creator-only CTAs

Then production said: “No proposals yet.”

### Tweet 3
First mistake: the empty state was hiding an RPC failure.

`getProgramAccounts` with a `memcmp` discriminator filter was rejected by the public devnet RPC:

`-32602 INVALID_PARAMS_WITH_MESSAGE`

The catch block returned `[]`.

So “failed to read chain” became “nothing exists.”

### Tweet 4
Next fix: fetch all accounts and filter client-side by Anchor discriminator.

That got further:

- RPC returned 15 accounts
- discriminator matched 11 Proposal accounts
- decoding failed on all 11

Error:

`Account not found: Proposal`

### Tweet 5
The IDL had `Proposal`.

But the Anchor client coder could not decode it from this IDL/client combo.

So I stopped relying on:

`program.coder.accounts.decode('Proposal', data)`

And decoded the Borsh layout manually from the Rust struct.

### Tweet 6
The Proposal account layout was:

- 8-byte discriminator
- creator pubkey
- proposal_id u64
- title string
- state enum
- yes_votes u64
- no_votes u64
- bump

Once I decoded those bytes directly, proposal history finally rendered.

### Tweet 7
Then a second bug appeared.

The UI showed a proposal as Draft.

Clicking Activate threw:

`Error Code: NotDraft`
`Proposal is not in Draft state`

The program was right.
The frontend was lying again.

### Tweet 8
The enum decoder returned:

`{ active: {} }`

But the UI checked:

`state.draft !== null`

For an active proposal, `state.draft` was `undefined`.

And `undefined !== null` is true.

So every proposal looked like Draft.

### Tweet 9
The fix was to match Anchor’s enum shape:

```ts
{
  draft: stateByte === 0 ? {} : null,
  active: stateByte === 1 ? {} : null,
  closed: stateByte === 2 ? {} : null,
}
```

Tiny shape mismatch.
Huge UX bug.

### Tweet 10
Final checks:

- build passes
- tests 19/19
- Cloudflare deploy works
- proposal history renders live
- state badges match on-chain state
- invalid Activate CTA no longer appears

The on-chain state machine protected itself.
The frontend had to learn to tell the truth.

### Tweet 11
Big lesson from Exercise 7:

If a Solana UI looks wrong, start with the bytes.

RPC response → discriminator → Borsh layout → enum shape → UI.

React was the last mile.
The real bug was in the decoding layer.

#Solana #BuildInPublic #Web3 #EncodeClub

---

## Short X Post

Spent way longer than expected debugging my Solana proposal dApp.

The UI said “No proposals yet,” but devnet had accounts.

Then it showed Active proposals as Draft because my manual enum decoder returned `undefined` instead of `null` for inactive variants.

Final lesson: Solana frontends are only as honest as their account decoder.

#Solana #BuildInPublic #EncodeClub

---

## LinkedIn Post

I learned a hard lesson while shipping my Solana proposal dApp: the frontend can lie even when the smart contract is correct.

The app had a simple state machine:

Draft → Active → Closed

The live UI was supposed to show proposal history, state badges, vote counts, and the correct action buttons.

Instead, it showed “No proposals yet.”

The chain had accounts. The UI didn’t show them.

After debugging, the issue turned out to be a layered frontend problem:

1. Public devnet RPC rejected `getProgramAccounts` with a `memcmp` filter.
2. The empty-state UI swallowed the error and returned `[]`.
3. Fetching all accounts worked, but Anchor’s coder failed with `Account not found: Proposal`.
4. Manual Borsh decoding fixed account reads.
5. Then the enum shape was wrong: inactive variants were missing instead of `null`, so Active proposals looked like Draft.

That last bug triggered this on-chain error when I clicked Activate:

`Error Code: NotDraft`

The program was right. The frontend was wrong.

What finally worked:

- fetch accounts with base64 encoding
- filter by Anchor discriminator
- manually decode the Borsh account layout
- return Anchor-style enum objects: `{ draft, active, closed }` with inactive variants set to `null`

The dApp now renders proposal history and state correctly.

My takeaway: when a Solana UI behaves strangely, don’t start by blaming React. Start with the account bytes.

RPC → discriminator → Borsh layout → enum shape → UI.

That path saved the demo.

#Solana #Web3 #BuildInPublic

---

## Short-Form Video Script — 60 seconds

### Hook (0-3s)
[TEXT: “My Solana UI was lying.”]

I shipped a proposal dApp, but the live UI said “No proposals yet.”

The chain had proposals.

### Problem (3-15s)
[VISUAL: terminal/RPC response: 15 accounts]

First bug: the RPC call failed with a `memcmp` filter, and the frontend swallowed the error as an empty array.

So “failed to read devnet” looked like “nothing exists.”

### Twist (15-30s)
[VISUAL: debug log]

Then I fetched all accounts.

RPC worked.
Discriminator filtering worked.
Decoding failed:

`Account not found: Proposal`

Anchor’s coder and my IDL format didn’t agree, so I decoded the Borsh layout manually.

### Second Twist (30-45s)
[VISUAL: Draft → Active → Closed]

Then the UI showed Active proposals as Draft.

Why?

My enum decoder returned `{ active: {} }`, but the UI expected inactive variants to be `null`.

`undefined !== null` made everything look Draft.

### Close (45-60s)
[VISUAL: live dApp with proposal cards]

Final fix:
RPC → discriminator → manual Borsh decode → Anchor-shaped enum.

Lesson: Solana frontends are only as honest as their account decoder.

#Solana #BuildInPublic #EncodeClub

---

## Hooks

1. My Solana dApp worked on-chain. The UI was lying.
2. “No proposals yet” was the most misleading bug I hit this week.
3. The smart contract was right. React was not the problem.
4. I spent hours debugging a Solana UI bug that came down to `undefined !== null`.
5. If your Solana frontend looks wrong, start with the bytes.
6. Anchor protected my state machine. My frontend tried to betray it.
7. A proposal was Active on-chain and Draft in the UI. Here’s why.

