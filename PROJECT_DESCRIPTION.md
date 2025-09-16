# Project Description

**Deployed Frontend URL:** [https://sol-buy-me-a-coffee.vercel.app/](https://sol-buy-me-a-coffee.vercel.app/)  

**Solana Program ID:** 8TenFn5NbJriUWrdRi89S742UZWqrtpNJvAYKFE2M2A5

---

## Project Overview

### Description
**Buy Me A Coffee** is a Solana-based decentralized application (dApp) that allows creators to receive small donations (SOL) from supporters, similar to “buying a coffee” as a gesture of appreciation.  

The dApp enables users to:
- Initialize a coffee account associated with their wallet.
- Accept SOL donations from multiple supporters.
- Track donation history and total contributions.
- Allow only the owner to withdraw accumulated funds.  

The frontend is built in **React + TypeScript** with **Anchor** integration for Solana program interactions and supports wallet connections using **Phantom**.

---

### Key Features
- **Wallet Connection:** Connect your Solana wallet using Phantom.
- **Initialize Coffee Account:** Create a coffee account to start receiving donations.
- **Send Coffee:** Donate SOL to a creator with an optional message.
- **Withdraw Funds:** The account owner can withdraw accumulated SOL.
- **View Balance:** Check total donations and donation count in real-time.
- **Responsive UI:** Works across desktop and mobile devices.
- **Live Demo:** Users can interact with the program deployed on **Devnet**.

---

### How to Use the dApp

1. **Connect Wallet:** Click “Connect Wallet” and approve connection via Phantom.
2. **Initialize Coffee Account:** Click “Initialize” to create your coffee account (only required once per wallet).
3. **Send Coffee:** Enter the donation amount and a message, then click “Send Coffee”.
4. **View Balance:** See total donations and the number of supporters.
5. **Withdraw Funds:** If you are the owner, click “Withdraw” to collect all accumulated SOL.

---

## Program Architecture

The Solana program is written using **Anchor** and includes the following main instructions:

1. **initialize** – Initializes the coffee account and sets the owner.
2. **send_coffee** – Records a donation from a supporter, updates the total donations, and stores donation metadata.
3. **get_balance** – Returns the total SOL stored in the coffee account.
4. **withdraw** – Allows the owner to withdraw all accumulated funds.

### PDA Usage
The project uses **Program Derived Addresses (PDAs)** to deterministically derive account addresses:

**PDAs Used:**
- **CoffeeAccount PDA:** Seed: `"coffee"` – Stores the coffee account associated with the owner, tracking total donations and donation count.
- **Donation PDA:** Each donation is recorded in its own account (PDA) to track donor, amount, message, and timestamp.

PDAs ensure that accounts are deterministic and securely associated with the program and wallet addresses.

---

### Program Instructions

**Instructions Implemented:**

- **initialize(owner: Pubkey):** Creates a new coffee account PDA and assigns ownership. Only callable once per wallet.  
- **send_coffee(amount: u64, message: String):** Creates a donation account and updates the coffee account’s total donations and count.  
- **get_balance(): u64** – Returns the current total balance in the coffee account.  
- **withdraw():** Transfers all accumulated SOL from the coffee account to the owner. Fails if caller is not the owner.

---

### Account Structure

```rust
#[account]
pub struct CoffeeAccount {
    pub owner: Pubkey,          // Wallet of the creator
    pub total_donations: u64,   // Total SOL received
    pub donation_count: u64,    // Number of donations received
}

#[account]
pub struct Donation {
    pub from: Pubkey,           // Donor wallet address
    pub amount: u64,            // Amount of SOL donated
    pub message: String,        // Optional message from donor
    pub timestamp: i64,         // Donation time
}
````

---

## Testing

### Test Coverage

Testing is implemented using **Anchor**, **Mocha**, and **Chai**. It covers:

**Happy Path Tests:**

* Initialize coffee account successfully.
* Send coffee (donation) from a single donor.
* Send multiple donations from different donors.
* Retrieve balance correctly.
* Owner withdraws accumulated funds successfully.

**Unhappy Path Tests:**

* Initialization fails if coffee account already exists.
* Donations fail with zero amount.
* Donations fail if donor has insufficient balance.
* Retrieving balance for a non-existent account fails.
* Non-owner withdraw attempts fail with `Unauthorized`.
* Withdrawal succeeds when only rent-exempt balance exists.
* Withdrawal fails if an invalid owner signer tries to withdraw.

---

### Running Tests

```bash
anchor test
```

This runs all unit tests locally using the Solana test validator.

---

### Additional Notes for Evaluators

* Tests simulate multiple wallets using `Keypair.generate()`.
* Airdrops ensure all accounts have enough SOL for testing.
* PDAs are used to deterministically generate coffee account and donation accounts.
* Donation records store donor, amount, message, and timestamp.
* Frontend interacts with these PDAs via the Anchor-generated IDL and Solana wallet adapter.
* Both success and failure scenarios are fully tested.


