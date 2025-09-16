import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { getProgram } from "./utils/anchorClient";
import { Buffer } from "buffer";

function App() {
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Check if the coffee account is initialized and get balance
  const checkCoffeeAccount = async () => {
    if (!wallet.publicKey) return;

    try {
      const program = getProgram(wallet);
      
      // Get the coffee account PDA
      const [coffeeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("coffee")],
        program.programId
      );

      try {
        // Try to get balance (this will fail if not initialized)
        const currentBalance = await program.methods
          .getBalance()
          .accounts({
            coffeeAccount: coffeeAccount,
          })
          .view();

        setBalance(Number(currentBalance) / LAMPORTS_PER_SOL);
        setIsInitialized(true);

        
        // @ts-ignore
        const coffeeAccountData = await program.account.coffeeAccount.fetch(coffeeAccount);
        setIsOwner(coffeeAccountData.owner.toString() === wallet.publicKey.toString());
      } catch (error) {
        // Account doesn't exist yet
        setIsInitialized(false);
        setBalance(null);
        setIsOwner(false);
      }
    } catch (error) {
      console.error("Error checking coffee account:", error);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      checkCoffeeAccount();
    }
  }, [wallet.connected, wallet.publicKey]);

  const initializeCoffee = async () => {
    if (!wallet.publicKey) {
      alert("Please connect wallet first!");
      return;
    }

    setLoading(true);
    try {
      const program = getProgram(wallet);
      
      // Get the coffee account PDA
      const [coffeeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("coffee")],
        program.programId
      );

      await program.methods
        .initialize(wallet.publicKey)
        .accounts({
          coffeeAccount: coffeeAccount,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      alert("☕ Coffee account initialized successfully!");
      await checkCoffeeAccount();
    } catch (err) {
      console.error("Initialization failed:", err);
      alert("Initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendCoffee = async () => {
    if (!wallet.publicKey) {
      alert("Please connect wallet first!");
      return;
    }

    if (!isInitialized) {
      alert("Coffee account not initialized yet!");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message!");
      return;
    }

    setLoading(true);
    try {
      const program = getProgram(wallet);
      
      // Convert SOL to lamports
      const amountInLamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
  

      // Get the coffee account PDA
      const [coffeeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("coffee")],
        program.programId
      );
      

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: coffeeAccount,
        lamports: amountInLamports,
      })
    );

    // Send transaction via Phantom
    const signature = await wallet.sendTransaction(
      transaction,
      program.provider.connection
    );

    await program.provider.connection.confirmTransaction(signature);

    alert(`☕ Successfully sent ${amount} SOL!`);
    setAmount("");
    setMessage("");
    await checkCoffeeAccount();
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Transaction failed. Check your balance and try again.");
  } finally {
    setLoading(false);
  }
};

  const withdrawFunds = async () => {
    if (!wallet.publicKey) {
      alert("Please connect wallet first!");
      return;
    }

    if (!isOwner) {
      alert("Only the owner can withdraw funds!");
      return;
    }

    setLoading(true);
    try {
      const program = getProgram(wallet);
      
      // Get the coffee account PDA
      const [coffeeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("coffee")],
        program.programId
      );

      await program.methods
        .withdraw()
        .accounts({
          coffeeAccount: coffeeAccount,
          owner: wallet.publicKey,
        })
        .rpc();

      alert("💰 Funds withdrawn successfully!");
      await checkCoffeeAccount();
    } catch (err) {
      console.error("Withdrawal failed:", err);
      alert("Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal points
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <div style={{ 
      padding: "2rem", 
      textAlign: "center",
      maxWidth: "600px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ marginBottom: "2rem" }}>☕ Buy Me a Coffee</h1>
      
      <div style={{ marginBottom: "2rem" }}>
        <WalletMultiButton />
      </div>

      {wallet.connected && (
        <>
          {/* Balance Display */}
          <div style={{ 
            background: "#f0f8ff", 
            padding: "1rem", 
            borderRadius: "10px",
            marginBottom: "2rem",
            border: "1px solid #b0d4f1"
          }}>
            <h3 style={{ margin: 0, color: "#1e40af" }}>
              Current Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : "Not initialized"}
            </h3>
            {isOwner && (
              <p style={{ margin: "0.5rem 0 0 0", color: "#059669", fontWeight: "bold" }}>
                👑 You are the owner
              </p>
            )}
          </div>

          {/* Initialize Button (if not initialized) */}
          {!isInitialized && (
            <div style={{ 
              background: "#fef3c7", 
              padding: "1.5rem", 
              borderRadius: "10px",
              marginBottom: "2rem",
              border: "1px solid #f59e0b"
            }}>
              <h3 style={{ marginTop: 0, color: "#92400e" }}>Coffee Account Not Initialized</h3>
              <p style={{ color: "#92400e", marginBottom: "1rem" }}>
                Initialize the coffee account to start receiving donations.
              </p>
              <button
                onClick={initializeCoffee}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  backgroundColor: loading ? "#ccc" : "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold"
                }}
              >
                {loading ? "Initializing..." : "Initialize Coffee Account"}
              </button>
            </div>
          )}

          {/* Send Coffee Section */}
          {isInitialized && (
            <div style={{ 
              background: "#f5f5f5", 
              padding: "2rem", 
              borderRadius: "10px",
              marginBottom: "2rem"
            }}>
              <h3 style={{ marginBottom: "1rem" }}>Send a Coffee ☕</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Amount (SOL):
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.1"
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    textAlign: "center"
                  }}
                />
                <small style={{ color: "#666", marginTop: "0.25rem", display: "block" }}>
                  Minimum: 0.001 SOL
                </small>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}>
                  Message:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Thanks for the great work!"
                  maxLength={200}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    minHeight: "80px",
                    resize: "vertical"
                  }}
                />
                <small style={{ color: "#666" }}>
                  {message.length}/200 characters
                </small>
              </div>

              <button
                onClick={sendCoffee}
                disabled={loading || !amount || !message.trim()}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  backgroundColor: loading || !amount || !message.trim() ? "#ccc" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  width: "100%",
                  fontWeight: "bold",
                  marginBottom: "1rem"
                }}
              >
                {loading ? "Sending..." : `Send ${amount || "0"} SOL ☕`}
              </button>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}>
                <button
                  onClick={() => { setAmount("0.1"); setMessage("Thanks for the coffee! ☕"); }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  0.1 SOL
                </button>
                <button
                  onClick={() => { setAmount("0.5"); setMessage("Great work! ☕"); }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  0.5 SOL
                </button>
                <button
                  onClick={() => { setAmount("1"); setMessage("Amazing content! ☕"); }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#e0e0e0",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  1 SOL
                </button>
              </div>
            </div>
          )}

          {/* Withdraw Section (Owner Only) */}
          {isInitialized && isOwner && balance && balance > 0 && (
            <div style={{ 
              background: "#ecfdf5", 
              padding: "1.5rem", 
              borderRadius: "10px",
              border: "1px solid #10b981"
            }}>
              <h3 style={{ marginTop: 0, color: "#065f46" }}>💰 Owner Controls</h3>
              <p style={{ color: "#065f46", marginBottom: "1rem" }}>
                You can withdraw the accumulated donations ({balance.toFixed(4)} SOL)
              </p>
              <button
                onClick={withdrawFunds}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  backgroundColor: loading ? "#ccc" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold"
                }}
              >
                {loading ? "Withdrawing..." : `Withdraw ${balance.toFixed(4)} SOL`}
              </button>
            </div>
          )}

          {/* Refresh Balance Button */}
          <button
            onClick={checkCoffeeAccount}
            style={{
              marginTop: "1rem",
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            🔄 Refresh Balance
          </button>
        </>
      )}

      {!wallet.connected && (
        <p style={{ 
          marginTop: "1rem", 
          color: "#666",
          fontStyle: "italic"
        }}>
          Connect your wallet to interact with the coffee contract ☕
        </p>
      )}
    </div>
  );
}

export default App;