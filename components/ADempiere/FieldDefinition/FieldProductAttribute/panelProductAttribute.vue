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
  <div class="wrapper">
    <el-tabs
      v-model="activeName"
      type="border-card"
      @tab-click="optionsAttribute"
    >
      <el-tab-pane name="setAttribute" label="Nuevo/Editar registro">
        <el-form
          v-shortkey="{ closeForm: ['esc'] }"
          size="small"
        >
          <el-row v-if="!isEmptyValue(panelAttribute)" :gutter="0">
            <el-col v-for="attribute in panelAttribute" :key="attribute.id" :span="24">
              <el-form-item :label="attribute.name">
                <el-input
                  v-if="attribute.value_type === 'S'"
                  v-model="attribute.value"
                />
                <el-input-number
                  v-else-if="attribute.value_type === 'N'"
                  v-model="attribute.value"
                  controls-position="right"
                />
                <el-select
                  v-else-if="attribute.value_type === 'L'"
                  v-model="attribute.value"
                  style="display: flex;"
                >
                  <el-option
                    v-for="item in attribute.product_attribute_values"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-show="!metadata.pos" :span="24" class="location-address-footer">
              <samp style="float: right; padding-top: 4px;">
                <el-button
                  type="danger"
                  icon="el-icon-close"
                  @click="close"
                />

                <el-button
                  type="primary"
                  icon="el-icon-check"
                  @click="save(panelAttribute)"
                />
              </samp>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane
        name="listProductAttribute"
        label="Seleccionar registro existente"
      >
        <el-form
          v-shortkey="{ closeForm: ['esc'] }"
          label-position="top"
          size="small"
          class="location-address"
        >
          <list-table
            :list-data="listDataAttribute"
            :parent-uuid="parentUuid"
            :container-uuid="containerUuid"
            :container-manager="containerManager"
            :metadata="metadata"
          />
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
// Components
import ListTable from './listTable'
// Api
import {
  listProductAttributesSetInstances,
  getProductAttribute,
  getProductAttributeSetInstace,
  createProductAttributeSetInstance
} from '@/api/ADempiere/form/productAttribute'
import { isEmptyValue } from '@/utils/ADempiere'
import { UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX } from '@/utils/ADempiere/dictionaryUtils'

export default {
  name: 'PanelProductAttribute',
  components: {
    ListTable
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
    containerManager: {
      type: Object,
      required: true
    },
    metadata: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      value: '',
      metadataList: [],
      listDataAttribute: [],
      isLoadingFields: false,
      activeName: 'setAttribute',
      timeOutFields: null,
      isCustomForm: true,
      panelAttribute: [],
      listSetInstace: [],
      unsubscribe: () => {}
    }
  },
  computed: {
    attributeSetInstanceID() {
      return this.$store.getters.getValueOfField({
        containerUuid: this.containerUuid,
        columnName: this.metadata.columnName
      })
    },
    productId() {
      return this.$store.getters.getValueOfField({
        containerUuid: this.containerUuid,
        columnName: 'M_Product_ID'
      })
    },
    isShowProductAttribute() {
      return this.$store.getters.getShowProductAttribute
    }
  },
  watch: {
    isShowProductAttribute(value) {
      if (value) {
        if (!this.isEmptyValue(this.productId) && !this.isEmptyValue(this.attributeSetInstanceID) && this.attributeSetInstanceID > 0) {
          this.findProductAttributeSetInstace({
            productId: this.productId,
            id: this.attributeSetInstanceID
          })
        } else {
          this.setAttribute()
        }
      }
    }
  },
  methods: {
    optionsAttribute(option) {
      this[option.name]()
    },
    listProductAttribute() {
      listProductAttributesSetInstances({
        productId: this.productId
      })
        .then(response => {
          const { records } = response
          this.listDataAttribute = records
        })
        .catch(error => {
          console.warn(error)
        })
    },
    close() {
      this.$store.commit('setShowProductAttribute', false)
    },
    save() {
      let value, listAttributes, selectAttributes
      const filterAttribute = this.panelAttribute.filter(attribute => !isEmptyValue(attribute.value))
      const attributes = filterAttribute.map(productAttributes => {
        const { uuid, value_type, id } = productAttributes
        switch (value_type) {
          case 'L':
            value = productAttributes.value
            listAttributes = this.panelAttribute.find(a => a.id === id)
            if (this.isEmptyValue(listAttributes)) value = productAttributes.value
            selectAttributes = listAttributes.product_attribute_values.find(a => a.name === value || a.id === value)
            if (!this.isEmptyValue(selectAttributes)) {
              value = selectAttributes.id
            } else {
              value = productAttributes.value
            }
            break
          default:
            value = productAttributes.value
            break
        }
        return {
          value,
          key: uuid
        }
      })
      const addTableName = attributes.find(attribute => attribute.key === 'tableName')
      if (this.isEmptyValue(addTableName)) attributes.push({ value: this.metadata.tabTableName, key: 'tableName' })
      createProductAttributeSetInstance({
        attributes,
        productId: this.productId
      })
        .then(response => {
          this.findProductAttributeSetInstace({
            productId: this.productId,
            id: response.id
          })
          this.close()
          this.setValue(response)
        })
        .catch(error => {
          this.close()
          console.warn(error)
        })
    },

    findValueAttribute(attribute, list, value) {
      if (this.isEmptyValue(list)) return value
      const findAttribute = list.find(b => b.product_attribute_uuid === attribute.uuid)
      if (this.isEmptyValue(findAttribute)) return value
      value = findAttribute.value
      return value
    },

    setAttribute() {
      const productId = this.$store.getters.getValueOfField({
        containerUuid: this.containerUuid,
        columnName: 'M_Product_ID'
      })
      let id
      getProductAttribute({
        productId,
        productAttributeSetInstanceId: id
      })
        .then(response => {
          const { productAttributes } = response
          id = response.id
          this.panelAttribute = productAttributes.map(attribute => {
            let value
            return {
              ...attribute,
              value
            }
          })
        })
        .catch(error => {
          console.warn(error)
        })
    },
    setValue(productAttributeSetInstance) {
      const { parentUuid, containerUuid, columnName, displayColumnName } = this.metadata
      const { id, uuid, description } = productAttributeSetInstance
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName,
        value: id
      })
      // set display column (name) value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName: displayColumnName,
        value: description
      })
      // set UUID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName: columnName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
        value: uuid
      })
      this.$store.dispatch('notifyFieldChange', {
        containerUuid,
        containerManager: this.containerManager,
        field: this.metadata,
        columnName
      })
    },
    findProductAttributeSetInstace({ productId, id, productAttributeSetId }) {
      getProductAttributeSetInstace({
        productId,
        id,
        productAttributeSetId
      })
        .then(responseSetInstance => {
          const { productAttributeInstances, productAttributeSet } = responseSetInstance

          this.panelAttribute = productAttributeSet.product_attributes.map(attribute => {
            let value
            return {
              ...attribute,
              value
              // value: this.findValueAttribute(attribute, this.listSetInstace)
            }
          })
          this.panelAttribute = this.panelAttribute.map(a => {
            return {
              ...a,
              value: this.findValueAttribute(a, productAttributeInstances)
            }
          })
        })
        .catch(error => {
          console.warn(error)
        })
    }
  }
}
</script>

<style scoped lang="scss">
  .location-address {
    .el-form-item {
        margin-bottom: 0px !important;
    }
  }
</style>
<style lang="scss">
.location-address {
  .el-form-item--small .el-form-item__label {
    line-height: 22px !important;
  }
  .el-form-item--small.el-form-item {
    margin-bottom: 5px !important;
  }
  .location-address-footer {
    button {
      padding: 4px 8px;
      i, svg {
        font-size: 20px !important;
      }
    }
  }
}
</style>
