import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

export function setupUmi() {
  const umi = createUmi('https://api.devnet.solana.com');

  const walletPath = path.join(
    process.env.HOME || '/root',
    '.config/solana/id.json'
  );
  const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  const solanaKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(solanaKeypair.secretKey);
  umi.use(keypairIdentity(umiKeypair));

  console.log('Umi instance: devnet (https://api.devnet.solana.com)');
  console.log(`Signer: ${umiKeypair.publicKey}`);

  return { umi, signer: umiKeypair };
}
