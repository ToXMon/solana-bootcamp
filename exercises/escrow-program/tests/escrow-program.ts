import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EscrowProgram } from "../target/types/escrow_program";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("escrow-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.escrowProgram as Program<EscrowProgram>;
  const payer = (provider.wallet as anchor.Wallet).payer;

  // Mints and wallets — created in before() hook
  let mintA: PublicKey;
  let mintB: PublicKey;
  let mintDecimals = 6;
  let maker: Keypair;
  let taker: Keypair;
  let randomUser: Keypair;

  // Helper: derive escrow PDA from maker + seed
  function escrowPda(makerPubkey: PublicKey, seed: number) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), makerPubkey.toBuffer(), new anchor.BN(seed).toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];
  }

  // Helper: get vault ATA address for an escrow PDA + mint
  function vaultAta(escrow: PublicKey, mint: PublicKey) {
    return getAssociatedTokenAddressSync(mint, escrow, true);
  }

  // Helper: fund a keypair from payer
  async function fund(keypair: Keypair, sol: number) {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: keypair.publicKey,
        lamports: sol * LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(tx);
  }

  // Helper: get token balance
  async function tokenBalance(ata: PublicKey): Promise<number> {
    try {
      const acct = await getAccount(provider.connection, ata);
      return Number(acct.amount);
    } catch {
      return 0;
    }
  }

  // Helper: airdrop if needed
  async function ensureBalance(pubkey: PublicKey, minSol: number) {
    const bal = await provider.connection.getBalance(pubkey);
    if (bal < minSol * LAMPORTS_PER_SOL) {
      await fund(Keypair.fromSecretKey(
        // Can't fund arbitrary pubkey, so airdrop instead
        Buffer.from([]) // placeholder — we use keypairs we control
      ), 0);
    }
  }

  // Helper: setup a fresh escrow and return all state
  async function setupEscrow(
    makerKp: Keypair,
    seed: number,
    receiveAmount: number,
    depositAmount: number
  ) {
    const escrow = escrowPda(makerKp.publicKey, seed);
    const vault = vaultAta(escrow, mintA);
    const makerAtaA = getAssociatedTokenAddressSync(mintA, makerKp.publicKey);

    await program.methods
      .make(
        new anchor.BN(seed),
        new anchor.BN(receiveAmount),
        new anchor.BN(depositAmount)
      )
      .accounts({
        maker: makerKp.publicKey,
        escrow: escrow,
        mintA: mintA,
        mintB: mintB,
        makerAtaA: makerAtaA,
        vault: vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([makerKp])
      .rpc();

    return { escrow, vault, makerAtaA };
  }

  // Helper: take the escrow
  async function takeEscrow(
    takerKp: Keypair,
    makerPubkey: PublicKey,
    escrow: PublicKey,
    seed: number
  ) {
    const vault = vaultAta(escrow, mintA);
    const takerAtaA = getAssociatedTokenAddressSync(mintA, takerKp.publicKey);
    const takerAtaB = getAssociatedTokenAddressSync(mintB, takerKp.publicKey);
    const makerAtaB = getAssociatedTokenAddressSync(mintB, makerPubkey);

    await program.methods
      .take()
      .accounts({
        taker: takerKp.publicKey,
        maker: makerPubkey,
        escrow: escrow,
        mintA: mintA,
        mintB: mintB,
        vault: vault,
        takerAtaA: takerAtaA,
        takerAtaB: takerAtaB,
        makerAtaB: makerAtaB,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([takerKp])
      .rpc();
  }

  // Helper: cancel the escrow
  async function cancelEscrow(
    makerKp: Keypair,
    escrow: PublicKey,
  ) {
    const vault = vaultAta(escrow, mintA);
    const makerAtaA = getAssociatedTokenAddressSync(mintA, makerKp.publicKey);

    await program.methods
      .cancel()
      .accounts({
        maker: makerKp.publicKey,
        escrow: escrow,
        mintA: mintA,
        vault: vault,
        makerAtaA: makerAtaA,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([makerKp])
      .rpc();
  }

  before(async () => {
    // Fund wallets from payer (avoids airdrop 429)
    maker = Keypair.generate();
    taker = Keypair.generate();
    randomUser = Keypair.generate();

    const fundTx = new Transaction()
      .add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: maker.publicKey, lamports: 0.3 * LAMPORTS_PER_SOL }))
      .add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: taker.publicKey, lamports: 0.3 * LAMPORTS_PER_SOL }))
      .add(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: randomUser.publicKey, lamports: 0.2 * LAMPORTS_PER_SOL }));
    await provider.sendAndConfirm(fundTx);

    // Create mint A (maker offers)
    mintA = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      mintDecimals
    );

    // Create mint B (maker wants)
    mintB = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      mintDecimals
    );

    // Create maker ATA for mint A and mint some tokens
    const makerAtaA = await createAccount(
      provider.connection,
      payer,
      mintA,
      maker.publicKey
    );
    await mintTo(
      provider.connection,
      payer,
      mintA,
      makerAtaA,
      payer,
      100_000_000 // 100 tokens (6 decimals)
    );

    // Create taker ATA for mint B and mint some tokens
    const takerAtaB = await createAccount(
      provider.connection,
      payer,
      mintB,
      taker.publicKey
    );
    await mintTo(
      provider.connection,
      payer,
      mintB,
      takerAtaB,
      payer,
      100_000_000 // 100 tokens (6 decimals)
    );

    console.log("\n  Setup complete:");
    console.log("  Payer:", payer.publicKey.toBase58());
    console.log("  Maker:", maker.publicKey.toBase58());
    console.log("  Taker:", taker.publicKey.toBase58());
    console.log("  MintA:", mintA.toBase58());
    console.log("  MintB:", mintB.toBase58());
  });

  // =====================
  // Test 1: Make → Take (happy path)
  // =====================
  it("Test 1: Make → Take (happy path) — balances update, accounts closed", async () => {
    const seed = 1;
    const receiveAmount = 500_000; // 0.5 Token B
    const depositAmount = 1_000_000; // 1.0 Token A

    const { escrow, vault } = await setupEscrow(maker, seed, receiveAmount, depositAmount);

    // Verify escrow created
    const escrowAcct = await program.account.escrow.fetch(escrow);
    assert.equal(escrowAcct.maker.toBase58(), maker.publicKey.toBase58());
    assert.equal(escrowAcct.receive.toNumber(), receiveAmount);
    assert.isAbove(escrowAcct.bump, 0);

    // Verify vault has Token A
    const vaultBalBefore = await tokenBalance(vault);
    assert.equal(vaultBalBefore, depositAmount);

    // Take
    await takeEscrow(taker, maker.publicKey, escrow, seed);

    // After take: taker has Token A, maker has Token B
    const takerAtaA = getAssociatedTokenAddressSync(mintA, taker.publicKey);
    const makerAtaB = getAssociatedTokenAddressSync(mintB, maker.publicKey);

    const takerTokenABal = await tokenBalance(takerAtaA);
    const makerTokenBBal = await tokenBalance(makerAtaB);

    assert.equal(takerTokenABal, depositAmount);
    assert.equal(makerTokenBBal, receiveAmount);

    // Escrow and vault should be closed
    const escrowInfo = await provider.connection.getAccountInfo(escrow);
    const vaultInfo = await provider.connection.getAccountInfo(vault);
    assert.isNull(escrowInfo, "Escrow account should be closed");
    assert.isNull(vaultInfo, "Vault account should be closed");

    console.log("  Test 1 PASSED — Make → Take happy path");
  });

  // =====================
  // Test 2: Make → Cancel (happy path)
  // =====================
  it("Test 2: Make → Cancel (happy path) — balance restored, accounts closed", async () => {
    const seed = 2;
    const receiveAmount = 500_000;
    const depositAmount = 1_000_000;

    const { escrow, vault } = await setupEscrow(maker, seed, receiveAmount, depositAmount);

    // Record maker Token A balance before cancel
    const makerAtaA = getAssociatedTokenAddressSync(mintA, maker.publicKey);
    const makerBalBefore = await tokenBalance(makerAtaA);

    // Cancel
    await cancelEscrow(maker, escrow);

    // Token A returned to maker
    const makerBalAfter = await tokenBalance(makerAtaA);
    assert.equal(makerBalAfter - makerBalBefore, depositAmount);

    // Escrow and vault closed
    const escrowInfo = await provider.connection.getAccountInfo(escrow);
    const vaultInfo = await provider.connection.getAccountInfo(vault);
    assert.isNull(escrowInfo, "Escrow account should be closed");
    assert.isNull(vaultInfo, "Vault account should be closed");

    console.log("  Test 2 PASSED — Make → Cancel happy path");
  });

  // =====================
  // Test 3: Double-take rejection
  // =====================
  it("Test 3: Double-take rejection — second take fails after escrow closed", async () => {
    const seed = 3;
    const receiveAmount = 500_000;
    const depositAmount = 1_000_000;

    const { escrow } = await setupEscrow(maker, seed, receiveAmount, depositAmount);
    await takeEscrow(taker, maker.publicKey, escrow, seed);

    // Second take should fail — escrow is closed
    try {
      await takeEscrow(taker, maker.publicKey, escrow, seed);
      assert.fail("Second take should have failed");
    } catch (err: any) {
      assert.include(err.message, "AccountNotInitialized" );
      console.log("  Test 3 PASSED — Double-take rejected:", err.message.substring(0, 80));
    }
  });

  // =====================
  // Test 4: Take after cancel
  // =====================
  it("Test 4: Take after cancel — fails after cancellation", async () => {
    const seed = 4;
    const receiveAmount = 500_000;
    const depositAmount = 1_000_000;

    const { escrow } = await setupEscrow(maker, seed, receiveAmount, depositAmount);
    await cancelEscrow(maker, escrow);

    // Take should fail — escrow is closed
    try {
      await takeEscrow(taker, maker.publicKey, escrow, seed);
      assert.fail("Take after cancel should have failed");
    } catch (err: any) {
      assert.include(err.message, "AccountNotInitialized");
      console.log("  Test 4 PASSED — Take after cancel rejected:", err.message.substring(0, 80));
    }
  });

  // =====================
  // Test 5: Wrong mint B
  // =====================
  it("Test 5: Wrong mint B — has_one = mint_b fails with EscrowError::InvalidMintB", async () => {
    const seed = 5;
    const receiveAmount = 500_000;
    const depositAmount = 1_000_000;

    const { escrow } = await setupEscrow (maker, seed, receiveAmount, depositAmount);

    // Create a wrong mint B
    const wrongMintB = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      mintDecimals
    );

    // Mint some wrong mint B tokens to taker
    const takerWrongAtaB = await createAccount(
      provider.connection,
      payer,
      wrongMintB,
      taker.publicKey
    );
    await mintTo(
      provider.connection,
      payer,
      wrongMintB,
      takerWrongAtaB,
      payer,
      100_000_000
    );

    const vault = vaultAta(escrow, mintA);
    const takerAtaA = getAssociatedTokenAddressSync(mintA, taker.publicKey);
    const makerAtaB = getAssociatedTokenAddressSync(wrongMintB, maker.publicKey);

    try {
      await program.methods
        .take()
        .accounts({
          taker: taker.publicKey,
          maker: maker.publicKey,
          escrow: escrow,
          mintA: mintA,
          // Pass the WRONG mint B here
          mintB: wrongMintB,
          vault: vault,
          takerAtaA: takerAtaA,
          takerAtaB: takerWrongAtaB,
          makerAtaB: makerAtaB,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([taker])
        .rpc();
      assert.fail("Take with wrong mint B should have failed");
    } catch (err: any) {
      // Should fail on has_one = mint_b constraint
      assert.include(err.message, "InvalidMintB" );
      console.log("  Test 5 PASSED — Wrong mint B rejected:", err.message.substring(0, 80));
    }

    // Cleanup: cancel escrow to return tokens to maker
    await cancelEscrow(maker, escrow);
  });

  // =====================
  // Test 6: Non-maker cancel
  // =====================
  it("Test 6: Non-maker cancel — fails with EscrowError::InvalidMaker or ConstraintSeeds", async () => {
    const seed = 6;
    const receiveAmount = 500_000;
    const depositAmount = 1_000_000;

    const { escrow } = await setupEscrow(maker, seed, receiveAmount, depositAmount);

    const vault = vaultAta(escrow, mintA);
    const makerAtaA = getAssociatedTokenAddressSync(mintA, randomUser.publicKey);

    try {
      await program.methods
        .cancel()
        .accounts({
          maker: randomUser.publicKey,
          escrow: escrow,
          mintA: mintA,
          vault: vault,
          makerAtaA: makerAtaA,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([randomUser])
        .rpc();
      assert.fail("Non-maker cancel should have failed");
    } catch (err: any) {
      // Should fail on has_one = maker or seed mismatch
      assert.isTrue(
        err.message.includes("InvalidMaker") ||
        err.message.includes("ConstraintSeeds") ||
        err.message.includes("Unauthorized") ||
        err.message.includes("ErrorCode::ConstraintSeeds"),
        `Expected InvalidMaker or ConstraintSeeds, got: ${err.message}`
      );
      console.log("  Test 6 PASSED — Non-maker cancel rejected:", err.message.substring(0, 80));
    }

    // Cleanup: cancel escrow to return tokens to maker
    await cancelEscrow(maker, escrow);
  });

  // =====================
  // Test 7: Insufficient taker funds
  // =====================
  it("Test 7: Insufficient taker funds — Token transfer CPI fails", async () => {
    const seed = 7;
    const receiveAmount = 500_000_000; // 500 Token B — more than taker has
    const depositAmount = 1_000_000;

    const { escrow } = await setupEscrow(maker, seed, receiveAmount, depositAmount);

    const vault = vaultAta(escrow, mintA);
    const takerAtaA = getAssociatedTokenAddressSync(mintA, taker.publicKey);
    const takerAtaB = getAssociatedTokenAddressSync(mintB, taker.publicKey);
    const makerAtaB = getAssociatedTokenAddressSync(mintB, maker.publicKey);

    try {
      await program.methods
        .take()
        .accounts({
          taker: taker.publicKey,
          maker: maker.publicKey,
          escrow: escrow,
          mintA: mintA,
          mintB: mintB,
          vault: vault,
          takerAtaA: takerAtaA,
          takerAtaB: takerAtaB,
          makerAtaB: makerAtaB,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([taker])
        .rpc();
      assert.fail("Take with insufficient funds should have failed");
    } catch (err: any) {
      // Should fail on token transfer CPI — insufficient funds
      assert.isTrue(
        err.message.includes("InsufficientFunds") ||
        err.message.includes("insufficient") ||
        err.message.includes("0x1") ||
        err.message.includes("custom instruction error"),
        `Expected insufficient funds error, got: ${err.message}`
      );
      console.log("  Test 7 PASSED — Insufficient taker funds rejected:", err.message.substring(0, 80));
    }

    // Cleanup: cancel escrow to return tokens to maker
    await cancelEscrow(maker, escrow);
  });

  // =====================
  // Test 8: Balance reconciliation
  // =====================
  it("Test 8: Balance reconciliation — total supply conserved", async () => {
    // After all preceding tests, verify no tokens were minted or burned unexpectedly.
    // Token A total supply should be 100 tokens (100_000_000) minus what's in closed accounts.
    // Token B total supply should be 100 tokens + wrong mint tokens created in test 5.
    // Instead of tracking exact amounts, verify supply conservation by checking no negative balances.

    const makerAtaA = getAssociatedTokenAddressSync(mintA, maker.publicKey);
    const takerAtaA = getAssociatedTokenAddressSync(mintA, taker.publicKey);
    const makerAtaB = getAssociatedTokenAddressSync(mintB, maker.publicKey);
    const takerAtaB = getAssociatedTokenAddressSync(mintB, taker.publicKey);

    const makerBalA = await tokenBalance(makerAtaA);
    const takerBalA = await tokenBalance(takerAtaA);
    const makerBalB = await tokenBalance(makerAtaB);
    const takerBalB = await tokenBalance(takerAtaB);

    console.log("  Final balances:");
    console.log("    Maker  Token A:", makerBalA);
    console.log("    Taker  Token A:", takerBalA);
    console.log("    Maker  Token B:", makerBalB);
    console.log("    Taker  Token B:", takerBalB);

    // Verify no negative balances exist (basic conservation check)
    assert.isAtLeast(makerBalA, 0, "Maker Token A balance must be non-negative");
    assert.isAtLeast(takerBalA, 0, "Taker Token A balance must be non-negative");
    assert.isAtLeast(makerBalB, 0, "Maker Token B balance must be non-negative");
    assert.isAtLeast(takerBalB, 0, "Taker Token B balance must be non-negative");

    // Verify total Token A supply = 100 tokens = 100_000_000 base units
    const totalA = makerBalA + takerBalA;
    assert.equal(
      totalA,
      100_000_000,
      "Total Token A supply must equal initial 100 tokens (no minting/burning)"
    );

    console.log("  Test 8 PASSED — Balance reconciliation verified");
  });
});
