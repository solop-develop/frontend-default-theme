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
  <el-dropdown trigger="click" class="fields-display-options" size="small" @command="handleCommand">
    <span class="el-dropdown-link">
      <svg-icon icon-class="list" />
    </span>

    <el-dropdown-menu slot="dropdown" style="max-width: 300px;">
      <el-dropdown-item
        :disabled="!isHiddenFieldsList"
        command="hiddenOptionals"
      >
        <svg-icon icon-class="eye" />
        {{ $t('fieldDisplayOptions.hideOptionalFields') }}
      </el-dropdown-item>

      <el-dropdown-item
        :disabled="!isShowFields"
        command="showOptionals"
      >
        <svg-icon icon-class="eye-open" />
        {{ $t('fieldDisplayOptions.showOptionalFields') }}
      </el-dropdown-item>

      <el-dropdown-item
        :disabled="!isShowFieldsWithValue"
        command="showOptionalsValue"
      >
        <svg-icon icon-class="eye-open" />
        {{ $t('fieldDisplayOptions.showOptionalFieldsWithValue') }}
      </el-dropdown-item>
      <el-dropdown-item v-if="!isMobile" :command="2">
        <svg-icon :icon-class="iconColumn(2)" />
        Mostrar 2 Columnas
      </el-dropdown-item>
      <el-dropdown-item v-if="!isMobile" :command="3">
        <svg-icon :icon-class="iconColumn(3)" />
        Mostrar 3 Columnas
      </el-dropdown-item>
      <el-dropdown-item v-if="!isMobile" :command="4">
        <svg-icon :icon-class="iconColumn(4)" />
        Mostrar 4 Columnas
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { computed, defineComponent } from '@vue/composition-api'
import store from '@/store'

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
    }
  },

  setup(props) {
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

    function iconColumn(column) {
      if (column === currentColumnSize.value) {
        return 'eye-open' 
      }
      return 'eye' 
    }

    const handleCommand = (command) => {
      let fieldsShowed = []
      if (typeof command === 'number') {
        store.dispatch('changeSizeField', {
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid,
          sizeField: command
        })
        return
      }
      if (command === 'showOptionals') {
        fieldsShowed = fieldsListAvailable.value
      }
      if (command === 'showOptionalsValue') {
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
      // computeds
      isShowFields,
      isShowFieldsWithValue,
      isHiddenFieldsList,
      currentColumnSize,
      isMobile,
      // methods
      handleCommand,
      iconColumn
    }
  }
})
</script>

<style scoped lang="scss">
  .fields-display-options {
    padding-left: 5px;
  }
</style>
