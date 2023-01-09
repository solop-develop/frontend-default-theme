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
  <el-button-group>
    <el-button
      v-popover:info-field
      type="primary"
      icon="el-icon-warning"
      style="font-size: 24px;padding-top: 5px;padding-bottom: 5px;padding-left: 6px;padding-right: 6px;"
    />
    <el-popover
      ref="info-field"
      placement="top"
      trigger="click"
      class="popover-field-options"
      style="padding: 0px !important; max-width: 400px"
    >
      <context-info
        :field-attributes="metadata"
      />
    </el-popover>

    <el-button
      v-bind="commonsProperties"
      type="primary"
      plain
      :disabled="isDisabledButton"
      @click="startProcess"
    >
      <!-- eslint-disable-next-line -->
      <component v-bind="iconProps" />
      {{ displayedValue }}
    </el-button>
  </el-button-group>
</template>

<script>
// Components and Mixins
import ContextInfo from '@theme/components/ADempiere/FieldDefinition/FieldOptions/ContextInfo'
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'

// Utils and Helpers Methods
import {
  runProcessOfWindow,
  generateReportOfWindow,
  openBrowserAssociated
} from '@/utils/ADempiere/dictionary/window.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// TODO: Add displayed value
export default {
  name: 'FieldButton',

  components: {
    ContextInfo
  },

  mixins: [
    fieldMixin
  ],

  computed: {
    isDisabledButton() {
      return this.metadata.readonly || !this.emptyValue
    },
    emptyValue() {
      return typeof this.value !== 'number' || isEmptyValue(this.value) || this.value <= 0
    },
    displayedValue() {
      if (this.emptyValue) {
        return this.metadata.name
      }

      // DisplayColumn_'ColumnName'
      const { displayColumnName: columnName, containerUuid, inTable } = this.metadata
      // table records values
      if (inTable) {
        // implement container manager row
        if (this.containerManager && this.containerManager.getCell) {
          return this.containerManager.getCell({
            containerUuid,
            rowIndex: this.metadata.rowIndex,
            columnName
          })
        }
      }

      const displayValue = this.$store.getters.getValueOfFieldOnContainer({
        parentUuid: this.metadata.parentUuid,
        containerUuid,
        columnName
      })
      if (!isEmptyValue(displayValue)) {
        return this.metadata.name + ': ' + displayValue
      }
      return this.metadata.name + ': ' + this.value
    },
    iconProps() {
      if (this.emptyValue && !isEmptyValue(this.metadata.process)) {
        if (this.metadata.process.isReport || this.metadata.process.jasperReport) {
          return {
            is: 'i',
            class: 'el-icon-data-analysis'
          }
        }

        if (this.metadata.process.browserUuid) {
          return {
            is: 'svg-icon',
            'icon-class': 'search'
          }
        }

        if (this.metadata.process.workflowUuid) {
          return {
            is: 'svg-icon',
            'icon-class': 'example'
          }
        }

        // is process
        return {
          is: 'i',
          'class': 'el-icon-setting'
        }
      }

      // button without process associated
      return {
        is: 'span'
      }
    }
  },

  // beforeMount() {
  //   if (this.metadata.displayed) {
  //     const value = this.value
  //     console.log(value, !this.isEmptyValue(this.displayedValue), this.displayedValue)
  //     if (!this.emptyValue && typeof this.value === 'number') {
  //       if (this.isEmptyValue(this.displayedValue)) {
  //         // request lookup
  //         this.getDefaultValueFromServer()
  //       }
  //     }
  //   }
  // },

  methods: {
    startProcess() {
      if (this.isEmptyValue(this.metadata.process)) {
        return
      }

      if (this.metadata.process.isReport || this.metadata.process.jasperReport) {
        generateReportOfWindow.generateReportOfWindow({
          parentUuid: this.parentUuid,
          containerUuid: this.containerUuid,
          uuid: this.metadata.process.uuid
        })
        return
      }

      if (this.metadata.process.browserUuid) {
        openBrowserAssociated.openBrowserAssociated({
          parentUuid: this.parentUuid,
          containerUuid: this.containerUuid,
          uuid: this.metadata.process.uuid,
          browserUuid: this.metadata.process.browserUuid
        })
        return
      }

      runProcessOfWindow.runProcessOfWindow({
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid,
        uuid: this.metadata.process.uuid
      })
    }
  }
}
</script>
