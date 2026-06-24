use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction;

declare_id!("7BjcqxB1gqyudc5vY3yBrvxuNfktUi8RcpDc8wN77P7H");

#[program]
pub mod tip_jar_cpi {
    use super::*;

    /// Initialize a TipJar PDA for the owner.
    /// Creates the PDA with owner, total_tips = 0, and stores the bump.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let tip_jar = &mut ctx.accounts.tip_jar;
        tip_jar.owner = ctx.accounts.owner.key();
        tip_jar.total_tips = 0;
        tip_jar.bump = ctx.bumps.tip_jar;

        msg!(
            "TipJar initialized for owner: {}",
            ctx.accounts.owner.key()
        );
        msg!("TipJar PDA: {}", ctx.accounts.tip_jar.key());
        Ok(())
    }

    /// Deposit SOL into the TipJar PDA using raw `invoke`.
    /// Anyone can call. The depositor signs the transaction,
    /// so `invoke` works without PDA signer seeds.
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, TipJarError::InvalidAmount);

        // Raw CPI via `invoke` — depositor is a signer on the transaction,
        // so the System Program transfer succeeds without PDA signer seeds.
        invoke(
            &system_instruction::transfer(
                ctx.accounts.depositor.key,
                &ctx.accounts.tip_jar.key(),
                amount,
            ),
            &[
                ctx.accounts.depositor.to_account_info(),
                ctx.accounts.tip_jar.to_account_info(),
            ],
        )?;

        let tip_jar = &mut ctx.accounts.tip_jar;
        tip_jar.total_tips = tip_jar
            .total_tips
            .checked_add(amount)
            .ok_or(TipJarError::Overflow)?;

        msg!(
            "Deposited {} lamports into TipJar. Total tips: {}",
            amount,
            tip_jar.total_tips
        );
        Ok(())
    }

    /// Withdraw SOL from the TipJar PDA using raw `invoke_signed`.
    /// Owner only. The PDA signs via seeds + stored bump.
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, TipJarError::InvalidAmount);

        let tip_jar = &ctx.accounts.tip_jar;

        // Check the PDA vault has enough lamports before withdrawing.
        require!(
            tip_jar.to_account_info().lamports() >= amount,
            TipJarError::InsufficientFunds
        );

        // IMPORTANT: We CANNOT use `invoke_signed` + `system_instruction::transfer`
        // to withdraw from this PDA because the TipJar account carries data (the
        // TipJar struct). The System Program's `transfer` instruction rejects
        // accounts with data: "Transfer: `from` must not carry data".
        //
        // Instead, since our program OWNS the TipJar PDA, we can directly
        // modify its lamports. This is the standard Solana pattern for PDA
        // vaults that double as data accounts — direct lamport manipulation.
        //
        // The `invoke_signed` + `system_instruction::transfer` pattern only
        // works when the source account is owned by the System Program and
        // carries no data (e.g., a plain wallet). For PDA data accounts, the
        // program itself has authority to debit/credit lamports directly.

        let tip_jar_info = ctx.accounts.tip_jar.to_account_info();
        let owner_info = ctx.accounts.owner.to_account_info();

        **tip_jar_info.lamports.borrow_mut() -= amount;
        **owner_info.lamports.borrow_mut() += amount;

        // total_tips is cumulative — do NOT decrement on withdraw.
        msg!(
            "Withdrew {} lamports from TipJar. Total tips (cumulative): {}",
            amount,
            tip_jar.total_tips
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + TipJar::INIT_SPACE,
        seeds = [b"tip_jar", owner.key().as_ref()],
        bump
    )]
    pub tip_jar: Account<'info, TipJar>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"tip_jar", tip_jar.owner.as_ref()],
        bump = tip_jar.bump
    )]
    pub tip_jar: Account<'info, TipJar>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"tip_jar", owner.key().as_ref()],
        bump = tip_jar.bump,
        has_one = owner @ TipJarError::Unauthorized
    )]
    pub tip_jar: Account<'info, TipJar>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TipJar {
    pub owner: Pubkey,    // 32 — who can withdraw
    pub total_tips: u64,  // 8  — cumulative tips received
    pub bump: u8,         // 1  — PDA bump for invoke_signed
}

#[error_code]
pub enum TipJarError {
    #[msg("Only the owner can withdraw")]
    Unauthorized,
    #[msg("Insufficient funds in tip jar")]
    InsufficientFunds,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Arithmetic overflow")]
    Overflow,
}
