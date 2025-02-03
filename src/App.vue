<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import BarChart from '@/components/BarChart.vue';
import Description from '@/components/Description.vue';
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
const allCategory = "All";
const { width } = useWindowSize()

const measures = computed(() => {
  const measureSet = new Set<string>(csvData.value.map((row) => row.measure));
  return Array.from(measureSet).sort();
});

const categories = computed(() => {
  const categorySet = new Set<string>(csvData.value.map((row) => row.stratification_category));
  const categoryArray = Array.from(categorySet)
    .filter(category => category)
    .sort((a,b) => {
      if (a === allCategory) return -1;
      if (b === allCategory) return 1;
      return a < b ? -1 : 1; 
    });
  return categoryArray;
});

const filteredData = computed(() => {
  const categoryData = csvData.value.filter(
    (row) =>
      row.measure === selectedMeasure.value &&
      row.stratification_category === selectedCategory.value
  );
  categoryData.forEach((row, i) => {
    row.index = i;
  });
  return categoryData;
});

const allCategorySelected = computed(() => {
  return selectedCategory.value === allCategory;
});

const smallScreen = computed(() => {
  // Derived through testing. Since this displays within an iFrame that may wrap on smaller screens, 
  // using traditional breaks can yield unexpected results.
  return width.value < 600;
});

const selectedMeasureRow = computed(() => {
  const row = measureRows.value.filter((row) => row.measure === selectedMeasure.value);
  if (!row.length) {
    return {
      measure: selectedMeasure.value,
      definition: "",
      chart_all: "",
      chart_age: "",
      chart_race_and_ethnicity: "",
      chart_residency: "",
      chart_sex: "",
      description_all: "",
      description_age: "",
      description_race_and_ethnicity: "",
      description_residency: "",
      description_sex: "",
      key_terms_all: "",
      key_terms_age: "",
      key_terms_race_and_ethnicity: "",
      key_terms_residency: "",
      key_terms_sex: "",
    }
  }
  return row[0];
});

const pathPrefix = () => {
  const location = window.location.href;
  return location.endsWith("/") ? location.slice(0, location.length - 1) : location;
}

const fetchCSVData = async () => {
  const response = await fetch(pathPrefix() + "/data.csv");
  return await response.text();
};

const fetchMeasureDescription = async () => {
  let response;
  // For development, the study team will edit this Google document
  if (apiKey) {
    response = await fetch("https://docs.google.com/spreadsheets/d/1_jFImMo4fZd8vQ7x4wAyLzxnnkn95F-vSXCV-yLzbi4/export?gid=0&format=csv&id=1_jFImMo4fZd8vQ7x4wAyLzxnnkn95F-vSXCV-yLzbi4&key=" + apiKey);
  } else {
    response = await fetch(pathPrefix() + "/measures.csv");
  }
  return await response.text();
};

const fetchData = async () => {
  try {
    const [data, description] = await Promise.all([fetchCSVData(), fetchMeasureDescription()]);
    Papa.parse<DataRow>(data, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        initialize(results);
      },
    });

    Papa.parse<MeasureRow>(description, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        measureRows.value = results.data;
      },
    });
  } catch (error) {
    console.error("Error fetching one of the CSV files:", error);
  }
}

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
  fetchData();
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
  <ul class="nav nav-tabs" id="dashboardTab" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="chart-tab" data-bs-toggle="tab" data-bs-target="#chart-tab-pane" type="button" role="tab" aria-controls="chart-tab-pane" aria-selected="true">Chart</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="description-tab" data-bs-toggle="tab" data-bs-target="#description-tab-pane" type="button" role="tab" aria-controls="description-tab-pane" aria-selected="false">Description</button>
    </li>
    <li class="nav-item" role="presentation" v-if="!smallScreen">
      <button class="nav-link" id="data-tab" data-bs-toggle="tab" data-bs-target="#data-tab-pane" type="button" role="tab" aria-controls="data-tab-pane" aria-selected="false">Data</button>
    </li>
  </ul>
  <div class="tab-content" id="dashboardTabContent">
    <div class="tab-pane fade show active" id="chart-tab-pane" role="tabpanel" aria-labelledby="chart-tab">
      <BarChart :data=filteredData :category=selectedCategory :allCategorySelected=allCategorySelected :measureInfo={...selectedMeasureRow} :smallScreen=smallScreen />
    </div>
    <div class="tab-pane fade" id="description-tab-pane" role="tabpanel" aria-labelledby="description-tab">
      <Description :category=selectedCategory :allCategorySelected=allCategorySelected :measureInfo={...selectedMeasureRow} />
    </div>
    <div class="tab-pane fade" id="data-tab-pane" role="tabpanel" aria-labelledby="data-tab" v-if="!smallScreen">
      <Table :data=filteredData />
    </div>
  </div>
</template>
