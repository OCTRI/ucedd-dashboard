<script setup lang="ts">
import { computed, PropType } from 'vue';
import MeasureRow from '@/types/MeasureRow';

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  description: {
    type: Object as PropType<MeasureRow>,
    required: true
  }
});

const description = computed(() => {
    return props.description.description;
});

const descriptionText = computed(() => {
    const measuresColumnName = "description_" + props.category.toLowerCase().replace(/[\s]+/g, '_');
    return props.description[measuresColumnName as keyof MeasureRow];
});

const hasDescriptionText = computed(() => {
    return descriptionText.value !== null;
});

</script>

<template>
    <h4>{{props.description.measure}} by {{ props.category }}</h4>
    <p v-if="description"><em>Description: {{ props.description.description }}</em></p>
    <div v-if="hasDescriptionText">
        <h5>Key Findings</h5>
        <div v-html="descriptionText"></div>
    </div>
</template>