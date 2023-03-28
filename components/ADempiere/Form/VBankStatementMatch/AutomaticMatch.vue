<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->
<template>
  <div style="height: 100% !important;">
    <el-card id="panel-top-search-criteria" class="panel-top-search-criteria" style="height: 100% !important;">
      <el-table
        :data="tableData"
        :border="true"
      >
        <el-table-column
          :label="title"
          :align="'center'"
        >
          <el-table-column
            type="selection"
            width="55"
          />
          <el-table-column
            v-for="(fieldAttributes, key) in headerTable"
            :key="key"
            :column-key="fieldAttributes.columnName"
            :prop="fieldAttributes.columnName"
            :label="fieldAttributes.label"
            :min-width="fieldAttributes.width"
            :align="fieldAttributes.align"
          />
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
  name: 'AutomaticMatch',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  setup(props, { root }) {
    /**
    * Refs
    */

    const tableData = ref([])
    const headerTable = ref([
      {
        label: 'Transaction Date',
        columnName: 'transactionDate',
        align: 'left',
        width: '150'
      },
      {
        label: 'Receipt',
        columnName: 'receipt',
        align: 'left',
        width: '100'
      },
      {
        label: 'Document No',
        columnName: 'documentNo',
        align: 'left',
        width: '150'
      },
      {
        label: 'Business Partner',
        columnName: 'businessPartner',
        align: 'left',
        width: '180'
      },
      {
        label: 'Tender type',
        columnName: 'tenderType',
        align: 'left',
        width: '150'
      },
      {
        label: 'Currency',
        columnName: 'currency',
        align: 'left',
        width: '100'
      },
      {
        label: 'Amount',
        columnName: 'amount',
        align: 'right',
        width: '120'
      },
      {
        label: 'Description',
        columnName: 'TransactionDate',
        align: 'left',
        width: '120'
      },
      {
        label: 'Reference No',
        columnName: 'referenceNo',
        align: 'left',
        width: '150'
      },
      {
        label: 'Memo',
        columnName: 'memo',
        align: 'left',
        width: '100'
      }
    ])

    return {
      tableData,
      headerTable
    }
  }
})
</script>

<style lang="scss">
.form-item-criteria {
  margin-top: 0px;
  margin-left: 0px;
  margin-bottom: 0px;
  margin-right: 0px;
  padding-bottom: 0px;
  .el-form-item__label {
    padding-bottom: 0px;
  }
  .el-form-item--medium .el-form-item__label {
    padding-bottom: 0px;
  }
  .el-form--inline .el-form-item {
    margin: 0px;
  }
}
.el-table {
  height: 100% !important;
  .el-table--border {
    border-right: none;
    border-bottom: none;
    height: 100% !important;
  }
  .el-table--scrollable-x .el-table__body-wrapper {
    height: 100% !important;
  }
  .el-table__body-wrapper {
    height: 85% !important;
  }
}
</style>
