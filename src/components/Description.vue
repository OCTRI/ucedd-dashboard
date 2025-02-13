<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, PropType } from 'vue';
import { MeasureRow, isRate } from '@/types/MeasureRow';

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
  return measureDefinition.value;
});

const descriptionText = computed(() => {
  const measuresColumnName =
    'description_' + props.category.toLowerCase().replace(/[\s]+/g, '_');
  return props.measureInfo[measuresColumnName as keyof MeasureRow];
});

const hasDescriptionText = computed(() => {
  return descriptionText.value !== null;
});

const keyTermsText = computed(() => {
  const measuresColumnName =
    'key_terms_' + props.category.toLowerCase().replace(/[\s]+/g, '_');
  return props.measureInfo[measuresColumnName as keyof MeasureRow];
});

const hasKeyTermsText = computed(() => {
  return keyTermsText.value !== null;
});
</script>

<template>
  <h3>
    Measure: {{ props.measureInfo.measure
    }}<span v-if="subcategorySelected"> by {{ props.category }}</span>
  </h3>
  <p v-if="showMeasureDefinition" class="fw-bold mb-2">Definition: {{ measureDefinition }}</p>
  <p v-if="isRate(props.measureInfo)" class="fw-light"><em>This measure is reported "per 1000 member-years", so it tells us the rate if 1,000 people had Medicaid for a whole year.</em></p>
  <div v-if="hasDescriptionText">
    <h6>Findings:</h6>
    <div v-html="descriptionText" class="ms-4"></div>
  </div>
  <p :class="hasDescriptionText ? 'fw-light ms-4' : 'fw-light'"><em>Reminder: the data is from all Oregon Medicaid members for the year 2022.</em></p>
  <div v-if="hasKeyTermsText">
    <h6>Key Terms:</h6>
    <div v-html="keyTermsText" class="ms-4"></div>
  </div>
</template>
