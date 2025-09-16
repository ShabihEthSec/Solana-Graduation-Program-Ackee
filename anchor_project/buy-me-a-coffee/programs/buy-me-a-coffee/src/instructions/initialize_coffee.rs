use crate::states::CoffeeAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeCoffee<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8 + 8, // discriminator + owner + total_donations + donation_count
        seeds = [b"coffee"],
        bump
    )]
    pub coffee_account: Account<'info, CoffeeAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_coffee(ctx: Context<InitializeCoffee>, owner: Pubkey) -> Result<()> {
    let coffee_account = &mut ctx.accounts.coffee_account;
    coffee_account.owner = owner;
    coffee_account.total_donations = 0;
    coffee_account.donation_count = 0;
    Ok(())
}
