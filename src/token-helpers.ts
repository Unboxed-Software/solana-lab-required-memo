import {
  TOKEN_2022_PROGRAM_ID,
  getAccountLen,
  ExtensionType,
  createInitializeAccountInstruction,
  createEnableRequiredMemoTransfersInstruction,
} from "@solana/spl-token";
import {
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  Transaction,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";

export async function createTokenWithMemoExtension(
  connection: Connection,
  payer: Keypair,
  tokenAccountKeypair: Keypair,
  mint: PublicKey,
) {
  throw new Error
}