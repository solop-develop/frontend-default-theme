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
  <div>
    <!-- <auxiliary-panel
      v-if="isShowedTableRecords"
      :parent-uuid="parentUuid"
      :container-uuid="tabUuid"
      :label="tabsList[currentTab].name"
    >
      <record-navigation
        :parent-uuid="parentUuid"
        :container-uuid="tabUuid"
        :container-manager="containerManager"
        :current-tab="tabsList[currentTab]"
      />
    </auxiliary-panel> -->
    <!-- <div style="display: flex;height: 100%;"> -->
    <el-tabs
      ref="el-tabs-container"
      v-model="currentTab"
      class="el-tabs-container"
      type="border-card"
      style="width:100%;height: 100%"
      @tab-click="handleClick"
    >
      <el-tab-pane
        v-for="(tabAttributes, key) in tabsList"
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

        <span v-if="currentTabMetadata.isShowedTableRecords">
          <tab-options
            :parent-uuid="parentUuid"
            :container-manager="containerManager"
            :current-tab-uuid="tabUuid"
            :tabs-list="tabsList"
            :all-tabs-list="allTabsList"
            :tab-attributes="tabAttributes"
            :references-manager="referencesManager"
            :convenience-options="additionalOptions"
          />
          <br>
        </span>

        <!-- Close table when clicking on group of fields -->
        <div
          v-if="isShowedTabs"
          @click="selectTab(tabsList[parseInt(currentTab)])"
        >
          <tab-panel
            :parent-uuid="parentUuid"
            :container-manager="containerManager"
            :tabs-list="tabsList"
            :all-tabs-list="allTabsList"
            :current-tab-uuid="tabUuid"
            :tab-attributes="tabAttributes"
            :actions-manager="actionsManager"
            :references-manager="referencesManager"
            :convenience-options="additionalOptions"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <div style="width: 1%;height: 100%;position: fixed;right: 1%;top: 50%;">
      <el-button type="primary" size="mini" circle @click="openRecordLogs">
        <svg-icon icon-class="tree-table" />
      </el-button>
    </div>
    <!-- </div> -->

    <el-drawer
      :visible.sync="showContainerInfo"
      :with-header="false"
      :before-close="openRecordLogs"
      :size="isDrawerWidth"
    >
      <panel-info
        :all-tabs-list="allTabsList"
        :show-container-info="showContainerInfo"
        :container-manager="containerManager"
        :current-record="currentRecordLogs"
      />
    </el-drawer>
  </div>
</template>

<script>
import { defineComponent, computed, watch, ref } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'
import language from '@/lang'

// components and mixins
// import AuxiliaryPanel from '@theme/components/ADempiere/AuxiliaryPanel/index.vue'
import DefaultTable from '@theme/components/ADempiere/DefaultTable/index.vue'
import PanelDefinition from '@theme/components/ADempiere/PanelDefinition/index.vue'
// import RecordNavigation from '@theme/components/ADempiere/RecordNavigation/index.vue'
import TabLabel from '@theme/components/ADempiere/TabManager/TabLabel.vue'
import PanelInfo from '../PanelInfo/index.vue'
import TabPanel from './TabPanel.vue'
import TabOptions from './TabOptions.vue'

// constants
import { UUID } from '@/utils/ADempiere/constants/systemColumns.js'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'TabManager',

  components: {
    // AuxiliaryPanel,
    DefaultTable,
    PanelDefinition,
    TabPanel,
    // RecordNavigation,
    PanelInfo,
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
    },
    additionalOptions: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props, { root }) {
    const queryProperty = 'tab'
    // if tabParent is present in path set this
    const tabNo = root.$route.query[queryProperty] || '0'
    const currentTab = ref(tabNo)

    const tabUuid = ref(props.tabsList[tabNo].uuid)

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isDrawerWidth = computed(() => {
      if (isMobile.value) {
        return '90%'
      }
      return '50%'
    })

    const tabStyle = computed(() => {
      // height tab content
      if (currentTabMetadata.value.isShowedTableRecords) {
        return {
          overflow: 'auto'
        }
      }
      return {
        height: '100% !important',
        overflow: 'auto'
      }
    })

    // Panel Info

    const currentRecordLogs = ref({})
    const drawer = ref(false)

    // use getter to reactive properties
    const currentTabMetadata = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, tabUuid.value)
    })

    const showContainerInfo = computed(() => {
      return store.getters.getShowLogs
    })

    const isShowedTabs = computed(() => {
      const storedWindow = store.getters.getStoredWindow(props.parentUuid)
      return storedWindow.isShowedTabsParent
    })

    const isShowedTableRecords = computed(() => {
      return currentTabMetadata.value.isShowedTableRecords
    })

    const isCreateNew = computed(() => {
      return Boolean(root.$route.query.action === 'create-new')
    })

    function isDisabledTab(key) {
      return (key > 0) &&
        (isCreateNew.value || isEmptyValue(recordUuidTabParent.value))
    }

    function setCurrentTab() {
      store.commit('setCurrentTab', {
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
      findRecordLogs(props.allTabsList[0])
      setTabNumber(tabindex)

      const inf = store.getters.getContainerInfo
      const infoTab = props.tabsList.find(row => row.uuid === tabuuid)
      if (!isEmptyValue(inf)) {
        if (!isEmptyValue(infoTab)) {
          if (!isEmptyValue(inf.currentTab)) {
            store.dispatch('changeTabAttribute', {
              parentUuid: inf.currentTab.parentUuid,
              containerUuid: inf.currentTab.containerUuid,
              attributeName: 'isSelected',
              attributeValue: false
            })
          }
          const list = store.getters.getTabRecordsList({ containerUuid: infoTab.containerUuid })
          const currentRecord = list.find(row => row.UUID === store.getters.getUuidOfContainer(infoTab.containerUuid))
          store.dispatch('panelInfo', {
            currentTab: infoTab,
            currentRecord
          })
          store.dispatch('changeTabAttribute', {
            parentUuid: infoTab.parentUuid,
            containerUuid: infoTab.containerUuid,
            attributeName: 'isSelected',
            attributeValue: true
          })
        }
      }
      // set metadata tab
      if (tabUuid.value !== tabuuid) {
        tabUuid.value = tabuuid
        setCurrentTab()
      }
    }

    const setTabNumber = (tabNumber = '0') => {
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

    const query = root.$route.query

    // get records list
    const recordsList = computed(() => {
      return tabData.value.recordsList
    })

    const isReadyFromGetData = computed(() => {
      return !tabData.value.isLoaded
    })

    const recordUuidTabParent = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.firstTabUuid,
        columnName: UUID
      })
    })

    const currentTabTableName = computed(() => {
      return store.getters.getTableName(
        props.parentUuid,
        currentTabMetadata.value.firstTabUuid
      )
    })

    const getData = () => {
      const containerUuid = tabUuid.value
      let filters
      const pageNumber = query.page
      if (query.filters) {
        filters = query.filters
      }
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid,
        filters,
        pageNumber
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
        const { action } = query
        // uuid into action query
        if (!isEmptyValue(action) && action !== 'create-new') {
          if (action === 'zoomIn') {
            const { columnName, value } = root.$route.query
            row = responseData.find(rowData => {
              return rowData[columnName] === value
            })
          } else {
            row = responseData.find(rowData => {
              return rowData.UUID === action
            })
          }
        }

        // set first record
        if (isEmptyValue(row)) {
          row = responseData[0]
        }

        // set values in panel
        props.containerManager.seekRecord({
          parentUuid: props.parentUuid,
          containerUuid,
          row
        })
      })
    }

    const listAction = computed(() => {
      return {
        parentUuid: props.parentUuid,
        containerUuid: tabUuid.value,
        defaultActionName: language.t('actionMenu.createNewRecord'),
        tableName: props.tabsList[currentTab.value].tableName,
        getActionList: () => {
          return store.getters.getStoredActionsMenu({
            containerUuid: tabUuid.value
          })
        }
      }
    })

    if (isReadyFromGetData.value) {
      getData()
    }
    watch(currentRecordLogs, (newValue, oldValue) => {
      const recordId = newValue[currentTabTableName.value + '_ID']
      router.push({
        name: root.$route.name,
        query: {
          ...root.$route.query,
          action: newValue.UUID,
          recordId
        },
        params: {
          ...root.$route.params,
          recordId
        }
      }, () => {})
    })
    // if changed tab and not records in stored, get records from server
    watch(tabUuid, (newValue, oldValue) => {
      if (newValue !== oldValue && !isEmptyValue(recordUuidTabParent.value) && !tabData.value.isLoaded) {
        getData()
      }
    })

    /**
     * Listar Historico de cambios
     */
    const openRecordLogs = () => {
      store.dispatch('showLogs', {
        show: !showContainerInfo.value
      })
      // store.commit('setShowRecordLogs', newValue)
    }

    /**
     * Current Record
     */
    const findRecordLogs = (tab) => {
      currentRecordLogs.value = store.getters.getValuesView({
        parentUuid: tab.parentUuid,
        containerUuid: tab.containerUuid,
        format: 'object'
      })
    }

    const tabMetadata = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      )
    })

    function changeShowedRecords() {
      store.dispatch('changeTabAttribute', {
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.uuid,
        attributeName: 'isShowedTableRecords',
        attributeValue: !currentTabMetadata.value.isShowedTableRecords
      })
      store.dispatch('changeTabAttribute', {
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.uuid,
        attributeName: 'isSelected',
        attributeValue: !currentTabMetadata.value.isSelected
      })
    }

    function selectTab(params) {
      store.dispatch('panelInfo', {
        currentTab: params
      })
    }

    findRecordLogs(props.allTabsList[0])

    setTabNumber(currentTab.value)

    return {
      tabUuid,
      currentTab,
      tableHeaders,
      recordsList,
      drawer,
      currentRecordLogs,
      // computed
      isMobile,
      isDrawerWidth,
      isShowedTabs,
      isShowedTableRecords,
      currentTabTableName,
      currentTabMetadata,
      tabStyle,
      listAction,
      tabMetadata,
      showContainerInfo,
      // methods
      handleClick,
      changeShowedRecords,
      findRecordLogs,
      openRecordLogs,
      isDisabledTab,
      selectTab
    }
  }

})
</script>
