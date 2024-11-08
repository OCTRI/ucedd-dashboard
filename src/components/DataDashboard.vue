<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import DataTable, { Api } from 'datatables.net-bs5';
import Papa from 'papaparse';

interface DataRow {
  measure: string;
  denominator_definition: string;
  stratification: string;
  total_n: string | number;
  idd_estimate_numeric: string | number;
  idd_error: string | number;
  non_idd_estimate_numeric: string | number;
  non_idd_error: string | number;
  difference_in_estimates: string | number;
  p_value: string | number;
  outcome_count: string | number;
  p_significant: string | number;
  outcome_directionality: string | number;
  idd_estimate_string: string;
  non_idd_estimate_string: string;
  stratification_category: string;
}

interface DisplayRow extends DataRow {
  stratification_display: string;
}

const csvData = ref<Array<DisplayRow>>([]);
const selectedMeasure = ref<string>("");
const selectedCategory = ref<string>("");
const table = useTemplateRef('table');
let dataTable: Api;

const filteredData = computed(() => {
  return csvData.value.filter(
    (row) =>
      row.measure === selectedMeasure.value &&
      row.stratification_category === selectedCategory.value
  );
});

const measures = computed(() => {
  const measureSet = new Set<string>();
  csvData.value.filter((row) => {
    if (row.measure) {
      measureSet.add(row.measure);
    }
  });
  return Array.from(measureSet);
});

const categories = computed(() => {
  const categorySet = new Set<string>();
  csvData.value.forEach((row) => {
    if (row.stratification_category) {
      categorySet.add(row.stratification_category);
    }
  });
  return Array.from(categorySet);
});

const fetchCSVData = () => {
  const location = window.location.href;
  const prefix = location.endsWith("/") ? location.slice(0, location.length - 1) : location;
  fetch(prefix + "/data.csv")
    .then((response) => response.text())
    .then((csvText) => {
      Papa.parse<DataRow>(csvText, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          initialize(results);
        },
      });
    })
    .catch((error) => {
      console.error("Error fetching the CSV file:", error);
    });
};

const initialize = (results: Papa.ParseResult<DataRow>) => {
  // Add an asterisk to significant results
  csvData.value = results.data.map(
    obj => ({ ...obj,
      stratification_display: `${obj.stratification} ${(1 === obj.p_significant) ? '*' : ''}`,
    }))
  selectedMeasure.value = measures.value[0];
  selectedCategory.value = categories.value[0];

  generateTable();
};

const generateTable = () => {
  // convinces TypeScript that the table ref can be used as an argument to the DataTable constructor
  if (table.value === null) {
    throw new Error('Table ref must not be null');
  }

  if (DataTable.isDataTable(dataTable)) {
    dataTable.destroy();
  }

  dataTable = new DataTable(table.value, {
    paging: false,
    data: filteredData.value,
    columns: [
      {
        data: 'stratification_display',
        title: 'Stratification',
      },
      {
        data: 'total_n',
        title: 'Count'
      },
      {
        data: 'non_idd_estimate_string',
        title: 'Non-IDD Estimate'
      },
      {
        data: 'idd_estimate_string',
        title: 'IDD Estimate'
      },
      {
        data: 'difference_in_estimates',
        title: 'Difference'
      }
    ],
    layout: {
      topStart: 'info',
      bottomStart: null
    },
    rowCallback: function (row, data) {
      if (!(row instanceof HTMLElement) || !('p_significant' in data) || !('outcome_directionality' in data)) {
        return;
      }

      if (1 === data.p_significant) {
        if (0 === data.outcome_directionality) {
          row.classList.add('significant-idd-row');
        } else if (1 === data.outcome_directionality) {
          row.classList.add('significant-nonidd-row');
        }
      }
    },
  });
};

const updateTable = () => {
  dataTable.clear();
  filteredData.value.forEach((row) => {
    dataTable.row.add(row);
  });
  dataTable.draw();
};

onMounted(() => {
  fetchCSVData();
});
</script>

<template>
  <div>
        <div class="row g-3">
            <div class="col-md-6">
                <label for="measure" class="form-label required-field">Choose a Measure</label>
                <select v-model="selectedMeasure"
                    class="form-select"
                    id="measure"
                    @change="updateTable"
                    required
                >
                    <option v-for="measure in measures" :key="measure" :value="measure">
                    {{ measure }}
                    </option>
                </select>
            </div>
            <div class="col-md-6">
                <label for="category" class="form-label required-field">Choose a Category</label>
                <select v-model="selectedCategory"
                    class="form-select"
                    id="category"
                    @change="updateTable"
                    required
                >
                    <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                    </option>
                </select>
            </div>
        </div>
        <div id="tableContainer">
            <table class="table rounded-corners" ref="table">
            </table>
        </div>
  </div>
</template>