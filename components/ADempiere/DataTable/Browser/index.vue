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
      <el-col
        :span="1"
        style="text-align: center;"
      >
        <columns-display-option
          :option="currentOption"
          :container-manager="containerManager"
          :parent-uuid="parentUuid"
          :container-uuid="containerUuid"
        />

        <full-screen-container
          style="float: right;"
          :parent-uuid="parentUuid"
          :container-uuid="containerUuid"
        />
      </el-col>
    </el-row>

    <el-table
      id="multipleTable"
      ref="multipleTable"
      v-loading="isLoadingDataTable"
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
            <cell-edit-info
              :parent-uuid="parentUuid"
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
      :container-manager="containerManager"
      :parent-uuid="parentUuid"
      :container-uuid="containerUuid"
      :total="recordsLength"
      :current-page="currentPage"
      :selection="selectionsLength"
      :records-page="recordsWithFilter.length"
      :handle-change-page="handleChangePage"
      :is-navigation="isNavigation"
      :handle-size-change="handleChangeSizePage"
    />
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, onUpdated, onBeforeMount, ref, watch } from '@vue/composition-api'

import store from '@/store'
import router from '@/router'

// components and mixins
import CellEditInfo from '@theme/components/ADempiere/DataTable/Components/CellEditInfo.vue'
import ColumnsDisplayOption from '@theme/components/ADempiere/DataTable/Components/ColumnsDisplayOption'
import CustomPagination from '@theme/components/ADempiere/DataTable/Components/CustomPagination.vue'
import FullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer/index.vue'
import useFullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer/useFullScreenContainer'

// utils and helper methods
import { isEmptyValue, tableColumnDataType } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'BrowserTable',

  components: {
    CellEditInfo,
    ColumnsDisplayOption,
    CustomPagination,
    FullScreenContainer
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
    const timeOutSearch = ref(() => {})
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

    // value of search
    const valueToSearch = computed({
      get() {
        if (!props.isShowSearch) {
          return ''
        }
        return store.getters.getSearchValueTabRecordsList({
          containerUuid: props.containerUuid
        })
      },
      set(searchValue) {
        if (!props.isShowSearch) {
          return ''
        }
        store.commit('setSearchValueTabRecordsList', {
          containerUuid: props.containerUuid,
          searchValue
        })
      }
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
      const getTabData = isEmptyValue(props.parentUuid) ? {} : store.getters.getStoredTab(props.parentUuid, props.containerUuid)
      const query = isEmptyValue(props.parentUuid) ? { ...root.$route.query, page: pageNumber } : { ...root.$route.query, page: getTabData.isParentTab ? pageNumber : root.$route.query.page, pageChild: !getTabData.isParentTab ? pageNumber : root.$route.query.pageChild }
      router.push({
        name: root.$route.name,
        query: {
          ...query
        }
      }, () => {})
    }

    function handleChangeSizePage(pageSize) {
      props.containerManager.setSizePage({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        pageSize
      })
    }

    function handleChangeSearch(value) {
      clearTimeout(timeOutSearch.value)
      timeOutSearch.value = setTimeout(() => {
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
          refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        refs.multipleTable.clearSelection()
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

    function setTableHeight() {
      adjustSize()
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

    watch(currentTabChildren, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        loadSelect()
      }
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
      loadSelect()
    })

    onMounted(() => {
      // adjustSize()
      // setTableHeight()
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
      timeOutSearch,
      valueToSearch,
      isLoadFilter,
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
      isDisplayed,
      loadSelect,
      handleChangeSizePage
    }
  }
})
</script>

<style lang="scss">
 div#mainWindow{
    width: 100%;
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
}
</style>
