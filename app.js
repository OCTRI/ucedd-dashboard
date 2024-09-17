const { ref, computed, reactive, onMounted, createApp } = Vue;

const DataDashboard = {
  template: `
	<div>
        <div class="form-group">
            <label for="measure" class="form-label required-field">Choose a Measure</label>
            <select v-model="selectedMeasure"
                class="form-select"
                id="measure"
                name="measure"
                @change="updateTable"
                required
            >
                <option v-for="measure in measures" :key="measure" :value="measure">
                {{ measure }}
                </option>
            </select>
        </div>
        <div class="form-group mt-4">
            <label for="category" class="form-label required-field">Choose a Category</label>
            <select v-model="selectedCategory"
                class="form-select"
                id="category"
                name="category"
                @change="updateTable"
                required
            >
                <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
                </option>
            </select>
        </div>
        <div id="tableContainer">
            <table class="table rounded-corners" ref="table">
            </table>
        </div>
	</div>
    `,
  setup() {
    const csvData = ref([]);
    const selectedMeasure = ref("");
    const selectedCategory = ref("");
    const table = ref(null);
    let dataTable;

    const filteredData = computed(() => {
      return csvData.value.filter(
        (row) =>
          row.measure === selectedMeasure.value &&
          row.stratification_category === selectedCategory.value
      );
    });

    const measures = computed(() => {
      const measureSet = new Set();
      csvData.value.filter((row) => {
        if (row.measure) {
          measureSet.add(row.measure);
        }
      });
      return Array.from(measureSet);
    });

    const categories = computed(() => {
      const categorySet = new Set();
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
          Papa.parse(csvText, {
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

    const initialize = (results) => {
      // Add an asterisk to significant results
      csvData.value = results.data.map(
        obj => ({ ...obj,
          stratification_display: `${obj.stratification} ${(1 === obj.p_significant) ? '*':''}`,
        }))
      selectedMeasure.value = measures.value[0];
      selectedCategory.value = categories.value[0];

      generateTable();
    };

    const generateTable = () => {
      if (DataTable.isDataTable(table.value)) {
        table.destroy();
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
        rowCallback: function (row, data) {
          if (1 === data.p_significant) {
            if (0 === data.outcome_directionality) {
              $(row).addClass("significant-idd-row");
            } else if (1 === data.outcome_directionality) {
              $(row).addClass("significant-nonidd-row");
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

    return {
      filteredData,
      measures,
      selectedMeasure,
      categories,
      selectedCategory,
      table,
      updateTable,
    };
  },
};

createApp({
  components: {
    "data-dashboard": DataDashboard,
  },
}).mount("#app");
