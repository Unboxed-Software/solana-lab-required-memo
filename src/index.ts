import {
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  AccountState,
  thawAccount,
  mintTo,
  setAuthority,
  AuthorityType,
  createTransferInstruction,
  createMint,
  getAccountLen,
  ExtensionType,
  createInitializeAccountInstruction,
  createEnableRequiredMemoTransfersInstruction,
  disableRequiredMemoTransfers,
  enableRequiredMemoTransfers
} from "@solana/spl-token";
import {
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  Transaction,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  clusterApiUrl,
} from "@solana/web3.js";
import { createTokenWithMemoExtension } from "./token-helpers";
import { initializeKeypair } from "./keypair-helpers";
require("dotenv").config();


(async () => {
  const connection = new Connection("http://127.0.0.1:8899", 'confirmed');
  const payer = await initializeKeypair(connection);
  const mintDecimals = 9;

  const ourTokenAccountKeypair = Keypair.generate();
  const ourTokenAccount = ourTokenAccountKeypair.publicKey;

  const otherTokenAccountKeypair = Keypair.generate();
  const otherTokenAccount = otherTokenAccountKeypair.publicKey;

  const amountToMint = 1000;
  const amountToTransfer = 300;
})()
