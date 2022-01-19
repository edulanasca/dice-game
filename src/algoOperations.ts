import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import type WalletConnect from "@walletconnect/client";
import {
  Algodv2,
  algosToMicroalgos,
  assignGroupID,
  encodeUint64,
  encodeUnsignedTransaction,
  getApplicationAddress,
  makeApplicationNoOpTxn,
  makePaymentTxnWithSuggestedParamsFromObject,
  PaymentTxn,
  SuggestedParams,
  Transaction,
  waitForConfirmation,
} from "algosdk";
import { APPID, PORT, SERVER, TOKEN } from "./consts";
import type { AccountData } from "./types";

const client = new Algodv2(TOKEN, SERVER, PORT);

export async function getInfoAccount(addr: string): Promise<AccountData> {
  return await (<Promise<AccountData>>client.accountInformation(addr).do());
}

export async function onBet(
  conn: WalletConnect,
  // addr: string,
  amount: number,
  user_n: number,
  dice_n: number
): Promise<AccountData> {

  const account = await getInfoAccount(conn.accounts[0]);

  const appAddr = getApplicationAddress(APPID);

  const params: SuggestedParams = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  const args = [encodeUint64(user_n), encodeUint64(dice_n)];

  const paymentTxn: PaymentTxn = {
    from: account.address,
    to: appAddr,
    amount: algosToMicroalgos(amount),
    suggestedParams: params,
  };

  const payTxn = makePaymentTxnWithSuggestedParamsFromObject(paymentTxn);
  const appCallTxn = makeApplicationNoOpTxn(
    account.address,
    params,
    APPID,
    args
  );
  
  const txns = assignGroupID([payTxn, appCallTxn]);

  const decodedResult = await askUserToSign(conn, txns);

  const { txId } = await client.sendRawTransaction(decodedResult).do();

  // Wait for confirmation
  let confirmedTxn = await waitForConfirmation(client, txId, 1000);
  //Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
  let mytxinfo = JSON.stringify(confirmedTxn.txn.txn, undefined, 2);
  console.log("Transaction information: %o", mytxinfo);
  var string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
  console.log("Note field: ", string);
  const accountInfo = await getInfoAccount(account.address);
  console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);
  console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
  console.log("Account balance: %d microAlgos", accountInfo.amount);

  return accountInfo;
}

export async function pay(conn: WalletConnect, to: string, amount: number) {
  const params: SuggestedParams = await client.getTransactionParams().do();
  params.fee = 1000;
  params.flatFee = true;

  const paymentTxn: PaymentTxn = {
    from: conn.accounts[0],
    to: to,
    amount: algosToMicroalgos(amount),
    suggestedParams: params,
  };

  const payTxn = makePaymentTxnWithSuggestedParamsFromObject(paymentTxn);
  const decodedResult = await askUserToSign(conn, [payTxn]);

  const { txId } = await client.sendRawTransaction(decodedResult).do(); 
  let confirmedTxn = await waitForConfirmation(client, txId, 1000);

  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
  console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);
  console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
  
  return await getInfoAccount(conn.accounts[0]);
}

async function askUserToSign(conn: WalletConnect, txns:Transaction[]): Promise<Uint8Array[]> {
  const txnsToSign = txns.map((txn) => {
    const encodedTxn = Buffer.from(encodeUnsignedTransaction(txn)).toString(
      "base64"
    );

    return {
      txn: encodedTxn,
      message: "Sign tx to app"
    };
  });

  const request = formatJsonRpcRequest("algo_signTxn", [txnsToSign]);
  const result: Array<string | null> = await conn.sendCustomRequest(request);

  return result.map((element) => {
    return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
  });
}