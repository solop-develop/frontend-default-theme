<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Yamel Senih ysenih@erpya.com www.erpya.com
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
  <el-button
    v-bind="commonsProperties"
    type="primary"
    plain
    @click="startProcess"
  >
    <!-- eslint-disable-next-line -->
    <component v-bind="iconProps" />
    {{ metadata.name }}
  </el-button>
</template>

<script>
// components and mixins
import fieldMixin from '@theme/components/ADempiere/Field/mixin/mixinField.js'

// utils and helpers methods
import {
  runProcessOfWindow,
  generateReportOfWindow,
  openBrowserAssociated
} from '@/utils/ADempiere/dictionary/window.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// TODO: Add displayed value
export default {
  name: 'FieldButton',

  mixins: [
    fieldMixin
  ],

  computed: {
    iconProps() {
      if (!isEmptyValue(this.metadata.process)) {
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
