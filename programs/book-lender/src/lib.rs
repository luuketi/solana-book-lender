use anchor_lang::prelude::*;

const ANCHOR_DISCRIMINATOR: usize = 8;

declare_id!("8gfVjrhzX32iP1YBN9sqNrUnKt8Gzt8P3RnmPgwprxU5");

#[program]
pub mod book_lender {
    use super::*;

    pub fn lend_book(ctx: Context<Lending>, from: Pubkey, to: Pubkey, ISBN: String, title: String ) -> Result<()> {
        *ctx.accounts.lend = Lend {
            from,
            to,
            ISBN,
            title
        };

        msg!("Book {ISBN} - {title} lent from: {from} to: {to}");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Lending<'info> {
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR + Lend::INIT_SPACE,
    )]
    pub lend: Account<'info, Lend>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Lend {
    pub from: Pubkey,
    pub to: Pubkey,
    #[max_len(13)]
    pub ISBN: String,
    #[max_len(100)]
    pub title: String,
}
