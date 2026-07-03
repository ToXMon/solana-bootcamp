use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, TransferChecked};

use crate::errors::EscrowError;
use crate::state::Escrow;

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    pub maker: SystemAccount<'info>,

    #[account(
        mut,
        close = maker,
        has_one = maker @ EscrowError::InvalidMaker,
        has_one = mint_a @ EscrowError::InvalidMintA,
        has_one = mint_b @ EscrowError::InvalidMintB,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,

    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_a,
        associated_token::authority = taker
    )]
    pub taker_ata_a: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = taker_ata_b.mint == mint_b.key() @ EscrowError::InvalidMintB
    )]
    pub taker_ata_b: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_b,
        associated_token::authority = maker
    )]
    pub maker_ata_b: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Take>) -> Result<()> {
    let signer_seeds = &[
        b"escrow".as_ref(),
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &ctx.accounts.escrow.seed.to_le_bytes(),
        &[ctx.accounts.escrow.bump],
    ];
    let signer = &[&signer_seeds[..]];

    // 1. Transfer Token B from taker to maker (taker signs)
    let cpi_accounts_b = TransferChecked {
        from: ctx.accounts.taker_ata_b.to_account_info(),
        mint: ctx.accounts.mint_b.to_account_info(),
        to: ctx.accounts.maker_ata_b.to_account_info(),
        authority: ctx.accounts.taker.to_account_info(),
    };
    let cpi_ctx_b = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts_b,
    );
    token::transfer_checked(
        cpi_ctx_b,
        ctx.accounts.escrow.receive,
        ctx.accounts.mint_b.decimals,
    )?;

    // 2. Transfer Token A from vault to taker (PDA signs)
    let vault_amount = ctx.accounts.vault.amount;
    let cpi_accounts_a = TransferChecked {
        from: ctx.accounts.vault.to_account_info(),
        mint: ctx.accounts.mint_a.to_account_info(),
        to: ctx.accounts.taker_ata_a.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    let cpi_ctx_a = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts_a,
        signer,
    );
    token::transfer_checked(cpi_ctx_a, vault_amount, ctx.accounts.mint_a.decimals)?;

    // 3. Close vault account (rent -> maker)
    let close_accounts = CloseAccount {
        account: ctx.accounts.vault.to_account_info(),
        destination: ctx.accounts.maker.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    let close_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_accounts,
        signer,
    );
    token::close_account(close_ctx)?;

    msg!(
        "Take completed — taker {} received Token A, maker {} received Token B",
        ctx.accounts.taker.key(),
        ctx.accounts.maker.key()
    );
    Ok(())
}
