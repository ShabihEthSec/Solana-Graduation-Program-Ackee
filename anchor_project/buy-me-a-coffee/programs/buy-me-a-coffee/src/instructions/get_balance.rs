use crate::states::CoffeeAccount;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct GetBalance<'info> {
    #[account(
        seeds = [b"coffee"],
        bump
    )]
    pub coffee_account: Account<'info, CoffeeAccount>,
}

pub fn get_balance(ctx: Context<GetBalance>) -> Result<u64> {
    let coffee_account = &ctx.accounts.coffee_account;
    let balance = coffee_account.to_account_info().lamports();
    let rent_exempt_balance =
        Rent::get()?.minimum_balance(coffee_account.to_account_info().data_len());
    let available_balance = balance.checked_sub(rent_exempt_balance).unwrap_or(0);

    msg!("Available balance: {} lamports", available_balance);
    Ok(available_balance)
}
