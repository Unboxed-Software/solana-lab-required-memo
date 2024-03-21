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

  const accountLen = getAccountLen([ExtensionType.MemoTransfer]);
  const lamports = await connection.getMinimumBalanceForRentExemption(accountLen);

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: tokenAccountKeypair.publicKey,
    space: accountLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
  });

  const initializeAccountInstruction = createInitializeAccountInstruction(
    tokenAccountKeypair.publicKey,
    mint,
    payer.publicKey,
    TOKEN_2022_PROGRAM_ID,
  );

  const enableRequiredMemoTransfersInstruction =
    createEnableRequiredMemoTransfersInstruction(
      tokenAccountKeypair.publicKey,
      payer.publicKey,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeAccountInstruction,
    enableRequiredMemoTransfersInstruction,
  );

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, tokenAccountKeypair], // Signers
  );
}