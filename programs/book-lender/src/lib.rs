use anchor_lang::prelude::*;

declare_id!("8gfVjrhzX32iP1YBN9sqNrUnKt8Gzt8P3RnmPgwprxU5");

#[program]
pub mod book_lender {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }


}

#[derive(Accounts)]
pub struct Initialize {}
