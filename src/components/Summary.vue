<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue';
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

const ready = ref<boolean>(false);

const description = computed(() => {
    return props.summary.description;
});

const categoryFinding = computed(() => {
    return props.summary[props.category.toLowerCase() as keyof MeasureRow];
});

const allFinding = computed(() => {
    return props.summary.all;
});

const hasFindings = computed(() => {
    return categoryFinding || allFinding;
});

watch(() => props.summary, (newData) => {
    if (newData.measure.length) {
        ready.value = true;
    }
}, { immediate: true });
</script>

<template>
    <h4>{{props.summary.measure}} by {{ props.category }}</h4>
    <p v-if="description">Description: {{ props.summary.description }}</p>
    <ul v-if="hasFindings">
        <li v-if="allFinding">
            {{ allFinding }}
        </li>
        <li v-if="categoryFinding">
            {{ categoryFinding }}
        </li>
    </ul>
</template>