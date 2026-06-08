use anchor_lang::prelude::*;

declare_id!("ggUpdzgva3CDB3UeDS6ntkLKgHGvrL5ApwW395Sj4k3");

#[program]
pub mod hello_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
