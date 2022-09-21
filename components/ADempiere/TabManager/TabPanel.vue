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
  <div>
    <span v-if="!isShowedTableRecords">
      <full-screen-container
        style="float: right;"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
      />
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
          <el-scrollbar v-else wrap-class="scroll-child" style="width: 100%;min-height: 339px;">
            <panel-definition
              key="panel-definition"
              :parent-uuid="parentUuid"
              :container-uuid="tabAttributes.uuid"
              :container-manager="containerManager"
              :group-tab="tabAttributes.tabGroup"
            />
          </el-scrollbar>
        </span>
        <el-scrollbar v-else wrap-class="scroll-child" style="width: 100%;min-height: 339px;">
          <panel-definition
            key="panel-definition"
            :parent-uuid="parentUuid"
            :container-uuid="tabAttributes.uuid"
            :container-manager="containerManager"
            :group-tab="tabAttributes.tabGroup"
          />
        </el-scrollbar>
      </template>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'
import router from '@/router'

// components and mixins
// import CustomPagination from '@theme/components/ADempiere/DataTable/CustomPagination.vue'
import DefaultTable from '@theme/components/ADempiere/DataTable/index.vue'
import FullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer'
import PanelDefinition from '@theme/components/ADempiere/PanelDefinition/index.vue'
import TabOptions from './TabOptions.vue'

export default defineComponent({
  name: 'TabPanel',

  components: {
    // CustomPagination,
    DefaultTable,
    FullScreenContainer,
    PanelDefinition,
    TabOptions
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
    }
  },

  setup(props, { root }) {
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

    const selectionsLength = computed(() => {
      return props.containerManager.getSelection({
        containerUuid: props.tabAttributes.uuid
      }).length
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

    return {
      // computeds
      listAction,
      recordsList,
      isShowedTableRecords,
      tableHeaders,
      tabData,
      isMobile,
      currentTab,
      // pagination
      currentPage,
      recordsLength,
      selectionsLength,
      // methods
      handleChangePage,
      changeShowedRecords
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
