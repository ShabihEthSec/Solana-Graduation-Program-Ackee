# Buy Me A Coffee - Solana Program

**Author:** ShabihEthSec

---

A Solana Anchor program that allows users to send "coffee" donations (in SOL) to content creators and leave messages of support.

---

## Overview

This program implements a "Buy Me a Coffee" style donation system on the Solana blockchain. It allows supporters to send SOL donations to content creators along with personalized messages, while providing creators with tools to track donations and withdraw funds.

---

## Features

- **Initialize Coffee Account**: Creators can set up a dedicated account to receive donations
- **Send Coffee Donations**: Supporters can send SOL donations with custom messages
- **Withdraw Funds**: Creators can withdraw accumulated donations to their wallet
- **View Balance**: Anyone can check the current balance of the coffee account
- **Donation Tracking**: The program tracks total donations and donation count

---

## Program Structure

### Instructions

1. **initialize**: Sets up a coffee account for receiving donations
   - **Parameters**: 
     - `owner` (Pubkey) - The public key of the account owner
   - **Accounts**: 
     - `coffee_account` (PDA, writable)
     - `payer` (signer, writable)
     - `system_program`

2. **send_coffee**: Allows users to send donations with a message
   - **Parameters**: 
     - `amount` (u64) - The donation amount in lamports
     - `message` (String) - A message from the donor
   - **Accounts**:
     - `coffee_account` (PDA, writable)
     - `donation` (signer, writable) - The donation account
     - `donor` (signer, writable)
     - `system_program`

3. **withdraw**: Allows the owner to withdraw accumulated funds
   - **Parameters**: None
   - **Accounts**:
     - `coffee_account` (PDA, writable)
     - `owner` (signer, writable)

4. **get_balance**: Returns the current balance of the coffee account
   - **Parameters**: None
   - **Accounts**:
     - `coffee_account` (PDA)
   - **Returns**: `u64` - The balance in lamports

---

### Accounts

1. **CoffeeAccount**: Stores information about the coffee account
   - `owner` (Pubkey) - The owner of the account
   - `total_donations` (u64) - Total amount of donations received
   - `donation_count` (u64) - Number of donations received

2. **Donation**: Represents an individual donation
   - `from` (Pubkey) - The donor's public key
   - `amount` (u64) - The donation amount in lamports
   - `message` (String) - The donor's message
   - `timestamp` (i64) - When the donation was made

---

### Errors

- **Unauthorized** (Error Code 6000): Thrown when a non-owner tries to withdraw funds

---

## Getting Started

### Prerequisites

- Rust and Cargo
- Solana CLI tools
- Anchor framework

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd buy-me-a-coffee
````

2. Build the program:

```bash
anchor build
```

3. Deploy the program:

```bash
anchor deploy
```

---

## Usage

### Initialize a Coffee Account

```javascript
await program.methods
  .initialize(ownerPublicKey)
  .accounts({
    coffeeAccount: coffeeAccountPDA,
    payer: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Send a Coffee Donation

```javascript
await program.methods
  .sendCoffee(amountInLamports, message)
  .accounts({
    coffeeAccount: coffeeAccountPDA,
    donation: donationAccount.publicKey,
    donor: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([donationAccount])
  .rpc();
```

### Withdraw Funds

```javascript
await program.methods
  .withdraw()
  .accounts({
    coffeeAccount: coffeeAccountPDA,
    owner: wallet.publicKey,
  })
  .rpc();
```

### Check Balance

```javascript
const balance = await program.methods
  .getBalance()
  .accounts({
    coffeeAccount: coffeeAccountPDA,
  })
  .view();
```

---

## Frontend Integration

The program includes a React-based frontend demonstrating how to interact with the smart contract. Key frontend features:

* Wallet connection using Phantom
* Coffee account initialization
* Sending donations with custom messages
* Withdrawing funds (owner only)
* Real-time balance display

---

## Development
## Testing

### Test Coverage

The tests are implemented using **Anchor**, **Mocha**, and **Chai**. They cover both **happy path** and **unhappy path** scenarios for the Buy Me A Coffee program. The main goal is to ensure that all program instructions (`initialize`, `send_coffee`, `get_balance`, `withdraw`) work as expected and handle edge cases correctly.

---

### Happy Path Tests

1. **Initialize Coffee Account**
   - Successfully creates a coffee account PDA.
   - Sets the owner correctly.
   - Initializes total donations and donation count to 0.

2. **Send Coffee (Single Donation)**
   - A donor can send SOL with a message.
   - Donation account is created and stored correctly.
   - Coffee account updates total donations and donation count.
   - Donor and coffee account balances update properly.

3. **Send Coffee (Multiple Donations)**
   - Handles donations from multiple donors.
   - Coffee account accumulates total donations correctly.
   - Donation count increments properly.

4. **Get Balance**
   - Returns the correct total donations in the coffee account.
   - Works even when called multiple times.

5. **Withdraw Funds (Owner)**
   - Owner can withdraw accumulated SOL.
   - Coffee account balance updates accordingly.
   - Owner balance increases by the withdrawn amount.

---

### Unhappy Path Tests

1. **Initialize Already Existing Account**
   - Fails if trying to initialize a coffee account that already exists.
   - Proper error is thrown: `"already in use"`.

2. **Send Coffee with Zero Amount**
   - Donation fails if amount is 0.
   - Proper error is thrown.

3. **Send Coffee with Insufficient Balance**
   - Fails if donor does not have enough SOL.
   - Error message includes `"insufficient"`.

4. **Get Balance for Non-existent Account**
   - Fails if the coffee account PDA does not exist.
   - Proper error is returned.

5. **Withdraw Funds (Non-Owner)**
   - Non-owner trying to withdraw will fail.
   - Error message includes `"Unauthorized"`.

6. **Withdraw When Only Rent-Exempt Balance Exists**
   - Withdrawal succeeds even if no extra funds are available.
   - No unexpected errors are thrown.

7. **Withdraw with Invalid Owner Signature**
   - Fails if a non-owner signer attempts withdrawal.
   - Error message includes `"unknown signer"`.

---

### Running Tests

To run all tests:

```bash
anchor test


### Program ID

The program ID is: `8TenFn5NbJriUWrdRi89S742UZWqrtpNJvAYKFE2M2A5`

### Network Deployment

The program can be deployed to different Solana networks by updating the `Anchor.toml` configuration:

```toml
[provider]
cluster = "devnet" # or "mainnet", "testnet", "localnet"
```

---

## Security Considerations

* Only the account owner can withdraw funds
* Donation accounts are created for each transaction
* Proper validation of input parameters
* PDA derivation uses a fixed seed ("coffee") to prevent collisions

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.


