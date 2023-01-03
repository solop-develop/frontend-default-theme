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
      class="document-action"
      @click="showClickActions = true"
      @command="handleCommandActions"
    >
      <el-popover
        v-if="!isEmptyValue(currentDocStatus) && !isEmptyValue(displayDocStatus)"
        :value="showClickActions"
        placement="top"
        trigger="click"
      >
        <h3> {{ $t('workflow.changeDocumentAction') }} </h3>

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
          <el-button size="mini" type="text" @click="showClickActions = false">
            {{ $t('components.dialogCancelButton') }}
          </el-button>
          <el-button type="primary" size="mini" @click="sendAction()">
            {{ $t('components.dialogConfirmButton') }}
          </el-button>
        </div>

        <el-button
          slot="reference"
          plain
          :loading="isDisabledDocument"
          size="small"
          style="padding: 0px;border: 0px;"
          :type="tagRender(additionalOptions.currentDocument.value).type"
          @click="handleClickdActions(additionalOptions.currentDocument.value)"
        >
          {{ additionalOptions.currentDocument.name }}
        </el-button>
      </el-popover>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(documents, key) in additionalOptions.options"
          :key="key"
          :command="documents.value"
        >
          {{ documents.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-popover
      v-if="tabAttributes.isParentTab && !getCurrentTab.isShowedTableRecords && !isEmptyValue(recordUuid) && !isEmptyValue(currentDocStatus) && !isEmptyValue(displayDocStatus)"
      v-model="visible"
      placement="top"
    >
      <h3> {{ $t('workflow.changeDocumentAction') }} </h3>

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
        <el-button size="mini" type="text" @click="visible = false">
          {{ $t('components.dialogCancelButton') }}
        </el-button>
        <el-button type="primary" size="mini" @click="sendAction()">
          {{ $t('components.dialogConfirmButton') }}
        </el-button>
      </div>
      <el-button slot="reference" type="text" />
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
    const containerUuid = props.tabAttributes.uuid
    const visible = ref(false)
    const selectDocActions = ref('')
    const showClickActions = ref(false)

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

    const listActions = computed(() => {
      const list = store.getters.getWorkFlowActions({ containerUuid })
      if (isEmptyValue(list)) {
        return []
      }
      return list.options
    })

    const displayDocStatus = computed(() => {
      if (isEmptyValue(listActions.value)) {
        return {
          name: ''
        }
      }
      return listActions.value.find(docs => docs.value === currentDocStatus.value)
    })

    const isDisabledDocument = computed(() => {
      const processing = store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid,
        columnName: 'Processing'
      })
      return convertStringToBoolean(processing)
    })

    function displayDocumentActions(nextStatus) {
      if (isEmptyValue(nextStatus)) {
        return {
          name: '',
          value: ''
        }
      }
      const currentStatus = props.additionalOptions.options.find(docs => docs.value === nextStatus)
      // if (isEmptyValue(currentStatus)) {
      //   return {
      //     name: '',
      //     value: ''
      //   }
      // }
      return currentStatus
    }

    function handleClickdActions(docsAction) {
      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.undo')
      }

      store.dispatch('fieldListInfo', { info })
      selectDocActions.value = docsAction
      showClickActions.value = true
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

    function sendAction(params) {
      visible.value = false
      showClickActions.value = false
      store.dispatch('changeActionsDoc', {
        tableName: props.tabAttributes.tableName,
        uuid: recordUuid.value,
        containerUuid,
        docAction: selectDocActions.value
      })
        .then(response => {
          refreshCurrentRecord()
        })
        .catch(error => {
          console.warn(`Error Run Doc Action: ${error.message}. Code: ${error.code}.`)
        })

      setTimeout(() => {
        refreshCurrentRecord()
      }, 700)
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
      visible.value = true
    }

    return {
      currentDocStatus,
      displayDocStatus,
      listActions,
      docStatus,
      isDisabledDocument,
      recordUuid,
      selectDocActions,
      showClickActions,
      getCurrentTab,
      visible,
      //
      displayDocumentActions,
      handleClickdActions,
      handleCommandActions,
      sendAction,
      tagRender
    }
  }
})
</script>

<style lang="scss">
.document-action-main {
  .document-action {
    > div.el-button-group {
      height: 32px;
      .el-button-group > .el-button:first-child,
      .el-button-group > .el-button:not(:last-child) {
        padding-left: 15px !important;
        padding-right: 15px !important;
      }
    }
  }
}
</style>
