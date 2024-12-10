<script setup lang="ts">
import { computed, shallowRef, PropType, ref, watch } from 'vue';
import DisplayRow from '@/types/DisplayRow';
import MeasureRow from '@/types/MeasureRow';
import {
    Chart, Scale, TooltipItem, registerables
} from 'chart.js';

const barChart = ref<HTMLCanvasElement | null>(null);
const chartInstance = shallowRef<Chart | null>(null);
Chart.defaults.font.size = 16;
Chart.defaults.font.family = "'Lato', 'Helvetica', 'Arial', sans-serif";

const props = defineProps({
    data: {
        type: Array<DisplayRow>,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    summary: {
        type: Object as PropType<MeasureRow>,
        required: true
    }
});

const isRate = computed(() => {
    return props.data.some((row) => 1 === row.outcome_count);
});

const title = computed(() => {
    return props.data[0].measure + ' by ' + props.data[0].stratification_category;
});

const subtitle = computed(() => {
    const measuresColumnName = "chart_" + props.category.toLowerCase().replace(/[\s]+/g, '_');
    const chartText = props.summary[measuresColumnName as keyof MeasureRow];
    return chartText;
});

Chart.register(...registerables);

const getChartData = () => {
    // Reformats the filtered data into the shape needed by chartjs
    const labels = props.data.map((row) => row.stratification_display);
    const idd_data = props.data.map((row) => Number(row.idd_estimate_numeric));
    const non_idd_data = props.data.map((row) => Number(row.non_idd_estimate_numeric));
    return {
        labels: labels,
        datasets: [
            {
                label: 'IDD',
                data: idd_data,
                backgroundColor: '#E57A77', // Red/Orange for IDD
            },
            {
                label: 'Non-IDD',
                data: non_idd_data,
                backgroundColor: '#7CA1CC', // Blue for Non-IDD
            },
        ]
    }
};

const getChartOptions = () => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as 'y', 
        plugins: {
            legend: {
                position: 'top' as 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem: TooltipItem<'bar'>) {
                        return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                    },
                },
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
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: isRate.value ? "Mean (per 1000 member years)" : "Percent",
                },
                afterBuildTicks: function(axis: Scale) {
                    axis.ticks = [axis.ticks[0], axis.ticks[axis.ticks.length-1]];
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
            },
        },
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

watch(() => props.data, (newData) => {
    if (newData.length > 0) {
        if (!chartInstance.value) {
            createChart();
        } else {
            updateChart();
        }
    }
}, { immediate: true });

</script>

<template>
    <div id="chart-wrapper">
        <canvas ref="barChart"></canvas>
    </div>
</template>