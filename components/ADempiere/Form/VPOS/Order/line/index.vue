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
      <!-- <template> -->
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <field-definition
            v-if="!isEmptyValue(fieldPriceProduct)"
            :ref="fieldPriceProduct.columnName"
            :metadata-field="{
              ...fieldPriceProduct,
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
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item label="Unidad de Medida" style="width: 100% !important;">
            <el-select
              v-model="uomValue"
              @change="changUomLine"
              @visible-change="findUomList"
            >
              <el-option
                v-for="(item, key) in uomList"
                :key="key"
                :label="item.uom.name"
                :value="item.product_uom"
              >
                <span style="float: left">{{ item.uom.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <field-definition
            v-if="!isEmptyValue(fieldQtyProduct)"
            :metadata-field="fieldQtyProduct"
            :container-uuid="'line'"
            :container-manager="{
              ...containerManager,
              getLookupList,
              isDisplayedField,
              generalInfoSearch,
              searchTableHeader,
              isDisplayedDefault,
              isMandatoryField,
              isReadOnlyField,
              changeFieldShowedFromUser
            }"
          />
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item label="Conversión" style="width: 100% !important;">
            <el-input
              v-model="uomValue.name"
              :disabled="true"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item label="Precio Base" style="width: 100% !important;padding-left: 10px;padding-right: 10px;">
            <el-input
              v-model="priceBase"
              :disabled="true"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
        <!-- <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <field-definition
            v-if="!isEmptyValue(fieldPriceProduct)"
            :ref="fieldPriceProduct.columnName"
            :metadata-field="{
              ...fieldPriceProduct,
              name: 'Precio Base',
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
              isReadOnlyField: () => { return true },
              changeFieldShowedFromUser
            }"
          />
        </el-form> -->
      </el-col>
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item label="Unidad de Medida Basse" style="width: 100% !important;padding-right: 2px;">
            <el-input
              v-model="currentLine.product.uomName"
              :disabled="true"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item label="Cantidad Base" style="width: 100% !important;padding-left: 10px;padding-right: 10px;">
            <el-input
              v-model="num"
              :disabled="true"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
        <!-- <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <field-definition
            v-if="!isEmptyValue(fieldUOMProduct)"
            :metadata-field="{
              ...fieldUOMProduct,
              name: 'Cantidad Base'
            }"
            :container-uuid="'line'"
            :container-manager="{
              ...containerManager,
              getLookupList,
              isDisplayedField,
              generalInfoSearch,
              searchTableHeader,
              isDisplayedDefault,
              isMandatoryField,
              isReadOnlyField: () => { return true },
              changeFieldShowedFromUser
            }"
          />
        </el-form> -->
      </el-col>
      <el-col :span="6">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item label="Equivale A" style="width: 100% !important;">
            <el-input
              v-model="num"
              :disabled="true"
              controls-position="right"
            />
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="24">
        <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
          <field-definition
            v-if="!isEmptyValue(fieldDiscountProduct)"
            :metadata-field="fieldDiscountProduct"
            :container-uuid="'line'"
            :container-manager="{
              ...containerManager,
              getLookupList,
              isDisplayedField,
              generalInfoSearch,
              searchTableHeader,
              isDisplayedDefault,
              isMandatoryField,
              isReadOnlyField,
              changeFieldShowedFromUser
            }"
          />
        </el-form>
      </el-col>
    </el-row>
    <el-row
      v-if="!isEmptyValue(metadataList) && isLoadedField" 
      :gutter="20"
    >
      <el-col :span="12">
        <el-form label-position="top" :inline="true" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item :label="$t('route.warehouse')" style="margin-left: 2%;width: 100% !important;">
            <el-select
              v-model="stock"
              style="display: block;"
              @change="changeWarehouseLine"
              @visible-change="loadStock"
            >
              <el-option
                v-for="(item, key) in listWarehouseLine"
                :key="key"
                :label="item.label"
                :value="item.uuid"
              >
                <span style="float: left">{{ item.label }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="12">
        <el-form label-position="top" :inline="true" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item label="Cantidad Disponible" style="width: 100% !important;">
            <el-input-number
              v-model="currentWarehouseQty"
              :disabled="true"
              controls-position="right"
              :precision="2"
              style="text-align: end !important;width: 100%;"
            />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
      <!-- </template> -->
      <!-- <el-col :span="16">
        <el-form label-position="top" :inline="true" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item :label="$t('route.warehouse')" style="margin-left: 2%;width: 100% !important;">
            <el-select
              v-model="stock"
              style="display: block;"
              @change="changeWarehouseLine"
              @visible-change="loadStock"
            >
              <el-option
                v-for="(item, key) in listWarehouseLine"
                :key="key"
                :label="item.label"
                :value="item.uuid"
              >
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.sumaryQty }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-col> -->
    <!-- </el-row> -->
    <!-- <el-row
      v-if="!isEmptyValue(metadataList) && isLoadedField"
    >
      <template
        v-for="(field, index) in metadataList"
      >
        <el-col :key="index" :span="8">
          <el-form label-position="top" label-width="10px" @submit.native.prevent="notSubmitForm">
            <field-definition
              v-if="field.columnName === 'PriceEntered'"
              :key="field.columnName"
              :ref="field.columnName"
              :metadata-field="{
                ...field,
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
            <field-definition
              v-if="field.columnName === 'QtyEntered'"
              :key="field.columnName"
              :metadata-field="field"
              :container-uuid="'line'"
              :container-manager="{
                ...containerManager,
                getLookupList,
                isDisplayedField,
                generalInfoSearch,
                searchTableHeader,
                isDisplayedDefault,
                isMandatoryField,
                isReadOnlyField,
                changeFieldShowedFromUser
              }"
            />
            <field-definition
              v-if="field.columnName === 'Discount'"
              :ref="field.columnName"
              :key="field.columnName"
              :metadata-field="field"
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
          </el-form>
        </el-col>
      </template>
      <el-col :span="16">
        <el-form label-position="top" :inline="true" label-width="10px" @submit.native.prevent="notSubmitForm">
          <el-form-item :label="$t('route.warehouse')" style="margin-left: 2%;width: 100% !important;">
            <el-select
              v-model="stock"
              style="display: block;"
              @change="changeWarehouseLine"
              @visible-change="loadStock"
            >
              <el-option
                v-for="(item, key) in listWarehouseLine"
                :key="key"
                :label="item.label"
                :value="item.uuid"
              >
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.sumaryQty }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row> -->
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

// Format of values ( Date, Price, Quantity )
import {
  formatQuantity
} from '@/utils/ADempiere/valueFormat.js'

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
      num: '3.5 Mts 2',
      conver: '1 Caja',
      qtyAvalible: 5,
      isLoadedField: false,
      panelType: 'custom',
      defaultData: {},
      fieldsListLine,
      fieldsList: [],
      options: [],
      priceBase: '',
      stock: '',
      uomValue: '',
      uomList: [],
      unsubscribe: () => {}
    }
  },

  computed: {
    fieldPriceProduct() {
      return this.metadataList.find(field => field.columnName === 'PriceEntered')
    },
    fieldQtyProduct() {
      return this.metadataList.find(field => field.columnName === 'QtyEntered')
    },
    fieldDiscountProduct() {
      return this.metadataList.find(field => field.columnName === 'Discount')
    },
    currentWarehouseQty: {
      get() {
        const qty = this.listWarehouseLine.find(warehouse => warehouse.uuid === this.stock)
        if (!this.isEmptyValue(qty.qty)) {
          return this.formatQuantity(qty.qty)
        }
        return 0
      },
      set(value) {
        return value
      }
    },
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
        listWarehouseLine.push({
          ...this.currentLine.warehouse,
          label: this.currentLine.warehouse.name,
          id: this.currentLine.warehouse.id,
          uuid: this.currentLine.warehouse.uuid,
          sumaryQty: 0
        })
        const list = listWarehouseLine
        return list
      }
      return listWarehouseLine
    }
  },

  watch: {
    showField(value) {
      this.priceBase = this.currencyPointOfSales.curSymbol + this.currentLine.priceActual
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
    formatQuantity,
    findUomList(value) {
      if (value) {
        if (!this.isEmptyValue(this.currentLine.product)) {
          this.$store.dispatch('findUom', {
            productId: this.currentLine.product.id
          })
            .then(response => {
              this.uomList = response.records
            })
        }
      }
    },
    loadStock(value) {
      if (value) {
        if (!this.isEmptyValue(this.currentLine.product)) {
          this.$store.dispatch('findWarehouse', {
            value: this.currentLine.product.value,
            sku: this.currentLine.product.sku
          })
        }
      }
    },
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
      const { requestedAccess } = this.$store.getters.getOverdrawnInvoice.attributePin
      validatePin({
        posUuid: this.currentPointOfSales.uuid,
        pin,
        requestedAccess
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
        .then(response => {
          this.$message({
            type: 'success',
            message: 'Acción a realizar',
            showClose: true
          })
        })
        .catch(error => {
          this.stock = this.currentLine.warehouse.uuid
          console.warn(error.message)
          this.$message({
            type: 'error',
            message: error.message,
            showClose: true
          })
        })
    },
    changUomLine(value) {
      const uom = this.uomList.find(uom => value.uuid === uom.product_uom.uuid)
      if (uom.divide_rate >= uom.multiply_rate ) {
        this.num = uom.divide_rate
      } else {
        this.num = uom.multiply_rate
      }
      updateOrderLine({
        posUuid: this.currentPointOfSales.uuid,
        orderLineUuid: this.currentLine.uuid,
        uomUuid: uom.uuid
      })
        .then(response => {
          this.$message({
            type: 'success',
            message: 'Acción a realizar',
            showClose: true
          })
        })
        .catch(error => {
          this.stock = this.currentLine.warehouse.uuid
          console.warn(error.message)
          this.$message({
            type: 'error',
            message: error.message,
            showClose: true
          })
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
                    requestedAccess: 'IsAllowsModifyQuantity',
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
                    requestedAccess: 'IsModifyPrice',
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
                if (this.isEmptyValue(mutation.payload.value) || mutation.payload.value === discount) {
                  return
                }
                if (this.modifyPrice) {
                  this.updateOrderLine(mutation.payload)
                } else {
                  const attributePin = {
                    ...mutation.payload,
                    type: 'updateOrder',
                    requestedAccess: 'isAllowsApplyDiscount',
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

<style>
.el-input.is-disabled .el-input__inner {
  text-align: right;
}
</style>