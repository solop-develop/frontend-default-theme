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
  <span v-if="isRowCanBeEdited(dataRow)" key="field-component">
    <field-definition
      key="field-definition"
      :container-uuid="containerUuid"
      :container-manager="containerManager"
      :is-data-table="true"
      :is-show-label="false"
      :in-table="true"
      :metadata-field="{
        ...fieldAttributes,
        rowIndex: scope.$index,
        recordUuid: dataRow.UUID
      }"
      size="mini"
    />
  </span>

  <cell-display-info
    v-else
    key="info-value"
    :class="cellCssClass"
    :field-attributes="fieldAttributes"
    :data-row="dataRow"
  />
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

// components and mixins
import CellDisplayInfo from '@theme/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'

// utils and helpers methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'CellEditInfo',

  components: {
    CellDisplayInfo,
    FieldDefinition
  },

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    fieldAttributes: {
      type: Object,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    scope: {
      type: Object,
      default: () => {}
    },
    dataRow: {
      type: Object,
      default: () => {}
    }
  },

  setup(props) {
    const isReadOnly = computed(() => {
      return props.containerManager.isReadOnlyColumn({
        field: props.fieldAttributes,
        row: props.dataRow
      })
    })

    /**
     * Css class style
     */
    const cellCssClass = computed(() => {
      let classCss = ' cell-info-edit '
      if (isReadOnly.value) {
        classCss += ' cell-no-edit '
      }
      return classCss
    })

    function isRowCanBeEdited(record) {
      if (!isEmptyValue(props.parentUuid)) {
        return false
      }
      if (!record.isSelectedRow) {
        return false
      }
      if (record.isEditRow && !isReadOnly.value) {
        return true
      }
      return false
    }

    return {
      // computeds
      cellCssClass,
      // methods
      isRowCanBeEdited
    }
  }
})
</script>

<style lang="scss">
.cell-info-edit {
  width: 100%;
  display: inline-block;
}

// style in cursor if cell is no edit
.cell-no-edit {
  cursor: not-allowed !important;
}
</style>
