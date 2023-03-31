<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <div class="main-express-receipt">
    <el-card class="box-card">
      <div slot="header" class="clearfix-express-receipt">
        <el-form ref="form-express-receipt" inline label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Orden de Venta" class="front-item-receipt">
                <el-select
                  v-model="salesOrder"
                  placeholder="Please Select Purchase Order"
                  style="width: 100%;"
                  filterable
                  @visible-change="findSalesOrder"
                  @change="selectSalesOrder"
                >
                  <el-option
                    v-for="item in listOrder"
                    :key="item.id"
                    :label="item.label"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="!isEmptyValue(salesOrder)" :span="12">
              <el-form-item label="Código Producto" class="front-item-receipt">
                <el-autocomplete
                  ref="searchValue"
                  v-model="findProduct"
                  :select-when-unmatched="true"
                  :trigger-on-focus="false"
                  :placeholder="$t('quickAccess.searchWithEnter')"
                  :fetch-suggestions="querySearchAsync"
                  style="width: 100%;"
                  @select="handleSelect"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
    <el-card v-if="!isEmptyValue(salesOrder)" class="box-card">
      <el-table
        ref="listProducto"
        v-loading="isLoadedServer"
        :data="productdeliveryList"
        :empty-text="$t('quickAccess.searchWithEnter')"
        :border="true"
        fit
        height="450"
        highlight-current-row
      >
        <el-table-column
          prop="product.value"
          :label="$t('form.productInfo.code')"
        />
        <el-table-column
          prop="product.name"
          :label="$t('form.pos.tableProduct.product')"
        />
        <el-table-column
          prop="quantity"
          :label="$t('form.pos.tableProduct.quantity')"
          :align="'right'"
        />
        <el-table-column
          :label="$t('form.pos.tableProduct.options')"
          column-key="value"
          width="160"
        >
          <template slot-scope="scope">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteShipmentLine(scope.row)" />
          </template>
        </el-table-column>
      </el-table>
      <!-- Action Panel Footer -->
      <el-row>
        <el-col :span="24">
          <el-button
            type="primary"
            icon="el-icon-check"
            class="button-base-icon"
            style="float: right; margin: 10px;"
            :disabled="isEmptyValue(salesOrder)"
            @click="processShipment"
          />
          <el-button
            type="danger"
            icon="el-icon-close"
            style="float: right;margin-top: 10px;"
            class="button-base-icon"
            @click="closeForm"
          />
          <el-button
            type="info"
            plain
            style="float: right; margin-top: 10px;"
            class="button-base-icon"
            @click="clearForm"
          >
            <svg-icon icon-class="layers-clear" />
          </el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import lang from '@/lang'
import store from '@/store'
import router from '@/router'
// Api
import {
  listOrders
  // Shipment
} from '@/api/ADempiere/form/ExpressShipment.js'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'ExpressShipment',
  setup() {
    /**
   * Ref
   */
    const salesOrder = ref('')
    const findProduct = ref('')
    const timeOut = ref(null)
    const listOrder = ref([])
    const isLoadedServer = ref(false)
    const isEditQuantity = ref(false)
    /**
   * Computed
   */
    const listProdcut = computed(() => {
      return store.getters.getListProduct
    })
    const productdeliveryList = computed(() => {
      return store.getters.getListShipmentLines
    })
    const currentShipment = computed(() => {
      return store.getters.getCurrentShipment
    })
    /**
     * Methods
     */

    function findSalesOrder(isFindOrder) {
      if (!isFindOrder) return
      listOrders({
        searchValue: salesOrder.value
      })
        .then(response => {
          const { records } = response
          listOrder.value = records.map(order => {
            const { id, uuid, document_no } = order
            return {
              id,
              label: document_no,
              uuid
            }
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
    }

    function selectSalesOrder(order) {
      store.dispatch('createShipment', {
        id: order
      })
    }

    function querySearchAsync(queryString, callBack) {
      console.log(listProdcut.value)
      const results = listProdcut.value.filter(createFilter(queryString))
      console.log({ results })
      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        if (isEmptyValue(results)) {
          store.dispatch('findListProduct', {
            searchValue: queryString,
            shipmentId: salesOrder.value
          })
            .then(response => {
              console.log({ response })
            })
            .catch(error => {
              showMessage({
                type: 'error',
                message: lang.t('form.pos.optionsPoinSales.salesOrder.emptyProductDelivery')
              })
              console.warn(`Error getting List Product: ${error.message}. Code: ${error.code}.`)
            })
        }
        const suggestionOpen = results.length
        if (this.isEmptyValue(queryString) || queryString.length < 4) {
          // not show list
          callBack(results)
          return
        }
        if (suggestionOpen <= 1) {
          handleSelect(results[0])
        }
        callBack(results)
      }, 500)
    }

    function createFilter(queryString) {
      return (link) => {
        const search = queryString.toLowerCase()
        return link.value.toLowerCase().includes(search) || link.name.toLowerCase().includes(search) || link.upc.toLowerCase().includes(search)
      }
    }

    function handleSelect(product) {
      if (typeof product === 'object') {
        // if (!isEmptyValue(productdeliveryList.value)) {
        const isProductExists = productdeliveryList.value.find(list => list.product.value === product.value)
        if (isEmptyValue(isProductExists)) {
          createShipmentLine(product)
          return
        }
        updateShipmentLine(isProductExists)
        // }
      }
    }

    /**
     * Shipment Line
     */

    function createShipmentLine(product) {
      store.dispatch('createLine', {
        shipmentId: 0,
        productId: product.id,
        productUuid: product.uuid
      })
    }

    function updateShipmentLine({
      id,
      uuid,
      quantity
    }) {
      store.dispatch('updateLine', {
        id,
        uuid,
        quantity: quantity + 1
      })
    }

    function deleteShipmentLine(line) {
      console.log({ line, salesOrder: salesOrder.value, currentShipment: currentShipment.value })
      const { id, uuid } = line
      store.dispatch('deleteLine', {
        id,
        uuid,
        shipmentId: currentShipment.value.id
      })
    }

    /**
     * Action Panel Footer
     */

    function closeForm() {
      const currentRoute = router.app._route
      const tabViewsVisited = store.getters.visitedViews
      store.dispatch('tagsView/delView', currentRoute)
      const oldRouter = tabViewsVisited[tabViewsVisited.length - 1]
      router.push({
        path: oldRouter.path
      }, () => {})
    }

    function clearForm(params) {
      salesOrder.value = ''
      findProduct.value = ''
    }

    function processShipment() {
      if (isEmptyValue(salesOrder.value)) return
      store.dispatch('processShipment', {
        id: salesOrder.value
      })
    }

    /**
   * Watch
   */
    watch(salesOrder, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        findSalesOrder(true)
      }
    })

    return {
      salesOrder,
      listOrder,
      findProduct,
      productdeliveryList,
      isLoadedServer,
      isEditQuantity,
      currentShipment,
      // Methods
      findSalesOrder,
      selectSalesOrder,
      handleSelect,
      createFilter,
      querySearchAsync,
      // Shipment Line
      createShipmentLine,
      updateShipmentLine,
      deleteShipmentLine,
      // Action Panel Footer
      processShipment,
      closeForm,
      clearForm
    }
  }
})
</script>

<style scoped lang="scss">
.front-item-receipt {
  width: 100%;
}
</style>
