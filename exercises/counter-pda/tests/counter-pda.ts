import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CounterPda } from "../target/types/counter_pda";
import { PublicKey } from "@solana/web3.js";

describe("counter-pda", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.counterPda as Program<CounterPda>;

  // Derive the PDA address for the provider's wallet
  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  it("Initializes the counter", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize tx:", tx);

    const account = await program.account.counter.fetch(counterPda);
    console.log("Count after init:", account.count.toString());
    assert(account.count.toString() === "0", "Count should be 0 after init");
  });

  it("Increments the counter to 1", async () => {
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        user: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Increment tx:", tx);

    const account = await program.account.counter.fetch(counterPda);
    console.log("Count after 1st increment:", account.count.toString());
    assert(account.count.toString() === "1", "Count should be 1");
  });

  it("Increments the counter to 2", async () => {
    const tx = await program.methods
      .increment()
      .accounts({
        counter: counterPda,
        user: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Increment tx:", tx);

    const account = await program.account.counter.fetch(counterPda);
    console.log("Count after 2nd increment:", account.count.toString());
    assert(account.count.toString() === "2", "Count should be 2");
  });
});

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}
