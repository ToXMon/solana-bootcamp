import { setupUmi } from './umi-setup';
import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import * as fs from 'fs';
import * as path from 'path';

function explorerLink(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

function decodeDataUri(uri: string): any | null {
  if (uri.startsWith('data:application/json;base64,')) {
    const b64 = uri.split(',')[1];
    try {
      return JSON.parse(Buffer.from(b64, 'base64').toString());
    } catch {
      return null;
    }
  }
  return null;
}

/** Read full metadata from local JSON file for display */
function readLocalMetadata(metaDir: string, isCollection: boolean, index: number): any | null {
  const filename = isCollection ? 'collection.json' : `member-${index}.json`;
  const filepath = path.join(metaDir, filename);
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch {
    return null;
  }
}

function printFullMetadata(uri: string, localMeta: any | null) {
  // Decode on-chain data
  const onChain = decodeDataUri(uri);
  if (onChain) {
    console.log(`  On-chain image: ${onChain.image || 'N/A'}`);
  }

  // Show full local metadata
  if (localMeta) {
    console.log(`  Description: ${localMeta.description || 'N/A'}`);
    console.log(`  Image: ${localMeta.image || 'N/A'}`);
    if (localMeta.attributes && localMeta.attributes.length > 0) {
      console.log('  Attributes:');
      for (const attr of localMeta.attributes) {
        console.log(`    ${attr.trait_type}: ${attr.value}`);
      }
    }
  }
}

async function main() {
  const { umi } = setupUmi();
  const metaDir = path.join(__dirname, '..', 'metadata');

  const addressesPath = path.join(__dirname, '..', 'mint-addresses.json');
  if (!fs.existsSync(addressesPath)) {
    console.error('No mint-addresses.json found. Run: npx tsx src/mint-collection.ts');
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'));

  console.log('\n========================================');
  console.log('  Exercise 10 - NFT Collection Listing');
  console.log('========================================');
  console.log(`Minted at: ${addresses.timestamp}`);

  // --- Collection NFT ---
  console.log('\n--- Collection NFT (Parent) ---');
  const collectionAsset = await fetchDigitalAsset(umi, addresses.collection);
  console.log(`Mint:     ${collectionAsset.mint.publicKey}`);
  console.log(`Name:     ${collectionAsset.metadata.name}`);
  console.log(`Symbol:   ${collectionAsset.metadata.symbol}`);
  console.log(`Standard: ${collectionAsset.metadata.tokenStandard}`);
  const collectionLocal = readLocalMetadata(metaDir, true, 0);
  printFullMetadata(collectionAsset.metadata.uri, collectionLocal);
  console.log(`Explorer: ${explorerLink(collectionAsset.mint.publicKey.toString())}`);

  // --- Member NFTs ---
  console.log('\n--- Member NFTs ---');
  for (let i = 0; i < addresses.members.length; i++) {
    const memberMint = addresses.members[i];
    console.log(`\n  === Member NFT #${i + 1} ===`);
    const memberAsset = await fetchDigitalAsset(umi, memberMint);
    console.log(`  Mint:     ${memberAsset.mint.publicKey}`);
    console.log(`  Name:     ${memberAsset.metadata.name}`);
    console.log(`  Symbol:   ${memberAsset.metadata.symbol}`);

    // Collection verification status
    const collection = memberAsset.metadata.collection;
    if (collection.__option === 'Some') {
      console.log(`  Collection Mint: ${collection.value.key}`);
      console.log(`  Verified: ${collection.value.verified ? 'YES ✅' : 'NO ❌'}`);
    } else {
      console.log('  Collection: None (UNVERIFIED)');
    }

    const memberLocal = readLocalMetadata(metaDir, false, i + 1);
    printFullMetadata(memberAsset.metadata.uri, memberLocal);
    console.log(`  Explorer: ${explorerLink(memberMint)}`);
  }

  // --- Summary ---
  console.log('\n========================================');
  console.log('  Verification Summary');
  console.log('========================================');
  let allVerified = true;
  for (let i = 0; i < addresses.members.length; i++) {
    const memberAsset = await fetchDigitalAsset(umi, addresses.members[i]);
    const collection = memberAsset.metadata.collection;
    const verified = collection.__option === 'Some' && collection.value.verified;
    console.log(`  Member #${i + 1}: ${verified ? 'VERIFIED ✅' : 'UNVERIFIED ❌'}`);
    if (!verified) allVerified = false;
  }
  console.log(`\n  All members verified: ${allVerified ? 'YES ✅' : 'NO ❌'}`);

  // --- Transaction history ---
  console.log('\n========================================');
  console.log('  Transaction History');
  console.log('========================================');
  console.log(`  Collection mint tx:  ${addresses.collectionTx}`);
  for (let i = 0; i < addresses.members.length; i++) {
    console.log(`  Member #${i + 1} mint tx:     ${addresses.memberTxs[i]}`);
    console.log(`  Member #${i + 1} verify tx:   ${addresses.memberVerifyTxs[i]}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\n=== ERROR ===');
  console.error(err);
  process.exit(1);
});
