<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
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
  <div v-if="!isChangeOptions" id="mainWindowDataTable" class="multipleTableWindows" :onLoad="adjustSize()" :onresize="adjustSize()">
    <el-table
      id="multipleTable"
      ref="multipleTable"
      v-loading="!getIsLoadedTabRecord"
      border
      :height="sizeViewTable"
      :row-key="keyColumn"
      reserve-selection
      highlight-current-row
      :data="recordsWithFilter"
      size="small"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      :row-class-name="tableRowClassName"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      @cell-click="handleCellClick"
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

      <el-table-column
        v-for="(fieldAttributes, key) in headerList"
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
          <cell-edit-info
            :parent-uuid="parentUuid"
            :container-uuid="containerUuid"
            :field-attributes="fieldAttributes"
            :container-manager="containerManager"
            :scope="scope"
            :data-row="scope.row"
            :data-cell="scope.column"
            :table-name="panelMetadata.tableName"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <loading-view
    v-else
    key="process-loading"
  />
</template>

<script>
import { defineComponent, computed, onMounted, onUpdated, onBeforeMount, ref, watch } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'

// Components and Mixins
import CellEditInfo from '@theme/components/ADempiere/DataTable/Components/CellEditInfo.vue'
// import CellDisplayInfo from '@theme/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'
import ColumnsDisplayOption from '@theme/components/ADempiere/DataTable/Components/ColumnsDisplayOption'
import FullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer/index.vue'
import useFullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer/useFullScreenContainer'
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'

// Constants
import { YES_NO } from '@/utils/ADempiere/references'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { isDocumentStatus } from '@/utils/ADempiere/constants/systemColumns'

export default defineComponent({
  name: 'WindowsTable',

  components: {
    // CellDisplayInfo,
    CellEditInfo,
    ColumnsDisplayOption,
    FullScreenContainer,
    LoadingView
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
    },
    isNavigation: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { root, refs }) {
    const {
      storedWindow
    } = useFullScreenContainer({
      parentUuid: props.parentUuid,
      containerUuid: props.containerUuid
    })

    const heightTable = ref()
    const timeOut = ref(() => {})
    const isChangeOptions = ref(false)
    const panelMain = document.getElementById('mainWindow')
    const heightSize = ref()
    const currentRowSelect = ref({})
    const isLoadingDataTale = computed(() => {
      if (props.containerManager && props.containerManager.isLoadedRecords) {
        return !props.containerManager.isLoadedRecords({
          containerUuid: props.containerUuid
        })
      }
      return !isEmptyValue(props.dataTable)
    })

    const getIsLoadedTabRecord = computed(() => {
      return store.getters.getIsLoadedTabRecord({
        containerUuid: props.containerUuid
      })
    })

    const currentOption = computed(() => {
      return store.getters.getTableOption(props.containerUuid)
    })

    const keyColumn = computed(() => {
      if (props.panelMetadata) {
        return props.panelMetadata.keyColumn
      }
      return undefined
    })

    const headerList = computed(() => {
      // const showMinimalistView = store.getters.getTableOption(props.containerUuid)
      // if (lang.t('table.dataTable.showMinimalistView') === showMinimalistView) {
      return props.header.filter(fieldItem => {
        if ([fieldItem.columnName, fieldItem.elementName].includes('TaskStatus')) {
          return true
        }
        // validate with container manager
        if (props.containerManager.isDisplayedColumn(fieldItem)) {
          const isDisplayedDefault = isDisplayedDefaultTable({
            ...fieldItem,
            isMandatory: props.containerManager.isMandatoryField(fieldItem)
          })
          // madatory, not parent column and without default value to window, mandatory or with default value to others
          if (isDisplayedDefault) {
            return true
          }
          // showed by user
          return fieldItem.isShowedTableFromUser
        }

        //     fieldItem.displayType !== BUTTON.id &&
        //     tableColumnDataType(fieldItem, currentOption.value) &&
        return false
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
      if (props.containerManager.getPageNumber) {
        return parseInt(props.containerManager.getPageNumber({
          containerUuid: props.containerUuid
        }), 10)
      }
      return 1
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const recordsLength = computed(() => {
      if (props.containerManager.getRecordCount) {
        return props.containerManager.getRecordCount({
          containerUuid: props.containerUuid
        })
      }
      return recordsWithFilter.value.length
    })

    const tabData = computed(() => {
      if (props.containerManager.getRecordList) {
        return props.containerManager.getRecordList({
          containerUuid: props.containerUuid
        })
      }
      return {}
    })

    const defaultSize = computed(() => {
      const main = document.getElementById('multipleTable')
      if (
        !isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)
      ) {
        return main.clientHeight
      }
      return 600
    })

    const sizeViewTable = computed(() => {
      if (isMobile.value) {
        return 500
      }
      if (!isEmptyValue(props.parentUuid)) {
        if (!isEmptyValue(panelMain) && !isEmptyValue(heightSize.value)) {
          const currentTab = store.getters.getStoredTab(
            props.parentUuid,
            props.containerUuid
          )

          if (!isEmptyValue(currentTab)) {
            if (currentTab.isParentTab) {
              if (storedWindow.value.isFullScreenTabsParent) {
                return heightSize.value - 250
              } else {
                return heightSize.value - 200
              }
            } else {
              if (storedWindow.value.isFullScreenTabsChildren) {
                return heightSize.value - 250
              } else {
                return heightSize.value - 200
              }
            }
          }
        }
      }
      if (props.containerManager.panelMain() === 'mainBrowser') {
        return defaultSize.value
      }
      return 'auto'
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

      if (!isEmptyValue(props.parentUuid)) {
        currentRowSelect.value = row
        toggleSelection()
        props.containerManager.setSelection({
          containerUuid: props.containerUuid,
          recordsSelected: [row]
        })
        toggleSelection([row])
        store.dispatch('changeTabAttribute', {
          attributeName: 'currentRowSelect',
          attributeNameControl: undefined,
          attributeValue: row,
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid
        })

        if (isMobile.value) {
          store.dispatch('changeTabAttribute', {
            attributeName: 'isShowedTableRecords',
            attributeNameControl: undefined,
            attributeValue: false,
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid
          })

          props.containerManager.seekRecord({
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid,
            row
          })
        }
        props.containerManager.seekRecord({
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid,
          row
        })
      }
    }

    /**
     * isDisplayedDefaultTable
     */
    function isDisplayedDefaultTable({ isMandatory, isParent, defaultValue, displayType, columnName, elementColumnName, name }) {
      const documentStatus = isDocumentStatus({
        columnName,
        elementColumnName
      })
      if (documentStatus) {
        return true
      }

      if (['DateInvoiced', 'DateOrdered', 'DatePromised', 'DateTrx', 'M_Product_ID', 'QtyEntered', 'DocumentNo', 'Value', 'DocStatus'].includes(columnName)) {
        return true
      }
      if (isMandatory && !isParent && isEmptyValue(defaultValue)) {
        // Yes/No field always boolean value (as default value)
        if (displayType === YES_NO.id) {
          return false
        }
        return true
      }
      return false
    }

    /**
     * To confirm edit record row
     * @param {object} row
     * @param {string} column
     */
    function handleRowDblClick(row, column, event) {
      // disable edit mode

      if (!isEmptyValue(props.parentUuid)) {
        const currentTab = store.getters.getStoredTab(
          props.parentUuid,
          props.containerUuid
        )

        const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
        if (recordUuid !== row.UUID && currentTab.isParentTab) {
          // props.containerManager.seekRecord({
          //   parentUuid: props.parentUuid,
          //   containerUuid: props.containerUuid,
          //   row
          // })
          props.containerManager.setSelection({
            containerUuid: props.containerUuid,
            recordsSelected: []
          })
        }

        store.dispatch('changeTabAttribute', {
          attributeName: 'isShowedTableRecords',
          attributeNameControl: undefined,
          attributeValue: false,
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid
        })
      }

      if (props.containerManager.confirmRowChanges && row.isSelectedRow && row.isEditRow) {
        row.isEditRow = false
        props.containerManager.confirmRowChanges({
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid,
          row
        })
      }
    }

    function headerLabel(field) {
      if (field.isMandatory || field.isMandatoryFromLogic) {
        return '* ' + field.name
      }
      return field.name
    }

    /**
     * custom method to handle change page
     */
    function handleChangePage(pageNumber) {
      props.containerManager.setPage({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        pageSize: store.getters.getTabPageSize({ containerUuid: props.containerUuid }),
        pageNumber
      })
      const getTabData = isEmptyValue(props.parentUuid) ? {} : store.getters.getStoredTab(props.parentUuid, props.containerUuid)
      const query = isEmptyValue(props.parentUuid) ? { ...root.$route.query, page: pageNumber } : { ...root.$route.query, page: getTabData.isParentTab ? pageNumber : root.$route.query.page, pageChild: !getTabData.isParentTab ? pageNumber : root.$route.query.pageChild }
      router.push({
        name: root.$route.name,
        query: {
          ...query
        }
      }, () => {})
    }

    /**
     * custom method to handle change size page
     */

    function handleChangeSizePage(pageSize) {
      props.containerManager.setSizePage({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        pageSize,
        pageNumber: 1
      })
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

    const currentTabChildren = computed(() => {
      if (isEmptyValue(props.parentUuid)) {
        return {}
      }
      const currentTab = store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      )
      if (!isEmptyValue(currentTab) && !currentTab.isParentTab) {
        const record = store.getters.getTabCurrentRow({
          containerUuid: props.containerUuid
        })
        return record
      }
      return {}
    })

    function handleSelection(selections, rowSelected) {
      let index = 0
      rowSelected.isSelectedRow = !rowSelected.isSelectedRow
      rowSelected.rowSelectedIndex = index++
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
          if (!isEmptyValue(refs.multipleTable)) {
            refs.multipleTable.toggleRowSelection(row)
          }
        })
      } else {
        if (!isEmptyValue(refs.multipleTable)) {
          refs.multipleTable.clearSelection()
        }
      }
    }
    function tableRowClassName(params) {
      const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
      if (params.row.UUID === recordUuid && !isEmptyValue(props.parentUuid) && isEmptyValue(currentRowSelect.value)) {
        return 'success-row'
      }
      return ''
    }

    function adjustSize() {
      if (!isEmptyValue(panelMain) && !isEmptyValue(panelMain.clientHeight)) {
        const size = parseInt(panelMain.clientHeight) / 2
        if (recordsWithFilter.value.length < 5) {
          heightTable.value = 'auto'
          return
        }
        heightTable.value = size
      }
    }

    function loadSelect() {
      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        const selectionsList = props.containerManager.getSelection({
          containerUuid: props.containerUuid
        })
        const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
        if (!isEmptyValue(recordsWithFilter.value) && !isEmptyValue(recordUuid) && isEmptyValue(selectionsList)) {
          const currentRow = recordsWithFilter.value.find(row => row.UUID === recordUuid)
          props.containerManager.setSelection({
            containerUuid: props.containerUuid,
            recordsSelected: [currentRow]
          })
          toggleSelection([currentRow])
        }
        // if (!isEmptyValue(selectionsList)) {
        //   toggleSelection(selectionsList)
        // }
      }, 1000)
    }

    function handleCellClick(row, column, cell, event) {
      if (column.type === 'selection') {
        // does not make the row editable if the checkbox is selected
        return
      }

      const { tableName } = props.panelMetadata
      let currentRowEdit = {
        UUID: ''
      }
      currentRowEdit = recordsWithFilter.value.find(records => records.isEditRow)
      if (!isEmptyValue(currentRowEdit) && currentRowEdit.UUID === row.UUID) {
        row.isEditRow = true
        return
      } else {
        const changeAllOthers = recordsWithFilter.value.filter(records => row[tableName + '_ID'] !== records[tableName + '_ID'])
        changeAllOthers.forEach(element => {
          element.isEditRow = false
        })
        row.isEditRow = true
        if (!isEmptyValue(currentRowEdit) && !isEmptyValue(currentRowEdit.UUID)) {
          props.containerManager.exitEditMode({
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid,
            tableName,
            recordUuid: currentRowEdit.UUID
          })
        }
      }
    }

    watch(currentTabChildren, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        loadSelect()
      }
    })

    watch(getIsLoadedTabRecord, (newValue, oldValue) => {
      const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
      const selectionsList = props.containerManager.getSelection({
        containerUuid: props.containerUuid
      })
      if (selectionsList.length > 1) {
        toggleSelection(selectionsList)
        // return
      }
      if (newValue && !isEmptyValue(recordUuid)) {
        const currentRow = recordsWithFilter.value.find(row => row.UUID === recordUuid)
        if (!isEmptyValue(currentRow) & !isEmptyValue(refs.multipleTable)) {
          refs.multipleTable.toggleRowSelection(currentRow)
        }
      }
    })

    watch(currentOption, (newValue, oldValue) => {
      isChangeOptions.value = true
      setTimeout(() => {
        isChangeOptions.value = false
      }, 500)
    })

    onUpdated(() => {
      const main = document.getElementById('mainWindow')
      if (
        !isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)
      ) {
        heightSize.value = main.clientHeight
      }
      // const selectionsList = props.containerManager.getSelection({
      //   containerUuid: props.containerUuid
      // })
      // if (!isEmptyValue(selectionsList)) {
      //   loadSelect()
      // }
    })

    onBeforeMount(() => {
      const main = document.getElementById('mainWindow')
      if (
        !isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)
      ) {
        heightSize.value = main.clientHeight
      }
      loadSelect()
    })

    onMounted(() => {
      // adjustSize()
      const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
      if (props.isTableSelection) {
        const selectionsList = props.containerManager.getSelection({
          containerUuid: props.containerUuid
        })
        if (!isEmptyValue(selectionsList)) {
          toggleSelection(selectionsList)
        } else if (!isEmptyValue(recordsWithFilter.value) && !isEmptyValue(recordUuid)) {
          const currentRow = recordsWithFilter.value.find(row => row.UUID === recordUuid)
          props.containerManager.setSelection({
            containerUuid: props.containerUuid,
            recordsSelected: [currentRow]
          })
          toggleSelection([currentRow])
        }
      }
    })

    return {
      // data
      timeOut,
      isChangeOptions,
      heightTable,
      heightSize,
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
      tabData,
      defaultSize,
      sizeViewTable,
      isMobile,
      currentRowSelect,
      currentTabChildren,
      getIsLoadedTabRecord,
      // methods
      adjustSize,
      tableRowClassName,
      headerLabel,
      handleChangePage,
      handleChangeSizePage,
      handleRowClick,
      handleRowDblClick,
      handleSelection,
      handleSelectionAll,
      loadSelect,
      handleCellClick
    }
  }
})
</script>

<style lang="scss">
 div#mainWindow{
    width: 100%;
}
div#mainWindowDataTable{
  width: 100%;
}
.multipleTableWindows {
  height: 100%;
  .el-table {
    height: 100% !important;
  }
  .el-table .el-table__cell {
    padding: 0px !important;
  }
  .el-table .success-row {
    background: #e8f4ff;
  }
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 15px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .el-table .cell:hover {
    border: 2px solid blue;
    overflow: hidden;
  }
}
</style>
