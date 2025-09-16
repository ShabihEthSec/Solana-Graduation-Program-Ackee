use crate::errors::ErrorCode;
use crate::states::CoffeeAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"coffee"],
        bump
    )]
    pub coffee_account: Account<'info, CoffeeAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
    let coffee_account = &mut ctx.accounts.coffee_account;

    // Check that signer is the owner
    require!(
        ctx.accounts.owner.key() == coffee_account.owner,
        ErrorCode::Unauthorized
    );

    // Get the balance to withdraw
    let balance = coffee_account.to_account_info().lamports();
    let rent_exempt_balance =
        Rent::get()?.minimum_balance(coffee_account.to_account_info().data_len());
    let withdrawable = balance.checked_sub(rent_exempt_balance).unwrap_or(0);

    if withdrawable > 0 {
        // Transfer from coffee account to owner
        **coffee_account.to_account_info().try_borrow_mut_lamports()? -= withdrawable;
        **ctx
            .accounts
            .owner
            .to_account_info()
            .try_borrow_mut_lamports()? += withdrawable;
    }

    Ok(())
}
