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
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
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
        <el-dropdown-item v-if="!isMobile && isShowSequence" :command="'secuencia'">
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
            <el-radio v-model="level" :label="0" :border="true">
              {{ $t('form.workflowActivity.filtersSearch.user') }}
            </el-radio>
          </template>
          <el-select
            v-model="currentUser"
            :placeholder="$t('form.workflowActivity.filtersSearch.user')"
            :disabled="level !== 0"
            filterable
            @visible-change="findListUser"
          >
            <el-option
              v-for="item in listUser"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <template slot="label">
            <el-radio v-model="level" :label="1" :border="true">
              {{ $t('profile.role') }}
            </el-radio>
          </template>
          <el-select
            v-model="currentRol"
            :placeholder="$t('profile.role')"
            :disabled="level !== 1"
            filterable
            @visible-change="findListRol"
          >
            <el-option
              v-for="item in listRol"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <template slot="label">
            <el-radio v-model="level" :label="2" :border="true">
              {{ $t('component.sequenceSort.customizationlevel') }}
            </el-radio>
          </template>
          <el-select
            v-model="customizationLevel"
            :placeholder="$t('component.sequenceSort.customizationlevel')"
            :disabled="level !== 2 "
            filterable
            @visible-change="findListCustomizations"
          >
            <el-option
              v-for="item in listCustomizationsLevel"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button
          type="danger"
          icon="el-icon-close"
          @click="close()"
        />
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="saveCustomization"
        />
      </span>
    </el-dialog>
  </span>
</template>

<script>
import {
  requestListUsers,
  requestListRoles,
  requestListCustomizationsLevel
} from '@/api/ADempiere/user-customization'

import { computed, defineComponent, ref } from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'

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

    const currentUser = ref('')
    const currentRol = ref('')
    const customizationLevel = ref('')
    const level = ref(0)

    const listUser = ref([])
    const listRol = ref([])
    const listCustomizationsLevel = ref([])
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
      const { isEditSecuence } = props.containerManager.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
      return !isEmptyValue(isEditSecuence)
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
    function close(params) {
      isSaveNewSequence.value = false
      const { isEditSecuence, uuid } = props.containerManager.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
      props.containerManager.changeSequence({
        uuid,
        attributeName: 'isEditSecuence',
        attributeNameControl: undefined,
        attributeValue: !isEditSecuence,
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
    }

    function findListUser(params) {
      // if (!isVisible) {
      //   return
      // }
      requestListUsers({})
        .then(response => {
          const { records } = response
          listUser.value = records
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }
    function findListRol(params) {
      // if (!isVisible) {
      //   return
      // }
      requestListRoles({})
        .then(response => {
          const { records } = response
          listRol.value = records
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }
    function findListCustomizations(params) {
      // if (!isVisible) {
      //   return
      // }
      requestListCustomizationsLevel({})
        .then(response => {
          const { records } = response
          listCustomizationsLevel.value = records
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
      if (level.value === 0) {
        levelId = currentUser.value
      } else if (level.value === 1) {
        levelId = currentRol.value
      } else if (level.value === 2) {
        levelId = customizationLevel.value
      }
      props.containerManager.applyCustomization({
        containerUuid: props.containerUuid,
        level: level.value,
        levelId,
        // levelUuid,
        fieldAttributes: props.fieldsCustomization
      })
        .then(response => {
          const { uuid } = props.containerManager.getPanel({
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid
          })
          props.containerManager.changeSequence({
            uuid,
            attributeName: 'fieldsList',
            attributeNameControl: undefined,
            attributeValue: props.newFieldsListSecuence,
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid
          })
          showMessage({
            message: response,
            type: 'success'
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
      close()
    }

    const handleCommand = (command) => {
      let fieldsShowed = []
      if (command === 'secuencia' && sequenceOptionLabel.value === language.t('component.sequenceSort.modifyFieldSequence')) {
        fieldsShowed = fieldsListAvailable.value
        const { isEditSecuence, uuid } = props.containerManager.getPanel({
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid
        })
        props.containerManager.changeSequence({
          uuid,
          attributeName: 'isEditSecuence',
          attributeNameControl: undefined,
          attributeValue: !isEditSecuence,
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid
        })

        return
      }
      if (command === 'secuencia' && sequenceOptionLabel.value === language.t('component.sequenceSort.saveNewSequence')) {
        findListUser()
        findListRol()
        isSaveNewSequence.value = true
        currentUser.value = store.getters['user/userInfo'].id
        currentRol.value = store.getters['user/getRole'].id

        return
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

    return {
      // ref
      isSaveNewSequence,
      currentUser,
      currentRol,
      customizationLevel,
      level,
      listUser,
      listRol,
      listCustomizationsLevel,
      // computeds
      isShowFields,
      isShowFieldsWithValue,
      isHiddenFieldsList,
      currentColumnSize,
      isMobile,
      sequenceOptionLabel,
      isShowSequence,
      // methods
      saveCustomization,
      close,
      handleCommand,
      iconColumn,
      findListUser,
      findListRol,
      findListCustomizations
    }
  }
})
</script>

<style scoped lang="scss">
  .fields-display-options {
    padding-left: 5px;
  }
</style>
