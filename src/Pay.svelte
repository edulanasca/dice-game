<script lang="ts">
  import type WalletConnect from "@walletconnect/client";
  import { pay } from "./algoOperations";

  export let walletConn: WalletConnect;
  let to: string = '';
  let amount: number = 0;
</script>

<div>
  <label>
    Account to pay
    <input type="text" bind:value={to} />
  </label>
  <label>
    Amount to send
    <input type="number" bind:value={amount} />
  </label>
  <button disabled={to.length < 58 || amount <= 0} on:click={() => pay(walletConn, to, amount)}
    >Send</button
  >
</div>
