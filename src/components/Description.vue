<script setup lang="ts">
import { computed, PropType } from 'vue';
import MeasureRow from '@/types/MeasureRow';

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  allCategorySelected: {
        type: Boolean,
        required: true
  },
  measureInfo: {
    type: Object as PropType<MeasureRow>,
    required: true
  }
});

const subcategorySelected = computed(() => {
    return !props.allCategorySelected;
});

const measureDefinition = computed(() => {
    return props.measureInfo.definition;
});

const showMeasureDefinition = computed(() => {
  return measureDefinition.value && props.allCategorySelected;
});

const descriptionText = computed(() => {
    const measuresColumnName = "description_" + props.category.toLowerCase().replace(/[\s]+/g, '_');
    return props.measureInfo[measuresColumnName as keyof MeasureRow];
});

const hasDescriptionText = computed(() => {
    return descriptionText.value !== null;
});

const keyTermsText = computed(() => {
    const measuresColumnName = "key_terms_" + props.category.toLowerCase().replace(/[\s]+/g, '_');
    return props.measureInfo[measuresColumnName as keyof MeasureRow];
});

const hasKeyTermsText = computed(() => {
    return keyTermsText.value !== null;
});

</script>

<template>
    <p class="lead fw-bold">Measure: {{props.measureInfo.measure}}<span v-if="subcategorySelected"> by {{ props.category }}</span></p>
    <p v-if="showMeasureDefinition">Definition: {{ measureDefinition }}</p>
    <div v-if="hasDescriptionText">
        <h6>Findings:</h6>
        <div v-html="descriptionText" class="ms-4"></div>
    </div>
    <p class="fw-light ms-4">Generic reminder that the data is from all Medicaid members</p>
    <div v-if="hasKeyTermsText">
        <h6>Key Terms:</h6>
        <div v-html="keyTermsText" class="ms-4"></div>
    </div>
</template>