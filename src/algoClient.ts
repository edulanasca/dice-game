import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import type WalletConnect from "@walletconnect/client";
import algosdk, {
  algosToMicroalgos,
  assignGroupID,
  encodeUnsignedTransaction,
  getApplicationAddress,
  makeApplicationNoOpTxn,
  makePaymentTxnWithSuggestedParams,
  SuggestedParams,
  waitForConfirmation,
} from "algosdk";
import type AlgodClient from "algosdk/dist/types/src/client/v2/algod/algod";

// From https://developer.algorand.org/docs/rest-apis/algod/v2/#account


export class AlgoClient {
  private _token: string =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  private _server: string = "http://localhost";
  private _port: number = 4001;
  private _client: AlgodClient;
  private _appId: number;

  constructor() {
    this._client = new algosdk.Algodv2(this._token, this._server, this._port);
  }

  set appId(appId: number) {
    this._appId = appId;
  }

  public async getAccInfo(addr: string): Promise<Record<string, any>> {
    return await this._client.accountInformation(addr).do();
  }

  public async onBet(
    conn: WalletConnect,
    address: string,
    bet_amount: number,
    dice_n: number,
    user_n: number
  ): Promise<Record<string, any>> {
    console.log(this._appId);
    console.log(address);
    const appAddr = getApplicationAddress(this._appId); //53604443
    console.log(address.length);
    console.log(typeof(address) === 'string');
    console.log(await this._client.pendingTransactionsInformation().do())

    const params: SuggestedParams = await this._client
      .getTransactionParams()
      .do();

    params.fee = 1000;
    params.flatFee = true;

    console.log(params);
    // console.log(address, bet_amount, dice_n, user_n)

    const args = [Uint8Array.of(user_n), Uint8Array.of(dice_n)];

    const secret = algosdk.mnemonicToSecretKey('quantum heart hazard pave more mean outdoor wing fruit laugh brown used explain gesture twenty leisure embrace once beyond bicycle fit reject allow above simple');
    console.log(secret);

    const payTxn = makePaymentTxnWithSuggestedParams(
      secret.addr,
      "FCJK23QE35CAI4EYH5VGAK3MZNVHEXKPVOUQC3HFLGJOHDLMAMMFLQQ72Y",
      algosToMicroalgos(bet_amount),
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
      this.toUint8(Math.random().toString()),
      params
    );

    const appCallTxn = makeApplicationNoOpTxn(
      secret.addr,
      params,
      53604443,
      args
    );

    // const pay = makePaymentTxnWithSuggestedParams(secret.addr, secret.addr, 1000, undefined, this.toUint8('test js sdk'), params);
    // const spay = pay.signTxn(secret.sk);

    // const {txId} = await this._client.sendRawTransaction(spay).do();
    // console.log(txId)
    assignGroupID([payTxn, appCallTxn]);
    
    const spayTxn = payTxn.signTxn(secret.sk);
    const sappCallTxn = payTxn.signTxn(secret.sk);

    const txns = [spayTxn, sappCallTxn];
    
    // const txnsToSign = txns.map(txn => {
    //   const encodedTxn = Buffer.from(encodeUnsignedTransaction(txn)).toString("base64");
    //   console.log(txn);
    //   return {
    //     txn: encodedTxn,
    //     message: 'Sign tx to app'
    //   }
    // })

    // console.log(txnsToSign);

    // const request = formatJsonRpcRequest("algo_signTxn", [txnsToSign]);
    // const result: Array<string | null> = await conn.sendCustomRequest(request);
    // console.log("Raw response:", result);

    // const decodedResult = result.map(element => {
    //   console.log('element' + element);
    //   return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
    // });

    // console.log(decodedResult);
    
    const { txId } = await this._client
    .sendRawTransaction(txns)
    // .sendRawTransaction(decodedResult)
    .do();

    // Wait for confirmation
    let confirmedTxn = await waitForConfirmation(this._client, txId, 1000);
    //Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
    // let mytxinfo = JSON.stringify(confirmedTxn.txn.txn, undefined, 2);
    // console.log("Transaction information: %o", mytxinfo);
    var string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
    console.log("Note field: ", string);
    const accountInfo = await this._client.accountInformation(secret.addr).do();
    console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);        
    console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
    console.log("Account balance: %d microAlgos", accountInfo.amount);
    
    // return await waitForConfirmation(this._client, tx_id, 10000);
    return undefined;
  }

  private toUint8(text: string) {
    return new TextEncoder().encode(text);
  }
}
