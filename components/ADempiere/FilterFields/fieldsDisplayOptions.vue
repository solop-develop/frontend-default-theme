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
  <span>
    <el-dropdown trigger="click" class="fields-display-options" size="small" @command="handleCommand">
      <span class="el-dropdown-link">
        <svg-icon icon-class="list" />
      </span>

      <el-dropdown-menu slot="dropdown" style="max-width: 300px;">
        <el-dropdown-item
          :disabled="!isHiddenFieldsList"
          command="minimalistView"
        >
          <i class="el-icon-menu" />
          {{ $t('fieldDisplayOptions.minimalistView') }}
        </el-dropdown-item>

        <el-dropdown-item
          :disabled="!isShowFieldsWithValue"
          command="showWithValue"
        >
          <svg-icon icon-class="component" />
          {{ $t('fieldDisplayOptions.showFieldsWithValue') }}
        </el-dropdown-item>

        <el-dropdown-item
          :disabled="!isShowFields"
          command="showAll"
        >
          <i class="el-icon-s-grid" />
          {{ $t('fieldDisplayOptions.showAllFields') }}
        </el-dropdown-item>

        <el-dropdown-item v-if="!isMobile" :command="2">
          <svg-icon :icon-class="iconColumn(2)" />
          {{ $t('fieldDisplayOptions.Show2Columns') }}
        </el-dropdown-item>
        <el-dropdown-item v-if="!isMobile" :command="3">
          <svg-icon :icon-class="iconColumn(3)" />
          {{ $t('fieldDisplayOptions.Show3Columns') }}
        </el-dropdown-item>
        <el-dropdown-item v-if="!isMobile" :command="4">
          <svg-icon :icon-class="iconColumn(4)" />
          {{ $t('fieldDisplayOptions.Show4Columns') }}
        </el-dropdown-item>
        <el-dropdown-item v-if="!isMobile" :command="'secuencia'">
          <i class="el-icon-sort" />
          {{ sequenceOptionLabel }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog
      :title="$t('component.sequenceSort.saveNewSequence')"
      :visible.sync="isSaveNewSequence"
    >
      <el-form :inline="true" label-position="top">
        <el-form-item>
          <template slot="label">
            <el-radio v-model="levelType" :label="0" :border="true" @change="getAvailableUsersList(true)">
              {{ $t('form.workflowActivity.filtersSearch.user') }}
            </el-radio>
          </template>
          <el-select
            v-model="currentUser"
            :placeholder="$t('form.workflowActivity.filtersSearch.user')"
            :disabled="levelType !== 0"
            filterable
            @visible-change="getAvailableUsersList"
          >
            <el-option
              v-for="item in availableUsersList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span style="float: left; margin-right: 15px;">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ isEmptyValue(item.value) ? item.description : item.value }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <template slot="label">
            <el-radio v-model="levelType" :label="1" :border="true" @change="getAvailableRolesList(true)">
              {{ $t('profile.role') }}
            </el-radio>
          </template>
          <el-select
            v-model="currentRole"
            :placeholder="$t('profile.role')"
            :disabled="levelType !== 1"
            filterable
            @visible-change="getAvailableRolesList"
          >
            <el-option
              v-for="item in availableRolesList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span style="float: left; margin-right: 15px;">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ isEmptyValue(item.value) ? item.description : item.value }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <template slot="label">
            <el-radio v-model="levelType" :label="2" :border="true" @change="getAvailableCustomizationsList(true)">
              {{ $t('component.sequenceSort.customizationlevel') }}
            </el-radio>
          </template>
          <el-select
            v-model="customizationLevel"
            :placeholder="$t('component.sequenceSort.customizationlevel')"
            :disabled="levelType !== 2 "
            filterable
            @visible-change="getAvailableCustomizationsList"
          >
            <el-option
              v-for="item in availableCustomizationsLeveList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span style="float: left; margin-right: 15px;">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ isEmptyValue(item.value) ? item.description : item.value }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button
          class="button-base-icon"
          type="danger"
          icon="el-icon-close"
          @click="closeModalDialog(); toggleDraggablePanel()"
        />
        <el-button
          class="button-base-icon"
          type="primary"
          icon="el-icon-check"
          @click="saveCustomization"
        />
      </span>
    </el-dialog>
  </span>
</template>

<script>
import { computed, defineComponent, nextTick, onMounted, ref, watch } from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'

// API Request Methods
import {
  requestListUsers,
  requestListRoles,
  requestListCustomizationsLevel
} from '@/api/ADempiere/user-customization'

export default defineComponent({
  name: 'FieldsDisplayOption',

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    availableFields: {
      type: Array,
      required: true
    },
    availableFieldsWithValue: {
      type: Array,
      required: true
    },
    showedFields: {
      type: Array,
      required: true
    },
    filterManager: {
      type: Function,
      default: ({ filterList }) => {}
    },
    containerManager: {
      type: Object,
      required: false
    },
    newFieldsListSecuence: {
      type: Array,
      default: () => []
    },
    fieldsCustomization: {
      type: Array,
      default: () => []
    }
  },

  setup(props) {
    const isSaveNewSequence = ref(false)

    const isLoadingSaveCustomization = computed({
      set(newValue) {
        props.containerManager.changePanelAttribute({
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid,
          attributeName: 'isLoadedFieldsList',
          attributeValue: !newValue
        })
      },
      get() {
        const { isLoadedFieldsList } = props.containerManager.getPanel({
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid
        })
        return !isLoadedFieldsList
      }
    })

    const currentSessionRoleId = computed(() => {
      return store.getters['user/getRole'].id
    })

    const currentSessionUserId = computed(() => {
      return store.getters['user/userInfo'].id
    })

    const currentUser = ref(currentSessionUserId.value)
    const currentRole = ref(currentSessionRoleId.value)
    const customizationLevel = ref('')
    const levelType = ref(0)

    const availableUsersList = ref([])
    const availableRolesList = ref([])
    const availableCustomizationsLeveList = ref([])

    // enabled showed optionals and mandatory fields
    const isShowFields = computed(() => {
      return props.availableFields.length > 0 &&
        props.availableFields.length > props.showedFields.length
    })

    // enabled showed optionals with value and mandatory fields
    const isShowFieldsWithValue = computed(() => {
      return props.availableFieldsWithValue.length > 0
    })

    // enabled hidden optionals fields (only mandatory))
    const isHiddenFieldsList = computed(() => {
      return props.showedFields.length > 0 &&
        props.availableFields.length > 0
    })

    const fieldsListAvailable = computed(() => {
      return props.availableFields.map(field => {
        return field.columnName
      })
    })

    const fieldsListAvailableWithValue = computed(() => {
      return props.availableFieldsWithValue.map(field => {
        return field.columnName
      })
    })

    const currentColumnSize = computed(() => {
      return store.getters.getSizeColumn({ containerUuid: props.containerUuid })
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isShowSequence = computed(() => {
      const panel = props.containerManager.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
      if (!isEmptyValue(panel)) {
        const { isEditSecuence } = panel
        return Boolean(isEditSecuence)
      }
      return false
    })

    const sequenceOptionLabel = computed(() => {
      const { isEditSecuence } = props.containerManager.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
      if (!isEmptyValue(isEditSecuence) && isEditSecuence) return language.t('component.sequenceSort.saveNewSequence')
      return language.t('component.sequenceSort.modifyFieldSequence')
    })

    function iconColumn(column) {
      if (column === currentColumnSize.value) {
        return 'eye-open'
      }
      return 'eye'
    }

    function toggleDraggablePanel(isDragAndDrop = false) {
      props.containerManager.changePanelAttribute({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        attributeName: 'isEditSecuence',
        attributeValue: isDragAndDrop
      })
    }

    function closeModalDialog(params) {
      isSaveNewSequence.value = false
    }

    function getAvailableUsersList(isShowList) {
      if (!isShowList) {
        return
      }
      if (!isEmptyValue(availableUsersList.value)) {
        return
      }
      requestListUsers({})
        .then(response => {
          const { records } = response
          availableUsersList.value = []
          nextTick(() => {
            availableUsersList.value = records
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function getAvailableRolesList(isShowList) {
      if (!isShowList) {
        return
      }
      if (!isEmptyValue(availableRolesList.value)) {
        return
      }
      requestListRoles({})
        .then(response => {
          const { records } = response
          availableRolesList.value = []
          nextTick(() => {
            availableRolesList.value = records
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function getAvailableCustomizationsList(isShowList) {
      if (!isShowList) {
        return
      }
      if (!isEmptyValue(availableCustomizationsLeveList.value)) {
        return
      }
      requestListCustomizationsLevel({})
        .then(response => {
          const { records } = response
          availableCustomizationsLeveList.value = []
          nextTick(() => {
            availableCustomizationsLeveList.value = records
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function saveCustomization() {
      let levelId
      if (levelType.value === 0) {
        levelId = currentUser.value
      } else if (levelType.value === 1) {
        levelId = currentRole.value
      } else if (levelType.value === 2) {
        levelId = customizationLevel.value
      }

      isLoadingSaveCustomization.value = true
      props.containerManager.applyCustomization({
        containerUuid: props.containerUuid,
        level: levelType.value,
        levelId,
        // levelUuid,
        fieldAttributes: props.fieldsCustomization
      })
        .then(response => {
          props.containerManager.changePanelAttribute({
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid,
            attributeName: 'fieldsList',
            attributeValue: props.newFieldsListSecuence
          })
          showMessage({
            message: response,
            type: 'success'
          })

          toggleDraggablePanel(false)
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
        .finally(() => {
          isLoadingSaveCustomization.value = false
        })
      closeModalDialog()
    }

    const handleCommand = (command) => {
      let fieldsShowed = []
      if (command === 'secuencia') {
        if (sequenceOptionLabel.value === language.t('component.sequenceSort.modifyFieldSequence')) {
          fieldsShowed = fieldsListAvailable.value
          const { isEditSecuence } = props.containerManager.getPanel({
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid
          })
          toggleDraggablePanel(!isEditSecuence)
          return
        }
        if (sequenceOptionLabel.value === language.t('component.sequenceSort.saveNewSequence')) {
          isSaveNewSequence.value = true
          return
        }
      }
      if (typeof command === 'number') {
        store.dispatch('changeSizeField', {
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid,
          sizeField: command
        })
        return
      }
      if (command === 'showAll') {
        fieldsShowed = fieldsListAvailable.value
      }
      if (command === 'showWithValue') {
        fieldsShowed = fieldsListAvailableWithValue.value
      }

      props.filterManager({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        fieldsShowed,
        fieldsList: props.availableFields
      })
    }

    onMounted(() => {
      if (levelType === 0) {
        getAvailableUsersList(true)
      } else if (levelType === 1) {
        getAvailableRolesList(true)
      } else if (levelType === 2) {
        getAvailableCustomizationsList(true)
      }
    })

    watch(isSaveNewSequence, (newValue) => {
      if (newValue) {
        getAvailableUsersList(true)
        getAvailableRolesList(true)
      }
    })

    return {
      // ref
      isSaveNewSequence,
      isLoadingSaveCustomization,
      currentUser,
      currentRole,
      customizationLevel,
      levelType,
      availableUsersList,
      availableRolesList,
      availableCustomizationsLeveList,
      // computeds
      currentSessionRoleId,
      currentSessionUserId,
      isShowFields,
      isShowFieldsWithValue,
      isHiddenFieldsList,
      currentColumnSize,
      isMobile,
      sequenceOptionLabel,
      isShowSequence,
      // methods
      saveCustomization,
      closeModalDialog,
      handleCommand,
      iconColumn,
      getAvailableUsersList,
      getAvailableRolesList,
      getAvailableCustomizationsList,
      toggleDraggablePanel
    }
  }
})
</script>

<style scoped lang="scss">
  .fields-display-options {
    padding-left: 5px;
  }
</style>
