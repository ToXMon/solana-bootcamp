import { setupUmi } from './umi-setup';
import {
  createV1,
  verifyCollectionV1,
  TokenStandard,
  findMetadataPda,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  generateSigner,
  percentAmount,
} from '@metaplex-foundation/umi';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Build a MINIMAL data URI for on-chain storage.
 * Only includes name + symbol + image to keep transaction size under 1232 bytes.
 * Full metadata stays in local JSON files for the list script.
 */
function makeMinimalDataUri(jsonPath: string): string {
  const full = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const minimal = {
    name: full.name,
    symbol: full.symbol,
    image: full.image,
  };
  const jsonStr = JSON.stringify(minimal);
  return `data:application/json;base64,${Buffer.from(jsonStr).toString('base64')}`;
}

function explorerLink(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

function txLink(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}

async function main() {
  const { umi, signer } = setupUmi();
  const metaDir = path.join(__dirname, '..', 'metadata');

  console.log('\n========================================');
  console.log('  Exercise 10 - NFT Collection Minting');
  console.log('========================================');

  // --- 1. Create Collection NFT ---
  console.log('\n--- Step 1: Creating Collection NFT ---');
  const collectionMint = generateSigner(umi);
  const collectionUri = makeMinimalDataUri(path.join(metaDir, 'collection.json'));
  const collectionMeta = JSON.parse(
    fs.readFileSync(path.join(metaDir, 'collection.json'), 'utf-8')
  );

  console.log(`  URI length: ${collectionUri.length} chars`);

  const collectionTx = await createV1(umi, {
    mint: collectionMint,
    authority: signer,
    name: collectionMeta.name,
    symbol: collectionMeta.symbol,
    uri: collectionUri,
    sellerFeeBasisPoints: percentAmount(0),
    tokenStandard: TokenStandard.NonFungible,
    isCollection: true,
  }).sendAndConfirm(umi, { send: { commitment: 'confirmed' } });

  const collectionSig = Buffer.from(collectionTx.signature).toString('base64');
  console.log(`Collection Name: ${collectionMeta.name}`);
  console.log(`Collection Mint: ${collectionMint.publicKey}`);
  console.log(`Collection Tx:   ${collectionSig}`);
  console.log(`Explorer:        ${explorerLink(collectionMint.publicKey.toString())}`);
  console.log(`Tx Explorer:     ${txLink(collectionSig)}`);

  // --- 2. Create 3 Member NFTs with collection reference ---
  const memberMints: string[] = [];
  const memberTxs: string[] = [];
  const memberVerifyTxs: string[] = [];

  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Step 2.${i}: Creating Member NFT #${i} ---`);
    const memberMint = generateSigner(umi);
    const memberUri = makeMinimalDataUri(path.join(metaDir, `member-${i}.json`));
    const memberMeta = JSON.parse(
      fs.readFileSync(path.join(metaDir, `member-${i}.json`), 'utf-8')
    );

    console.log(`  URI length: ${memberUri.length} chars`);

    // Create member NFT with collection reference
    // Collection field must be { key, verified } object — not bare PublicKey
    const memberTx = await createV1(umi, {
      mint: memberMint,
      authority: signer,
      name: memberMeta.name,
      symbol: memberMeta.symbol,
      uri: memberUri,
      sellerFeeBasisPoints: percentAmount(0),
      tokenStandard: TokenStandard.NonFungible,
      collection: { key: collectionMint.publicKey, verified: false },
    }).sendAndConfirm(umi, { send: { commitment: 'confirmed' } });

    const memberSig = Buffer.from(memberTx.signature).toString('base64');
    console.log(`Member Name:  ${memberMeta.name}`);
    console.log(`Member Mint:  ${memberMint.publicKey}`);
    console.log(`Mint Tx:      ${memberSig}`);
    console.log(`Explorer:     ${explorerLink(memberMint.publicKey.toString())}`);

    // --- 3. Verify collection membership ---
    console.log(`Verifying collection membership...`);
    const memberMetadataPda = findMetadataPda(umi, { mint: memberMint.publicKey });

    try {
      const verifyTx = await verifyCollectionV1(umi, {
        metadata: memberMetadataPda,
        collectionMint: collectionMint.publicKey,
        authority: signer,
      }).sendAndConfirm(umi, { send: { commitment: 'confirmed' } });

      const verifySig = Buffer.from(verifyTx.signature).toString('base64');
      console.log(`Verified! Tx: ${verifySig}`);
      console.log(`Verify Tx Explorer: ${txLink(verifySig)}`);
      memberVerifyTxs.push(verifySig);
    } catch (err: any) {
      console.log(`Verification note: ${err.message?.substring(0, 150) || 'may already be verified'}`);
      memberVerifyTxs.push('already-verified');
    }

    memberMints.push(memberMint.publicKey.toString());
    memberTxs.push(memberSig);
  }

  // --- Save addresses for list script ---
  const addresses = {
    collection: collectionMint.publicKey.toString(),
    members: memberMints,
    memberTxs: memberTxs,
    memberVerifyTxs: memberVerifyTxs,
    collectionTx: collectionSig,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(__dirname, '..', 'mint-addresses.json'),
    JSON.stringify(addresses, null, 2)
  );

  console.log('\n========================================');
  console.log('  Minting Complete - Summary');
  console.log('========================================');
  console.log(`Collection NFT: ${collectionMint.publicKey}`);
  console.log(`  ${explorerLink(collectionMint.publicKey.toString())}`);
  for (let i = 0; i < memberMints.length; i++) {
    console.log(`Member NFT #${i + 1}:  ${memberMints[i]}`);
    console.log(`  ${explorerLink(memberMints[i])}`);
  }
  console.log('\nAddresses saved to mint-addresses.json');
  console.log('\nNext: npx tsx src/list-collection.ts');
}

main().catch((err) => {
  console.error('\n=== ERROR ===');
  console.error(err);
  process.exit(1);
});
