use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct Escrow {
    pub seed: u64,      // Arbitrary seed for uniqueness
    pub maker: Pubkey,  // Maker wallet address (authority)
    pub mint_a: Pubkey, // Token the maker is offering
    pub mint_b: Pubkey, // Token the maker wants in return
    pub receive: u64,   // Amount of Token B required to complete swap
    pub bump: u8,       // PDA bump seed for signer reconstruction
}
