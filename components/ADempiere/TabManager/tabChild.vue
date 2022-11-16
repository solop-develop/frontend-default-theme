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
  <el-tabs
    v-if="!isEmptyValue(showedTabsList)"
    v-model="currentTab"
    type="border-card"
    style="width: 100%"
    @tab-click="handleClick"
  >
    <el-tab-pane
      v-for="(tabAttributes, key) in showedTabsList"
      :key="key"
      :label="tabAttributes.name"
      :name="String(key)"
      :tabuuid="tabAttributes.uuid"
      :tabindex="String(key)"
      lazy
      :disabled="isDisabledTab(key)"
      :style="tabStyle"
    >
      <tab-label
        slot="label"
        :is-active-tab="tabAttributes.uuid === tabUuid"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
      />

      <div
        v-if="isShowedTableRecords && !isMobile"
      >
        <tab-options
          :parent-uuid="parentUuid"
          :container-manager="containerManager"
          :current-tab-uuid="tabUuid"
          :tabs-list="tabsList"
          :all-tabs-list="allTabsList"
          :tab-attributes="tabAttributes"
          :references-manager="referencesManager"
        />
        <br>
      </div>

      <div
        v-if="isShowedTabs"
        style="height: 100% !important;"
        @click="selectTab(tabsList[parseInt(currentTab)])"
      >
        <!-- records in table to multi records -->
        <div v-if="isMobile">
          <tab-panel
            key="tab-panel"
            :parent-uuid="parentUuid"
            :container-manager="containerManager"
            :tabs-list="tabsList"
            :all-tabs-list="allTabsList"
            :current-tab-uuid="tabUuid"
            :tab-attributes="tabAttributes"
            :actions-manager="actionsManager"
            :references-manager="referencesManager"
          />
        </div>
        <div v-else>
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
          <!-- <el-scrollbar v-else ref="tabPanel" :vertical="false" class="scroll-tab-panel"> -->
          <tab-panel
            v-else
            key="tab-panel-65465456"
            :parent-uuid="parentUuid"
            :container-manager="containerManager"
            :tabs-list="tabsList"
            :all-tabs-list="allTabsList"
            :current-tab-uuid="tabUuid"
            :tab-attributes="tabAttributes"
            :actions-manager="actionsManager"
            :references-manager="referencesManager"
          />
          <!-- </el-scrollbar> -->
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { defineComponent, computed, watch, ref, onUnmounted } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'

// components and mixins
import DefaultTable from '@theme/components/ADempiere/DataTable/index.vue'
import TabLabel from '@theme/components/ADempiere/TabManager/TabLabel.vue'
import TabPanel from './TabPanel.vue'
import TabOptions from './TabOptions.vue'

// constants
import { UUID } from '@/utils/ADempiere/constants/systemColumns.js'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { getContextAttributes, generateContextKey } from '@/utils/ADempiere/contextUtils'

export default defineComponent({
  name: 'TabManager',

  components: {
    DefaultTable,
    TabPanel,
    TabLabel,
    TabOptions
  },

  props: {
    parentUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    allTabsList: {
      type: Array,
      required: false
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    actionsManager: {
      type: Object,
      default: () => ({})
    },
    // used only window
    referencesManager: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props, { root }) {
    const queryProperty = 'tabChild'

    // if tabParent is present in path set this
    const tabNo = root.$route.query[queryProperty] || '0'
    const currentTab = ref(tabNo)

    const tabUuid = ref(props.tabsList[tabNo].uuid)

    const tabStyle = computed(() => {
      // height tab content
      return {
        height: '100% !important',
        overflow: 'auto'
      }
    })

    // use getter to reactive properties
    const currentTabMetadata = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, tabUuid.value)
    })

    // tabs with display logic
    const showedTabsList = computed(() => {
      return props.tabsList.filter(tab => {
        return tab.isShowedTab()
      })
    })

    const isShowedTabs = computed(() => {
      const storedWindow = store.getters.getStoredWindow(props.parentUuid)

      return storedWindow.isShowedTabsChildren
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isShowedTableRecords = computed(() => {
      return currentTabMetadata.value.isShowedTableRecords
    })

    const isCreateNew = computed(() => {
      return Boolean(root.$route.query.action === 'create-new')
    })

    function isDisabledTab(key) {
      return key > 0 && (isCreateNew.value || isEmptyValue(recordUuidTabParent.value))
    }

    function changeShowedRecords() {
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: !currentTabMetadata.value.isShowedTableRecords,
        parentUuid: props.parentUuid,
        containerUuid: tabUuid.value
      })
    }
    function setCurrentTab() {
      store.commit('setCurrentTabChild', {
        parentUuid: props.parentUuid,
        tab: props.tabsList[currentTab.value]
      })
    }

    // create the table header
    const tableHeaders = computed(() => {
      const panel = props.tabsList[currentTab.value]
      if (panel && panel.fieldsList) {
        return panel.fieldsList
      }
      return []
    })

    /**
     * @param {object} tabHTML DOM HTML the tab clicked
     */
    const handleClick = (tabHTML) => {
      const { tabuuid, tabindex } = tabHTML.$attrs

      setTabNumber(tabindex)

      // set metadata tab
      if (tabUuid.value !== tabuuid) {
        tabUuid.value = tabuuid
        setCurrentTab()
      }

      const containerInfo = store.getters.getContainerInfo
      if (!isEmptyValue(containerInfo)) {
        const currentTabDefinition = props.tabsList.find(row => row.uuid === tabuuid)
        if (!isEmptyValue(currentTabDefinition)) {
          if (!isEmptyValue(currentTabDefinition.currentTab)) {
            store.dispatch('changeTabAttribute', {
              parentUuid: containerInfo.currentTab.parentUuid,
              containerUuid: containerInfo.currentTab.containerUuid,
              attributeName: 'isSelected',
              attributeValue: false
            })
          }
          const currentTabData = store.getters.getTabData({
            containerUuid: tabuuid
          })

          const recordsListTab = currentTabData.recordsList
          let currentRecord = {}
          if (isEmptyValue(recordsListTab)) {
            if (!currentTabData.isLoaded && !currentTabData.isLoading) {
              // load records
              getData()
            }
          } else {
            currentRecord = recordsListTab.find(row => row.UUID === store.getters.getUuidOfContainer(currentTabDefinition.containerUuid))
            store.dispatch('panelInfo', {
              currentTab: currentTabDefinition,
              currentRecord
            })
          }
          store.dispatch('changeTabAttribute', {
            parentUuid: currentTabDefinition.parentUuid,
            containerUuid: currentTabDefinition.containerUuid,
            attributeName: 'isSelected',
            attributeValue: true
          })
        }
      }
    }

    function setTabNumber(tabNumber = '0') {
      if (isEmptyValue(tabNumber)) {
        tabNumber = '0'
      }
      if (tabNumber !== currentTab.value) {
        currentTab.value = tabNumber
      }

      router.push({
        query: {
          ...root.$route.query,
          [queryProperty]: currentTab.value
        },
        params: {
          ...root.$route.params
        }
      }, () => {})

      return tabNumber
    }

    const tabData = computed(() => {
      return store.getters.getTabData({
        containerUuid: currentTabMetadata.value.uuid
      })
    })

    // get records list
    const recordsList = computed(() => {
      return tabData.value.recordsList
    })

    const recordUuidTabParent = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.firstTabUuid,
        columnName: UUID
      })
    })

    function getData() {
      const containerUuid = tabUuid.value
      const filters = []
      if (!isEmptyValue(root.$route.query) &&
        !isEmptyValue(root.$route.query.columnName) &&
        !isEmptyValue(root.$route.query.value)) {
        filters.push({
          columnName: root.$route.query.columnName,
          value: root.$route.query.value
        })
      }
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid,
        filters
      }).then(responseData => {
        if (isCreateNew.value || isEmptyValue(responseData)) {
          // set values in panel
          props.containerManager.seekRecord({
            parentUuid: props.parentUuid,
            containerUuid,
            row: {}
          })
          return
        }

        let row = {}
        const { action } = root.$route.query
        // uuid into action query
        if (!isEmptyValue(action) && action !== 'create-new') {
          /*
          // search link value
          const { linkColumnName } = tab
          const value = store.getters.getValueOfField({
            parentUuid: props.parentUuid,
            columnName: linkColumnName
          })
          if (linkColumnName && !isEmptyValue(value)) {
            row = responseData.find(rowData => {
            return rowData[linkColumnName] === value
          })
          }
          */
        }

        // set first record
        if (isEmptyValue(row)) {
          row = responseData[0]
          props.containerManager.seekRecord({
            parentUuid: props.parentUuid,
            containerUuid,
            row
          })
        }

        // set values in panel

        // props.containerManager.seekRecord({
        //   parentUuid: props.parentUuid,
        //   containerUuid,
        //   row
        // })
      })
    }

    // const storedContextAttributes = computed(() => {
    //   return store.getters.getTabContextKey({
    //     containerUuid: props.tabsList[currentTab.value].uuid
    //   })
    // })

    const storedOldContextAttibutes = computed(() => {
      return store.getters.getTabOldContextKey({
        containerUuid: props.tabsList[currentTab.value].uuid
      })
    })

    const currentContextAttributes = computed(() => {
      const contextAttributesList = getContextAttributes({
        parentUuid: props.parentUuid,
        contextColumnNames: currentTabMetadata.value.contextColumnNames,
        keyName: 'key'
      })
      return generateContextKey(contextAttributesList, 'key')
    })

    const storedOldRecord = computed(() => {
      return store.getters.getCurrentRecordOnPanel(props.tabsList[currentTab.value].uuid)
    })

    /**
     * Vuex suscription when record parent change
     */
    const unsuscribeChangeParentRecord = () => {}

    // // if changed record in parent tab, reload tab child
    // watch(currentTab, (newValue, oldValue) => {
    //   if (newValue !== oldValue && !isEmptyValue(newValue)) {
    //     getData()
    //   }
    // })

    // if changed record in parent tab, reload tab child
    watch(recordUuidTabParent, (newValue, oldValue) => {
      if (newValue !== oldValue && !isEmptyValue(newValue)) {
        if (currentContextAttributes.value === storedOldContextAttibutes.value) {
          store.dispatch('setOldAsCurrentTabData', {
            parentUuid: props.parentUuid,
            containerUuid: props.tabsList[currentTab.value].uuid
          })
        } else {
          // if there is no petition in progress
          if (!tabData.value.isLoading) {
            getData()
          }
        }
      }
    })

    // unsuscribeChangeParentRecord = store.subscribeAction({
    //   after: (action, state) => {
    //     if (action.type === 'setTabDefaultValues' && action.payload) {
    //       const currentChildTab = currentTabMetadata.value
    //       if (action.payload.parentUuid === currentChildTab.parentUuid) {
    //         const isChangeParentTab = currentChildTab.parentTabs.some(tabItem => {
    //           return tabItem.uuid === action.payload.containerUuid
    //         })
    //         if (isChangeParentTab) {
    //           store.dispatch('setTabDefaultValues', {
    //             parentUuid: action.payload.parentUuid,
    //             containerUuid: currentChildTab.containerUuid
    //           })
    //         }
    //       }
    //     }
    //   }
    // })

    setTabNumber(currentTab.value)

    // remove susbscriptions
    onUnmounted(() => {
      unsuscribeChangeParentRecord()
    })

    function selectTab(params) {
      store.dispatch('panelInfo', {
        currentTab: params
      })
    }

    return {
      tabUuid,
      currentTab,
      tableHeaders,
      recordsList,
      // computed
      storedOldRecord,
      storedOldContextAttibutes,
      currentContextAttributes,
      isShowedTabs,
      showedTabsList,
      isMobile,
      currentTabMetadata,
      recordUuidTabParent,
      isShowedTableRecords,
      tabData,
      tabStyle,
      // methods
      handleClick,
      isDisabledTab,
      changeShowedRecords,
      selectTab
    }
  }

})
</script>

<style>
.el-tabs--border-card > .el-tabs__content {
  padding: 15px;
  overflow: auto;
  height: 100%;
}
.scroll-child {
  /* max-height: 300px; */
  overflow-x: hidden;
}
</style>
