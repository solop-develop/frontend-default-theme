<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
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
    <el-row
      v-if="!isEmptyValue(metadataList) && isLoadedField"
    >
      <el-col :span="8" style="width: 100% !important;">
        <el-form label-position="top" :inline="true" label-width="10px" style="display: flex;" @submit.native.prevent="notSubmitForm">
          <el-col :span="24" style>
            <field-definition
              v-if="!isEmptyValue(metadataList[0].columnName)"
              :key="metadataList[0].columnName"
              :ref="metadataList[0].columnName"
              :metadata-field="{
                ...metadataList[0],
                labelCurrency: currencyPointOfSales.iSOCode,
              }"
              :container-uuid="'line'"
              :container-manager="{
                ...containerManager,
                getLookupList,
                isDisplayedField,
                isDisplayedDefault,
                generalInfoSearch,
                searchTableHeader,
                isMandatoryField,
                isReadOnlyField,
                changeFieldShowedFromUser
              }"
            />
          </el-col>
          <el-col :span="24">
            <field-definition
              v-if="!isEmptyValue(metadataList[1].columnName)"
              :key="metadataList[1].columnName"
              :ref="metadataList[1].columnName"
              :metadata-field="{
                ...metadataList[1],
                labelCurrency: currencyPointOfSales.iSOCode,
              }"
              :container-uuid="'line'"
              :container-manager="{
                ...containerManager,
                getLookupList,
                isDisplayedField,
                isDisplayedDefault,
                generalInfoSearch,
                searchTableHeader,
                isMandatoryField,
                isReadOnlyField,
                changeFieldShowedFromUser
              }"
            />
          </el-col>
          <el-col :span="24">
            <field-definition
              v-if="!isEmptyValue(metadataList[2].columnName)"
              :key="metadataList[2].columnName"
              :ref="metadataList[2].columnName"
              :metadata-field="{
                ...metadataList[2],
                labelCurrency: currencyPointOfSales.iSOCode,
              }"
              :container-uuid="'line'"
              :container-manager="{
                ...containerManager,
                getLookupList,
                isDisplayedField,
                isDisplayedDefault,
                generalInfoSearch,
                searchTableHeader,
                isMandatoryField,
                isReadOnlyField,
                changeFieldShowedFromUser
              }"
            />
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('route.warehouse')">
              <el-select
                v-model="stock"
                @change="changeWarehouseLine"
              >
                <el-option
                  v-for="(item, key) in listWarehouseLine"
                  :key="key"
                  :label="item.label + ' | Cantidad: ' + item.qty"
                  :value="item.uuid"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-form>
      </el-col>
    </el-row>
    <div
      v-else
      key="form-loading"
      v-loading="isEmptyValue(metadataList)"
      :element-loading-text="$t('notifications.loading')"
      :element-loading-spinner="'el-icon-loading'"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      class="view-loading"
    />
  </div>
</template>
<script>
// constants
import fieldsListLine from './fieldsListLine.js'

// components and mixins
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'

// api request methods
import { validatePin, updateOrderLine } from '@/api/ADempiere/form/point-of-sales.js'

import orderLineMixin from '@theme/components/ADempiere/Form/VPOS/Order/orderLineMixin.js'

// utils and helper methods
import {
  createFieldFromDictionary
} from '@/utils/ADempiere/lookupFactory'
import {
  getLookupList,
  isDisplayedField,
  isDisplayedDefault,
  isMandatoryField,
  generalInfoSearch,
  searchTableHeader,
  isReadOnlyField,
  changeFieldShowedFromUser
} from '@theme/components/ADempiere/Form/VPOS/containerManagerPos.js'

export default {
  name: 'FieldLine',

  components: {
    FieldDefinition
  },

  mixins: [
    orderLineMixin
  ],

  props: {
    dataLine: {
      type: Object,
      default: () => {}
    },
    showField: {
      type: Boolean,
      default: false
    },
    currentLine: {
      type: Object,
      default: () => {}
    },
    containerManager: {
      type: Object,
      default: () => ({
        actionPerformed: () => {},
        getFieldsLit: () => {},
        setDefaultValues: () => {}
      })
    }
  },

  data() {
    return {
      metadataList: [],
      panelMetadata: {},
      isLoaded: false,
      isLoadedField: false,
      panelType: 'custom',
      defaultData: {},
      fieldsListLine,
      fieldsList: [],
      options: [],
      stock: '',
      unsubscribe: () => {}
    }
  },

  computed: {
    currentLineOrder() {
      const line = this.$store.state['pointOfSales/orderLine/index'].line
      if (!this.isEmptyValue(line)) {
        return line
      }
      return {}
    },
    isModifyPrice() {
      const pos = this.$store.getters.posAttributes.currentPointOfSales
      if (!this.isEmptyValue(pos.isModifyPrice)) {
        return pos.isModifyPrice
      }
      return false
    },
    isPosRequiredPin() {
      const pos = this.$store.getters.posAttributes.currentPointOfSales
      if (!this.isEmptyValue(pos.isPosRequiredPin) && !this.validatePin) {
        return pos.isPosRequiredPin
      }
      return false
    },
    currentPointOfSales() {
      return this.$store.getters.posAttributes.currentPointOfSales
    },
    validatePin() {
      return this.$store.state['pointOfSales/orderLine/index'].validatePin
    },
    currencyPointOfSales() {
      if (!this.isEmptyValue(this.currentPointOfSales)) {
        return this.currentPointOfSales.priceList.currency
      }
      return ''
    },
    isDisplayTaxAmount() {
      return this.currentPointOfSales.isDisplayTaxAmount
    },
    isDisplayDiscount() {
      return this.currentPointOfSales.isDisplayDiscount
    },
    listWarehouseLine() {
      const listWarehouseLine = this.$store.getters.getListWarehouseLine
      let defaultLineWarehouse
      if (!this.isEmptyValue(this.currentLine.warehouse)) {
        defaultLineWarehouse = listWarehouseLine.find(stock => stock.uuid === this.currentLine.warehouse.uuid)
      }
      if (this.isEmptyValue(defaultLineWarehouse)) {
        const list = listWarehouseLine.push({
          ...this.currentLine.warehouse,
          qty: 0
        })
        return list
      }
      return listWarehouseLine
    }
  },

  watch: {
    showField(value) {
      if (!this.isEmptyValue(this.currentLine.product)) {
        this.$store.dispatch('findWarehouse', {
          value: this.currentLine.product.value,
          sku: this.currentLine.product.sku
        })
      }
      this.visible = false
      if (value && this.isEmptyValue(this.metadataList) && (this.dataLine.uuid === this.$store.state['pointOfSales/orderLine/index'].line.uuid)) {
        this.metadataList = this.setFieldsList()
        this.isLoadedField = true
      }
      if (value) {
        this.fillOrderLineQuantities({
          currentPrice: this.fieldShowValue({
            row: this.currentLine,
            columnName: 'CurrentPrice'
          }),
          quantityOrdered: this.currentLine.quantity,
          discount: this.currentLine.discount
        })
        this.isLoadedField = true
      }
      if (!this.isEmptyValue(this.currentLine.warehouse)) {
        this.stock = this.currentLine.warehouse.uuid
      }
    }
  },

  beforeMount() {
    this.unsubscribe = this.subscribeChanges()
  },

  beforeDestroy() {
    this.unsubscribe()
  },

  methods: {
    getLookupList,
    isDisplayedField,
    isDisplayedDefault,
    generalInfoSearch,
    searchTableHeader,
    isMandatoryField,
    isReadOnlyField,
    changeFieldShowedFromUser,
    createFieldFromDictionary,
    setFieldsList() {
      const fieldsList = []
      // Product Code
      this.fieldsListLine.forEach(element => {
        this.createFieldFromDictionary(element)
          .then(metadata => {
            const data = metadata
            fieldsList.push({
              ...data,
              containerUuid: 'line'
            })
          }).catch(error => {
            console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
          })
      })
      return fieldsList
    },
    fillOrderLineQuantities({
      currentPrice,
      quantityOrdered,
      discount
    }) {
      this.defaultData = {
        currentPrice,
        quantityOrdered,
        discount
      }
      const containerUuid = 'line'
      // Editable fields
      if (!this.isEmptyValue(quantityOrdered)) {
        this.$store.commit('updateValueOfField', {
          containerUuid: 'line',
          columnName: 'QtyEntered',
          value: quantityOrdered
        })
      }
      if (!this.isEmptyValue(currentPrice)) {
        this.$store.commit('updateValueOfField', {
          containerUuid,
          columnName: 'PriceEntered',
          value: currentPrice
        })
      }
      if (!this.isEmptyValue(discount)) {
        this.$store.commit('updateValueOfField', {
          containerUuid,
          columnName: 'Discount',
          value: discount
        })
      }
    },
    closePing() {
      this.$refs.ping[this.$refs.ping.length - 1].showPopper = false
      this.visible = false
    },
    checkclosePin(pin) {
      validatePin({
        posUuid: this.currentPointOfSales.uuid,
        pin
      })
        .then(response => {
          this.$store.commit('pin', true)
          this.pin = ''
        })
        .catch(error => {
          console.error(error.message)
          this.$message({
            type: 'error',
            message: error.message,
            showClose: true
          })
          this.pin = ''
        })
      this.closePing()
    },
    convertValuesToSend(values) {
      const valuesToSend = {}
      Object.keys(values).forEach(key => {
        const value = values[key]
        if (this.isEmptyValue(value)) {
          return
        }
        switch (value.columnName) {
          case 'PriceEntered':
            valuesToSend['currentPrice'] = value.value
            break
          case 'QtyEntered':
            valuesToSend['quantityOrdered'] = value.value
            break
          case 'Discount':
            valuesToSend['discount'] = value.value
            break
        }
      })
      return valuesToSend
    },
    changeWarehouseLine(value) {
      updateOrderLine({
        posUuid: this.currentPointOfSales.uuid,
        orderLineUuid: this.currentLine.uuid,
        warehouseUuid: value
      })
    },
    subscribeChanges() {
      return this.$store.subscribe((mutation, state) => {
        if (!this.isEmptyValue(mutation.payload) && !this.isEmptyValue(mutation.payload.containerUuid) && mutation.payload.containerUuid === 'line') {
          if (mutation.type === 'updateValueOfField') {
            let qtyEntered, priceEntered, discount

            switch (mutation.payload.columnName) {
              case 'QtyEntered':
                qtyEntered = this.fieldShowValue({
                  row: this.currentLineOrder,
                  columnName: 'QtyEntered'
                })
                if (this.isEmptyValue(mutation.payload.value) || mutation.payload.value === parseInt(qtyEntered, 10)) {
                  return
                }
                if (this.allowsModifyQuantity && !this.isEmptyValue(this.$store.state['pointOfSales/orderLine/index'].line)) {
                  this.updateOrderLine(mutation.payload)
                } else {
                  const attributePin = {
                    ...mutation.payload,
                    type: 'updateOrder',
                    label: this.$t('form.pos.pinMessage.qtyEntered')
                  }
                  this.$store.dispatch('changePopoverOverdrawnInvoice', { attributePin, visible: true })
                  this.visible = true
                }
                break
              case 'PriceEntered':
                priceEntered = this.fieldShowValue({
                  row: this.currentLineOrder,
                  columnName: 'CurrentPrice'
                })
                if (this.isEmptyValue(mutation.payload.value) || mutation.payload.value === priceEntered) {
                  return
                }
                if (this.modifyPrice) {
                  this.updateOrderLine(mutation.payload)
                } else {
                  const attributePin = {
                    ...mutation.payload,
                    type: 'updateOrder',
                    label: mutation.payload.columnName === 'PriceEntered' ? this.$t('form.pos.pinMessage.price') : this.$t('form.pos.pinMessage.discount')
                  }
                  this.$store.dispatch('changePopoverOverdrawnInvoice', { attributePin, visible: true })
                  this.visible = true
                }
                break
              case 'Discount':
                discount = this.fieldShowValue({
                  row: this.currentLineOrder,
                  columnName: 'Discount'
                })
                if (this.isEmptyValue(mutation.payload.value) || mutation.payload.value === parseInt(discount)) {
                  return
                }
                if (this.modifyPrice) {
                  this.updateOrderLine(mutation.payload)
                } else {
                  const attributePin = {
                    ...mutation.payload,
                    type: 'updateOrder',
                    label: mutation.payload.columnName === 'PriceEntered' ? this.$t('form.pos.pinMessage.price') : this.$t('form.pos.pinMessage.discount')
                  }
                  this.$store.dispatch('changePopoverOverdrawnInvoice', { attributePin, visible: true })
                  this.visible = true
                }
                break
            }
          }
        }
        if (mutation.type === 'addFocusGained' && this.isPosRequiredPin && (mutation.payload.columnName === 'PriceEntered' || mutation.payload.columnName === 'Discount' || mutation.payload.columnName === 'QtyEntered')) {
          this.columnNameVisible = mutation.payload.columnName
          this.visible = true
        }
        // if (mutation.type === 'updateValueOfField' && (mutation.payload.columnName === 'PriceEntered' || mutation.payload.columnName === 'Discount' || mutation.payload.columnName === 'QtyEntered')) {
        //   const values = this.$store.getters.getValuesView({
        //     containerUuid: mutation.payload.containerUuid,
        //     format: 'array'
        //   })
        //   const { currentPrice, quantityOrdered, discount } = this.convertValuesToSend(values)

        //   if (!this.isEmptyValue(currentPrice) && this.defaultData.currentPrice !== currentPrice) {
        //     this.fillOrderLineQuantities({
        //       currentPrice,
        //       quantityOrdered,
        //       discount
        //     })
        //     this.updateOrderLine({
        //       columnName: mutation.payload.columnName,
        //       value: mutation.payload.value
        //     })
        //   } else if (!this.isEmptyValue(discount) && this.defaultData.discount !== discount) {
        //     this.fillOrderLineQuantities({
        //       currentPrice,
        //       quantityOrdered,
        //       discount
        //     })
        //     this.updateOrderLine({
        //       columnName: mutation.payload.columnName,
        //       value: mutation.payload.value
        //     })
        //   } else if (!this.isEmptyValue(quantityOrdered) && this.defaultData.quantityOrdered !== quantityOrdered) {
        //     this.fillOrderLineQuantities({
        //       currentPrice,
        //       quantityOrdered,
        //       discount
        //     })
        //     this.updateOrderLine({
        //       columnName: mutation.payload.columnName,
        //       value: mutation.payload.value
        //     })
        //   }
        // }
      })
    }
  }
}
</script>
