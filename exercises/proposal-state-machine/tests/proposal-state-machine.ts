import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ProposalStateMachine } from "../target/types/proposal_state_machine";
import { PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { assert } from "chai";

describe("proposal-state-machine", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ProposalStateMachine as Program<ProposalStateMachine>;
  const creator = provider.wallet.publicKey;

  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("proposal_counter")],
    program.programId
  );

  function getProposalPda(creatorKey: PublicKey, proposalId: number): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("proposal"),
        creatorKey.toBuffer(),
        new anchor.BN(proposalId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    return pda;
  }

  function getVoteRecordPda(proposalKey: PublicKey, voterKey: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vote"), proposalKey.toBuffer(), voterKey.toBuffer()],
      program.programId
    );
    return pda;
  }

  // Fund keypair via transfer from main wallet instead of airdrop (avoids 429 rate limits)
  async function fundKeypair(keypair: Keypair, amount: number = 0.1) {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: creator,
        toPubkey: keypair.publicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(tx);
  }

  // Read current counter from chain to know the next proposal ID
  let proposalIdCounter = 0;

  before(async () => {
    try {
      const counterAccount = await program.account.proposalCounter.fetch(counterPda);
      proposalIdCounter = counterAccount.count.toNumber();
      console.log(`Starting from proposal ID: ${proposalIdCounter}`);
    } catch {
      console.log("Counter not yet initialized, starting from 0");
    }
  });

  it("Creates a proposal in Draft state", async () => {
    const title = "Should we upgrade the protocol?";
    const proposalPda = getProposalPda(creator, proposalIdCounter);

    const tx = await program.methods
      .createProposal(title)
      .accounts({
        counter: counterPda,
        proposal: proposalPda,
        creator: creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Create proposal tx:", tx);

    const counterAccount = await program.account.proposalCounter.fetch(counterPda);
    assert.equal(counterAccount.count.toNumber(), proposalIdCounter + 1, "Counter should be incremented");

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.equal(proposalAccount.creator.toBase58(), creator.toBase58(), "Creator mismatch");
    assert.equal(proposalAccount.proposalId.toNumber(), proposalIdCounter, "Proposal ID mismatch");
    assert.equal(proposalAccount.title, title, "Title mismatch");
    assert.deepEqual(proposalAccount.state, { draft: {} }, "State should be Draft");
    assert.equal(proposalAccount.yesVotes.toNumber(), 0, "Yes votes should be 0");
    assert.equal(proposalAccount.noVotes.toNumber(), 0, "No votes should be 0");
  });

  it("Activates a proposal (Draft → Active)", async () => {
    const proposalPda = getProposalPda(creator, proposalIdCounter);

    const tx = await program.methods
      .activate()
      .accounts({
        proposal: proposalPda,
        creator: creator,
      })
      .rpc();

    console.log("Activate tx:", tx);

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.deepEqual(proposalAccount.state, { active: {} }, "State should be Active");
  });

  it("Casts a YES vote", async () => {
    const proposalPda = getProposalPda(creator, proposalIdCounter);
    const voter = creator;
    const voteRecordPda = getVoteRecordPda(proposalPda, voter);

    const tx = await program.methods
      .vote(true)
      .accounts({
        proposal: proposalPda,
        voteRecord: voteRecordPda,
        voter: voter,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Vote YES tx:", tx);

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.equal(proposalAccount.yesVotes.toNumber(), 1, "Yes votes should be 1");
    assert.equal(proposalAccount.noVotes.toNumber(), 0, "No votes should be 0");

    const voteRecord = await program.account.voteRecord.fetch(voteRecordPda);
    assert.equal(voteRecord.proposal.toBase58(), proposalPda.toBase58(), "Proposal mismatch in vote record");
    assert.equal(voteRecord.voter.toBase58(), voter.toBase58(), "Voter mismatch in vote record");
    assert.equal(voteRecord.voteYes, true, "voteYes should be true");
  });

  it("Casts a NO vote from a different voter", async () => {
    const proposalPda = getProposalPda(creator, proposalIdCounter);
    const voter = Keypair.generate();
    await fundKeypair(voter, 0.1);

    const voteRecordPda = getVoteRecordPda(proposalPda, voter.publicKey);

    const tx = await program.methods
      .vote(false)
      .accounts({
        proposal: proposalPda,
        voteRecord: voteRecordPda,
        voter: voter.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([voter])
      .rpc();

    console.log("Vote NO tx:", tx);

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.equal(proposalAccount.yesVotes.toNumber(), 1, "Yes votes should still be 1");
    assert.equal(proposalAccount.noVotes.toNumber(), 1, "No votes should be 1");
  });

  it("Rejects double voting (same voter tries again)", async () => {
    const proposalPda = getProposalPda(creator, proposalIdCounter);
    const voter = creator;
    const voteRecordPda = getVoteRecordPda(proposalPda, voter);

    try {
      await program.methods
        .vote(true)
        .accounts({
          proposal: proposalPda,
          voteRecord: voteRecordPda,
          voter: voter,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have rejected double vote");
    } catch (err) {
      assert.include(err.message.toString(), "already in use", `Unexpected error: ${err.message}`);
      console.log("Double vote correctly rejected");
    }
  });

  it("Closes an Active proposal (Active → Closed)", async () => {
    const proposalPda = getProposalPda(creator, proposalIdCounter);

    const tx = await program.methods
      .close()
      .accounts({
        proposal: proposalPda,
        creator: creator,
      })
      .rpc();

    console.log("Close tx:", tx);

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.deepEqual(proposalAccount.state, { closed: {} }, "State should be Closed");
  });

  it("Cancels a proposal from Draft state (Draft → Closed)", async () => {
    proposalIdCounter++;
    const title = "Should we cancel this before voting?";
    const proposalPda = getProposalPda(creator, proposalIdCounter);

    await program.methods
      .createProposal(title)
      .accounts({
        counter: counterPda,
        proposal: proposalPda,
        creator: creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    let proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.deepEqual(proposalAccount.state, { draft: {} }, "Should start as Draft");

    const tx = await program.methods
      .close()
      .accounts({
        proposal: proposalPda,
        creator: creator,
      })
      .rpc();

    console.log("Cancel from Draft tx:", tx);

    proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.deepEqual(proposalAccount.state, { closed: {} }, "State should be Closed after cancel");
  });

  it("Rejects unauthorized activation (non-creator)", async () => {
    proposalIdCounter++;
    const title = "Unauthorized activation test";
    const proposalPda = getProposalPda(creator, proposalIdCounter);

    await program.methods
      .createProposal(title)
      .accounts({
        counter: counterPda,
        proposal: proposalPda,
        creator: creator,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const nonCreator = Keypair.generate();
    await fundKeypair(nonCreator, 0.05);

    try {
      await program.methods
        .activate()
        .accounts({
          proposal: proposalPda,
          creator: nonCreator.publicKey,
        })
        .signers([nonCreator])
        .rpc();
      assert.fail("Should have rejected unauthorized activation");
    } catch (err) {
      console.log("Unauthorized activation correctly rejected");
    }
  });

  it("Rejects voting on a closed proposal", async () => {
    const proposalPda = getProposalPda(creator, proposalIdCounter);

    await program.methods
      .close()
      .accounts({
        proposal: proposalPda,
        creator: creator,
      })
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(proposalPda);
    assert.deepEqual(proposalAccount.state, { closed: {} }, "Should be Closed");

    const voter = Keypair.generate();
    await fundKeypair(voter, 0.05);
    const voteRecordPda = getVoteRecordPda(proposalPda, voter.publicKey);

    try {
      await program.methods
        .vote(true)
        .accounts({
          proposal: proposalPda,
          voteRecord: voteRecordPda,
          voter: voter.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([voter])
        .rpc();
      assert.fail("Should have rejected vote on closed proposal");
    } catch (err) {
      assert.include(
        err.message.toString(),
        "NotActive",
        `Unexpected error: ${err.message}`
      );
      console.log("Vote on closed proposal correctly rejected");
    }
  });
});
