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
 validateng with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-container style="height: 100% !important;">
    <el-header
      style="height: 13%;text-align: center;padding-top: 1%;"
    >
      <el-descriptions :column="1">
        <el-descriptions-item label-style="{ color: #606266; font-weight: bold; }">
          <template slot="label">
            <svg-icon icon-class="tab" style="margin-right: 10px;" />
            {{ $t('window.containerInfo.log.tab') }}
          </template>
          <span style="color: #606266; font-weight: bold;">
            {{ currentTab.name }}
          </span>
        </el-descriptions-item>
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
            {{ currentRecordInfo[currentTab.tableName + '_ID'] }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label-style="{ color: #606266; font-weight: bold; }">
          <template slot="label">
            <svg-icon icon-class="user" style="margin-right: 10px;" />
            {{ $t('window.containerInfo.log.recordUUID') }}
          </template>
          <span style="color: #606266; font-weight: bold;">
            {{ currentRecordInfo.UUID }}
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </el-header>
    <el-main style="padding:0px; height: 100% !important;">
      <el-tabs
        v-model="nameTab"
        type="border-card"
        style="height: 100% !important;"
        class="qlq"
        @tab-click="handleClick"
      >
        <el-tab-pane name="getRecordLogs">
          <span slot="label">
            <svg-icon icon-class="tree-table" />
            {{ $t('window.containerInfo.log.changeHistory') }}
          </span>
          <el-scrollbar class="scroll-panel-info">
            <record-logs />
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane name="getAttachment">
          <span slot="label">
            <i class="el-icon-paperclip" />
            {{ $t('window.containerInfo.attachment.label') }}
          </span>
          <attachment
            :is-active-tab="'getAttachment' === nameTab"
            :table-name="allTabsList[0].tableName"
            :record-id="currentRecord[allTabsList[0].tableName + '_ID']"
            :record-uuid="currentRecord.UUID"
          />
        </el-tab-pane>
        <el-tab-pane name="listChats" style="height: 100% !important;">
          <span slot="label">
            <svg-icon icon-class="message" />
            {{ $t('window.containerInfo.notes') }}
          </span>
          <chats
            :table-name="allTabsList[0].tableName"
            :record-id="currentRecord[allTabsList[0].tableName + '_ID']"
          />
        </el-tab-pane>
        <el-tab-pane v-if="isWorkflowLog" name="searchWorkflowHistory" style="height: 100% !important;">
          <span slot="label">
            <svg-icon icon-class="tree-table" />
            {{ 'Historico de WorkFlow' }}
          </span>
          <workflow-logs
            :container-uuid="currentTab.containerUuid"
          />
          <!-- <chats
            :table-name="allTabsList[0].tableName"
            :record-id="currentRecord[allTabsList[0].tableName + '_ID']"
          /> -->
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, computed, watch, ref } from '@vue/composition-api'

import store from '@/store'

// components and mixins
import { DOCUMENT_STATUS_COLUMNS_LIST } from '@/utils/ADempiere/constants/systemColumns'
import Attachment from './Component/Attachment/index.vue'
import RecordLogs from './Component/RecordLogs/index.vue'
import Chats from './Component/chats/index.vue'
import workflowLogs from './Component/workflowLogs/index.vue'

export default defineComponent({
  name: 'ContainerInfo',

  components: {
    RecordLogs,
    Attachment,
    Chats,
    workflowLogs
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
    }
  },

  setup(props, { root }) {
    const currentRecordLogs = ref({ name: 'nada' })
    const listLogs = ref({})
    const currentKey = ref(0)
    const typeAction = ref(0)
    const currentTabLogs = ref('0')
    const tableName = ref('')
    const nameTab = ref('getRecordLogs')

    // use getter to reactive properties

    const openInfo = computed(() => {
      return props.showContainerInfo
    })
    const isLoadLogs = computed(() => {
      return store.state.utils.showRecordLogs
    })

    /**
     * Container Info
     */
    const containerInfo = computed(() => {
      const inf = store.getters.getContainerInfo
      if (inf) {
        return inf
      }
      return {}
    })

    /**
     * Current Tab
     */
    const currentTab = computed(() => {
      if (containerInfo.value.currentTab) {
        return containerInfo.value.currentTab
      }
      return {}
    })

    /**
     * Current window
     */
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

    /**
     * Current Record
     */
    const currentRecordInfo = computed(() => {
      if (containerInfo.value.currentRecord) {
        return containerInfo.value.currentRecord
      }
      return {}
    })

    /**
     * Record
     */
    const findRecordLogs = (tab) => {
      tableName.value = root.$store.getters.getTableName(tab.parentUuid, tab.containerUuid)
      currentRecordLogs.value = root.$store.getters.getValuesView({
        parentUuid: tab.parentUuid,
        containerUuid: tab.containerUuid,
        format: 'object'
      })
    }

    watch(isLoadLogs, (newValue, oldValue) => {
      if (newValue) {
        findRecordLogs(props.allTabsList[parseInt(currentTabLogs.value)])
      }
    })

    watch(openInfo, (newValue, oldValue) => {
      if (newValue && newValue !== oldValue && nameTab.value !== 'getRecordLogs') {
        handleClick({
          name: nameTab.value
        })
      }
    })

    findRecordLogs(props.allTabsList[parseInt(currentTabLogs.value)])

    /**
     * showkey
     */
    const showkey = (key, index) => {
      if (key === currentKey.value && index === typeAction.value) {
        currentKey.value = 1000
      } else {
        currentKey.value = key
        typeAction.value = index
      }
    }
    const handleClickLogs = (tabHTML) => {
      findRecordLogs(props.allTabsList[parseInt(currentTabLogs.value)])
    }
    const validate = (list) => {
      return DOCUMENT_STATUS_COLUMNS_LIST.includes(list.columnName)
    }
    /**
     * Listar Historico de cambios
     */
    const openRecordLogs = (a) => {
      drawer.value = !drawer.value
    }
    const handleClick = (tab, event) => {
      nameTab.value = tab.name
      props.containerManager[tab.name]({
        tableName: currentTab.value.tableName,
        containerUuid: currentTab.value.containerUuid,
        recordId: currentRecordInfo.value[currentTab.value.tableName + '_ID'],
        recordUuid: currentRecordInfo.value.UUID
      })
    }
    const drawer = ref(false)

    return {
      currentTabLogs,
      drawer,
      nameTab,
      currentRecordLogs,
      currentKey,
      isLoadLogs,
      isWorkflowLog,
      listLogs,
      tableName,
      containerInfo,
      currentRecordInfo,
      currentTab,
      // methods
      validate,
      showkey,
      findRecordLogs,
      handleClick,
      handleClickLogs,
      openRecordLogs
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
