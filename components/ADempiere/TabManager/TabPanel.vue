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
  <div style="height: 100% !important;">
    <span v-if="!isShowedTableRecords">
      <tab-options
        :parent-uuid="parentUuid"
        :container-manager="containerManager"
        :current-tab-uuid="currentTabUuid"
        :tabs-list="tabsList"
        :tab-attributes="tabAttributes"
        :references-manager="referencesManager"
      />
    </span>
    <div v-if="isMobile">
      <default-table
        v-if="isShowedTableRecords"
        key="default-table"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :container-manager="containerManager"
        :header="tableHeaders"
        :data-table="recordsList"
        :panel-metadata="tabAttributes"
      />
      <panel-definition
        v-else
        key="panel-definition"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :container-manager="containerManager"
        :group-tab="tabAttributes.tabGroup"
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
      />
      <el-scrollbar v-else wrap-class="scroll-child" style="width: 100%; min-height: 30vh;overflow-x: hidden !important;">
        <panel-definition
          key="panel-definition"
          :parent-uuid="parentUuid"
          :container-uuid="tabAttributes.uuid"
          :container-manager="containerManager"
          :group-tab="tabAttributes.tabGroup"
        />
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// components and mixins
import PanelDefinition from '@theme/components/ADempiere/PanelDefinition/index.vue'
import DefaultTable from '@theme/components/ADempiere/DefaultTable/index.vue'
import TabOptions from './TabOptions.vue'

export default defineComponent({
  name: 'TabPanel',

  components: {
    PanelDefinition,
    DefaultTable,
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
    }
  },

  setup(props) {
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

    const tableHeaders = computed(() => {
      const panel = props.tabsList.find(tabs => tabs.uuid === props.currentTabUuid)
      if (panel && panel.fieldsList) {
        return panel.fieldsList
      }
      return []
    })

    // get records list
    const recordsList = computed(() => {
      return tabData.value.recordsList
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
    function handleViewFullScreen() {
      store.dispatch('changeTabAttribute', {
        attributeName: 'isViewFullScreen',
        attributeNameControl: undefined,
        attributeValue: !tabData.value.isViewFullScreen,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
    }

    return {
      // computed
      listAction,
      recordsList,
      isShowedTableRecords,
      tableHeaders,
      tabData,
      isMobile,
      // methodo
      changeShowedRecords,
      handleViewFullScreen
    }
  }

})
</script>
