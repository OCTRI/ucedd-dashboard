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
        <div class="form-group">
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
        <div id="tableContainer" class="mt-4">
            <table class="table table-bordered" ref="table">
            </table>
        </div>
	</div>
    `,
  setup() {
    const csvData = ref([]);
    const selectedMeasure = ref("");
    const selectedCategory = ref("");
    const headers = ref([]);
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
      fetch("http://localhost:8000/data.csv")
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
      csvData.value = results.data;
      headers.value = Object.keys(csvData.value[0]);
      selectedMeasure.value = measures.value[0];
      selectedCategory.value = categories.value[0];

      generateTable();
    };

    const generateTable = () => {
      if (DataTable.isDataTable(table.value)) {
        table.destroy();
      }
      dataTable = new DataTable(table.value, {
        data: filteredData.value,
        columns: headers.value.map((header) => ({
          data: header,
          title: header,
        })),
        rowCallback: function (row, data) {
          if (data.p_value_numeric < 0.05) {
            $(row).addClass("significant");
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
      headers,
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
