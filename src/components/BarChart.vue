<script setup lang="ts">
import { computed, shallowRef, ref, watch } from 'vue';
import DisplayRow from '@/types/DisplayRow';
import {
    Chart, TooltipItem, registerables
} from 'chart.js';

const barChart = ref<HTMLCanvasElement | null>(null);
const chartInstance = shallowRef<Chart | null>(null);
Chart.defaults.font.size = 16;
Chart.defaults.font.family = "'Lato', 'Helvetica', 'Arial', sans-serif";

const props = defineProps({
    data: {
        type: Array<DisplayRow>,
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
    return props.data.some((row) => 1 === row.p_significant) ? "Significant differences are denoted with an asterisk (*) and highlighted" : "Differences between IDD and non-IDD populations is not statistically significant.";
});

// Adds background when stratification_category is significant
const dynamicHighlightPlugin = {
    id: 'dynamicHighlight',
    beforeDatasetsDraw: (chart: Chart) => {
        const { ctx, chartArea, scales } = chart;
        const { top, bottom } = chartArea;
        const xAxis = scales.x;
        const groups = props.data.filter((row) => 1 === row.p_significant).map((row) => row.stratification_display);
        ctx.save();
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';

        const labels = chart?.data?.labels;
        if (labels) {
            groups.forEach((groupLabel) => {
                const groupIndex = labels.indexOf(groupLabel);
                const groupWidth = (xAxis.getPixelForTick(1) - xAxis.getPixelForTick(0));
                if (groupIndex !== -1) {
                    const barStart = xAxis.getPixelForTick(groupIndex) - groupWidth / 2;
                    ctx.fillRect(barStart, top, groupWidth, bottom - top);
                }
            });
        }

        ctx.restore();
    },
};
Chart.register(...registerables, dynamicHighlightPlugin);

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
                display: true,
                text: subtitle.value,
                font: {
                    size: 14
                }
            },
        },
        scales: {
            x: {
                stacked: false,
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: isRate.value ? "Mean (per 1000 member years)" : "Percent",
                },
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