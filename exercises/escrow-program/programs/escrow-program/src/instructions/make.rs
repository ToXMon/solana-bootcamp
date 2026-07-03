use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, TransferChecked};

use crate::errors::EscrowError;
use crate::state::Escrow;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        init,
        payer = maker,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,

    #[account(
        mut,
        constraint = maker_ata_a.mint == mint_a.key() @ EscrowError::InvalidMintA
    )]
    pub maker_ata_a: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = escrow
    )]
    pub vault: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Make>, seed: u64, receive: u64, amount: u64) -> Result<()> {
    require_gt!(receive, 0, EscrowError::InvalidAmount);
    require_gt!(amount, 0, EscrowError::InvalidAmount);

    // Store escrow fields manually (no set_inner in Anchor 0.31)
    let escrow = &mut ctx.accounts.escrow;
    escrow.seed = seed;
    escrow.maker = ctx.accounts.maker.key();
    escrow.mint_a = ctx.accounts.mint_a.key();
    escrow.mint_b = ctx.accounts.mint_b.key();
    escrow.receive = receive;
    escrow.bump = ctx.bumps.escrow;

    // Transfer Token A from maker to vault using transfer_checked
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.maker_ata_a.to_account_info(),
        mint: ctx.accounts.mint_a.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.maker.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
    );
    token::transfer_checked(cpi_ctx, amount, ctx.accounts.mint_a.decimals)?;

    msg!(
        "Escrow created by maker {} — seed={}, receive={}, amount={}",
        ctx.accounts.maker.key(),
        seed,
        receive,
        amount
    );
    Ok(())
}
