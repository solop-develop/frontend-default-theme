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
  <el-popover
    key="product-attribute"
    ref="ProductAttribute"
    v-model="isShowProductAttribute"
    class="product-attribute"
    placement="left-end"
    width="500"
    trigger="click"
  >
    <panel-product-attribute
      class="product-attribute-form"
      :parent-uuid="parentUuid"
      :container-uuid="containerUuid"
      :container-manager="containerManager"
      :metadata="metadata"
      :show="isShowProductAttribute"
    />

    <el-button
      slot="reference"
      class="button-product-attribute-show"
      type="text"
      style="width: 100%;"
      :disabled="isDisabled"
    >
      <el-input
        v-model="displayedValueNotEdit"
        v-bind="properties"
        @clear="clearValues"
      >
        <el-button slot="append">
          <svg-icon icon-class="setAttribute" />
        </el-button>
      </el-input>
    </el-button>
  </el-popover>
</template>

<script>
// components and mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import panelProductAttribute from './panelProductAttribute'

export default {
  name: 'FieldProductAttribute',

  components: {
    panelProductAttribute
  },

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

  data() {
    return {
      metadataList: [],
      isLoadingFields: false,
      timeOutFields: null,
      isCustomForm: true,
      unsubscribe: () => {}
    }
  },

  computed: {
    isShowProductAttribute: {
      get() {
        return this.$store.getters.getShowProductAttribute
      },
      set(value) {
        if (value && this.isEmptyValue(this.attributeSet) && this.metadata.tabTableName === 'M_Product') {
          this.$message({
            message: this.$t('field.emptyFieldAttribute'),
            type: 'info',
            showClose: value
          })
          this.$store.commit('setShowProductAttribute', !value)
          this.$refs.ProductAttribute.showPopper = !value
          return
        }
        this.$store.commit('setShowProductAttribute', value)
      }
    },
    displayedValueNotEdit: {
      get() {
        return this.displayedValue
      },
      set(value) {
        // emty, dont edit
      }
    },
    properties() {
      return {
        ...this.commonsProperties,
        disabled: true
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
    },
    attributeSet() {
      return this.$store.getters.getValueOfFieldOnContainer({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        columnName: 'M_AttributeSet_ID'
      })
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
