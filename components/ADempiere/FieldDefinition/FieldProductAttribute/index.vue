<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <el-input
    v-model="displayedValueNotEdit"
    v-bind="commonsProperties"
    @clear="clearValues"
  />
</template>

<script>
// components and mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'

export default {
  name: 'FieldProductAttribute',

  mixins: [
    fieldMixin
  ],

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    }
  },

  computed: {
    displayedValueNotEdit: {
      get() {
        console.log(this.displayedValue)
        return this.displayedValue
      },
      set(value) {
        // emty, dont edit
      }
    },
    displayedValue: {
      get() {
        return this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: this.metadata.displayColumnName
        })
      },
      set(value) {
        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: this.metadata.displayColumnName,
          value
        })
      }
    },
    popoverPlacement() {
      return this.metadata.popoverPlacement || 'top'
    }
  },

  methods: {
    clearValues() {
      // TODO: Clear values into form
      this.value = undefined
      this.displayedValue = undefined

      this.$store.dispatch('clearValuesOnContainer', {
        containerUuid: this.uuidForm
      })
    }
  }
}
</script>
