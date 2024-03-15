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
} from "@solana/web3.js";
import { createTokenWithMemoExtension } from "./token-helpers";
import { initializeKeypair } from "./keypair-helpers";
require("dotenv").config();
interface TransferWithoutMemoInputs {
  connection: Connection;
  fromTokenAccount: PublicKey;
  destinationTokenAccount: PublicKey;
  payer: Keypair;
  amount: number;
}
async function testTryingToTransferWithoutMemo(inputs: TransferWithoutMemoInputs) {
  const { fromTokenAccount, destinationTokenAccount, payer, connection, amount } = inputs;
  try {
    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        destinationTokenAccount,
        payer.publicKey,
        amount,
        undefined,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await sendAndConfirmTransaction(connection, transaction, [payer]);

    console.error("You should not be able to transfer without a memo.");

  } catch (error) {
    console.log(
      `✅ - We expected this to fail because you need to send a memo with the transfer.`
    );
  }
}

interface TransferWithMemoInputs {
  connection: Connection;
  fromTokenAccount: PublicKey;
  destinationTokenAccount: PublicKey;
  mint: PublicKey;
  payer: Keypair;
  amount: number;
  message: string;
}
async function testTransferWithMemo(inputs: TransferWithMemoInputs) {
  const { fromTokenAccount, destinationTokenAccount, mint, payer, connection, amount, message } = inputs;
  try {

    const transaction = new Transaction().add(
      new TransactionInstruction({
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(message, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      }),

      createTransferInstruction(
        fromTokenAccount,
        destinationTokenAccount,
        payer.publicKey,
        amount,
        undefined,
        TOKEN_2022_PROGRAM_ID
      )
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);

    const account = await getAccount(
      connection,
      destinationTokenAccount,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )

    console.log(
      `✅ - We have transferred ${account.amount} tokens to ${destinationTokenAccount} with the memo: ${message}`
    );

  } catch (error) {
    console.log(error)
  }
}

async function testTransferWithDisabledMemo(inputs: TransferWithoutMemoInputs) {
  const { fromTokenAccount, destinationTokenAccount, payer, connection, amount } = inputs;
  try {

    await disableRequiredMemoTransfers(
      connection,
      payer,
      destinationTokenAccount,
      payer,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        destinationTokenAccount,
        payer.publicKey,
        amount,
        undefined,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await sendAndConfirmTransaction(connection, transaction, [payer]);

    const account = await getAccount(
      connection,
      destinationTokenAccount,
      undefined,
      TOKEN_2022_PROGRAM_ID
    )

    // re-enable memo transfers to show it exists 
    await enableRequiredMemoTransfers(
      connection,
      payer,
      destinationTokenAccount,
      payer,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(
      `✅ - We have transferred ${amount} tokens to ${destinationTokenAccount} without a memo.`
    );

  } catch (error) {
    console.log(error)
  }
}

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

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    mintDecimals,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );


  await createTokenWithMemoExtension(
    connection,
    payer,
    ourTokenAccountKeypair,
    mint
  );

  await createTokenWithMemoExtension(
    connection,
    payer,
    otherTokenAccountKeypair,
    mint
  );

  await mintTo(
    connection,
    payer,
    mint,
    ourTokenAccount,
    payer,
    amountToMint,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  )

  {
    // Show that you can't transfer without memo
    await testTryingToTransferWithoutMemo({
      connection,
      fromTokenAccount: ourTokenAccount,
      destinationTokenAccount: otherTokenAccount,
      payer,
      amount: amountToTransfer
    });
  }

  {
    // Show transfer with memo 
    await testTransferWithMemo({
      connection,
      fromTokenAccount: ourTokenAccount,
      destinationTokenAccount: otherTokenAccount,
      mint,
      payer,
      amount: amountToTransfer,
      message: "Hello, Solana"
    });

  }

  {
    // Show you can disable memo transfer and transfer without it
    await testTransferWithDisabledMemo({
      connection,
      fromTokenAccount: ourTokenAccount,
      destinationTokenAccount: otherTokenAccount,
      payer,
      amount: amountToTransfer
    });
  }
})()
