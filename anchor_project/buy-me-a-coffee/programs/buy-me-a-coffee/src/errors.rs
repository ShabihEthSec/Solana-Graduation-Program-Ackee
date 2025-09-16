use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only the owner can withdraw funds")]
    Unauthorized,
}
