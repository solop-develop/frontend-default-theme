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
  <!-- <el-popover
    key="standard-location"
    ref="locationAddress"
    v-model="isShowedLocationForm"
    placement="left-end"
    width="455"
    trigger="click"
    style="padding: 0px !important"
  >
    <product-attribute-form
      v-if="isShowedLocationForm"
      :parent-uuid="parentUuid"
      :container-uuid="containerUuid"
      :container-manager="containerManager"
      :metadata="metadata"
    />

    <el-button
      slot="reference"
      type="text"
      style="width: 100%;"
      :disabled="isDisabled"
    >
      <el-input
        v-model="displayedValueNotEdit"
        v-bind="commonsProperties"
        @clear="clearValues"
      >
        <template slot="append">
          <i class="el-icon-delete" />
        </template>
      </el-input>
    </el-button>
  </el-popover> -->
</template>

<script>
// components and mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import mixinLocation from './mixinLocationAddress.js'
// import ProductAttributeForm from './ProductAttributeForm.vue'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'FieldLocationAddress',

  // components: {
  //   ProductAttributeForm
  // },

  mixins: [
    fieldMixin,
    mixinLocation
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
    cssClassStyle() {
      let styleClass = ' custom-field-location '
      if (!isEmptyValue(this.metadata.cssClassName)) {
        styleClass += this.metadata.cssClassName
      }

      if (this.isEmptyRequired) {
        styleClass += ' field-empty-required '
      }

      return styleClass
    },
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
        /**
         * TODO: Add DisplayColumnName (to locator's and location's fields) in entities
         * list response, to set value or empty value in fieldValue state when
         * change records with dataTable.
         */
        if (isEmptyValue(this.value)) {
          return undefined
        }

        const alo = this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: this.metadata.displayColumnName
        })
        const qlq = this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: this.metadata.columnName
        })
        console.log({ alo, qlq }, 'M_AttributeSetInstance_ID', this.metadata.columnName, this.metadata.displayColumnName)

        return this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: this.metadata.displayColumnName
        })
      },
      set(value) {
        console.log({ value })
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

  watch: {
    value(newValue, oldValue) {
      console.log({ newValue })
      // this.displayedValue = newValue
      // this.setDefaultValue()
      // if (isEmptyValue(newValue)) {
      //   this.displayedValue = undefined
      // } else {
      //   if (newValue !== oldValue) {
      //     this.displayedValue = undefined
      //     // this.setDefaultValue()
      //   }
      // }
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

// <style lang="scss">
// /**
//  * span tag as button and label text
//  */
// .button-location-show {
//   padding-top: 0px !important;
// }
// .popover-attribute {
//   padding: 0px !important
// }
// </style>
