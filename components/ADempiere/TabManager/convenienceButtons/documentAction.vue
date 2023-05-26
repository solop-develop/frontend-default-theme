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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span
    v-if="tabAttributes.isParentTab && !isEmptyValue(additionalOptions)"
    class="document-action-main"
  >
    <el-dropdown
      v-if="tabAttributes.isParentTab && !getCurrentTab.isShowedTableRecords && !isEmptyValue(recordUuid) && !isEmptyValue(additionalOptions) && !isEmptyValue(additionalOptions.options)"
      split-button
      style="margin-left: 10px;"
      size="small"
      class="document-action"
      @click="handleCommandActions(defaultDocumentAction.value);"
      @command="handleCommandActions"
    >
      {{ defaultDocumentAction.name }}

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(documentAction, key) in documentActionsList"
          :key="key"
          :divided="key > 0"
          :command="documentAction.value"
        >
          <document-status-tag
            key="document-actions"
            size="small"
            :value="documentAction.value"
          />
          {{ documentAction.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-popover
      ref="popoverDocAction"
      v-model="isVisibleDocAction"
      trigger="click"
      placement="top"
    >
      <h3> {{ $t('workflow.changeDocumentAction') }} </h3>
      {{ displayDocumentActions(selectDocActions).description }}
      <br><br>

      <el-steps :space="200" simple>
        <el-step icon="el-icon-d-arrow-right">
          <template slot="title">
            <document-status-tag
              key="document-status"
              size="small"
              :value="currentDocStatus"
              :displayed-value="displayDocStatus.name"
            />
          </template>
        </el-step>
        <el-step icon="el-icon-d-arrow-right">
          <template slot="title">
            <document-status-tag
              key="document-actions"
              size="small"
              :value="displayDocumentActions(selectDocActions).value"
              :displayed-value="displayDocumentActions(selectDocActions).name"
            />
          </template>
        </el-step>
      </el-steps>

      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="isVisibleDocAction = false">
          {{ $t('components.dialogCancelButton') }}
        </el-button>
        <el-button type="primary" size="mini" @click="sendAction()">
          {{ $t('components.dialogConfirmButton') }}
        </el-button>
      </div>
    </el-popover>

    <!-- Current Status -->
    <document-status
      :parent-uuid="parentUuid"
      :container-uuid="tabAttributes.uuid"
      style="position: absolute; right: 7%;"
    />
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// Components and Mixins
import DocumentStatus from '@theme/components/ADempiere/TabManager/convenienceButtons/documentStatus.vue'
import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'

// Utils and Melper Methods
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import {
  refreshRecord
} from '@/utils/ADempiere/dictionary/window'
import { tagRender } from '@/utils/ADempiere/dictionary/workflow'

export default defineComponent({
  name: 'DocumentAction',

  components: {
    DocumentStatus,
    DocumentStatusTag
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
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    additionalOptions: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props) {
    /**
     * Const
     */

    const containerUuid = props.tabAttributes.uuid

    /**
     * Ref
     */

    const isVisibleDocAction = ref(false)
    const selectDocActions = ref('')
    const popoverDocAction = ref(null)
    const emptyDocAction = {
      name: '',
      value: '',
      description: ''
    }

    /**
     * Computed
     */
    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })

    const getCurrentTab = computed(() => {
      const tab = store.getters.getStoredTab(
        props.parentUuid,
        containerUuid
      )
      if (tab) {
        return tab
      }
      return props.tabAttributes
    })

    const defaultDocumentAction = computed(() => {
      return props.additionalOptions.currentDocument
    })

    const documentActionsList = computed(() => {
      return props.additionalOptions.options
    })

    const currentDocStatus = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid,
        columnName: 'DocStatus'
      })
    })

    const docStatus = computed(() => {
      return props.tabAttributes.fieldsList.find(field => field.columnName === 'DocStatus')
    })

    const displayDocStatus = computed(() => {
      let docStatus = {}
      if (!isEmptyValue(documentActionsList.value)) {
        docStatus = documentActionsList.value.find(docAction => docAction.value === currentDocStatus.value)
      }
      if (isEmptyValue(docStatus)) {
        const list = store.getters.getWorkFlowActions({ containerUuid })
        if (!isEmptyValue(list) && !isEmptyValue(list.options)) {
          docStatus = list.options.find(docStatus => docStatus.value === currentDocStatus.value)
        }
      }
      return docStatus || emptyDocAction
    })

    const isDisabledDocument = computed(() => {
      const processing = store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid,
        columnName: 'Processing'
      })
      return convertStringToBoolean(processing)
    })

    /**
     * Methods
     */

    function displayDocumentActions(nextStatus) {
      if (isEmptyValue(nextStatus))  return emptyDocAction
      const currentStatus = props.additionalOptions.options.find(docs => docs.value === nextStatus)
      if (isEmptyValue(currentStatus))  return defaultDocumentAction.value
      return currentStatus
    }

    function handleCommandActions(params) {
      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.undo')
      }

      store.dispatch('fieldListInfo', { info })
      selectDocActions.value = params
      isVisibleDocAction.value = true
    }

    function refreshCurrentRecord() {
      refreshRecord.refreshRecord({
        parentUuid: props.parentUuid,
        containerUuid
      })

      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.refresh')
      }
      store.dispatch('fieldListInfo', { info })
    }

    function sendAction() {
      isVisibleDocAction.value = false
      store.dispatch('runDocumentAction', {
        tableName: props.tabAttributes.tableName,
        recordUuid: recordUuid.value,
        containerUuid,
        docAction: selectDocActions.value,
        description: message()
      })
        .catch(error => {
          console.warn(`Error Run Doc Action: ${error.message}. Code: ${error.code}.`)
        })
        .finally(() => {
          refreshCurrentRecord()
        })
    }

    function message() {
      const selectActions = documentActionsList.value.find(action => action.value === selectDocActions.value)
      if (isEmptyValue(selectActions)) return defaultDocumentAction.value
      return selectActions.description
    }

    return {
      // Ref
      emptyDocAction,
      popoverDocAction,
      selectDocActions,
      isVisibleDocAction,
      // Computed
      docStatus,
      recordUuid,
      getCurrentTab,
      currentDocStatus,
      displayDocStatus,
      isDisabledDocument,
      documentActionsList,
      defaultDocumentAction,
      // Methods
      displayDocumentActions,
      handleCommandActions,
      sendAction,
      tagRender,
      message
    }
  }
})
</script>
