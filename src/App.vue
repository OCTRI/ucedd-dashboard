<script setup lang="ts">
import DataDashboard from './components/DataDashboard.vue';
</script>

<template>
  <h2 class="mb-4">Outcome levels, differences for Medicaid members with IDD and comparison population (2022)</h2>
  <p>Differences that are statistically significant are denoted with an asterisk (*). Rows that are colored <span class="significant-idd-block-text">orange</span> indicate poorer outcomes for the IDD community. Rows that are colored <span class="significant-nonidd-block-text">blue</span> indicate poorer outcomes for the non-IDD community.</p>
  <DataDashboard />
</template>
