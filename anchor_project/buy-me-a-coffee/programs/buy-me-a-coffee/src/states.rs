use anchor_lang::prelude::*;

#[account]
pub struct CoffeeAccount {
    pub owner: Pubkey,
    pub total_donations: u64,
    pub donation_count: u64,
}

#[account]
pub struct Donation {
    pub from: Pubkey,
    pub amount: u64,
    pub message: String,
    pub timestamp: i64,
}
