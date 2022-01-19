<script lang="ts">
  import type WalletConnect from "@walletconnect/client";

  import AccountInfo from "./AccountInfo.svelte";
  import { getInfoAccount, onBet } from "./algoOperations";
  import type { AccountData } from "./types";

  export let walletConn: WalletConnect;

  let dice_n: number = 0;
  let user_n: number = 0;
  let amount: number = 1;
  let accData: AccountData;

  getInfoAccount(walletConn.accounts[0]);

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const onRoll = function () {
    dice_n = getRandomInt(1, 6);
    console.log(dice_n);
    onBet(walletConn, amount, user_n, dice_n).then(
      (data) => (accData.amount = data.amount)
    );
  };
</script>

<div>
  <AccountInfo {accData} />
  <label>
    Amount to bet
    <input type="number" bind:value={amount} min="1" max={amount} />
  </label>
  <label for="in_usr">
    Number to guess (1 a 6)
    <input name="in_user" type="number" bind:value={user_n} min="1" max="6" />
  </label>
  <button on:click={onRoll}>Roll the dice</button>
  {#if dice_n !== 0}
    {#await onRoll}
      <p>Betting...</p>
    {:then res}
      <p>Dice number: {dice_n}</p>
      <p>Your number: {user_n}</p>
    {/await}
  {/if}
</div>
