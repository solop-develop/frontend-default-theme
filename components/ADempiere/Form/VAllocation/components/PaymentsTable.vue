<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <el-table
    id="listPaymentsTable"
    ref="listPaymentsTable"
    :data="listPayments"
    border
    :max-height="panelInvoce"
    @select="selectionsPayments"
    @select-all="selectionsPaymentsAll"
  >
    <el-table-column
      type="selection"
      fixed
      width="40"
    />
    <el-table-column
      v-for="(header, key) in headersPayments"
      :key="key"
      prop="id"
      :align="header.align"
      min-width="210"
      :label="header.label"
    >
      <template slot-scope="scope">
        <span v-if="(header.columnName === 'organization' || header.columnName === 'transaction_type')">
          {{ scope.row[header.columnName].name }}
        </span>
        <span v-else-if="isCellInput(header)">
          <el-input-number
            v-model="scope.row[header.columnName]"
            controls-position="right"
          />
        </span>
        <span v-else>
          <p
            v-if="scope.row[header.columnName].length < 13 || (typeof scope.row[header.columnName] === 'number')"
            style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 12px;"
          >
            {{ scope.row[header.columnName] }}
          </p>
          <p
            v-else
            style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 12px;"
          >
            <el-popover
              placement="top-start"
              trigger="hover"
              width="300"
            >
              {{ scope.row[header.columnName] }}
              <p
                slot="reference"
                type="text"
                style="color: #606266;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 12px;"
              >
                {{ scope.row[header.columnName] }}
              </p>
            </el-popover>
          </p>
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

import store from '@/store'
// import router from '@/router'

// Components and Mixins
import headersPayments from './headersPayments.js'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'InvocesTable',

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  setup(props, { root }) {
    /**
     * Refs
     */
    const listPaymentsTable = ref(null)
    const panelInvoce = ref(250)
    /**
     * computed
     */

    const listPayments = computed(() => {
      return store.getters.getListVAllocation.payments
    })

    const selectListAll = computed(() => {
      return store.getters.getListSelectInvoceandPayment
    })

    /**
     * Methods
     */

    function isCellInput(cell) {
      const { columnName } = cell
      let isInput = false
      switch (columnName) {
        case 'writeOff':
          isInput = true
          break
        case 'applied':
          isInput = true
          break
      }
      return isInput
    }

    function selectionsPayments(selection, row) {
      const { isSelect } = row
      if (isSelect) {
        row.applied = 0
        row.isSelect = !isSelect
        removeRowSelect(row)
        return
      }
      row.isSelect = !isSelect
      row.applied = applied(row)
      addRowSelect(row)
    }

    function selectionsPaymentsAll(selection) {
      console.log({ selection })
    }

    function setToggleSelection() {
      const isSelectPayments = listPayments.value.filter(list => list.isSelect)
      setTimeout(() => {
        if (!isEmptyValue(listPayments.value) && !isEmptyValue(isSelectPayments)) {
          toggleSelection(isSelectPayments)
        }
      }, 500)
    }

    function toggleSelection(list) {
      if (list) {
        list.forEach(row => {
          listPaymentsTable.value.toggleRowSelection(row)
        })
      } else {
        listPaymentsTable.value.clearSelection()
      }
    }

    function addRowSelect(row) {
      const list = isEmptyValue(selectListAll.value) ? [] : selectListAll.value
      console.log({ list, row })
      const listAll = list.push(row)
      console.log({ list, listAll, row })
      store.commit('setListSelectInvoceandPayment', list)
    }

    function removeRowSelect(row) {
      console.log(selectListAll.value)
      const index = selectListAll.value.findIndex(list => list.id === row.id)
      const list = selectListAll.value
      const listRemove = list.splice(index, 1)
      console.log({ listRemove })
    }

    function applied(row) {
      if (isEmptyValue(selectListAll.value)) return row.open_amount
      let applied
      // let amount = 0, applied = 0
      selectListAll.value.forEach(element => {
        console.log({ element })
        if (element.type === row.type) {
          if (element.transaction_type.value !== row.transaction_type.value) {
            if (element.applied <= row.open_amount) {
              applied = row.open_amount
            } else {
              applied = element.applied
            }
          }
        }
      })
      return applied
    }

    setToggleSelection()

    return {
      // Import
      headersPayments,
      // Refs
      panelInvoce,
      listPaymentsTable,
      // Computed
      listPayments,
      selectListAll,
      // Methods
      isCellInput,
      selectionsPayments,
      selectionsPaymentsAll
    }
  }
})
</script>

<style lang="scss">
.from-wf-panel {
  padding-top: 10px;
  padding-left: 20px;
  padding-right: 20px;
}
.el-input-number {
  .el-input--medium .el-input__inner {
  text-align: end;
  }
}
.panel-top-search-criteria {
  display: flex;
  .el-card__body {
  display: contents;
  padding-top: 0px !important;
  padding-right: 0px !important;
  padding-bottom: 2px !important;
  padding-left: 0px !important;
  height: 100%!important;
  }
}
.el-table .cell {
  word-break: break-all;
  padding-left: 10px;
  padding-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 12px;
}
</style>
<style>
.el-table--scrollable-x .el-table__body-wrapper {
height: 90%;
overflow-x: auto;
}
/* .el-card__header {
padding-top: 5px;
padding-bottom: 0px;
} */
</style>
