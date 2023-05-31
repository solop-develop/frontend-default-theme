<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div style="height: 100% !important;">
    <el-card id="panel-top-search-criteria" class="panel-top-search-criteria" style="height: 100% !important;">
      <el-table
        v-loading="matchingMovements.isLoading"
        :data="matchingMovements.list"
        empty-text="Sin Coincidencia Automática "
        :border="true"
        element-loading-text="Loading....."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.2)"
      >
        <p slot="empty" style="width: 100%;">
          <el-empty description="Sin Coincidencia Automática" />
        </p>
        <el-table-column
          label="Coincidencia Automática"
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
          >
            <template slot-scope="scope">
              <span v-if="fieldAttributes.columnName === 'is_receipt'">
                <i v-if="scope.row[fieldAttributes.columnName]" class="el-icon-check" style="font-size: 21px;color: green;font-weight: 600;" />
              </span>
              <span v-else>
                {{ displayDataColumn(scope.row, fieldAttributes.columnName) }}
              </span>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'

export default defineComponent({
  name: 'AutomaticMatch',

  props: {
    title: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { root }) {
    /**
    * Refs
    */
    const matchingMovements = computed(() => {
      return store.getters.getListMatchingMovements
    })
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

    function displayDataColumn(data, column) {
      let display
      switch (column) {
        case 'business_partner':
          display = data.business_partner.name
          break
        case 'tender_type':
          display = data.tender_type.name
          break
        case 'currency':
          display = data.currency.iso_code
          break
        default:
          display = data[column]
          break
      }
      return display
    }

    return {
      matchingMovements,
      headerTable,
      displayDataColumn
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
