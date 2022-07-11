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
  <div v-show="isDisDisableOptionsTabChild" class="convenience-buttons-main">
    <el-button
      v-if="isCreateRecord"
      plain
      size="small"
      type="success"
      class="new-record-button"
      @click="newRecord"
    >
      {{ $t('actionMenu.new') }}
    </el-button>

    <!--
    <el-button
      v-if="isDeleteRecord"
      plain
      size="small"
      type="danger"
      class="delete-record-button"
      @click="deleteCurrentRecord"
    >
      {{ $t('actionMenu.delete') }}
    </el-button>
    -->

    <el-popover
      v-if="isDeleteRecord"
      v-model="isVisibleConfirmDelete"
      placement="top"
      class="delete-record-container"
    >
      <p>{{ $t('window.confirmDeleteRecord') }}</p>
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
      class="undo-changes-button"
      @click="saveChanges"
    >
      {{ $t('actionMenu.save') }}
    </el-button>
    <el-button
      v-if="isUndoChanges || isSaveRecord"
      plain
      size="small"
      type="info"
      class="undo-changes-button"
      @click="undoChanges"
    >
      {{ $t('actionMenu.undo') }}
    </el-button>
  </div>
</template>

<script>
import Vue from 'vue'
import { defineComponent, computed, onUnmounted, ref } from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// constants
import { LOG_COLUMNS_NAME_LIST } from '@/utils/ADempiere/constants/systemColumns'

// components and mixins
import ActionMenu from '@theme/components/ADempiere/ActionMenu/index.vue'

// utils and helper methods
import { showMessage } from '@/utils/ADempiere/notification'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { createNewRecord, deleteRecord, undoChange } from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'ConvenienceButtons',

  components: {
    ActionMenu
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

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })
    const recordParentTab = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })

    const isDisDisableOptionsTabChild = computed(() => {
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
        containerUuid: props.tabAttributes.uuid
      })
    })

    const isCreateRecord = computed(() => {
      if (isSecondaryParentTab.value) {
        return false
      }
      if (props.tabAttributes.isInsertRecord && !props.tabAttributes.isReadOnly) {
        return !isEmptyValue(recordUuid.value) // && recordUuid.value !== 'create-new'
      }

      return false
    })

    const isSaveRecord = computed(() => {
      const persistenceValues = store.getters.getPersistenceAttributes({
        containerUuid,
        recordUuid: recordUuid.value
      })

      return !isEmptyValue(persistenceValues)
    })

    const isDeleteRecord = computed(() => {
      return deleteRecord.enabled({
        parentUuid: props.parentUuid,
        tabParentIndex: props.tabAttributes.tabParentIndex,
        containerUuid
      })
    })

    const isUndoChanges = computed(() => {
      return isEmptyValue(recordUuid.value) || recordUuid.value === 'create-new'
    })

    const getCurrentTab = computed(() => {
      const tab = store.getters.getStoredTab(
        props.parentUuid,
        props.tabAttributes.uuid
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
      if (getCurrentTab.value.isShowedTableRecords) {
        store.dispatch('changeTabAttribute', {
          attributeName: 'isShowedTableRecords',
          attributeNameControl: undefined,
          attributeValue: false,
          parentUuid: props.parentUuid,
          containerUuid: props.tabAttributes.uuid
        })
      }
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
          containerUuid: props.tabAttributes.uuid
        })
        isVisibleConfirmDelete.value = false
        return
      }
      deleteRecord.deleteRecord({
        parentUuid: props.parentUuid,
        containerUuid,
        recordUuid: recordUuid.value
      })
      isVisibleConfirmDelete.value = false
    }

    function undoChanges() {
      undoChange.undoChange({
        parentUuid: props.parentUuid,
        containerUuid
      })
    }

    function saveChanges() {
      const emptyMandatory = store.getters.getTabFieldsEmptyMandatory({
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

      if (!isEmptyValue(emptyMandatory)) {
        showMessage({
          message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory,
          type: 'info'
        })
        return
      }
      store.dispatch('flushPersistenceQueue', {
        containerUuid,
        tableName: props.tabAttributes.tableName,
        recordUuid: recordUuid.value
      })
        .catch(() => {
          console.error('service worker:cannot install')
        })
    }

    /**
     * Vuex subscription when record parent change
     * TODO: Add support to restart or delete timer by flushPersistenceQueue
     */
    const unsubscribeChangeParentRecord = () => {}

    // unsubscribeChangeParentRecord = store.subscribeAction({
    //   before: (action, state) => {
    //     if (action.type === 'addKeyPressed' && action.payload && action.payload.containerUuid === containerUuid) {
    //       // restart timer
    //     }
    //   }
    // })

    // remove susbscriptions
    onUnmounted(() => {
      unsubscribeChangeParentRecord()
    })

    return {
      buttonConfirmDelete,
      isVisibleConfirmDelete,
      // computed
      recordUuid,
      selectionsRecords,
      isCreateRecord,
      isDeleteRecord,
      isUndoChanges,
      getCurrentTab,
      isDisDisableOptionsTabChild,
      recordParentTab,
      isSaveRecord,
      // methods
      newRecord,
      deleteCurrentRecord,
      focusConfirmDelete,
      undoChanges,
      saveChanges
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
