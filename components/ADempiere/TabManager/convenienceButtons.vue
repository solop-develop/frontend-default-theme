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
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div v-show="isDisableOptionsTabChild" class="convenience-buttons-main">
    <el-button
      v-if="isCreateRecord"
      plain
      size="small"
      type="success"
      class="new-record-button"
      @click="newRecord()"
    >
      {{ $t('actionMenu.new') }}
    </el-button>

    <el-button
      v-if="isUndoChanges"
      plain
      size="small"
      type="info"
      class="undo-changes-button"
      @click="undoChanges()"
    >
      {{ $t('actionMenu.undo') }}
    </el-button>

    <el-button
      v-show="isRefreshRecord"
      plain
      size="small"
      type="primary"
      class="undo-changes-button"
      @click="refreshCurrentRecord()"
    >
      {{ $t('actionMenu.refresh') }}
    </el-button>

    <el-popover
      v-if="isDeleteRecord"
      v-model="isVisibleConfirmDelete"
      placement="top"
      class="delete-record-container"
    >
      <el-descriptions :title="$t('window.confirmDeleteRecord')" direction="vertical" :column="tabAttributes.identifierColumns.length" border>
        <el-descriptions-item
          v-for="(item, index) in tabAttributes.identifierColumns"
          :key="index"
          :label="item.columnName"
        >
          <li
            v-for="(record, key) in listOfRecordsToDeleted"
            :key="key"
          >
            {{ record[item.columnName] }}
          </li>
        </el-descriptions-item>
      </el-descriptions>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="isVisibleConfirmDelete = false">
          {{ $t('window.cancel') }}
        </el-button>
        <el-button
          ref="buttonConfirmDelete"
          type="primary"
          size="mini"
          @click="deleteCurrentRecord()"
        >
          {{ $t('window.confirm') }}
        </el-button>
      </div>

      <el-button
        slot="reference"
        plain
        size="small"
        type="danger"
        class="delete-record-button"
        @click="focusConfirmDelete()"
      >
        {{ $t('actionMenu.delete') }}
      </el-button>
    </el-popover>
    <el-button
      v-show="isSaveRecord"
      plain
      size="small"
      type="primary"
      :loading="isSaveRecordLoading"
      :disabled="isSaveRecordLoading"
      class="undo-changes-button"
      @click="saveChanges()"
    >
      {{ $t('actionMenu.save') }}
    </el-button>
    <span>
      <el-dropdown
        v-if="tabAttributes.isParentTab && !getCurrentTab.isShowedTableRecords && !isEmptyValue(recordUuid) && !isEmptyValue(additionalOptions) && !isEmptyValue(additionalOptions.options)"
        split-button
        @command="handleCommandActions"
      >
        <el-popover
          v-if="!isEmptyValue(currentDocStatus) && !isEmptyValue(displayDocStatus)"
          :value="showClickActions"
          placement="top"
          class="alo"
          trigger="click"
        >
          <h3> {{ '¿Está seguro de que quiere cambiar el estado de documento?' }} </h3>
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
            <el-button size="mini" type="text" @click="showClickActions = false">cancel</el-button>
            <el-button type="primary" size="mini" @click="sendAction()">confirm</el-button>
          </div>
          <el-button
            slot="reference"
            plain
            :loading="isDisabledDocument"
            size="small"
            style="padding: 0px;border: 0px;"
            :type="tagRender(additionalOptions.currentDocument)"
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
        <h3> {{ '¿Está seguro de que quiere cambiar el estado de documento?' }} </h3>

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
          <el-button size="mini" type="text" @click="visible = false">cancel</el-button>
          <el-button type="primary" size="mini" @click="sendAction()">confirm</el-button>
        </div>
        <el-button slot="reference" type="text" />
      </el-popover>
      <el-popover
        v-if="!isEmptyValue(recordUuid) && !isEmptyValue(currentDocStatus) && !isEmptyValue(displayDocStatus) && tabAttributes.isParentTab"
        trigger="hover"
        width="900"
      >
        <el-descriptions :title="docStatus.description" direction="vertical" :column="2" border>
          <template slot="extra">
            <document-status-tag
              key="document-status"
              size="small"
              :value="currentDocStatus"
              :displayed-value="displayDocStatus.name"
            />
          </template>
          <el-descriptions-item label="Acciones">
            <el-steps :active="indexStepActions" :space="500" align-center finish-status="success">
              <el-step
                v-for="(actions, key) in listActions"
                :key="key"
                :title="actions.name"
              />
            </el-steps>
          </el-descriptions-item>
        </el-descriptions>
        <el-button
          slot="reference"
          plain
          size="small"
          :type="tagRender({ value: currentDocStatus })"
          class="undo-changes-button"
          style="position: absolute;right: 6%;"
        >
          {{ displayDocStatus.name }}
        </el-button>
      </el-popover>
    </span>
  </div>
</template>

<script>
import Vue from 'vue'
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// constants
import { LOG_COLUMNS_NAME_LIST } from '@/utils/ADempiere/constants/systemColumns'

// components and mixins
import ActionMenu from '@theme/components/ADempiere/ActionMenu/index.vue'
import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'

// utils and helper methods
import { showMessage } from '@/utils/ADempiere/notification'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import {
  createNewRecord, refreshRecord, deleteRecord, undoChange
} from '@/utils/ADempiere/dictionary/window'
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat.js'

export default defineComponent({
  name: 'ConvenienceButtons',

  components: {
    ActionMenu,
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
    currentTabUuid: {
      type: String,
      default: ''
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
    const isVisibleConfirmDelete = ref(false)
    const buttonConfirmDelete = ref(null)
    const visible = ref(false)
    const showClickActions = ref(false)
    const selectDocActions = ref('')
    const isSaveRecordLoading = ref(false)

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })
    const recordParentTab = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })

    const listOfRecordsToDeleted = computed(() => {
      if (!getCurrentTab.value.isShowedTableRecords) {
        const record = store.getters.getTabCurrentRow({
          containerUuid
        })
        if (isEmptyValue(record)) {
          return []
        }
        return [record]
      }
      return selectionsRecords.value
    })

    const isDisableOptionsTabChild = computed(() => {
      if (!getCurrentTab.value.isParentTab) {
        if (store.getters.getUuidOfContainer(getCurrentTab.value.firstTabUuid)) {
          return true
        }
        return false
      }
      return true
    })

    const isSecondaryParentTab = computed(() => {
      return !isEmptyValue(props.tabAttributes.tabParentIndex) && props.tabAttributes.tabParentIndex > 0
    })

    const selectionsRecords = computed(() => {
      return props.containerManager.getSelection({
        containerUuid
      })
    })

    const isCreateRecord = computed(() => {
      if (isSecondaryParentTab.value) {
        return false
      }
      if (isExistsChanges.value) {
        return false
      }

      return createNewRecord.enabled({
        parentUuid: props.parentUuid,
        tabParentIndex: props.tabAttributes.tabParentIndex,
        containerUuid
      })
    })

    const isExistsChanges = computed(() => {
      const persistenceValues = store.getters.getPersistenceAttributesChanges({
        parentUuid: props.parentUuid,
        containerUuid,
        recordUuid: recordUuid.value
      })
      return !isEmptyValue(persistenceValues)
    })

    const isRefreshRecord = computed(() => {
      if (isEmptyValue(recordUuid.value)) {
        return false
      }
      return !isExistsChanges.value
    })

    const emptyMandatoryFields = computed(() => {
      return store.getters.getTabFieldsEmptyMandatory({
        parentUuid: props.parentUuid,
        containerUuid,
        formatReturn: false
      }).filter(itemField => {
        // omit send to server (to create or update) columns manage by backend
        return itemField.isAlwaysUpdateable ||
          !LOG_COLUMNS_NAME_LIST.includes(itemField.columnName)
      }).map(itemField => {
        return itemField.name
      })
    })

    const isSaveRecord = computed(() => {
      if (!isEmptyValue(emptyMandatoryFields.value)) {
        return false
      }

      return isExistsChanges.value
    })

    const isDeleteRecord = computed(() => {
      if (isExistsChanges.value) {
        return false
      }
      return deleteRecord.enabled({
        parentUuid: props.parentUuid,
        tabParentIndex: props.tabAttributes.tabParentIndex,
        containerUuid
      })
    })

    const isUndoChanges = computed(() => {
      if (!isEmptyValue(recordUuid.value)) {
        return isExistsChanges.value
      }

      // without old record
      const oldRecordUuid = store.getters.getCurrentRecordOnPanel(containerUuid)
      return !isEmptyValue(oldRecordUuid) || isExistsChanges.value
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

    const isDisabledDocument = computed(() => {
      const processing = store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid,
        columnName: 'Processing'
      })
      return convertStringToBoolean(processing)
    })

    const displayDocStatus = computed(() => {
      if (isEmptyValue(listActions.value)) {
        return {
          name: ''
        }
      }
      return listActions.value.find(docs => docs.value === currentDocStatus.value)
    })

    const listActions = computed(() => {
      const list = store.getters.getWorkFlowActions({ containerUuid })
      if (isEmptyValue(list)) {
        return []
      }
      return list.options
    })

    const indexStepActions = computed(() => {
      if (isEmptyValue(listActions.value)) {
        return 0
      }
      return listActions.value.findIndex(docs => docs.value === currentDocStatus.value)
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

    function newRecord() {
      createNewRecord.createNewRecord({
        parentUuid: props.parentUuid,
        containerUuid
      })
      if (getCurrentTab.value.isShowedTableRecords) {
        store.dispatch('changeTabAttribute', {
          attributeName: 'isShowedTableRecords',
          attributeNameControl: undefined,
          attributeValue: false,
          parentUuid: props.parentUuid,
          containerUuid
        })
      }

      this.$store.dispatch('panelInfo', {
        currentTab: props.tabAttributes,
        currentRecord: recordParentTab.value
      })
      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.new')
      }
      this.$store.dispatch('fieldListInfo', { info })
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
      this.$store.dispatch('fieldListInfo', { info })
    }

    function focusConfirmDelete() {
      if (buttonConfirmDelete.value) {
        Vue.nextTick(() => {
          // TODO: Doesn't work, focus confirm button with displayed popover.
          // buttonConfirmDelete.value.$el.focus()
        })
      }
    }

    function deleteCurrentRecord() {
      if (getCurrentTab.value.isShowedTableRecords && !isEmptyValue(selectionsRecords.value)) {
        store.dispatch('deleteSelectedRecordsFromWindow', {
          parentUuid: props.parentUuid,
          containerUuid
        })
        isVisibleConfirmDelete.value = false
        return
      }

      const info = {
        fieldsList: props.tabAttributes.fieldsList,
        option: language.t('actionMenu.delete')
      }
      this.$store.dispatch('fieldListInfo', { info })
      deleteRecord.deleteRecord({
        parentUuid: props.parentUuid,
        containerUuid,
        recordUuid: recordUuid.value
      })
      isVisibleConfirmDelete.value = false
    }

    function undoChanges() {
      // this.$store.dispatch('fieldListInfo', {
      //   fieldsList: props.tabAttributes.fieldsList,
      //   option: language.t('actionMenu.undo')
      // })
      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.undo')
      }

      this.$store.dispatch('fieldListInfo', { info })
      undoChange.undoChange({
        parentUuid: props.parentUuid,
        containerUuid
      })
    }

    function saveChanges() {
      const emptyMandatory = emptyMandatoryFields.value

      if (!isEmptyValue(emptyMandatory)) {
        showMessage({
          message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory,
          type: 'info'
        })
        return
      }

      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.save')
      }

      this.$store.dispatch('fieldListInfo', { info })
      isSaveRecordLoading.value = true

      store.dispatch('flushPersistenceQueue', {
        parentUuid: props.parentUuid,
        containerUuid,
        tableName: props.tabAttributes.tableName,
        recordUuid: recordUuid.value
      })
        .catch(error => {
          console.error('Error saving record', error.message)
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
        .finally(() => {
          isSaveRecordLoading.value = false
        })
    }

    function openLog() {
      const list = store.getters.getTabRecordsList({ containerUuid })
      const currentRecord = list.find(row => row.UUID === recordUuid.value)
      store.dispatch('showLogs', {
        tableName: props.tabAttributes.tableName,
        recordUuid: recordUuid.value,
        containerUuid,
        currentRecord,
        show: true
      })
    }

    function handleCommandActions(params) {
      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.undo')
      }

      this.$store.dispatch('fieldListInfo', { info })
      selectDocActions.value = params
      visible.value = true
    }

    function handleClickdActions(docsAction) {
      const info = {
        fieldsList: props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: containerUuid
        }),
        option: language.t('actionMenu.undo')
      }

      this.$store.dispatch('fieldListInfo', { info })
      selectDocActions.value = docsAction
      showClickActions.value = true
    }

    /**
     * Vuex subscription when record parent change
     * TODO: Add support to restart or delete timer by flushPersistenceQueue
     */
    // const unsubscribeChangeParentRecord = () => {}

    // unsubscribeChangeParentRecord = store.subscribeAction({
    //   before: (action, state) => {
    //     if (action.type === 'addKeyPressed' && action.payload && action.payload.containerUuid === containerUuid) {
    //       // restart timer
    //     }
    //   }
    // })

    // remove susbscriptions
    // onUnmounted(() => {
    //   unsubscribeChangeParentRecord()
    // })

    function tagRender(typeDoc) {
      let type = 'info'

      switch (typeDoc.value) {
        case 'AP':
          type = 'success'
          break

        case 'CO':
          type = 'success'
          break

        case '??':
        case 'DR':
          type = 'info'
          break

        case 'CL':
          type = 'primary'
          break
        case 'IP':
          type = 'warning'
          break

        case 'WC':
        case 'WP':
          type = 'warning'
          break

        case 'VO':
          type = 'danger'
          break

        case 'NA':
        case 'IN':
        case 'RE':
          type = 'danger'
          break
        default:
          type = ''
          break
      }
      return type
    }

    function displayDocumentActions(nextStatus) {
      if (isEmptyValue(nextStatus)) {
        return {
          name: '',
          value: ''
        }
      }
      return props.additionalOptions.options.find(docs => docs.value === nextStatus)
    }

    function sendAction(params) {
      visible.value = false
      showClickActions.value = false
      store.dispatch('changeActionsDoc', {
        tableName: props.tabAttributes.tableName,
        uuid: recordUuid.value,
        docAction: selectDocActions.value
      })
      setTimeout(() => {
        refreshCurrentRecord()
      }, 7000)
    }

    return {
      buttonConfirmDelete,
      isVisibleConfirmDelete,
      visible,
      showClickActions,
      selectDocActions,
      isSaveRecordLoading,
      // computed
      recordUuid,
      selectionsRecords,
      isCreateRecord,
      isExistsChanges,
      isDeleteRecord,
      isRefreshRecord,
      isUndoChanges,
      getCurrentTab,
      isDisableOptionsTabChild,
      recordParentTab,
      isSaveRecord,
      listOfRecordsToDeleted,
      isDisabledDocument,
      currentDocStatus,
      docStatus,
      displayDocStatus,
      listActions,
      indexStepActions,
      // methods
      newRecord,
      deleteCurrentRecord,
      focusConfirmDelete,
      refreshCurrentRecord,
      undoChanges,
      saveChanges,
      openLog,
      tagRender,
      displayDocumentActions,
      handleCommandActions,
      handleClickdActions,
      sendAction
    }
  }

})
</script>

<style lang="scss" scoped>
.convenience-buttons-main {
  .delete-record-container {
    padding-left: 9px;
    padding-right: 9px;
  }
  .el-button {
    padding-left: 9px;
    padding-right: 9px;
  }
}
</style>
