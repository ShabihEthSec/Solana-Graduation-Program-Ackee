import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BuyMeACoffee } from "../target/types/buy_me_a_coffee";
import { expect } from "chai";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";

describe("buy-me-a-coffee", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.buyMeACoffee as Program<BuyMeACoffee>;
  const provider = anchor.getProvider();

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.initialize().rpc();
  //   console.log("Your transaction signature", tx);
  // });

    // Test accounts
  let owner: Keypair;
  let donor1: Keypair;
  let donor2: Keypair;
  let coffeeAccountPDA: anchor.web3.PublicKey;
  let coffeeAccountBump: number;

  before(async () => {
    // Initialize test keypairs
    owner = Keypair.generate();
    donor1 = Keypair.generate();
    donor2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(owner.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(donor1.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(donor2.publicKey, 2 * LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Derive coffee account PDA
    [coffeeAccountPDA, coffeeAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("coffee")],
      program.programId
    );
  });

  describe("initialize", () => {
    it("should successfully initialize the coffee account", async () => {
      const tx = await program.methods
        .initialize(owner.publicKey)
        .accounts({
          coffeeAccount: coffeeAccountPDA,
          payer: owner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      // Verify the account was created and initialized correctly
      const coffeeAccount = await program.account.coffeeAccount.fetch(coffeeAccountPDA);
      expect(coffeeAccount.owner.toString()).to.equal(owner.publicKey.toString());
      expect(coffeeAccount.totalDonations.toString()).to.equal("0");
      expect(coffeeAccount.donationCount.toString()).to.equal("0");
    });

    it("should fail to initialize if coffee account already exists", async () => {
      try {
        await program.methods
          .initialize(owner.publicKey)
          .accounts({
            coffeeAccount: coffeeAccountPDA,
            payer: owner.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([owner])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("already in use");
      }
    });
  });

  describe("send_coffee", () => {
    let donationKeypair1: Keypair;
    let donationKeypair2: Keypair;

    beforeEach(() => {
      donationKeypair1 = Keypair.generate();
      donationKeypair2 = Keypair.generate();
    });

    it("should successfully send coffee (make donation)", async () => {
      const donationAmount = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL
      const message = "Thanks for the great content!";

      // Get initial balances
      const initialDonorBalance = await provider.connection.getBalance(donor1.publicKey);
      const initialCoffeeBalance = await provider.connection.getBalance(coffeeAccountPDA);

      const tx = await program.methods
        .sendCoffee(new anchor.BN(donationAmount), message)
        .accounts({
          coffeeAccount: coffeeAccountPDA,
          donation: donationKeypair1.publicKey,
          donor: donor1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([donor1, donationKeypair1])
        .rpc();

      // Verify donation record
      const donation = await program.account.donation.fetch(donationKeypair1.publicKey);
      expect(donation.from.toString()).to.equal(donor1.publicKey.toString());
      expect(donation.amount.toString()).to.equal(donationAmount.toString());
      expect(donation.message).to.equal(message);
      expect(Number(donation.timestamp)).to.be.greaterThan(0);

      // Verify coffee account was updated
      const coffeeAccount = await program.account.coffeeAccount.fetch(coffeeAccountPDA);
      expect(coffeeAccount.totalDonations.toString()).to.equal(donationAmount.toString());
      expect(coffeeAccount.donationCount.toString()).to.equal("1");

      // Verify balances changed correctly
      const finalDonorBalance = await provider.connection.getBalance(donor1.publicKey);
      const finalCoffeeBalance = await provider.connection.getBalance(coffeeAccountPDA);
      
      expect(finalCoffeeBalance).to.be.greaterThan(initialCoffeeBalance);
      expect(finalDonorBalance).to.be.lessThan(initialDonorBalance);
    });

    it("should handle multiple donations correctly", async () => {
      const donationAmount1 = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL
      const donationAmount2 = 0.15 * LAMPORTS_PER_SOL; // 0.15 SOL
      const message1 = "First donation!";
      const message2 = "Second donation!";

      // First donation
      await program.methods
        .sendCoffee(new anchor.BN(donationAmount1), message1)
        .accounts({
          coffeeAccount: coffeeAccountPDA,
          donation: donationKeypair1.publicKey,
          donor: donor1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([donor1, donationKeypair1])
        .rpc();

      // Second donation from different donor
      await program.methods
        .sendCoffee(new anchor.BN(donationAmount2), message2)
        .accounts({
          coffeeAccount: coffeeAccountPDA,
          donation: donationKeypair2.publicKey,
          donor: donor2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([donor2, donationKeypair2])
        .rpc();

      // Verify coffee account accumulated correctly
      const coffeeAccount = await program.account.coffeeAccount.fetch(coffeeAccountPDA);
      const expectedTotal = donationAmount1 + donationAmount2 + (0.1 * LAMPORTS_PER_SOL); // Previous test donation
      expect(coffeeAccount.totalDonations.toString()).to.equal(expectedTotal.toString());
      expect(coffeeAccount.donationCount.toString()).to.equal("3"); // Including previous test
    });

    it("should fail with zero donation amount", async () => {
      try {
        await program.methods
          .sendCoffee(new anchor.BN(0), "Zero donation")
          .accounts({
            coffeeAccount: coffeeAccountPDA,
            donation: donationKeypair1.publicKey,
            donor: donor1.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([donor1, donationKeypair1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
       
        expect(error).to.exist;
        console.log("Zero donation error:", error.message);
      }
    });

    it("should fail if donor has insufficient balance", async () => {
      const poorDonor = Keypair.generate();
      const excessiveAmount = 10 * LAMPORTS_PER_SOL;

      try {
        await program.methods
          .sendCoffee(new anchor.BN(excessiveAmount), "Too much!")
          .accounts({
            coffeeAccount: coffeeAccountPDA,
            donation: donationKeypair1.publicKey,
            donor: poorDonor.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorDonor, donationKeypair1])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("insufficient");
      }
    });
  });

  describe("get_balance", () => {
    it("should return the correct available balance", async () => {
      const result = await program.methods
        .getBalance()
        .accounts({
          coffeeAccount: coffeeAccountPDA,
        })
        .view();

      // Should return a BN (Big Number) - convert to number for assertion
      const balance = result.toNumber ? result.toNumber() : Number(result);
      expect(balance).to.be.a('number');
      expect(balance).to.be.greaterThanOrEqual(0);
    });

    it("should work with non-existent coffee account (simulation)", async () => {
      // Create a fake PDA that doesn't exist
      const [fakePDA] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("fake-coffee")],
        program.programId
      );

      try {
        await program.methods
          .getBalance()
          .accounts({
            coffeeAccount: fakePDA,
          })
          .view();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.exist;
        console.log("Non-existent account error:", error.message);
      }
    });
  });

  describe("withdraw", () => {
    it("should allow owner to withdraw funds", async () => {
      // Get initial balances
      const initialOwnerBalance = await provider.connection.getBalance(owner.publicKey);
      const initialCoffeeBalance = await provider.connection.getBalance(coffeeAccountPDA);

      const tx = await program.methods
        .withdraw()
        .accounts({
          coffeeAccount: coffeeAccountPDA,
          owner: owner.publicKey,
        })
        .signers([owner])
        .rpc();

      // Verify balances changed
      const finalOwnerBalance = await provider.connection.getBalance(owner.publicKey);
      const finalCoffeeBalance = await provider.connection.getBalance(coffeeAccountPDA);

      // Owner should have received some funds (minus transaction fees)
      expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance - 0.01 * LAMPORTS_PER_SOL);
      
      // Coffee account should retain only rent-exempt balance
      expect(finalCoffeeBalance).to.be.lessThan(initialCoffeeBalance);
    });

    it("should fail when non-owner tries to withdraw", async () => {
      const nonOwner = Keypair.generate();
      await provider.connection.requestAirdrop(nonOwner.publicKey, LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        await program.methods
          .withdraw()
          .accounts({
            coffeeAccount: coffeeAccountPDA,
            owner: nonOwner.publicKey,
          })
          .signers([nonOwner])
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Unauthorized");
      }
    });

    it("should handle withdrawal when balance is only rent-exempt amount", async () => {
      // First, let's withdraw all available funds
      await program.methods
        .withdraw()
        .accounts({
          coffeeAccount: coffeeAccountPDA,
          owner: owner.publicKey,
        })
        .signers([owner])
        .rpc();

      // Try to withdraw again - should not fail but nothing to withdraw
      const tx = await program.methods
        .withdraw()
        .accounts({
          coffeeAccount: coffeeAccountPDA,
          owner: owner.publicKey,
        })
        .signers([owner])
        .rpc();

      // Should complete successfully even with nothing to withdraw
      expect(tx).to.be.a('string');
    });

    it("should fail with invalid owner signature", async () => {
      const fakeOwner = Keypair.generate();
      
      try {
        await program.methods
          .withdraw()
          .accounts({
            coffeeAccount: coffeeAccountPDA,
            owner: owner.publicKey, // Correct owner account
          })
          .signers([fakeOwner]) // Wrong signer
          .rpc();
        
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("unknown signer");
      }
    });
  });

});
