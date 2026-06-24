import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TipJarCpi } from "../target/types/tip_jar_cpi";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { assert } from "chai";

describe("tip-jar-cpi", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.tipJarCpi as Program<TipJarCpi>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  // Fresh owner keypair per run — unique PDA avoids "account already exists"
  const owner = Keypair.generate();
  const depositor2 = Keypair.generate();

  const [tipJarPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("tip_jar"), owner.publicKey.toBuffer()],
    program.programId
  );

  async function fetchTipJar() {
    return program.account.tipJar.fetch(tipJarPda);
  }

  async function getPdaLamports() {
    const info = await provider.connection.getAccountInfo(tipJarPda);
    return info?.lamports ?? 0;
  }

  before(async () => {
    // Fund owner + depositor2 from payer (avoids airdrop 429)
    // Amounts sized to fit post-deploy balance (~1.33 SOL)
    const tx = new Transaction()
      .add(SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: owner.publicKey,
        lamports: 0.3 * LAMPORTS_PER_SOL,
      }))
      .add(SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: depositor2.publicKey,
        lamports: 0.2 * LAMPORTS_PER_SOL,
      }));
    const sig = await provider.sendAndConfirm(tx);
    console.log("\n  Funded owner + depositor2:", sig);
    console.log("  Payer:", payer.publicKey.toBase58());
    console.log("  Owner:", owner.publicKey.toBase58());
    console.log("  Depositor2:", depositor2.publicKey.toBase58());
    console.log("  TipJar PDA:", tipJarPda.toBase58());
  });

  it("Initializes the tip jar PDA with owner and total_tips = 0", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        tipJar: tipJarPda,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("  Initialize tx:", tx);

    const tipJar = await fetchTipJar();
    assert.equal(tipJar.owner.toBase58(), owner.publicKey.toBase58());
    assert.equal(tipJar.totalTips.toNumber(), 0);
    assert.isAbove(tipJar.bump, 0);

    console.log("  Owner:", tipJar.owner.toBase58());
    console.log("  Total tips:", tipJar.totalTips.toNumber());
    console.log("  Bump:", tipJar.bump);
  });

  it("Deposits 0.1 SOL from owner — total_tips increments", async () => {
    const depositAmount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
    const pdaBefore = await getPdaLamports();

    const tx = await program.methods
      .deposit(depositAmount)
      .accounts({
        tipJar: tipJarPda,
        depositor: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("  Deposit tx:", tx);
    console.log("  Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

    const tipJar = await fetchTipJar();
    const pdaAfter = await getPdaLamports();

    assert.equal(tipJar.totalTips.toNumber(), depositAmount.toNumber());
    assert.equal(pdaAfter - pdaBefore, depositAmount.toNumber());

    console.log("  PDA lamports before:", pdaBefore);
    console.log("  PDA lamports after:", pdaAfter);
    console.log("  Total tips:", tipJar.totalTips.toNumber());
  });

  it("Deposits from a different user — total_tips accumulates", async () => {
    const depositAmount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
    const tipJarBefore = await fetchTipJar();
    const pdaBefore = await getPdaLamports();

    const tx = await program.methods
      .deposit(depositAmount)
      .accounts({
        tipJar: tipJarPda,
        depositor: depositor2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([depositor2])
      .rpc();

    console.log("  Deposit (depositor2) tx:", tx);
    console.log("  Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

    const tipJar = await fetchTipJar();
    const pdaAfter = await getPdaLamports();

    assert.equal(
      tipJar.totalTips.toNumber(),
      tipJarBefore.totalTips.toNumber() + depositAmount.toNumber()
    );
    assert.equal(pdaAfter - pdaBefore, depositAmount.toNumber());

    console.log("  Total tips after 2nd deposit:", tipJar.totalTips.toNumber());
  });

  it("Withdraws 0.05 SOL — owner receives, total_tips unchanged", async () => {
    const withdrawAmount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
    const tipJarBefore = await fetchTipJar();
    const pdaBefore = await getPdaLamports();

    const tx = await program.methods
      .withdraw(withdrawAmount)
      .accounts({
        tipJar: tipJarPda,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("  Withdraw tx:", tx);
    console.log("  Explorer: https://explorer.solana.com/tx/" + tx + "?cluster=devnet");

    const tipJar = await fetchTipJar();
    const pdaAfter = await getPdaLamports();

    // total_tips must NOT decrement — it's cumulative
    assert.equal(tipJar.totalTips.toNumber(), tipJarBefore.totalTips.toNumber());
    // PDA lamports decrease by withdraw amount
    assert.equal(pdaBefore - pdaAfter, withdrawAmount.toNumber());

    console.log("  PDA lamports before:", pdaBefore);
    console.log("  PDA lamports after:", pdaAfter);
    console.log("  Total tips (unchanged):", tipJar.totalTips.toNumber());
  });

  it("Rejects unauthorized withdraw — non-owner fails", async () => {
    const withdrawAmount = new anchor.BN(0.01 * LAMPORTS_PER_SOL);

    try {
      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          tipJar: tipJarPda,
          owner: depositor2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([depositor2])
        .rpc();
      assert.fail("Should have rejected unauthorized withdraw");
    } catch (err) {
      console.log("  Correctly rejected unauthorized withdraw:", (err as Error).message.slice(0, 120));
      // PDA seed constraint fails when wrong owner is passed — this IS the
      // unauthorized access prevention. Seed mismatch fires before has_one.
      assert.include((err as Error).message, "ConstraintSeeds");
    }
  });

  it("Rejects withdraw exceeding PDA balance", async () => {
    const excessiveAmount = new anchor.BN(100 * LAMPORTS_PER_SOL);

    try {
      await program.methods
        .withdraw(excessiveAmount)
        .accounts({
          tipJar: tipJarPda,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner])
        .rpc();
      assert.fail("Should have rejected withdraw exceeding balance");
    } catch (err) {
      console.log("  Correctly rejected excessive withdraw:", (err as Error).message.slice(0, 120));
      assert.include((err as Error).message, "InsufficientFunds");
    }
  });

  it("Verifies PDA balance on-chain via RPC", async () => {
    const pdaLamports = await getPdaLamports();
    const tipJar = await fetchTipJar();

    console.log("\n  === Final State ===");
    console.log("  Program ID:", program.programId.toBase58());
    console.log("  TipJar PDA:", tipJarPda.toBase58());
    console.log("  Owner:", tipJar.owner.toBase58());
    console.log("  Total tips (cumulative):", tipJar.totalTips.toNumber(), "lamports");
    console.log("  Bump:", tipJar.bump);
    console.log("  PDA lamports:", pdaLamports);
    console.log("  Explorer (account): https://explorer.solana.com/address/" + tipJarPda.toBase58() + "?cluster=devnet");

    assert.isAbove(pdaLamports, 0);
    assert.isAbove(tipJar.totalTips.toNumber(), 0);
  });
});
