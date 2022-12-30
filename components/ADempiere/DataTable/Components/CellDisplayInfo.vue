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
  <span :class="cellCssClass">
    <document-status-tag
      v-if="fieldAttributes.isColumnDocumentStatus"
      key="document-status"
      size="small"
      :value="cellValue"
      :displayed-value="displayedValue"
    />

    <progress-percentage
      v-else-if="isPercentageColumn"
      key="percentage-status"
      :value="cellValue"
      :displayed-value="displayedValue"
    />

    <p
      v-else-if="!isEmptyValue(displayedValue) && displayedValue.length >= 23"
      key="display-column"
      style="max-height: 40px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap; margin: 5px;"
    >
      <el-popover
        placement="top-start"
        width="300"
        trigger="hover"
        :open-delay="400"
      >
        <el-row>
          <el-col :span="24" style="word-break: normal;">
            <el-button
              type="text"
              style="padding: 0px 8px;"
              icon="el-icon-document-copy"
              @click="copyContent(displayedValue)"
            />

            <div
              v-if="(!isEmptyValue(displayedValue) && fieldAttributes.componentPath === TEXT_LONG.componentPath)"
              v-markdown="displayedValue"
            />
            <template v-else>
              {{ displayedValue }}
            </template>
          </el-col>
        </el-row>
        <el-row slot="reference">
          <el-col :span="24" style="max-height: 40px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
            {{ displayedValue }}
          </el-col>
        </el-row>
      </el-popover>
    </p>

    <span v-else>
      <div
        v-if="(!isEmptyValue(displayedValue) && fieldAttributes.componentPath === TEXT_LONG.componentPath)"
        v-markdown="displayedValue"
      />

      <p v-else key="only-value" style="margin: 5px;">
        {{ displayedValue }}
      </p>
    </span>
  </span>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

// components and mixins
import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import ProgressPercentage from '@theme/components/ADempiere/ContainerOptions/ProgressPercentage.vue'

// utils and helpers methods
import { copyToClipboard } from '@/utils/ADempiere/coreUtils.js'
import { formatField } from '@/utils/ADempiere/valueFormat.js'

// constants
import { TEXT_LONG } from '@/utils/ADempiere/references'

export default defineComponent({
  name: 'CellDisplayInfo',

  components: {
    DocumentStatusTag,
    FieldDefinition,
    ProgressPercentage
  },

  props: {
    fieldAttributes: {
      type: Object,
      required: true
    },
    dataRow: {
      type: Object,
      default: () => {}
    }
  },

  setup(props) {
    const columnName = computed(() => {
      return props.fieldAttributes.columnName
    })
    const elementName = computed(() => {
      return props.fieldAttributes.elementName
    })
    const displayColumnName = computed(() => {
      return props.fieldAttributes.displayColumnName
    })

    const cellValue = computed(() => {
      return props.dataRow[columnName.value]
    })

    const displayedValue = computed(() => {
      return formatField({
        value: props.dataRow[columnName.value],
        displayedValue: props.dataRow[displayColumnName.value],
        displayType: props.fieldAttributes.displayType
      })
    })

    const cellCssClass = computed(() => {
      let classCss = ''
      if (props.fieldAttributes.componentPath === 'FieldNumber') {
        classCss += ' cell-align-right '
      }
      if (props.fieldAttributes.isColumnDocumentStatus) {
        classCss = ' cell-align-center '
      }
      return classCss
    })

    const isPercentageColumn = computed(() => {
      return [columnName.value, elementName.value].includes('TaskStatus')
    })

    function copyContent(value) {
      copyToClipboard({
        text: value,
        isShowMessage: true
      })
    }

    return {
      columnName,
      displayColumnName,
      // data
      isPercentageColumn,
      TEXT_LONG,
      // computeds
      cellValue,
      cellCssClass,
      displayedValue,
      // methods
      copyContent
    }
  }
})
</script>

<style lang="scss">
// used in cell type number
.cell-align-right {
  text-align: right !important;
}
.cell-align-center {
  text-align: center !important;
}
</style>
