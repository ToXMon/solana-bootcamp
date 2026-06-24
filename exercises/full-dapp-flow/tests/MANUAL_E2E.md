# Manual Devnet E2E Verification Checklist

Target app: `exercises/full-dapp-flow`  
Network: Solana devnet only  
Program ID: `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`

## Pre-flight

- [ ] `solana config get` shows `https://api.devnet.solana.com` or an approved devnet RPC.
- [ ] Test wallet has devnet SOL for transaction fees.
- [ ] Browser wallet is set to devnet.
- [ ] App starts with `npm run dev` and console has no red errors.
- [ ] Open Solana Explorer in devnet mode: `https://explorer.solana.com/?cluster=devnet`.

## Wallet connection

- [ ] Connect Phantom wallet.
  - Expected: wallet button changes from `Connect Wallet` to truncated address.
  - Evidence: screenshot connected state.
- [ ] Disconnect Phantom wallet.
  - Expected: button returns to `Connect Wallet`; proposal create/vote actions requiring wallet are unavailable or fail gracefully.
- [ ] Repeat connect/disconnect with Solflare.
  - Expected: same behavior as Phantom.

## Create proposal

- [ ] Enter a non-empty proposal title and submit.
- [ ] Approve the transaction in the wallet.
- [ ] Capture transaction signature from UI/wallet/devtools.
- [ ] Verify the transaction on Solana Explorer devnet.
  - Expected: transaction status is successful.
  - Expected: instruction targets program ID `8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG`.
- [ ] Verify the new proposal appears in the UI as `Draft` with `0` yes votes and `0` no votes.
- [ ] Verify the proposal PDA/account on Explorer devnet.
  - Expected: account owner is the program ID.

## Activate proposal

- [ ] As the creator, click `Activate` on a draft proposal.
- [ ] Approve the transaction.
- [ ] Verify transaction success on Explorer devnet.
- [ ] Refresh/refetch proposals.
- [ ] Confirm UI state changes from `Draft` to `Active`.
- [ ] Confirm `Activate` and `Cancel` buttons disappear and creator close action is available.

## Vote yes/no

- [ ] With a wallet that has not voted, vote `Yes` on an active proposal.
- [ ] Approve and verify transaction on Explorer devnet.
- [ ] Confirm yes vote count increments by 1 after refetch.
- [ ] Attempt to vote again from the same wallet.
  - Expected: transaction fails or UI reports already-voted error without corrupting counts.
- [ ] Switch to a second funded devnet wallet and vote `No`.
- [ ] Verify transaction on Explorer devnet.
- [ ] Confirm no vote count increments by 1.
- [ ] Verify vote record PDA/account exists on Explorer devnet if address is exposed or derivable.

## Close proposal

- [ ] As creator, click `Close` on an active proposal.
- [ ] Approve and verify transaction on Explorer devnet.
- [ ] Refresh/refetch proposals.
- [ ] Confirm UI state changes to `Closed`.
- [ ] Confirm voting and close actions are no longer available.

## Unauthorized actions

- [ ] Connect a non-creator wallet to a draft proposal.
  - Expected: `Activate` and `Cancel` are not rendered.
- [ ] Connect a non-creator wallet to an active proposal.
  - Expected: `Close` is not rendered.
- [ ] If a direct transaction can be attempted from devtools/script, try activating or closing as non-creator.
  - Expected: on-chain transaction fails with an authorization error.
  - Expected: UI displays a readable error and does not show stale success state.

## Responsive checks

Use browser devtools device toolbar.

- [ ] 320px width: wallet button, create form, proposal cards, dialogs fit without horizontal scrolling.
- [ ] 768px width: card spacing and form layout remain readable.
- [ ] 1024px width: primary flow is visible without layout overlap.
- [ ] 1440px width: content max-width/spacing remains balanced; no stretched controls.

## Accessibility and performance

- [ ] Keyboard-only flow: connect button, create form, proposal actions, dialogs can be reached with Tab/Shift+Tab.
- [ ] Dialog focus stays inside modal and returns after close.
- [ ] Screen-reader labels are present for wallet status, proposal status, explorer links, and loading/error states.
- [ ] Run Lighthouse against local preview or deployed build.
  - Expected: Accessibility score >= 90.
  - Expected: Performance score >= 80.
- [ ] Save Lighthouse report or screenshot as evidence.

## Evidence to capture

- [ ] Wallet connected screenshot.
- [ ] Create proposal transaction Explorer URL.
- [ ] Proposal account Explorer URL.
- [ ] Activate transaction Explorer URL.
- [ ] Yes vote transaction Explorer URL.
- [ ] No vote transaction Explorer URL.
- [ ] Close transaction Explorer URL.
- [ ] Unauthorized action error screenshot or transaction failure URL.
- [ ] Responsive screenshots at 320px, 768px, 1024px, 1440px.
- [ ] Lighthouse report screenshot or exported JSON/HTML.
