import {
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  mintTo,
  createTransferInstruction,
  createMint,
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
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createTokenWithMemoExtension } from "./token-helper";
import { initializeKeypair, makeKeypairs } from '@solana-developers/helpers';

require("dotenv").config();


(async () => {
  const connection = new Connection("http://127.0.0.1:8899", 'confirmed');
  const payer = await initializeKeypair(connection, {
    airdropAmount: 1 * LAMPORTS_PER_SOL
  });
  const mintDecimals = 9;

  const [ourTokenAccountKeypair, otherTokenAccountKeypair] = makeKeypairs(2)
  const ourTokenAccount = ourTokenAccountKeypair.publicKey;
  const otherTokenAccount = otherTokenAccountKeypair.publicKey;

  const amountToMint = 1000;
  const amountToTransfer = 300;
})()
