<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com www.erpya.com
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
  <div :onLoad="adjustSize()" :onresize="setTableHeight()">
    <el-row v-if="isShowSearch">
      <el-col :span="23">
        <el-input
          v-model="valueToSearch"
          clearable
          size="mini"
          class="input-search"
          @input="handleChangeSearch"
        >
          <i
            slot="prefix"
            class="el-icon-search el-input__icon"
          />
        </el-input>
      </el-col>
      <el-col :span="1">
        <columns-display-option
          :option="currentOption"
          :container-manager="containerManager"
          :parent-uuid="parentUuid"
          :container-uuid="containerUuid"
        />
      </el-col>
    </el-row>
    <el-table
      ref="multipleTable"
      v-loading="isLoadingDataTable"
      border
      :height="heightTable"
      :row-key="keyColumn"
      reserve-selection
      highlight-current-row
      :data="recordsWithFilter"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      :row-class-name="tableRowClassName"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      @select="handleSelection"
      @select-all="handleSelectionAll"
    >
      <!-- column with the checkbox -->
      <el-table-column
        v-if="isTableSelection"
        type="selection"
        :prop="keyColumn"
        fixed
        min-width="50"
      />

      <template v-for="(fieldAttributes, key) in headerList">
        <el-table-column
          :key="key"
          :label="headerLabel(fieldAttributes)"
          :column-key="fieldAttributes.columnName"
          :prop="fieldAttributes.columnName"
          sortable
          min-width="210"
          :fixed="fieldAttributes.isFixedTableColumn"
        >
          <template slot-scope="scope">
            <!-- formatted displayed value -->
            <cell-info
              :container-uuid="containerUuid"
              :field-attributes="fieldAttributes"
              :container-manager="containerManager"
              :scope="scope"
              :data-row="scope.row"
            />
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- pagination table, set custom or use default change page method -->
    <custom-pagination
      :total="recordsLength"
      :current-page="currentPage"
      :selection="selectionsLength"
      :handle-change-page="handleChangePage"
    />
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from '@vue/composition-api'

import store from '@/store'
import router from '@/router'

// components and mixins
import CellInfo from './CellInfo.vue'
import ColumnsDisplayOption from './ColumnsDisplayOption'
import CustomPagination from './CustomPagination.vue'

// utils and helper methods
import { isEmptyValue, tableColumnDataType } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'DefaultTable',

  components: {
    CellInfo,
    ColumnsDisplayOption,
    CustomPagination
  },

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    panelMetadata: {
      type: Object,
      required: true
    },
    isLoadingDataTable: {
      type: Boolean,
      default: false
    },
    // get the table header
    header: {
      type: Array,
      required: true,
      default: () => []
    },
    dataTable: {
      type: Array,
      default: () => []
    },
    // Show check column from selection row
    isTableSelection: {
      type: Boolean,
      default: true
    },
    isShowSearch: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { root, refs }) {
    const valueToSearch = ref('')
    const heightTable = ref()
    const isLoadingDataTale = computed(() => {
      if (props.containerManager && props.containerManager.isLoadedRecords) {
        return !props.containerManager.isLoadedRecords({
          containerUuid: props.containerUuid
        })
      }
      return !isEmptyValue(props.dataTable)
    })

    const currentOption = computed(() => {
      return store.getters.getTableOption
    })

    const keyColumn = computed(() => {
      if (props.panelMetadata) {
        return props.panelMetadata.keyColumn
      }
      return undefined
    })

    const headerList = computed(() => {
      return props.header.filter(fieldItem => {
        return isDisplayed(fieldItem) &&
          // fieldItem.isShowedTableFromUser &&
          tableColumnDataType(fieldItem, currentOption.value)
      })
    })

    const sizeOption = computed(() => {
      if (props.isShowSearch) {
        return 1
      }
      return 24
    })

    const styleOption = computed(() => {
      if (props.isShowSearch) {
        return ''
      }
      return 'text-align: end; padding-right: 5px;'
    })

    const selectionsLength = computed(() => {
      return props.containerManager.getSelection({
        containerUuid: props.containerUuid
      }).length
    })

    const currentPage = computed(() => {
      if (props.containerManager.getRecordCount) {
        return parseInt(props.containerManager.getPageNumber({
          containerUuid: props.containerUuid
        }), 10)
      }
      return 1
    })

    const recordsLength = computed(() => {
      if (props.containerManager.getRecordCount) {
        return props.containerManager.getRecordCount({
          containerUuid: props.containerUuid
        })
      }
      return recordsWithFilter.value.length
    })

    /**
     * Select record row
     * @param {object} row
     * @param {string} column
     */
    function handleRowClick(row, column, event) {
      if (row.isSelectedRow) {
        // enable edit mode
        row.isEditRow = true
      }

      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        row
      })
    }

    /**
     * To confirm edit record row
     * @param {object} row
     * @param {string} column
     */
    function handleRowDblClick(row, column, event) {
      // disable edit mode
      row.isEditRow = false
      if (!row.isSelectedRow) {
        return
      }

      props.containerManager.confirmRowChanges({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        row
      })
    }

    function headerLabel(field) {
      if (field.isMandatory || field.isMandatoryFromLogic) {
        return '* ' + field.name
      }

      return field.name
    }

    /**
     * Verify is displayed column/field in table
     */
    function isDisplayed(field) {
      // validate with container manager
      return props.containerManager.isDisplayedColumn(field)
    }

    /**
     * custom method to handle change page
     */
    function handleChangePage(pageNumber) {
      props.containerManager.setPage({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        pageNumber
      })
      const isParentTab = store.getters.getStoredTab(props.parentUuid, props.containerUuid).isParentTab
      router.push({
        name: root.$route.name,
        query: {
          ...root.$route.query,
          page: isParentTab ? pageNumber : root.$route.query.page,
          pageChild: !isParentTab ? pageNumber : root.$route.query.pageChild
        }
      }, () => {})
    }

    const timeOut = ref(() => {})

    function handleChangeSearch(value) {
      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        // get records
        filterRecord(value)
      }, 1000)
    }

    // get table data
    const recordsWithFilter = computed(() => {
      if (props.containerManager && props.containerManager.getRecordsList) {
        return props.containerManager.getRecordsList({
          containerUuid: props.containerUuid
        })
      }
      return props.dataTable
    })

    const isLoadFilter = ref(false)

    function filterRecord(searchText) {
      isLoadFilter.value = true

      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        searchValue: searchText
      })
        .finally(() => {
          clearTimeout(timeOut.value)
          isLoadFilter.value = false
        })
    }

    function handleSelection(selections, rowSelected) {
      rowSelected.isSelectedRow = !rowSelected.isSelectedRow
      rowSelected.isEditRow = rowSelected.isSelectedRow // edit record if is selected

      props.containerManager.setSelection({
        containerUuid: props.containerUuid,
        recordsSelected: selections
      })
    }

    function handleSelectionAll(selections) {
      props.containerManager.setSelection({
        containerUuid: props.containerUuid,
        recordsSelected: selections
      })
    }

    /**
     * Select or unselect rows
     * USE ONLY MOUNTED
     */
    function toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        refs.multipleTable.clearSelection()
      }
    }
    function tableRowClassName(params) {
      if (params.row.UUID === root.$route.query.action) {
        return 'success-row'
      }
      return ''
    }

    function adjustSize() {
      const panelMain = document.getElementById('mainWindow')

      if (!isEmptyValue(panelMain) && !isEmptyValue(panelMain.clientHeight)) {
        const size = parseInt(panelMain.clientHeight) / 2
        if (recordsWithFilter.value.length < 5) {
          heightTable.value = 'auto'
          return
        }
        heightTable.value = size
      }
    }
    window.addEventListener('resize', setTableHeight)
    function setTableHeight() {
      adjustSize()
    }

    onMounted(() => {
      // adjustSize()
      // setTableHeight()
      if (props.isTableSelection) {
        const selectionsList = props.containerManager.getSelection({
          containerUuid: props.containerUuid
        })

        toggleSelection(selectionsList)
      }
    })

    return {
      // data
      valueToSearch,
      isLoadFilter,
      heightTable,
      // computeds
      headerList,
      isLoadingDataTale,
      sizeOption,
      styleOption,
      recordsWithFilter,
      currentOption,
      keyColumn,
      recordsLength,
      currentPage,
      selectionsLength,
      // methods
      filterRecord,
      setTableHeight,
      adjustSize,
      tableRowClassName,
      handleChangeSearch,
      headerLabel,
      handleChangePage,
      handleRowClick,
      handleRowDblClick,
      handleSelection,
      handleSelectionAll,
      isDisplayed
    }
  }
})
</script>

<style lang="scss">
 div#mainWindow{
    width: 100%;
}
</style>
