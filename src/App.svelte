<script lang="ts">
  import WalletConnect from "@walletconnect/client";
  import QRCodeModal from "algorand-walletconnect-qrcode-modal";
  import { BRIDGE } from "./consts";

  import Dice from "./Dice.svelte";
  import Pay from "./Pay.svelte";

  let connection: WalletConnect;
  let accounts: string[];
  let chainId: number;

  const walletConnectInit = async () => {
    const conn = new WalletConnect({
      bridge: BRIDGE,
      qrcodeModal: QRCodeModal,
    });

    if (!conn.connected) {
      await conn.createSession();
    } else {
      connection = conn;
      accounts = conn.accounts;
      chainId = conn.chainId;
    }

    conn.on("connect", (err, payload) => {
      if (err) throw err;
      connection = conn;
      accounts = payload.params[0]["accounts"];
      chainId = payload.params[0]["peerId"];
    });

    conn.on("disconnect", (err, payload) => {
      if (err) throw err;

      connection = null;
      console.log("disconnect");
    });
  };

  const disconnect = async () => await connection.killSession();
</script>

<main>
  <h1>Roll the Dice</h1>
  {#if !connection}
    <button on:click={walletConnectInit}> Connect </button>
  {:else}
    <h2>Wallet Options</h2>
    <button on:click={disconnect}>Disconnect</button>
    <p>{accounts}</p>
    <Dice walletConn={connection} />
    <Pay walletConn={connection} />
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  button {
    margin: 1.5rem;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
