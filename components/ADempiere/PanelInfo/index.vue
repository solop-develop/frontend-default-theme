<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 validateng with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-container style="height: 100% !important;">
    <el-main style="padding:0px; height: 100% !important;">
      <el-tabs
        v-model="nameTab"
        type="border-card"
        style="height: 100% !important;"
        @tab-click="handleClick"
      >
        <el-tab-pane name="getRecordLogs">
          <span slot="label">
            <svg-icon icon-class="tree-table" />
            {{ $t('window.containerInfo.log.changeHistory') }}
          </span>
          <el-scrollbar class="scroll-panel-info">
            <el-descriptions :column="1">
              <el-descriptions-item label-style="{ color: #606266; font-weight: bold; }">
                <template slot="label">
                  <svg-icon icon-class="table" style="margin-right: 10px;" />
                  {{ $t('window.containerInfo.log.tableName') }}
                </template>
                <span style="color: #606266; font-weight: bold;">
                  {{ currentTab.tableName }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label-style="{ color: #606266; font-weight: bold; }">
                <template slot="label">
                  <svg-icon icon-class="user" style="margin-right: 10px;" />
                  {{ $t('window.containerInfo.log.recordID') }}
                </template>
                <span style="color: #606266; font-weight: bold;">
                  {{ currentRecordId }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label-style="{ color: #606266; font-weight: bold; }">
                <template slot="label">
                  <svg-icon icon-class="user" style="margin-right: 10px;" />
                  {{ $t('window.containerInfo.log.recordUUID') }}
                </template>
                <span style="color: #606266; font-weight: bold;">
                  {{ currentRecordUuid }}
                </span>
              </el-descriptions-item>
            </el-descriptions>
            <record-logs />
          </el-scrollbar>
        </el-tab-pane>

        <el-tab-pane name="listReference">
          <span slot="label">
            <i class="el-icon-zoom-in" />
            {{ $t('window.containerInfo.referenceRecords') }}
          </span>
          <reference-records
            :table-name="currentTab.tableName"
            :parent-uuid="currentTab.parentUuid"
            :record-uuid="currentRecordUuid"
            :tab-uuid="currentTab.uuid"
          />
        </el-tab-pane>

        <el-tab-pane name="recordAttachmentTab">
          <span slot="label">
            <i class="el-icon-paperclip" />
            {{ $t('window.containerInfo.attachment.label') }}
          </span>
          <attachment-manager
            :is-active-tab="'recordAttachmentTab' === nameTab"
            :table-name="allTabsList[0].tableName"
            :record-id="currentRecordId"
            :record-uuid="currentRecordUuid"
          />
        </el-tab-pane>

        <el-tab-pane name="recordNotesTab" style="height: 100% !important;">
          <span slot="label">
            <svg-icon icon-class="message" />
            {{ $t('window.containerInfo.notes') }}
          </span>
          <record-notes
            :table-name="allTabsList[0].tableName"
            :record-id="currentRecordId"
          />
        </el-tab-pane>

        <el-tab-pane
          v-if="isWorkflowLog"
          name="searchWorkflowHistory"
          style="height: 100% !important;"
        >
          <span slot="label">
            <svg-icon icon-class="tree-table" />
            {{ $t('window.containerInfo.workflowLog') }}
          </span>
          <workflow-logs
            :container-uuid="currentTab.containerUuid"
          />
        </el-tab-pane>

        <el-tab-pane v-if="isAccountingInfo" name="accountingInformation" style="height: 100% !important;">
          <span slot="label">
            <svg-icon icon-class="balance" style="font-size: 18px;" />
            {{ $t('window.containerInfo.accountingInformation.title') }}
          </span>
          <accounting
            :container-manager="containerManager"
            :container-uuid="currentTab.containerUuid"
            :table-name="currentTab.tableName"
            :record-id="currentRecordId"
            :record-uuid="recordUuid"
          />
        </el-tab-pane>

        <el-tab-pane v-if="!isEmptyValue(storeProduct)" name="listProductStorage" style="height: 100% !important;">
          <span slot="label">
            <svg-icon icon-class="warehouse" style="font-size: 18px;" />
            {{ $t('listStoreProduct.title') }}
          </span>
          <store-product
            :list="recordsListStoreProduct"
          />
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, computed, watch, ref } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// Components and Mixins
import Accounting from './Component/Accounting/index.vue'
import AttachmentManager from './Component/AttachmentManager/index.vue'
import RecordLogs from './Component/RecordLogs/index.vue'
import RecordNotes from './Component/RecordNotes/index.vue'
import ReferenceRecords from './Component/ReferenceRecords/index.vue'
import StoreProduct from './Component/storeProduct/index.vue'
import WorkflowLogs from './Component/workflowLogs/index.vue'

// API Request Methods
import { listProductStorage } from '@/api/ADempiere/form/storeProduct.js'

// Utils and Helper Methods
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'ContainerInfo',

  components: {
    Accounting,
    AttachmentManager,
    RecordLogs,
    RecordNotes,
    ReferenceRecords,
    StoreProduct,
    WorkflowLogs
  },

  props: {
    allTabsList: {
      type: Array,
      default: () => []
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentRecord: {
      type: Object,
      required: true
    },
    showContainerInfo: {
      type: Boolean,
      default: false
    },
    tabUuid: {
      type: String,
      default: ''
    },
    isAccountingInfo: {
      type: Boolean,
      default: false
    },
    defaultOpenedTab: {
      type: String,
      default: 'getRecordLogs'
    }
  },

  setup(props, { root }) {
    const currentRecordLogs = ref({ name: '' })
    const currentKey = ref(0)
    const typeAction = ref(0)
    const currentTabLogs = ref('0')
    const tableName = ref('')
    const nameTab = ref('getRecordLogs')
    const recordsListStoreProduct = ref([])

    if (!isEmptyValue(props.defaultOpenedTab)) {
      nameTab.value = props.defaultOpenedTab
    }

    // use getter to reactive properties

    /**
     * Computed
     * isLoadLogs
     * isWorkflowLog
     * containerInfo
     * currentTab
     * storeProduct
     * showPanelInfo
     * currentRecordUuid
     * currentRecordId
     */
    const isLoadLogs = computed(() => {
      return store.state.utils.showRecordLogs
    })

    // Container Info
    const containerInfo = computed(() => {
      const inf = store.getters.getContainerInfo
      if (inf) {
        return inf
      }
      return {}
    })

    // Current Tab
    const currentTab = computed(() => {
      if (containerInfo.value.currentTab) {
        return containerInfo.value.currentTab
      }
      return {}
    })

    // Current Record UUID
    const currentRecordUuid = computed(() => {
      if (!isEmptyValue(currentTab.value)) {
        return store.getters.getUuidOfContainer(currentTab.value.containerUuid)
      }
      return ''
    })

    // Current Record ID
    const currentRecordId = computed(() => {
      if (currentTab.value) {
        return store.getters.getIdOfContainer({
          containerUuid: currentTab.value.containerUuid,
          tableName: currentTab.value.tableName
        })
      }
      return ''
    })

    // Store Product
    const storeProduct = computed(() => {
      return store.getters.getValueOfField({
        containerUuid: currentTab.value.containerUuid,
        columnName: 'M_Product_ID'
      })
    })

    // Current window
    const storedWindow = computed(() => {
      if (currentTab.value && currentTab.value.parentUuid) {
        return store.getters.getStoredWindow(currentTab.value.parentUuid)
      }
      return {}
    })

    const isWorkflowLog = computed(() => {
      if (storedWindow.value) {
        return storedWindow.value.windowType === 'T' && currentTab.value.isParentTab
      }
      return false
    })

    // Open Container the Info
    const showPanelInfo = computed(() => {
      return store.getters.getShowLogs
    })

    /**
     * Function Infomation Panel
     * findRecordLogs @param {object} tab
     * showkey  @param {number, number} key
     * handleClick @param {object} tab
     * findListStoreProduct @param {object} params
     */

    // Record
    function findRecordLogs(tab) {
      tableName.value = root.$store.getters.getTableName(tab.parentUuid, tab.containerUuid)
      currentRecordLogs.value = root.$store.getters.getValuesView({
        parentUuid: tab.parentUuid,
        containerUuid: tab.containerUuid,
        format: 'object'
      })
    }

    // showkey
    function showkey(key, index) {
      if (key === currentKey.value && index === typeAction.value) {
        currentKey.value = 1000
      } else {
        currentKey.value = key
        typeAction.value = index
      }
    }

    function handleClick(tab, event) {
      if (tab.name === 'accountingInformation') {
        return
      }
      if (tab.name === 'listProductStorage') {
        findListStoreProduct()
        return
      }
      if (tab.name === language.t('window.containerInfo.attachment.label')) {
        tab.name = 'recordAttachmentTab'
      }
      if (tab.name === language.t('window.containerInfo.notes')) {
        tab.name = 'recordNotesTab'
      }
      if (tab.name === 'listReference') {
        tab.name = 'listReference'
        store.dispatch('getReferencesFromServer', {
          tableName: currentTab.value.tableName,
          containerUuid: currentTab.value.containerUuid,
          parentUuid: currentTab.value.parentUuid,
          recordId: currentRecordId.value,
          recordUuid: currentRecordUuid.value
        })
      }
      if (isEmptyValue(props.containerManager[tab.name])) {
        return
      }

      nameTab.value = tab.name
      props.containerManager[tab.name]({
        tableName: currentTab.value.tableName,
        containerUuid: currentTab.value.containerUuid,
        parentUuid: currentTab.value.parentUuid,
        recordId: currentRecordId.value,
        recordUuid: currentRecordUuid.value
      })
    }

    function findListStoreProduct(params) {
      listProductStorage({
        tableName: currentTab.value.tableName,
        recordId: currentRecordId.value,
        recordUuid: currentRecordUuid.value
      })
        .then(response => {
          recordsListStoreProduct.value = response.recordsList.map(record => {
            const { id, uuid, tableName, attributes } = record
            return {
              ...attributes,
              DateLastInventory: formatDate({ value: attributes.DateLastInventory }),
              id,
              uuid,
              tableName
            }
          })
        })
    }

    /**
     * Watch
     * Information Panel Observers
     */

    watch(isLoadLogs, (newValue, oldValue) => {
      if (newValue) {
        findRecordLogs(props.allTabsList[parseInt(currentTabLogs.value)])
      }
    })

    watch(showPanelInfo, (newValue, oldValue) => {
      if (newValue && newValue !== oldValue) {
        handleClick({
          name: props.defaultOpenedTab
        })
      }
    })

    watch(() => props.defaultOpenedTab, (newValue) => {
      nameTab.value = newValue
    })

    findRecordLogs(props.allTabsList[parseInt(currentTabLogs.value)])

    return {
      // Ref
      currentRecordLogs,
      currentKey,
      typeAction,
      currentTabLogs,
      tableName,
      nameTab,
      recordsListStoreProduct,
      // Computed
      isLoadLogs,
      isWorkflowLog,
      containerInfo,
      currentTab,
      storeProduct,
      showPanelInfo,
      currentRecordUuid,
      currentRecordId,
      // methods
      showkey,
      findRecordLogs,
      handleClick,
      findListStoreProduct
    }
  }

})
</script>

<style>
.scroll-panel-info {
  width: 100%;
  height: 800px;
}
</style>
