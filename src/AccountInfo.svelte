<script lang="ts">
  import { microalgosToAlgos } from "algosdk";
  import type { AccountData } from "./algoClient";

  export let accData: AccountData;
</script>

<div>
  {#if accData}
    <p>You have {microalgosToAlgos(accData.amount)} Algos</p>
  {/if}
</div>
