import base58, json, os

with open('/a0/usr/projects/solana_bootcamp/.a0proj/secrets.env') as f:
    for line in f:
        if line.startswith('PK='):
            pk_b58 = line.split('=', 1)[1].strip().strip('"').strip("'")
            break

keypair_bytes = base58.b58decode(pk_b58)
keypair_list = list(keypair_bytes)
keypair_path = os.path.expanduser('~/.config/solana/id.json')
os.makedirs(os.path.dirname(keypair_path), exist_ok=True)
with open(keypair_path, 'w') as f:
    json.dump(keypair_list, f)
os.chmod(keypair_path, 0o600)
print(f'Wallet restored: {len(keypair_list)} bytes')
