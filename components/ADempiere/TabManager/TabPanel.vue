<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com www.erpya.com
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
  <el-container style="height: 100%;">
    <el-header :height="styleHeadPanel">
      <tab-options
        :parent-uuid="parentUuid"
        :container-manager="containerManager"
        :current-tab-uuid="currentTabUuid"
        :container-uuid="tabAttributes.uuid"
        :tabs-list="tabsList"
        :tab-attributes="tabAttributes"
        :references-manager="referencesManager"
        :adicionales-options="convenienceOptions"
        :is-child-tab="isChildTab"
      />
      <filter-fields
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :fields-list="containerManager.getFieldsList({ parentUuid, containerUuid: tabAttributes.uuid })"
        :filter-manager="containerManager.changeFieldShowedFromUser"
        :showed-manager="containerManager.isDisplayedField"
        :fields-to-hidden="containerManager.getFieldsToHidden"
        :is-filter-records="true"
        :is-showed-table-records="isShowedTableRecords"
        :container-manager="containerManager"
      />
    </el-header>
    <el-main>
      <div style="width: 100%;">
        <default-table
          v-if="isShowedTableRecords"
          key="default-table"
          :parent-uuid="parentUuid"
          :container-uuid="tabAttributes.uuid"
          :container-manager="containerManager"
          :header="tableHeaders"
          :data-table="recordsList"
          :panel-metadata="tabAttributes"
          :is-navigation="true"
        />
        <template v-else>
          <!-- <span v-if="isMobile || isEmptyValue(tabAttributes.childTabs)"> -->
          <!-- <panel-definition
            v-if="tabAttributes.isParentTab"
            key="panel-definition"
            :parent-uuid="parentUuid"
            :container-uuid="tabAttributes.uuid"
            :container-manager="containerManager"
            :group-tab="tabAttributes.tabGroup"
          /> -->
          <panel-definition
            key="panel-definition"
            :parent-uuid="parentUuid"
            :container-uuid="tabAttributes.uuid"
            :container-manager="containerManager"
            :group-tab="tabAttributes.tabGroup"
            :style="overflowHeightScrooll"
          />
          <!-- </span> -->
          <!-- <el-scrollbar v-else wrap-class="scroll-child" style="width: 100%;min-height: 339px;padding-bottom: 25px;">
            <panel-definition
              key="panel-definition"
              :parent-uuid="parentUuid"
              :container-uuid="tabAttributes.uuid"
              :container-manager="containerManager"
              :group-tab="tabAttributes.tabGroup"
              :style="overflowHeightScrooll"
            />
          </el-scrollbar> -->
        </template>
      </div>
    </el-main>
    <el-footer :height="styleFooterPanel">
      <!-- pagination table, set custom or use default change page method -->
      <custom-pagination
        :container-manager="containerManager"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :total="recordsLength"
        :current-page="currentPage"
        :selection="selectionsLength"
        :records-page="recordsWithFilter.length"
        :handle-change-page="handleChangePage"
        :handle-size-change="handleChangeSizePage"
        :change-previous-record="changePreviousRecord"
        :change-next-record="changeNextRecord"
        :is-change-record="true"
      />
    </el-footer>
  </el-container>
  <!-- <div>
    <span v-if="!isShowedTableRecords">
      <full-screen-container
        style="float: right;"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
      />
    </span>
    <span style="display: grid;">
      <tab-options
        :parent-uuid="parentUuid"
        :container-manager="containerManager"
        :current-tab-uuid="currentTabUuid"
        :tabs-list="tabsList"
        :tab-attributes="tabAttributes"
        :references-manager="referencesManager"
        :adicionales-options="convenienceOptions"
      />
    </span>

    <div style="width: 100%;">
      <default-table
        v-if="isShowedTableRecords"
        key="default-table"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :container-manager="containerManager"
        :header="tableHeaders"
        :data-table="recordsList"
        :panel-metadata="tabAttributes"
        :is-navigation="true"
      />
      <template v-else>
        <span v-if="isMobile || isEmptyValue(tabAttributes.childTabs)">
          <panel-definition
            v-if="tabAttributes.isParentTab"
            key="panel-definition"
            :parent-uuid="parentUuid"
            :container-uuid="tabAttributes.uuid"
            :container-manager="containerManager"
            :group-tab="tabAttributes.tabGroup"
          />
          <panel-definition
            v-else
            key="panel-definition"
            :parent-uuid="parentUuid"
            :container-uuid="tabAttributes.uuid"
            :container-manager="containerManager"
            :group-tab="tabAttributes.tabGroup"
            :style="overflowHeightScrooll"
          />
        </span>
        <el-scrollbar v-else wrap-class="scroll-child" style="width: 100%;min-height: 339px;padding-bottom: 25px;">
          <panel-definition
            key="panel-definition"
            :parent-uuid="parentUuid"
            :container-uuid="tabAttributes.uuid"
            :container-manager="containerManager"
            :group-tab="tabAttributes.tabGroup"
            :style="overflowHeightScrooll"
          />
        </el-scrollbar>
      </template>
    </div>
  </div> -->
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'
import router from '@/router'

// components and mixins
import FilterFields from '@theme/components/ADempiere/FilterFields/index.vue'
import DefaultTable from '@theme/components/ADempiere/DataTable/index.vue'
import FullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer'
import PanelDefinition from '@theme/components/ADempiere/PanelDefinition/index.vue'
import CustomPagination from '@theme/components/ADempiere/DataTable/Components/CustomPagination.vue'
import TabOptions from './TabOptions.vue'

export default defineComponent({
  name: 'TabPanel',

  components: {
    CustomPagination,
    DefaultTable,
    FullScreenContainer,
    PanelDefinition,
    TabOptions,
    FilterFields
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentTabUuid: {
      type: String,
      default: ''
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    actionsManager: {
      type: Object,
      default: () => ({})
    },
    // used only window
    referencesManager: {
      type: Object,
      default: () => ({})
    },
    convenienceOptions: {
      type: Object,
      default: () => ({})
    },
    isChildTab: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { root }) {
    const overflowHeightScrooll = computed(() => {
      if (props.tabAttributes.isParentTab) {
        if (store.getters.getStoredWindow(props.parentUuid).isFullScreenTabsParent) {
          return 'max-height: 650px;'
        }
        return 'max-height: 300px;'
      }
      if (store.getters.getStoredWindow(props.parentUuid).isFullScreenTabsChildren) {
        return 'max-height: 500px !important;'
      }
      return 'max-height: 300px !important;'
    })

    const listAction = computed(() => {
      return {
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid,
        defaultActionName: language.t('actionMenu.createNewRecord'),
        tableName: props.tabAttributes.tableName,
        getActionList: () => {
          return store.getters.getStoredActionsMenu({
            containerUuid: props.tabAttributes.uuid
          })
        }
      }
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isShowedTableRecords = computed(() => {
      return tabData.value.isShowedTableRecords
    })

    const tabData = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.tabAttributes.uuid
      )
    })

    const currentTab = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.tabAttributes.uuid
      )
    })

    const storedWindow = computed(() => {
      return store.getters.getStoredWindow(props.parentUuid)
    })

    const styleHeadPanel = computed(() => {
      if (root.isEmptyValue(isWithChildsTab.value)) return '10%!important'
      if (storedWindow.value.isFullScreenTabsParent) return '15% !important'
      if (props.isChildTab && storedWindow.value.isFullScreenTabsChildren) return '15% !important'
      return '21%!important'
    })

    const styleFooterPanel = computed(() => {
      if (root.isEmptyValue(isWithChildsTab.value)) return '5%!important'
      if (props.isChildTab && storedWindow.value.isFullScreenTabsChildren) return '10% !important'
      if (props.isChildTab) return '20% !important'
      if (storedWindow.value.isFullScreenTabsParent) return '10% !important'
      return '15% !important'
    })

    // const inf = store.getters.getContainerInfo

    const list = store.getters.getTabRecordsList({ containerUuid: currentTab.value.containerUuid })
    const currentRecord = list.find(row => row.UUID === store.getters.getUuidOfContainer(currentTab.value.containerUuid))
    store.dispatch('panelInfo', {
      currentTab: currentTab.value,
      currentRecord
    })

    if (props.tabAttributes.isParentTab) {
      store.dispatch('changeTabAttribute', {
        parentUuid: currentTab.value.parentUuid,
        containerUuid: currentTab.value.containerUuid,
        attributeName: 'isSelected',
        attributeValue: !currentTab.value.isSelected
      })
    }

    const tableHeaders = computed(() => {
      const panel = props.tabsList.find(tabs => tabs.uuid === props.currentTabUuid)
      if (panel && panel.fieldsList) {
        return panel.fieldsList
      }
      return []
    })

    // get records list
    const recordsList = computed(() => {
      return props.containerManager.getRecordsList({
        containerUuid: props.tabAttributes.uuid
      })
    })

    const currentPage = computed(() => {
      if (props.containerManager.getRecordCount) {
        return parseInt(props.containerManager.getPageNumber({
          containerUuid: props.tabAttributes.uuid
        }), 10)
      }
      return 1
    })

    const recordsLength = computed(() => {
      if (props.containerManager.getRecordCount) {
        return props.containerManager.getRecordCount({
          containerUuid: props.tabAttributes.uuid
        })
      }
      return 0
    })

    const recordsWithFilter = computed(() => {
      if (props.containerManager && props.containerManager.getRecordsList) {
        return props.containerManager.getRecordsList({
          containerUuid: props.tabAttributes.uuid
        })
      }
      return []
    })

    const selectionsLength = computed(() => {
      const selection = props.containerManager.getSelection({
        containerUuid: props.tabAttributes.uuid
      })
      if (root.isEmptyValue(selection)) return 0
      return selection.length
    })

    const isWithChildsTab = computed(() => {
      return store.getters.getStoredWindow(props.parentUuid).tabsListChild
    })

    function changeShowedRecords() {
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: !tabData.value.isShowedTableRecords,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
    }

    function handleChangePage(pageNumber) {
      props.containerManager.setPage({
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid,
        pageSize: store.getters.getTabPageSize({ containerUuid: props.tabAttributes.uuid }),
        pageNumber
      })
      router.push({
        name: root.$route.name,
        query: {
          ...root.$route.query,
          page: tabData.value.isParentTab ? pageNumber : root.$route.query.page,
          pageChild: !tabData.value.isParentTab ? pageNumber : root.$route.query.pageChild
        }
      }, () => {})
    }

    /**
     * custom method to handle change size page
     */

    function handleChangeSizePage(pageSize) {
      props.containerManager.setSizePage({
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid,
        pageSize,
        pageNumber: 1
      })
    }

    /**
     * changePreviousRecord
     */

    function changePreviousRecord(recordPrevious) {
      const recordUuid = store.getters.getUuidOfContainer(props.currentTabUuid)
      const posicionIndex = recordsWithFilter.value.findIndex(record => record.UUID === recordUuid)
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: false,
        parentUuid: props.parentUuid,
        containerUuid: props.currentTabUuid
      })
      store.dispatch('changeTabAttribute', {
        attributeName: 'currentRowSelect',
        attributeNameControl: undefined,
        parentUuid: props.parentUuid,
        containerUuid: props.currentTabUuid,
        row: recordsWithFilter.value[posicionIndex - 1]
      })

      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.currentTabUuid,
        row: recordsWithFilter.value[posicionIndex - 1]
      })
    }

    /**
     * changePreviousRecord
     */

    function changeNextRecord(recordNext) {
      const recordUuid = store.getters.getUuidOfContainer(props.currentTabUuid)
      const posicionIndex = recordsWithFilter.value.findIndex(record => record.UUID === recordUuid)
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: false,
        parentUuid: props.parentUuid,
        containerUuid: props.currentTabUuid
      })
      store.dispatch('changeTabAttribute', {
        attributeName: 'currentRowSelect',
        attributeNameControl: undefined,
        parentUuid: props.parentUuid,
        containerUuid: props.currentTabUuid,
        row: recordsWithFilter.value[posicionIndex + 1]
      })

      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.currentTabUuid,
        row: recordsWithFilter.value[posicionIndex + 1]
      })
    }

    return {
      // computeds
      listAction,
      recordsList,
      isShowedTableRecords,
      tableHeaders,
      tabData,
      isMobile,
      currentTab,
      overflowHeightScrooll,
      isWithChildsTab,
      // pagination
      styleHeadPanel,
      styleFooterPanel,
      currentPage,
      recordsLength,
      selectionsLength,
      recordsWithFilter,
      storedWindow,
      // methods
      handleChangePage,
      handleChangeSizePage,
      changeShowedRecords,
      changePreviousRecord,
      changeNextRecord
    }
  }

})
</script>

<style lang="scss" scoped>
.scroll-tab-panel {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  ::v-deep {
    .el-scrollbar__bar {
      bottom: 0px;
    }
    // .el-scrollbar__wrap {
    //   height: 49px;
    // }
  }
}
</style>
