import { Connection } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import idlJson  from "../idl/buy_me_a_coffee.json";

// Replace with your deployed program ID


export function getProgram(wallet: any) {

  const idl = idlJson as Idl;
  const connection = new Connection("https://api.devnet.solana.com", "processed");
  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
  return new Program(idl ,  provider);
}
