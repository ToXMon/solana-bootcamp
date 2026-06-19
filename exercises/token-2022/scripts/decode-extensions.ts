/**
 * Exercise 4 — Token-2022 Extension Decoder
 *
 * Connects to devnet, fetches the Token-2022 mint created in this exercise,
 * decodes all configured extensions, and prints mint + token account details.
 */
import {
  Connection,
  PublicKey,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getMint,
  getAccount,
  getExtensionTypes,
  ExtensionType,
  getTransferFeeAmount,
  unpackMint,
} from "@solana/spl-token";

const RPC_URL = "https://api.devnet.solana.com";
const MINT_ADDRESS = "Cc57DfMQiZzMQ77boNZQGbHGnHLuKnkcDRxQuVBRzqrm";
const MAIN_ATA = "6fsRkKavjzLGLxTcea5B7SXmwWDfJbCttVp1z55dPySa";
const SECOND_ATA = "6wuPowTeW1ngx1SUBEefWYaWGRjhvA7SaeDCUJSW1ree";

function fmtExtensionType(t: ExtensionType): string {
  // ExtensionType is an enum; map numeric value to name where known
  const names: Record<number, string> = {
    0: "Uninitialized",
    1: "TransferFeeConfig",
    2: "TransferFeeAmount",
    3: "MintCloseAuthority",
    4: "AccountCloseAuthority",
    5: "ImmutableOwner",
    6: "MetadataPointer",
    7: "TokenMetadata",
    8: "GroupPointer",
    9: "TokenGroup",
    10: "GroupMemberPointer",
    11: "TokenGroupMember",
    12: "PermanentDelegate",
    13: "NonTransferable",
    14: "NonTransferableAccount",
    15: "PermanentDelegateAccount",
    16: "InterestBearingConfig",
    17: "DefaultAccountState",
    18: "CpiGuard",
    19: "MemoTransfer",
    20: "TransferHook",
    21: "TransferHookAccount",
    22: "ConfidentialTransferMint",
    23: "ConfidentialTransferAccount",
    24: "ConfidentialTransferFeeConfig",
    25: "ConfidentialTransferFeeAmount",
    26: "Metadata",
  };
  return names[t] ?? `UnknownExtension(${t})`;
}

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");
  const mintPubkey = new PublicKey(MINT_ADDRESS);

  console.log("=".repeat(70));
  console.log("Exercise 4 — Token-2022 Extension Decoder");
  console.log("=".repeat(70));
  console.log(`RPC:        ${RPC_URL}`);
  console.log(`Mint:       ${MINT_ADDRESS}`);
  console.log(`Program ID: ${TOKEN_2022_PROGRAM_ID.toBase58()}`);
  console.log();

  // Fetch raw account info so we can use unpackMint for extension parsing
  const accountInfo = await connection.getAccountInfo(mintPubkey);
  if (!accountInfo) {
    throw new Error(`Mint account not found: ${MINT_ADDRESS}`);
  }
  console.log(`Account owner:  ${accountInfo.owner.toBase58()}`);
  console.log(`Account size:   ${accountInfo.data.length} bytes`);
  console.log(`Executable:     ${accountInfo.executable}`);
  console.log(`Lamports:       ${accountInfo.lamports}`);
  console.log();

  // Unpack the mint with Token-2022 program ID (this preserves extensions)
  const mint = unpackMint(mintPubkey, accountInfo, TOKEN_2022_PROGRAM_ID);

  console.log("-".repeat(70));
  console.log("Mint Base Data");
  console.log("-".repeat(70));
  console.log(`Supply:           ${mint.supply.toString()} (${mint.supply.toString()} raw / ${Number(mint.supply) / 1e9} UI)`);
  console.log(`Decimals:         ${mint.decimals}`);
  console.log(`Mint authority:   ${mint.mintAuthority?.toBase58() ?? "(not set)"}`);
  console.log(`Freeze authority: ${mint.freezeAuthority?.toBase58() ?? "(not set)"}`);
  console.log(`Is initialized:   ${mint.isInitialized}`);
  console.log();

  console.log("-".repeat(70));
  console.log("Configured Extensions");
  console.log("-".repeat(70));
  const extTypes = getExtensionTypes(accountInfo.data);
  console.log(`Extension count: ${extTypes.length}`);
  extTypes.forEach((t, i) => {
    console.log(`  [${i + 1}] ${fmtExtensionType(t)} (type id ${t})`);
  });
  console.log();

  console.log("-".repeat(70));
  console.log("Extension Details");
  console.log("-".repeat(70));

  // TransferFeeConfig (mint-level)
  if (mint.tlvData) {
    // Iterate known extensions and print detail where available
    if (extTypes.includes(ExtensionType.TransferFeeConfig)) {
      const tfc = (mint as any).transferFeeConfig;
      if (tfc) {
        console.log("TransferFeeConfig:");
        console.log(`  currentFeeBasisPoints:  ${tfc.newerTransferFee.transferFeeBasisPoints}`);
        console.log(`  currentMaxFee:          ${tfc.newerTransferFee.maximumFee.toString()} raw`);
        console.log(`  olderFeeBasisPoints:    ${tfc.olderTransferFee.transferFeeBasisPoints}`);
        console.log(`  olderMaxFee:            ${tfc.olderTransferFee.maximumFee.toString()} raw`);
        console.log(`  transferFeeConfigAuthority: ${tfc.transferFeeConfigAuthority?.toBase58() ?? "(not set)"}`);
        console.log(`  withdrawWithheldAuthority:   ${tfc.withdrawWithheldAuthority?.toBase58() ?? "(not set)"}`);
      } else {
        console.log("TransferFeeConfig: present but not parsed via unpackMint (manual decode needed)");
      }
      console.log();
    }

    if (extTypes.includes(ExtensionType.MetadataPointer)) {
      const mp = (mint as any).metadataPointer;
      console.log("MetadataPointer:");
      console.log(`  authority:        ${mp?.authority?.toBase58() ?? "(not set)"}`);
      console.log(`  metadataAddress:  ${mp?.metadataAddress?.toBase58() ?? "(not set)"}`);
      console.log();
    }

    if (extTypes.includes(ExtensionType.TokenMetadata)) {
      const meta = (mint as any).metadata;
      console.log("TokenMetadata:");
      if (meta) {
        console.log(`  updateAuthority: ${meta.updateAuthority?.toBase58() ?? "(not set)"}`);
        console.log(`  mint:            ${meta.mint?.toBase58() ?? "(not set)"}`);
        console.log(`  name:            ${meta.name}`);
        console.log(`  symbol:          ${meta.symbol}`);
        console.log(`  uri:             ${meta.uri}`);
      } else {
        console.log("  (metadata struct not exposed via unpackMint; raw TLV present)");
      }
      console.log();
    }
  }

  // Token accounts
  console.log("=".repeat(70));
  console.log("Token Accounts");
  console.log("=".repeat(70));

  for (const [label, ataStr] of [["Main Wallet ATA", MAIN_ATA], ["Second Wallet ATA", SECOND_ATA]] as const) {
    console.log(`\n${label}: ${ataStr}`);
    const ataPub = new PublicKey(ataStr);
    const ai = await connection.getAccountInfo(ataPub);
    if (!ai) {
      console.log("  (account not found)");
      continue;
    }
    console.log(`  owner program: ${ai.owner.toBase58()}`);
    console.log(`  data size:     ${ai.data.length} bytes`);

    const acc = await getAccount(connection, ataPub, undefined, TOKEN_2022_PROGRAM_ID);
    console.log(`  mint:          ${acc.mint.toBase58()}`);
    console.log(`  owner:         ${acc.owner.toBase58()}`);
    console.log(`  amount (raw):  ${acc.amount.toString()}`);
    console.log(`  amount (ui):   ${Number(acc.amount) / 1e9}`);
    console.log(`  state:         ${acc.state}`);

    // Extensions on the token account
    const accExtTypes = getExtensionTypes(ai.data);
    console.log(`  account extensions: ${accExtTypes.length}`);
    accExtTypes.forEach((t) => console.log(`    - ${fmtExtensionType(t)}`));

    // Transfer fee withheld amount
    const feeAmount = getTransferFeeAmount(acc);
    if (feeAmount) {
      console.log(`  withheldFee (raw): ${feeAmount.withheldAmount.toString()}`);
      console.log(`  withheldFee (ui):  ${Number(feeAmount.withheldAmount) / 1e9}`);
    } else {
      console.log("  withheldFee: (none / no TransferFeeAmount extension)");
    }
  }

  console.log();
  console.log("=".repeat(70));
  console.log("Decoder complete. Verify on Explorer:");
  console.log(`  https://explorer.solana.com/address/${MINT_ADDRESS}?cluster=devnet`);
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("Decoder failed:", err);
  process.exit(1);
});
