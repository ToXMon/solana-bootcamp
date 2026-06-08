use anchor_lang::prelude::*;

declare_id!("Box6VnMVRFpCsGJbfkVr6JGS1sHuLeJbVv3Yq3R9CtSZ");

#[program]
pub mod counter_pda {
    use super::*;

    /// Creates a new counter PDA account for the user, initialized to 0.
    /// Seeds: [b"counter", user.key().as_ref()]
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        msg!("Counter initialized!");
        Ok(())
    }

    /// Increments the counter by 1.
    /// Only the user who owns this counter PDA can increment it.
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        msg!("Counter incremented to: {}", ctx.accounts.counter.count);
        Ok(())
    }
}

/// Account holding the counter state.
/// Space: 8 bytes (Anchor discriminator) + 8 bytes (u64) = 16 bytes total
#[account]
pub struct Counter {
    pub count: u64,
}

/// Accounts for the `initialize` instruction.
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Accounts for the `increment` instruction.
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,

    pub user: Signer<'info>,
}
