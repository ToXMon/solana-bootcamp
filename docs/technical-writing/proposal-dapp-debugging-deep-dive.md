# The Proposal dApp Debugging Story: When “No Proposals Yet” Wasn’t the Problem

I thought I had finished the proposal dApp.

The Anchor program was deployed to devnet. The React UI was live on Cloudflare Workers. The app could create proposals, read accounts, submit transactions, and show proposal cards.

Then the live demo did the one thing a demo should never do: it quietly lied.

The page said:

> No proposals yet.

But the chain had proposals.

That kicked off a much longer debugging session than I expected. The final bug was not one bug. It was a stack of Solana frontend problems hiding behind the same empty state.

## What I was building

This was Exercise 7 of the Encode Club Solana Developer Bootcamp: a full dApp flow for a proposal state machine.

The on-chain program supports four instructions:

- `create_proposal`
- `activate`
- `vote`
- `close`

The state machine is simple:

```text
Draft → Active → Closed
```

The frontend needed to:

- connect a wallet
- create proposals
- fetch proposal history from devnet
- show each proposal’s state
- show vote counts
- let the creator activate/cancel/close when allowed
- let connected users vote on active proposals

The program ID on devnet:

```text
8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG
```

The live app:

```text
https://proposal-dapp.tolu-a-shekoni.workers.dev/
```

## Symptom 1: “No proposals yet”

The first visible issue was the empty state.

The UI rendered the create form, but there were no proposal cards, no state badges, no vote counts, and no action buttons.

At first, that looked like a UI rendering bug. It wasn’t.

The dApp was calling `getProgramAccounts` with a `memcmp` filter on the Anchor discriminator:

```ts
const accounts = await connection.getProgramAccounts(program.programId, {
  filters: [
    { memcmp: { offset: 0, bytes: PROPOSAL_DISCRIMINATOR.toString('base64') } }
  ],
})
```

The public devnet RPC rejected that call:

```text
-32602 INVALID_PARAMS_WITH_MESSAGE
```

The frontend caught the error and returned `[]`, so the UI displayed “No proposals yet.”

The first lesson: **an empty state can hide a failed RPC call.**

Returning `[]` from a catch block feels harmless, but in a blockchain app it can erase the difference between “nothing exists” and “we failed to read the chain.”

## Symptom 2: Fetching all accounts worked, but decoding failed

The next fix was to remove the `memcmp` filter and fetch all program accounts instead.

That worked. The RPC returned accounts.

Then decoding failed.

The debug trace looked like this:

```text
rpc_done: 15 accounts
filter_done: 11 Proposal accounts
decode_error: Account not found: Proposal
```

This was the real turning point.

The frontend had successfully fetched accounts from devnet. It had successfully matched 11 proposal accounts by discriminator. But Anchor’s coder could not decode them:

```ts
program.coder.accounts.decode('Proposal', data)
```

The error:

```text
Account not found: Proposal
```

The IDL contained `Proposal`, but the frontend stack was using an older IDL format with a newer Anchor client path. The coder did not register the account name the way the code expected.

So I stopped asking Anchor to decode it and decoded the Borsh layout manually.

The Rust account layout was explicit:

```rust
pub struct Proposal {
    pub creator: Pubkey,
    pub proposal_id: u64,
    pub title: String,
    pub state: ProposalState,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub bump: u8,
}
```

The frontend decoder became:

```ts
function decodeProposal(data: Buffer) {
  let offset = 8 // Anchor discriminator

  const creator = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  const proposal_id = new BN(data.subarray(offset, offset + 8), 'le')
  offset += 8

  const titleLen = data.readUInt32LE(offset)
  offset += 4

  const title = data.subarray(offset, offset + titleLen).toString('utf8')
  offset += titleLen

  const stateByte = data.readUInt8(offset)
  offset += 1

  const state = {
    draft: stateByte === 0 ? {} : null,
    active: stateByte === 1 ? {} : null,
    closed: stateByte === 2 ? {} : null,
  }

  const yes_votes = new BN(data.subarray(offset, offset + 8), 'le')
  offset += 8

  const no_votes = new BN(data.subarray(offset, offset + 8), 'le')
  offset += 8

  const bump = data.readUInt8(offset)

  return { creator, proposal_id, title, state, yes_votes, no_votes, bump }
}
```

That fixed proposal history.

The cards finally rendered.

## Symptom 3: The UI showed Draft, but the program said NotDraft

After proposals appeared, another bug showed up.

Clicking **Activate** on one proposal failed with:

```text
AnchorError thrown in programs/proposal-state-machine/src/lib.rs:50
Error Code: NotDraft
Error Number: 6001
Error Message: Proposal is not in Draft state.
```

The program was right.

The proposal was not in Draft.

The frontend was wrong.

The manual decoder originally returned enum state like this:

```ts
{ active: {} }
```

But the UI checked state like this:

```ts
if (state.draft !== null) return 'draft'
if (state.active !== null) return 'active'
return 'closed'
```

For an active proposal, `state.draft` was `undefined`.

And this is true:

```ts
undefined !== null
```

So every proposal looked like Draft.

The fix was to match Anchor’s expected enum shape exactly:

```ts
const state = {
  draft: stateByte === 0 ? {} : null,
  active: stateByte === 1 ? {} : null,
  closed: stateByte === 2 ? {} : null,
}
```

That one-line logic bug caused the UI to expose the wrong CTA.

The program rejected the invalid transition, which is exactly what it should do.

## The final read path

The final frontend account flow is:

1. Use Helius devnet RPC for stable account reads.
2. Call `getProgramAccounts` with `encoding: 'base64'`.
3. Convert account data to `Buffer` safely.
4. Filter accounts by Anchor discriminator.
5. Decode `Proposal` and `VoteRecord` manually from the Rust layout.
6. Return state in the enum shape the UI expects.

The important part is that each layer now has a clear responsibility.

RPC fetches accounts.

The discriminator filters account types.

The manual decoder translates bytes into frontend objects.

The UI renders only what the decoded state actually allows.

## Things that did not work

This was the useful part of the exercise.

Several plausible fixes were wrong:

| Attempt | Why it failed |
|---|---|
| Trusting the empty state | It hid RPC failures. |
| `getProgramAccounts` with `memcmp` on public RPC | The endpoint rejected the call. |
| Removing `encoding: 'base64'` | RPCs can reject large account data without base64 encoding. |
| `program.coder.accounts.decode('Proposal', data)` | Anchor coder could not find the account type from this IDL/client combination. |
| `program.account.proposal.all()` | It crashed the frontend in this setup. |
| Returning `{ active: {} }` only | UI expected inactive variants to be `null`, not missing. |

## What I learned

The main lesson was that Solana frontend bugs often sit between layers:

- RPC behavior
- account encoding
- Anchor IDL format
- Borsh layout
- enum representation
- UI state assumptions

None of those pieces were broken by themselves. The bug lived in the mismatch between them.

The on-chain program did its job. When the frontend tried to activate a non-draft proposal, the program rejected it with `NotDraft`.

That error was not the bug. It was the proof that the state machine was protecting itself.

## Checks that now pass

- Build passes.
- Unit tests pass: 19/19.
- Cloudflare Workers deploy succeeds.
- Live UI renders proposal history.
- Proposal state labels match on-chain state.
- Invalid activation path is no longer shown for non-draft proposals.

## Takeaway

If a Solana dApp frontend looks wrong, do not start with the component tree.

Start with the bytes.

Check what the RPC returned. Check the discriminator. Check the account layout. Check the enum shape. Then check the UI.

The frontend is only honest if the decoding layer is honest.
