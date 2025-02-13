<script setup lang="ts">
import { computed, shallowRef, PropType, ref, watch } from 'vue';
import DisplayRow from '@/types/DisplayRow';
import { MeasureRow, isRate} from '@/types/MeasureRow';
import { Chart, Scale, TooltipItem, registerables } from 'chart.js';

const barChart = ref<HTMLCanvasElement | null>(null);
const chartInstance = shallowRef<Chart | null>(null);
Chart.defaults.font.size = 16;
Chart.defaults.font.family = "'Lato', 'Helvetica', 'Arial', sans-serif";

// Abbreviations for small screens
const raceAbbreviations: Record<string, string> = {
  'Black/African American': 'BL',
  'Latino/a/x': 'LAT',
  'Other/Multiple Races': 'OTH',
  'Unknown/Missing/Decline': 'UNK',
  White: 'WHI'
};

const props = defineProps({
  data: {
    type: Array<DisplayRow>,
    required: true
  },
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
  },
  smallScreen: {
    type: Boolean,
    required: true
  }
});

const explanatoryText = computed(() => {
  return isRate(props.measureInfo) ? 'Shown as a number of people per 1000, counted over one year': 'Shown as a percent of people';
});

const title = computed(() => {
  return (
    props.data[0].measure +
    (props.allCategorySelected ? '' : ' by ' + props.data[0].stratification_category)
  );
});

const subtitle = computed(() => {
  const measuresColumnName =
    'chart_' + props.category.toLowerCase().replace(/[\s]+/g, '_');
  const chartText = props.measureInfo[measuresColumnName as keyof MeasureRow];
  return chartText;
});

const useRaceAbbreviations = computed(() => {
  return props.smallScreen && props.category === 'Race and Ethnicity';
});

const categoryLabels = computed(() => {
  if (useRaceAbbreviations.value) {
    return props.data.map(row => raceAbbreviations[row.stratification]);
  }
  return props.data.map(row => row.stratification);
});

Chart.register(...registerables);

const getChartData = () => {
  // Reformats the filtered data into the shape needed by chartjs
  const labels = categoryLabels.value;
  const idd_data = props.data.map(row => Number(row.idd_estimate_numeric));
  const non_idd_data = props.data.map(row => Number(row.non_idd_estimate_numeric));
  return {
    labels: labels,
    datasets: [
      {
        label: 'IDD',
        data: idd_data,
        backgroundColor: '#E57A77' // Red/Orange for IDD
      },
      {
        label: 'Non-IDD',
        data: non_idd_data,
        backgroundColor: '#7CA1CC' // Blue for Non-IDD
      }
    ]
  };
};

const getChartOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label(tooltipItem: TooltipItem<'bar'>) {
            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
          }
        }
      },
      title: {
        display: true,
        text: title.value
      },
      subtitle: {
        display: subtitle.value !== null,
        text: subtitle.value,
        font: {
          size: 14
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: isRate(props.measureInfo) ? 'Mean' : 'Percent'
        },
        afterBuildTicks(axis: Scale) {
          axis.ticks = [axis.ticks[0], axis.ticks[axis.ticks.length - 1]];
          return axis;
        },
        grid: {
          display: false
        }
      },
      y: {
        stacked: false,
        grid: {
          display: false
        }
      }
    }
  };
};

const createChart = async () => {
  const context = barChart?.value?.getContext('2d');
  if (context) {
    chartInstance.value = new Chart(context, {
      type: 'bar',
      data: getChartData(),
      options: getChartOptions()
    });
  }
};

const updateChart = () => {
  if (chartInstance.value) {
    chartInstance.value.data = getChartData();
    chartInstance.value.options = getChartOptions();
    chartInstance.value.update();
  }
};

watch(
  () => props.data,
  newData => {
    if (newData.length > 0) {
      if (!chartInstance.value) {
        createChart();
      } else {
        updateChart();
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div id="chart-wrapper">
      <canvas ref="barChart"></canvas>
    </div>
    <div>
      <em>{{ explanatoryText }}</em>
    </div>
    <div v-if="useRaceAbbreviations" class="text-secondary mt-3">
      <h5>Race and Ethnicity Abbreviations</h5>
      <ul>
        <li v-for="(abbreviation, fullText) in raceAbbreviations" :key="fullText">
          {{ abbreviation }} = "{{ fullText }}"
        </li>
      </ul>
    </div>
  </div>
</template>
