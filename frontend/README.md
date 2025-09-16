# Buy Me A Coffee - Frontend
**Author:** ShabihEthSec

---
A React + TypeScript frontend for the **Buy Me A Coffee** Solana program. This app lets users connect their Solana wallet, donate SOL (send coffee), and view account balances. Built with **Vite**, **Anchor**, and **@solana/wallet-adapter** libraries.

**💻 Live Demo:** [https://sol-buy-me-a-coffee.vercel.app/](https://sol-buy-me-a-coffee.vercel.app/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Connecting with the Solana Program](#connecting-with-the-solana-program)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This frontend interacts with the Solana program deployed on **Devnet**. Users can:

- Initialize a coffee account
- Donate SOL to the coffee account
- Withdraw funds (if they are the owner)
- View the current balance and donation history

It integrates with Solana wallets like **Phantom** for transaction signing and connection.

---

## Features

- Wallet connection (Phantom)
- Initialize Coffee Account
- Send Coffee (donate SOL)
- Withdraw funds (owner only)
- View balance and donations
- Responsive UI
- Built for Solana Devnet

---

## Tech Stack

- **React** & **TypeScript**
- **Vite** (fast development & build)
- **@solana/web3.js**
- **@solana/wallet-adapter-react**
- **Anchor** (IDL integration)
- **TailwindCSS / CSS** (for styling)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/ShabihEthSec/Sol-Buy-me-a-coffee.git
cd Sol-Buy-me-a-coffee/frontend/buy-me-a-coffee
````

Install dependencies:

```bash
npm install
```

---

## Usage

1. Start the development server:

```bash
npm run dev
```

2. Open `http://localhost:5173` in your browser.

3. Connect your **Phantom Wallet**.

4. Interact with the app:

   * Initialize the coffee account
   * Send coffee (donate SOL)
   * Withdraw funds (if you are the owner)
   * View balance

**Live Demo:** [https://sol-buy-me-a-coffee.vercel.app/](https://sol-buy-me-a-coffee.vercel.app/)

---

## Project Structure

```
src/
├─ App.tsx             # Main application
├─ main.tsx            # ReactDOM render & Wallet providers
├─ components/         # Reusable components (buttons, modals, etc.)
├─ utils/              # Anchor program client helpers
├─ assets/             # Images and logos
├─ styles/             # CSS / Tailwind
tsconfig.json           # TypeScript configuration
package.json            # Project dependencies
```

---

## Connecting with the Solana Program

* Uses **Anchor-generated IDL** for type-safe program interaction.
* Fetches **coffee account PDA** using `PublicKey.findProgramAddressSync`.
* Handles errors like:

  * `Initialization failed`
  * `Insufficient balance`
* Uses `@solana/wallet-adapter-react` for wallet connection and signing transactions.

---

## Deployment

This frontend is deployed on **Vercel**. To redeploy after changes:

1. Push your changes to GitHub:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

2. Vercel automatically builds and deploys from your GitHub repo.

---

## Contributing

Contributions are welcome!

* Fork the repo
* Create a branch (`git checkout -b feature-name`)
* Commit your changes (`git commit -m "Add feature"`)
* Push (`git push origin feature-name`)
* Open a Pull Request

---

## License

MIT License © 2025 ShabihEthSec




