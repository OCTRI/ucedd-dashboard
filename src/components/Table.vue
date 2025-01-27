<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue';
import DataTable, { Api } from 'datatables.net-bs5';
import DisplayRow from '@/types/DisplayRow';

const table = useTemplateRef('table');
let dataTable: Api;

const props = defineProps({
  data: {
    type: Array<DisplayRow>,
    required: true
  }
});

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
    searching: false,
    info: false,
    data: props.data,
    columns: [
      {
        data: 'index',
        visible: false
      },
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
    order: [[0, 'asc']],
    layout: {
      topStart: 'info',
      bottomStart: null
    },
    rowCallback: function (row, data) {
      // Convinces typescript that the operations to follow are valid 
      if (!(row instanceof HTMLElement) || !('p_significant' in data) || !('outcome_directionality' in data)
          || !('stratification' in data)) {
        return;
      }

      // Add style to rows where statistical significance is detected
      if (1 === data.p_significant) {
        if (0 === data.outcome_directionality) {
          row.classList.add('significant-idd-row');
        } else if (1 === data.outcome_directionality) {
          row.classList.add('significant-nonidd-row');
        }
      }
      
      // Add style to the "All" row (which aggregates counts at the bottom of table)
      if ('All' === data.stratification) {
        row.classList.add('all-stratification-row')
      }
    },
  });
};

const updateTable = () => {
  dataTable.clear();
  props.data.forEach((row) => {
    dataTable.row.add(row);
  });
  dataTable.draw();
};

onMounted(() => {
  generateTable();
});

watch(
  () => props.data,
  (() => {
    updateTable();
  })
);
</script>

<template>
  <div>
    <p>Differences that are statistically significant are denoted with an asterisk (*). Rows that are colored <span
        class="significant-idd-block-text">orange</span> indicate poorer outcomes for the IDD community. Rows that are
      colored <span class="significant-nonidd-block-text">blue</span> indicate poorer outcomes for the non-IDD
      community.
    </p>
    <div id="tableContainer">
      <table class="table rounded-corners" ref="table">
      </table>
    </div>
  </div>
</template>