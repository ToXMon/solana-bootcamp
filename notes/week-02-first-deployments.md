# Week 2: First Deployments — Learning Notes

## Development Environment

### Toolchain Checklist
*Document your setup steps here*

### Devnet Configuration
*Document your devnet setup here*

## Exercise 1: Hello Solana
- **Goal**: Setup environment, run default deploy
- **Deliverable**: Deployed Program ID ✅
- **Program ID**: `ggUpdzgva3CDB3UeDS6ntkLKgHGvrL5ApwW395Sj4k3`
- **Deploy Tx**: [2GYp4w...wiHAsS](https://explorer.solana.com/tx/2GYp4wAtDBW7QFQBATtBRwm7kwnMMzm3MHaunAr7FFEifGsq9aEBGJ3QjXCynd14qsVh6R87V78TKkCFG1wiHAsS?cluster=devnet)
- **Test Tx**: [8BGNmR...Bw4Pn](https://explorer.solana.com/tx/8BGNmRTf3cpj63gDwFfjWswRVkAFJer4ez7cGzwDEzJPoeJEttLyMV9b6bU2eW2q7o9URjLC3Xv1YuStw8Bw4Pn?cluster=devnet)
- **Explorer**: [Program on Solana Explorer](https://explorer.solana.com/address/ggUpdzgva3CDB3UeDS6ntkLKgHGvrL5ApwW395Sj4k3?cluster=devnet)

### Notes
- Toolchain installed: Rust 1.96.0, Solana CLI 4.0.1, Anchor CLI 0.31.0
- npm anchor-cli package is just a JS wrapper — must compile binary from source via cargo
- Program deployment costs ~1.26 SOL (rent exemption for 180KB BPF binary)
- Devnet airdrops have rate limits — used web faucet as backup
- Built in 4m 41s, deployed and tested successfully on first try

---

## Exercise 2: Counter PDA
- **Goal**: Write instructions to initialize and increment a PDA counter
- **Deliverable**: User-scoped PDA state
- **Program ID**: *(fill after deploying)*
- **Explorer Link**: *(fill after verifying)*

### Notes
*Document your experience here*

## Key Learnings
*Add insights as you work through exercises*
