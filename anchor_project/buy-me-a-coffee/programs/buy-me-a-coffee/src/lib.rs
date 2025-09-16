use anchor_lang::prelude::*;

declare_id!("8TenFn5NbJriUWrdRi89S742UZWqrtpNJvAYKFE2M2A5");


pub mod errors;
pub mod instructions;
pub mod states;

pub use errors::*;
pub use instructions::*;
pub use states::*;


#[program]
pub mod buy_me_a_coffee {
    use super::*;

    // Initialize the coffee account
    pub fn initialize(ctx: Context<InitializeCoffee>, owner: Pubkey) -> Result<()> {
        instructions::initialize_coffee::initialize_coffee(ctx, owner)
    }

    // Send coffee (donate) - accumulates in contract
    pub fn send_coffee(ctx: Context<SendCoffee>, amount: u64, message: String) -> Result<()> {
        instructions::send_coffee::send_coffee(ctx, amount, message)
    }

    // Withdraw accumulated funds (owner only)
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        instructions::withdraw::withdraw(ctx)
    }

    // Get balance (view function equivalent)
    pub fn get_balance(ctx: Context<GetBalance>) -> Result<u64> {
        instructions::get_balance::get_balance(ctx)
    }
}
