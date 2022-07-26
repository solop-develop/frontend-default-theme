<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Elsio Sanchez elsiosanchez@gmail.com https://github.com/elsiosanchez
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
  <el-main
    v-shortkey="shortsKey"
    style="padding-top: 0px"
    @shortkey.native="keyAction"
  >
    <el-collapse v-model="activeAccordion" accordion class="order-query-criteria">
      <el-collapse-item name="query-criteria">
        <template slot="title">
          {{ $t('orderList.label') }}
        </template>

        <el-form
          label-position="top"
          size="small"
          @submit.native.prevent="notSubmitForm"
        >
          <el-row>
            <field-definition
              v-for="(field) in fieldsListFind"
              :key="field.sequence"
              :metadata-field="field"
              :container-uuid="'Order-List'"
              :container-manager="containerManagerOrderList"
            />
          </el-row>
        </el-form>
      </el-collapse-item>
    </el-collapse>
    <el-table
      ref="OrderTable"
      v-loading="isLoadingRecords"
      class="order-table"
      :data="orderList"
      highlight-current-row
      border
      fit
      :max-height="300"
      size="small"
      @current-change="handleCurrentChange"
      @row-dblclick="changeOrder"
    >
      <p slot="empty" style="width: 100%;">
        {{ $t('orderList.emptyOrderList') }}
      </p>

      <el-table-column
        type="index"
        label="#"
        width="35"
        header-align="center"
      />

      <el-table-column
        v-for="(heard, key) in labelTable"
        :key="key"
        :label="heard.label"
        prop="value"
        header-align="center"
      >
        <span v-if="heard.columnName === 'DocumentNo'" slot-scope="scope">
          {{ scope.row.documentNo }}
        </span>
        <span v-else-if="heard.columnName === 'C_BPartner_ID'" slot-scope="scope">
          {{ scope.row.customer.name }}
        </span>
        <span v-else-if="heard.columnName === 'Name'" slot-scope="scope">
          {{ scope.row.name }}
        </span>
        <span v-else-if="heard.columnName === 'Name2'" slot-scope="scope">
          {{ scope.row.lastName }}
        </span>
      </el-table-column>
    </el-table>
    <br>
    <el-row :gutter="24" class="order-footer">
      <el-col :span="12">
        <custom-pagination
          :total="orderListRecordCount"
          :current-page="1"
          :container-manager="containerManagerOrderList"
          :handle-change-page="setPage"
          :selection="selection"
          style="float: left"
        />
      </el-col>

      <el-col :span="12">
        <samp style="float: right; padding-right: 10px;">
          <el-button
            type="danger"
            class="custom-button-create-bp"
            icon="el-icon-close"
            @click="closeList"
          />
          <el-button
            type="primary"
            class="custom-button-create-bp"
            icon="el-icon-check"
            @click="changeOrder"
          />
        </samp>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>

import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import CustomPagination from '@theme/components/ADempiere/DefaultTable/CustomPagination.vue'

// constants
import { ORDER_LIST_FORM } from '@/utils/ADempiere/dictionary/form/order/orderList.js'
import fieldsList from './fieldsListSearch'

// components and mixins
import orderListMixin from './mixinOrder'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import {
  // createFieldFromDefinition,
  createFieldFromDictionary
} from '@/utils/ADempiere/lookupFactory'
import { containerManager as containerManagerForm } from '@/utils/ADempiere/dictionary/form'

export default {
  name: 'OrderList',

  components: {
    CustomPagination,
    FieldDefinition
  },

  mixins: [
    orderListMixin
  ],

  props: {
    containerManager: {
      type: Object,
      default: () => ({
        actionPerformed: () => {},
        getFieldsLit: () => {},
        setDefaultValues: () => {}
      })
    },
    metadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: ORDER_LIST_FORM,
          columnName: 'C_BPartner_ID'
        }
      }
    },
    showPopover: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      activeAccordion: 'query-criteria',
      fieldsList,
      metadataList: [],
      timeOutRecords: null,
      isLoadingRecords: false,
      timeOutFields: null,
      isLoadingFields: false
      // unsubscribe: () => {}
    }
  },

  computed: {
    uuidForm() {
      if (!isEmptyValue(this.metadata.containerUuid)) {
        return ORDER_LIST_FORM + '_' + this.metadata.containerUuid
      }
      return ORDER_LIST_FORM
    },
    shortsKey() {
      return {
        close: ['esc'],
        refreshList: ['f5']
      }
    },
    selection() {
      if (isEmptyValue(this.currentRow)) {
        return 0
      }
      return 1
    },
    containerManagerOrderList() {
      return {
        ...this.containerManager,
        ...containerManagerForm,
        setPage: this.setPage
      }
    },
    fieldsListFind() {
      const list = this.metadataList.map(field => {
        // if (field.columnName === 'C_BPartner_ID') {
        //   return {
        //     ...field,
        //     containerUuid: ORDER_LIST_FORM
        //   }
        // }
        return field
      })
      return this.fieldSort(list)
    },
    labelTable() {
      return this.metadataList.map(field => {
        return {
          label: field.name,
          columnName: field.columnName
        }
      })
    },
    orderListData() {
      return this.$store.getters.getOrderData({
        containerUuid: this.uuidForm
      })
    },
    orderListRecordCount() {
      return this.$store.getters.getOrderListRecordCount({
        containerUuid: this.uuidForm
      })
    },
    orderList() {
      return this.$store.getters.getOrderList({
        containerUuid: this.uuidForm
      })
    },
    isReadyFromGetData() {
      const { isLoaded } = this.orderListData
      return !isLoaded && this.showPopover
    },
    currentRow: {
      set(rowSelected) {
        this.$store.commit('setOrderSelectedRow', {
          containerUuid: this.uuidForm,
          currentRow: rowSelected
        })
      },
      get() {
        return this.$store.getters.getOrderCurrentRow({
          containerUuid: this.uuidForm
        })
      }
    }
  },

  watch: {
    isReadyFromGetData(isToLoad) {
      if (isToLoad) {
        this.searchOrderList()
      }
    },
    showPopover(value) {
      if (value && isEmptyValue(this.metadataList)) {
        clearTimeout(this.timeOutFields)
        this.timeOutFields = setTimeout(() => {
          this.setFieldsList()
        }, 500)
      }
    }
  },

  created() {
    this.unsubscribe = this.subscribeChanges()
    if (this.isReadyFromGetData) {
      this.searchOrderList()
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs.OrderTable) {
        this.$refs.OrderTable.setCurrentRow(this.currentRow)
      }
    })

    if (this.showPopover) {
      clearTimeout(this.timeOutFields)
      this.timeOutFields = setTimeout(() => {
        this.setFieldsList()
      }, 500)
    }
  },

  beforeDestroy() {
    this.unsubscribe()
  },

  methods: {
    handleCurrentChange(row) {
      this.currentRow = row
    },
    keyAction(event) {
      switch (event.srcKey) {
        case 'refreshList':
          /**
           * TODO: When refreshing you are making 2 list requests, you can be the
           * observer that activates the second request
          */
          this.searchOrderList()
          break

        case 'close':
          this.closeList()
          break
      }
    },
    changeOrder() {
      if (!isEmptyValue(this.currentRow)) {
        this.setOrderSelectedRow(this.currentRow)
        this.closeList()
      }
    },
    closeList() {
      this.$store.commit('changePopoverListOrder', false)
    },
    setPage(pageNumber) {
      this.searchOrderList(pageNumber)
    },
    subscribeChanges() {
      return this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'updateValueOfField') {
          if (mutation.payload.containerUuid === this.uuidForm) {
            this.searchOrderList()
          }
        }
      })
    },
    setFieldsList() {
      const list = []
      this.isLoadingFields = true
      this.fieldsList.forEach(element => {
        createFieldFromDictionary(element)
          .then(response => {
            const data = response
            list.push({
              ...data,
              containerUuid: this.uuidForm
            })
          }).catch(error => {
            console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
          })
      })
      this.metadataList = list
      this.isLoadingFields = false
    },
    searchOrderList(pageNumber = 0, isConvert = true) {
      const values = this.$store.getters.getValuesView({
        containerUuid: this.uuidForm,
        format: 'object'
      })

      let parsedValues = values
      if (isConvert && !isEmptyValue(values)) {
        parsedValues = this.convertValuesToSend(values)
      }
      this.isLoadingRecords = true
      clearTimeout(this.timeOutRecords)
      this.timeOutRecords = setTimeout(() => {
        // search on server
        this.$store.dispatch('findOrder', {
          ...parsedValues,
          containerUuid: this.uuidForm,
          pageNumber
        })
          .then(response => {
            if (isEmptyValue(response)) {
              this.$message({
                type: 'warning',
                showClose: true,
                message: this.$t('orderList.notFound')
              })
            }
          })
          .finally(() => {
            this.isLoadingRecords = false
          })
      }, 500)
    },
    /**
     * ColumnName equals property to set into request's system-core
     * TODO: Add keyServer and keyClient
     * @param {object} values
     * @returns {object}
     */
    convertValuesToSend(values) {
      const valuesToSend = {}
      Object.keys(values).forEach(key => {
        const value = values[key]
        if (isEmptyValue(value)) {
          return
        }
        switch (key) {
          case 'DocumentNo':
            valuesToSend['documentNo'] = value
            break
          case 'Name':
            valuesToSend['name'] = value
            break
          case 'C_BPartner_ID_UUID':
            valuesToSend['businessPartnerUuid'] = value
            break
          case 'DateOrderedFrom':
            valuesToSend['dateOrderedFrom'] = value
            break
          case 'DateOrderedTo':
            valuesToSend['dateOrderedTo'] = value
            break
          case 'IsPaid':
            valuesToSend['isWaitingForPay'] = value
            break
          case 'Processed':
            valuesToSend['isOnlyProcessed'] = value
            break
          case 'IsInvoiced':
            valuesToSend['isWaitingForInvoice'] = value
            break
        }
      })
      // valuesToSend['posUuid'] = this.$store.getters.posAttributes.currentPointOfSales.uuid
      return valuesToSend
    },
    fieldSort(list) {
      return list.sort((a, b) => {
        if (a.sequence > b.sequence) {
          return 1
        }
        if (a.sequence < b.sequence) {
          return -1
        }
        return 0
      })
    }
  }
}
</script>

<style lang="scss">
.order-list-container {
  .order-query-criteria {
    // space between quey criteria and table
    .el-collapse-item__content {
      padding-bottom: 0px !important;
    }
  }
}
</style>
