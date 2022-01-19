import type WalletConnect from "@walletconnect/client";

export interface IAppState {
  connector: WalletConnect | null;
  fetching: boolean;
  connected: boolean;
  showModal: boolean;
  pendingRequest: boolean;
  signedTxns: Uint8Array[][] | null;
  pendingSubmissions: Array<number | Error>;
  uri: string;
  accounts: string[];
  address: string;
  result: any; //IResult | null;
  chain: any; //ChainType;
  assets: any;//IAssetData[];
}

export interface AccountData {
  address: string;
  amount: number;
  assets: {
    amount: number;
    asset_id: number;
    creator: string;
    is_frozen: boolean;
  }[];
};