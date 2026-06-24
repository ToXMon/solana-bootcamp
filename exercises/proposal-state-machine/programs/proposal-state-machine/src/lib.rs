use anchor_lang::prelude::*;

declare_id!("8o5EoWMSG3m4YjYMava2xzqmZtXxoHoLM8T8QttYtKFG");

/// Proposal state machine: Draft → Active → Closed
/// - Draft: initial state, creator can activate or cancel (close)
/// - Active: anyone can vote, creator can close
/// - Closed: terminal state, no further actions
#[program]
pub mod proposal_state_machine {
    use super::*;

    /// Creates a new proposal in Draft state.
    /// Reads the current counter value as the proposal_id, then increments the counter.
    /// Anyone can call this instruction.
    /// Seeds: ProposalCounter [b"proposal_counter"], Proposal [b"proposal", creator, proposal_id]
    pub fn create_proposal(ctx: Context<CreateProposal>, title: String) -> Result<()> {
        let proposal_id = ctx.accounts.counter.count;

        // Initialize the proposal account
        let proposal = &mut ctx.accounts.proposal;
        proposal.creator = ctx.accounts.creator.key();
        proposal.proposal_id = proposal_id;
        proposal.title = title.clone();
        proposal.state = ProposalState::Draft;
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.bump = ctx.bumps.proposal;

        // Set bump on counter (safe for both first-init and subsequent calls)
        ctx.accounts.counter.bump = ctx.bumps.counter;

        // Increment the global counter for the next proposal
        ctx.accounts.counter.count += 1;

        msg!(
            "Proposal {} created by {} with title: \"{}\"",
            proposal_id,
            ctx.accounts.creator.key(),
            title
        );
        Ok(())
    }

    /// Activates a proposal, transitioning from Draft → Active.
    /// Only the creator can call this. State must be Draft.
    pub fn activate(ctx: Context<Activate>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(
            proposal.state == ProposalState::Draft,
            ProposalError::NotDraft
        );

        proposal.state = ProposalState::Active;

        msg!(
            "Proposal {} activated by creator",
            proposal.proposal_id
        );
        Ok(())
    }

    /// Casts a vote on an Active proposal.
    /// Anyone can call this. Creates a VoteRecord PDA that prevents double voting.
    /// Seeds: VoteRecord [b"vote", proposal, voter]
    pub fn vote(ctx: Context<Vote>, vote_yes: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(
            proposal.state == ProposalState::Active,
            ProposalError::NotActive
        );

        // Record the vote in the VoteRecord PDA
        let vote_record = &mut ctx.accounts.vote_record;
        vote_record.proposal = proposal.key();
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.vote_yes = vote_yes;
        vote_record.bump = ctx.bumps.vote_record;

        // Tally the vote
        if vote_yes {
            proposal.yes_votes += 1;
        } else {
            proposal.no_votes += 1;
        }

        msg!(
            "Vote cast on proposal {}: {} by {}",
            proposal.proposal_id,
            if vote_yes { "YES" } else { "NO" },
            ctx.accounts.voter.key()
        );
        Ok(())
    }

    /// Closes a proposal, transitioning from Draft or Active → Closed.
    /// Only the creator can call this.
    /// - Draft → Closed: cancel (creator backs out before voting starts)
    /// - Active → Closed: normal close (voting ended)
    pub fn close(ctx: Context<Close>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;

        require!(
            proposal.state != ProposalState::Closed,
            ProposalError::AlreadyClosed
        );

        let prev_state = proposal.state;
        proposal.state = ProposalState::Closed;

        msg!(
            "Proposal {} closed (was {:?}) by creator",
            proposal.proposal_id,
            prev_state
        );
        Ok(())
    }
}

// ===== Account Structures =====

/// Proposal state enum for the state machine.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum ProposalState {
    Draft,
    Active,
    Closed,
}

/// Proposal account: stores all proposal data.
/// Space: 8 (discriminator) + 32 (creator) + 8 (proposal_id) + 4+64 (title) + 1 (state) + 8 (yes_votes) + 8 (no_votes) + 1 (bump) = 134
#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub creator: Pubkey,       // 32 — who created this proposal
    pub proposal_id: u64,      // 8 — auto-incremented ID from global counter
    #[max_len(64)]
    pub title: String,         // 4 + 64 — proposal title (max 64 chars)
    pub state: ProposalState,  // 1 — current state in the state machine
    pub yes_votes: u64,        // 8 — tally of YES votes
    pub no_votes: u64,         // 8 — tally of NO votes
    pub bump: u8,              // 1 — PDA bump seed
}

/// Global counter for auto-incrementing proposal IDs.
/// Space: 8 (discriminator) + 8 (count) + 1 (bump) = 17
#[account]
#[derive(InitSpace)]
pub struct ProposalCounter {
    pub count: u64,  // 8 — next proposal ID
    pub bump: u8,    // 1 — PDA bump seed
}

/// Vote record: one per voter per proposal, prevents double voting.
/// Space: 8 (discriminator) + 32 (proposal) + 32 (voter) + 1 (vote_yes) + 1 (bump) = 74
#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub proposal: Pubkey,  // 32 — which proposal was voted on
    pub voter: Pubkey,     // 32 — who cast the vote
    pub vote_yes: bool,    // 1 — true = YES, false = NO
    pub bump: u8,          // 1 — PDA bump seed
}

// ===== Instruction Account Contexts =====

/// Accounts for `create_proposal`.
#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateProposal<'info> {
    // Global counter PDA — init on first proposal, then just mut
    #[account(
        init_if_needed,
        payer = creator,
        space = 8 + ProposalCounter::INIT_SPACE,
        seeds = [b"proposal_counter"],
        bump
    )]
    pub counter: Account<'info, ProposalCounter>,

    // New proposal PDA — seeded by creator + proposal_id (current counter value)
    #[account(
        init,
        payer = creator,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", creator.key().as_ref(), &counter.count.to_le_bytes()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Accounts for `activate`.
#[derive(Accounts)]
pub struct Activate<'info> {
    #[account(
        mut,
        seeds = [b"proposal", creator.key().as_ref(), &proposal.proposal_id.to_le_bytes()],
        bump = proposal.bump,
        has_one = creator
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

/// Accounts for `vote`.
#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.creator.as_ref(), &proposal.proposal_id.to_le_bytes()],
        bump = proposal.bump,
    )]
    pub proposal: Account<'info, Proposal>,

    // Vote record PDA — init fails if already exists (prevents double voting)
    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Accounts for `close`.
#[derive(Accounts)]
pub struct Close<'info> {
    #[account(
        mut,
        seeds = [b"proposal", creator.key().as_ref(), &proposal.proposal_id.to_le_bytes()],
        bump = proposal.bump,
        has_one = creator
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

// ===== Error Types =====

#[error_code]
pub enum ProposalError {
    #[msg("Only the creator can perform this action")]
    Unauthorized,
    #[msg("Proposal is not in Draft state")]
    NotDraft,
    #[msg("Proposal is not in Active state")]
    NotActive,
    #[msg("Proposal is already closed")]
    AlreadyClosed,
    #[msg("Title exceeds maximum length of 64 characters")]
    TitleTooLong,
}
