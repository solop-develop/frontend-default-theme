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
    <el-button
      plain
      size="small"
      type="text"
      @click="changeShowedRecords"
    >
      <span style="padding: 10px;">
        <svg-icon icon-class="table" />
        <b v-show="!isMobile">
          {{ label }}
        </b>
      </span>
    </el-button>
    <convenience-buttons
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
      :container-manager="containerManager"
      :tab-attributes="tabAttributes"
      :additional-options="adicionalesOptions"
      style="display: contents;"
    />
    <full-screen-container
      style="float: right;"
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
    />
    <action-menu
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
      :container-manager="containerManager"
      :actions-manager="listAction"
      :references-manager="referencesManager"
      style="float: right;"
    />
  </div>
  <!-- <div class="tab-options-main">
    <div style="margin-right: 0%;padding-right: 10px; float: left; display: flex;">
      <el-button
        plain
        size="small"
        type="text"
        @click="changeShowedRecords"
      >
        <span style="padding: 10px;">
          <svg-icon icon-class="table" />
          <b v-show="!isMobile">
            {{ label }}
          </b>
        </span>
      </el-button>

      <convenience-buttons
        :parent-uuid="parentUuid"
        :container-uuid="currentTabUuid"
        :container-manager="containerManager"
        :tab-attributes="tabAttributes"
        :additional-options="adicionalesOptions"
      />
    </div>

    <div style="float: right; padding-left: 1%; display: inline-flex;">
      <el-button
        plain
        size="small"
        type="text"
        @click="changeShowedRecords"
      >
        <span style="padding: 10px;">
          <svg-icon icon-class="table" />
          <b v-show="!isMobile">
            {{ label }}
          </b>
        </span>
      </el-button>
      <action-menu
        :parent-uuid="parentUuid"
        :container-uuid="currentTabUuid"
        :container-manager="containerManager"
        :actions-manager="listAction"
        :references-manager="referencesManager"
      />
    </div>
  </div> -->
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// components and mixins
import ActionMenu from '@theme/components/ADempiere/ActionMenu/index.vue'
import ConvenienceButtons from '@theme/components/ADempiere/TabManager/convenienceButtons.vue'
import FullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer'
// utils and helper methods

export default defineComponent({
  name: 'TabOptions',

  components: {
    ActionMenu,
    ConvenienceButtons,
    FullScreenContainer
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
    containerUuid: {
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
    adicionalesOptions: {
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
        withoutDefaulAction: true,
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

    const currentRecordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.tabAttributes.uuid)
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

    const label = computed(() => {
      if (isShowedTableRecords.value) {
        return language.t('window.toggleSingle')
      }
      return language.t('window.multiRecord')
    })

    function changeShowedRecords() {
      // const isSelectionRow = props.containerManager.getSelection({
      //   containerUuid: props.tabAttributes.uuid
      // })
      // isSelectionRow.sort()
      // const recordUuid = store.getters.getUuidOfContainer(props.tabAttributes.uuid)
      // if (!isEmptyValue(tabData.value.currentRowSelect) && !isEmptyValue(isSelectionRow) && currentRecordUuid.value !== isSelectionRow[isSelectionRow.length - 1].UUID) {
      //   props.containerManager.seekRecord({
      //     parentUuid: props.parentUuid,
      //     containerUuid: props.tabAttributes.uuid,
      //     row: tabData.value.currentRowSelect
      //   })
      // }
      // if (tabData.value.isShowedTableRecords && !isEmptyValue(isSelectionRow) && isSelectionRow[isSelectionRow.length - 1].UUID !== recordUuid) {
      //   props.containerManager.seekRecord({
      //     parentUuid: props.parentUuid,
      //     containerUuid: props.tabAttributes.uuid,
      //     row: isSelectionRow[isSelectionRow.length - 1]
      //   })
      // }
      // if (!tabData.value.isShowedTableRecords && !isEmptyValue(isSelectionRow) && currentRecordUuid.value !== isSelectionRow[isSelectionRow.length - 1].UUID) {
      //   props.containerManager.seekRecord({
      //     parentUuid: props.parentUuid,
      //     containerUuid: props.tabAttributes.uuid,
      //     row: isSelectionRow[isSelectionRow.length - 1]
      //   })
      // }
      const row = store.getters.getTabCurrentRow({ containerUuid: props.currentTabUuid })
      store.dispatch('changeTabAttribute', {
        attributeName: 'currentRowSelect',
        attributeNameControl: undefined,
        attributeValue: row,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
      // props.containerManager.setSelection({
      //   containerUuid: props.containerUuid,
      //   recordsSelected: [tabData.value.currentRowSelect]
      // })
      store.commit('setTabSelectionsList', {
        containerUuid: props.containerUuid,
        recordsSelected: [row]
      })
      // props.containerManager.setSelection({
      //   containerUuid: props.containerUuid,
      //   recordsSelected: [row]
      // })
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: !tabData.value.isShowedTableRecords,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
    }

    return {
      // computed
      isMobile,
      listAction,
      recordsList,
      isShowedTableRecords,
      tableHeaders,
      label,
      currentRecordUuid,
      // methods
      changeShowedRecords
    }
  }

})
</script>
