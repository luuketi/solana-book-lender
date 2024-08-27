use anchor_lang::prelude::*;

const ANCHOR_DISCRIMINATOR: usize = 8;

declare_id!("8gfVjrhzX32iP1YBN9sqNrUnKt8Gzt8P3RnmPgwprxU5");

#[error_code]
enum LendingError {
    #[msg("ISBN length must be 13")]
    InvalidISBN,
    #[msg("Title must not be empty")]
    EmptyTitle,
}

#[program]
pub mod book_lender {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Shelf created.");
        Ok(())
    }

    #[allow(non_snake_case)]
    pub fn lend_book(ctx: Context<Update>, from: Pubkey, ISBN: String, title: String ) -> Result<()> {
        require!(ISBN.len() == 13, LendingError::InvalidISBN);
        require!(title.len() > 0, LendingError::EmptyTitle);

        let lending = Lend{ from, ISBN, title };
        ctx.accounts.shelf.lendings.push(lending);

        msg!("Book {ISBN} - {title} lent from: {from}");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR + Shelf::INIT_SPACE,
    )]
    pub shelf: Account<'info, Shelf>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub shelf: Account<'info, Shelf>,
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Shelf {
    #[max_len(10)]
    pub lendings: Vec<Lend>
}

#[account]
#[derive(InitSpace)]
#[allow(non_snake_case)]
pub struct Lend {
    pub from: Pubkey,
    #[max_len(13)]
    pub ISBN: String,
    #[max_len(100)]
    pub title: String,
}