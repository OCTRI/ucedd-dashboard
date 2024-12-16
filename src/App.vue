<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BarChart from '@/components/BarChart.vue';
import Summary from '@/components/Summary.vue';
import Table from '@/components/Table.vue';
import Papa from 'papaparse';
import Tab from 'bootstrap/js/dist/tab';
import DataRow from '@/types/DataRow';
import DisplayRow from '@/types/DisplayRow';
import MeasureRow from '@/types/MeasureRow';

const csvData = ref<Array<DisplayRow>>([]);
const selectedMeasure = ref<string>("");
const selectedCategory = ref<string>("");
const measureRows = ref<Array<MeasureRow>>([]);
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

const measures = computed(() => {
  const measureSet = new Set<string>(csvData.value.map((row) => row.measure));
  return Array.from(measureSet);
});

const categories = computed(() => {
  const categorySet = new Set<string>(csvData.value.map((row) => row.stratification_category));
  const categoryArray = Array.from(categorySet);
  return categoryArray.filter((category) => category && category !== "All");
});

const filteredData = computed(() => {
  const categoryData = csvData.value.filter(
    (row) =>
      row.measure === selectedMeasure.value &&
      row.stratification_category === selectedCategory.value
  );
  const allForMeasure = csvData.value.filter(
    (row) =>
      row.measure === selectedMeasure.value &&
      row.stratification_category === "All"
  );
  const all = categoryData.concat(allForMeasure);
  all.forEach((row, i) => {
    row.index = i;
  });
  return all;
});

const selectedMeasureRow = computed(() => {
  const row = measureRows.value.filter((row) => row.measure === selectedMeasure.value);
  if (!row.length) {
    return {
      measure: selectedMeasure.value,
      description: "",
      chart_age: "",
      chart_race_and_ethnicity: "",
      chart_residency: "",
      chart_sex: "",
      summary_age: "",
      summary_race_and_ethnicity: "",
      summary_residency: "",
      summary_sex: "",
    }
  }
  return row[0];
});

const pathPrefix = () => {
  const location = window.location.href;
  return location.endsWith("/") ? location.slice(0, location.length - 1) : location;
}

const fetchCSVData = async () => {
  try {
    const response = await fetch(pathPrefix() + "/data.csv");
    const csvText = await response.text();
    Papa.parse<DataRow>(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        initialize(results);
      },
    });
  } catch (error) {
    console.error("Error fetching the CSV file:", error);
  }

};

const fetchMeasureSummary = async () => {
  try {
    let response;
    // For development, the study team will edit this Google document
    if (apiKey !== undefined && apiKey !== null) {
      response = await fetch("https://docs.google.com/spreadsheets/d/1_jFImMo4fZd8vQ7x4wAyLzxnnkn95F-vSXCV-yLzbi4/export?gid=0&format=csv&id=1_jFImMo4fZd8vQ7x4wAyLzxnnkn95F-vSXCV-yLzbi4&key=" + apiKey);
    } else {
      response = await fetch(pathPrefix() + "/measures.csv");
    }
    const csvText = await response.text();
    Papa.parse<MeasureRow>(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        measureRows.value = results.data;
      },
    });
  } catch (error) {
    console.error("Error fetching the CSV file:", error);
  }
};

const initialize = (results: Papa.ParseResult<DataRow>) => {
  // Add an asterisk to significant results
  csvData.value = results.data.map(
    obj => ({
      ...obj,
      index: 0, // This will be set by filteredData
      stratification_display: `${obj.stratification} ${(1 === obj.p_significant) ? '*' : ''}`,
    }))
  selectedMeasure.value = measures.value[0];
  selectedCategory.value = categories.value[0];
};

onMounted(() => {
  const tabs = document.querySelectorAll('#pills-tab button');
  tabs.forEach(el => new Tab(el));
  fetchCSVData();
  fetchMeasureSummary();
});


</script>

<template>
  <div class="row g-3">
    <div class="col-md-6">
      <label for="measure" class="form-label">Choose a Measure</label>
      <select v-model="selectedMeasure" class="form-select" id="measure" required>
        <option v-for="measure in measures" :key="measure" :value="measure">
          {{ measure }}
        </option>
      </select>
    </div>
    <div class="col-md-6">
      <label for="category" class="form-label">Choose a Category</label>
      <select v-model="selectedCategory" class="form-select" id="category" required>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>
  </div>
  <ul class="nav nav-pills my-4" id="pills-tab" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="pills-chart-tab" data-bs-toggle="pill" data-bs-target="#pills-chart"
        type="button" role="tab" aria-controls="pills-chart" aria-selected="true">Chart</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="pills-summary-tab" data-bs-toggle="pill" data-bs-target="#pills-summary"
        type="button" role="tab" aria-controls="pills-summary" aria-selected="false">Summary</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="pills-data-tab" data-bs-toggle="pill" data-bs-target="#pills-data" type="button"
        role="tab" aria-controls="pills-data" aria-selected="false">Data</button>
    </li>
  </ul>
  <div class="tab-content" id="pills-tabContent">
    <div class="tab-pane fade show active" id="pills-chart" role="tabpanel" aria-labelledby="pills-chart-tab">
      <BarChart :data=filteredData :category=selectedCategory :summary=selectedMeasureRow />
    </div>
    <div class="tab-pane fade" id="pills-summary" role="tabpanel" aria-labelledby="pills-summary-tab">
      <Summary :category=selectedCategory :summary=selectedMeasureRow />
    </div>
    <div class="tab-pane fade" id="pills-data" role="tabpanel" aria-labelledby="pills-data-tab">
      <Table :data=filteredData />
    </div>
  </div>
</template>
