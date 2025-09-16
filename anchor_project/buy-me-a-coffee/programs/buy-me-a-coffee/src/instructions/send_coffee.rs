use crate::states::{CoffeeAccount, Donation};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SendCoffee<'info> {
    #[account(
        mut,
        seeds = [b"coffee"],
        bump
    )]
    pub coffee_account: Account<'info, CoffeeAccount>,
    #[account(
        init,
        payer = donor,
        space = 8 + 32 + 8 + 8 + 280, // discriminator + from + amount + timestamp + message
    )]
    pub donation: Account<'info, Donation>,
    #[account(mut)]
    pub donor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn send_coffee(ctx: Context<SendCoffee>, amount: u64, message: String) -> Result<()> {
    let coffee_account = &mut ctx.accounts.coffee_account;
    let donation = &mut ctx.accounts.donation;

    // Transfer SOL from donor to coffee account (PDA)
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.donor.key(),
        &coffee_account.key(),
        amount,
    );

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.donor.to_account_info(),
            coffee_account.to_account_info(),
        ],
    )?;

    // Record donation details
    donation.from = ctx.accounts.donor.key();
    donation.message = message;
    donation.amount = amount;
    donation.timestamp = Clock::get()?.unix_timestamp;

    // Update coffee account stats
    coffee_account.total_donations = coffee_account.total_donations.checked_add(amount).unwrap();
    coffee_account.donation_count = coffee_account.donation_count.checked_add(1).unwrap();

    Ok(())
}
