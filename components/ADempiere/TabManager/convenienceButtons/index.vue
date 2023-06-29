<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
  <div v-show="isDisableOptionsTabChild" class="convenience-buttons-main">
    <el-button
      v-if="isCreateRecord"
      plain
      size="small"
      type="success"
      class="new-record-button"
      @click="newRecord()"
    >
      <svg-icon icon-class="newRecord" />
      <span v-if="!isMobile">
        {{ $t('actionMenu.new') }}
      </span>
    </el-button>

    <el-button
      v-if="isUndoChanges"
      plain
      size="small"
      type="warning"
      class="undo-changes-button"
      @click="undoChanges()"
    >
      <svg-icon icon-class="undo" />
      <span v-if="!isMobile">
        {{ $t('actionMenu.undo') }}
      </span>
    </el-button>

    <el-button
      v-show="isRefreshRecord"
      plain
      size="small"
      type="primary"
      class="undo-changes-button"
      @click="refreshCurrentRecord()"
    >
      <svg-icon icon-class="refresh" />
      <span v-if="!isMobile">
        {{ $t('actionMenu.refresh') }}
      </span>
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
          :label="item.name"
        >
          <cell-display-info
            v-for="(record, key) in listOfRecordsToDeleted"
            :key="key"
            :field-attributes="item"
            :data-row="record"
          />
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
        <svg-icon icon-class="delete" />
        <span v-if="!isMobile">
          {{ $t('actionMenu.delete') }}
        </span>
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
      <svg-icon icon-class="save-AD" />
      <span v-if="!isMobile">
        {{ $t('actionMenu.save') }}
      </span>
    </el-button>

    <document-action
      v-if="tabAttributes.isDocument"
      :parent-uuid="parentUuid"
      :container-manager="containerManager"
      :tab-attributes="tabAttributes"
      :fields-list="fieldsListPanelInfo"
    />

    <advanced-tab-query
      :parent-uuid="parentUuid"
      :container-uuid="tabAttributes.uuid"
      :fields-list="fieldsListPanelInfo"
      :container-manager="containerManager"
      style="float: right;"
    />

  </div>
</template>

<script>
import Vue from 'vue'
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'
import router from '@/router'
import language from '@/lang'

// Components and Mixins
// import AdvancedTabQuery from '@theme/components/ADempiere/TabManager/AdvancedTabQuery.vue'
import CellDisplayInfo from '@theme/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'
import DocumentAction from '@theme/components/ADempiere/TabManager/convenienceButtons/documentAction.vue'
import AdvancedTabQuery from '@theme/components/ADempiere/TabManager/AdvancedTabQuery.vue'
// Constants
import { LOG_COLUMNS_NAME_LIST } from '@/utils/ADempiere/constants/systemColumns'

// Utils and Melper Methods
import { showMessage } from '@/utils/ADempiere/notification'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import {
  createNewRecord,
  refreshRecord,
  deleteRecord,
  undoChange
} from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'ConvenienceButtons',

  components: {
    AdvancedTabQuery,
    CellDisplayInfo,
    DocumentAction
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
    }
  },

  setup(props) {
    const containerUuid = props.tabAttributes.uuid
    const isVisibleConfirmDelete = ref(false)
    const buttonConfirmDelete = ref(null)
    const isSaveRecordLoading = ref(false)

    const currentRoute = router.app._route

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })
    const recordParentTab = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
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

    const fieldsListPanelInfo = computed(() => {
      return props.containerManager.getFieldsList({
        parentUuid: props.parentUuid,
        containerUuid: containerUuid
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

    function newRecord() {
      createNewRecord.createNewRecord({
        parentUuid: props.parentUuid,
        containerUuid
      })

      store.dispatch('panelInfo', {
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
      store.dispatch('fieldListInfo', { info })
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
      store.dispatch('fieldListInfo', { info })
      deleteRecord.deleteRecord({
        parentUuid: props.parentUuid,
        containerUuid,
        recordUuid: recordUuid.value
      })
      isVisibleConfirmDelete.value = false
    }

    function undoChanges() {
      // store.dispatch('fieldListInfo', {
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

      store.dispatch('fieldListInfo', { info })
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

      store.dispatch('fieldListInfo', { info })
      isSaveRecordLoading.value = true

      store.dispatch('flushPersistenceQueue', {
        parentUuid: props.parentUuid,
        containerUuid,
        tableName: props.tabAttributes.tableName,
        recordUuid: recordUuid.value
      })
        .then(response => {
          const {
            name,
            query,
            params
          } = currentRoute
          const { id } = response
          // refresh parent tab on document window
          if (!props.tabAttributes.isParentTab) {
            const { firstTabUuid } = props.tabAttributes
            const firstTab = store.getters.getStoredTab(
              props.parentUuid,
              firstTabUuid
            )
            if (!isEmptyValue(firstTab) && firstTab.isDocument) {
              refreshRecord.refreshRecord({
                parentUuid: props.parentUuid,
                containerUuid: firstTabUuid
              })
            }
          }

          router.replace({
            name,
            query: {
              ...query,
              recordId: id,
              filters: []
            },
            params: {
              ...params,
              filters: []
            }
          }, () => {})
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

    return {
      buttonConfirmDelete,
      isVisibleConfirmDelete,
      isSaveRecordLoading,
      // computed
      isMobile,
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
      fieldsListPanelInfo,
      listOfRecordsToDeleted,
      // methods
      newRecord,
      deleteCurrentRecord,
      focusConfirmDelete,
      refreshCurrentRecord,
      undoChanges,
      saveChanges,
      openLog
    }
  }

})
</script>

<style lang="scss">
.convenience-buttons-main {
  display: contents;
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
