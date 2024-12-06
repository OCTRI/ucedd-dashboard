<script setup lang="ts">
import { computed, PropType } from 'vue';
import MeasureRow from '@/types/MeasureRow';

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  summary: {
    type: Object as PropType<MeasureRow>,
    required: true
  }
});

const description = computed(() => {
    return props.summary.description;
});

const summaryText = computed(() => {
    const measuresColumnName = "summary_" + props.category.toLowerCase().replace(/[\s]+/g, '_');
    return props.summary[measuresColumnName as keyof MeasureRow];
});

const hasSummaryText = computed(() => {
    return summaryText.value !== null;
});

</script>

<template>
    <h4>{{props.summary.measure}} by {{ props.category }}</h4>
    <p v-if="description"><em>Description: {{ props.summary.description }}</em></p>
    <div v-if="hasSummaryText">
        <h5>Key Findings</h5>
        <div v-html="summaryText"></div>
    </div>
</template>