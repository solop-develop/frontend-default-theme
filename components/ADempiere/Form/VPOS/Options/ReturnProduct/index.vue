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
GNU General Public License for morej details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-main
    v-shortkey="shortsKey"
    class="product-list-content"
  >
    <el-form
      v-shortkey="shortsKey"
      label-position="top"
      label-width="10px"
      @submit.native.prevent="notSubmitForm"
    >
      <el-form-item
        :label="$t('form.productInfo.codeProduct')"
        style="width: 100%;"
      >
        <el-select
          v-model="searchProduct"
          remote
          filterable
          reserve-keyword
          style="width: 100%;"
          :visible-change="listReturnProduct"
          :placeholder="$t('quickAccess.searchWithEnter')"
        >
          <el-option
            v-for="item in listProduct"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <el-table
      ref="listProducto"
      v-shortkey="shortsKey"
      v-loading="isLoadedServer"
      :data="productdeliveryList"
      :empty-text="$t('quickAccess.searchWithEnter')"
      border
      fit
      height="350"
      highlight-current-row
      @cell-dblclick="editDelivery"
      @shortkey.native="keyAction"
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
        align="right"
        :width="isEditQuantity ? '210px' : '110px'"
      >
        <template slot-scope="scope">
          <el-input-number
            v-if="isEditQuantity"
            v-model="scope.row.quantity"
            controls-position="right"
            :min="1"
            @change="handleChange(scope.row)"
          />
          <span v-else>
            {{ formatQuantity({ value: scope.row.quantity }) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="uom.uom.name"
        :label="$t('form.pos.tableProduct.uom')"
      />
      <el-table-column
        prop="quantity"
        :label="$t('form.pos.tableProduct.movementQuantity')"
        align="right"
        width="200px"
      >
        <template slot-scope="scope">
          {{ formatQuantity({ value: scope.row.movement_quantity }) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('form.pos.tableProduct.options')"
        column-key="value"
        width="160"
      >
        <template>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <el-col
        :offset="18"
        :span="6"
        style="border: 1px solid #d3d4d6;border-radius: 10px;padding-left: 10px;padding-right: 10px;margin-top: 10px;"
      >
        <p class="total">
          <b>
            {{ $t('form.pos.order.order') }}:
          </b>
          <b style="float: right;">
            {{ 'RM-102' }}
          </b>
        </p>
        <p class="total">
          <b>
            {{ $t('form.pos.order.total') }}:
          </b>
          <b style="float: right;">
            {{ 0.00 }}
          </b>
        </p>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="products-list-footer">
      <el-col :span="24">
        <samp style="float: right; padding-top: 10px;">
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            @click="close"
          />
          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            @click="close"
          />
        </samp>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
// constants
// api request methods
// import {
//   createPayment,
//   cashOpening,
//   updatePayment,
//   deletePayment,
//   availableCash
// } from '@/api/ADempiere/form/point-of-sales.js'
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'
import store from '@/store'

// Utils and Helper Methods
import { formatPrice } from '@/utils/ADempiere/valueFormat.js'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'

export default defineComponent({
  name: 'ReturnProduct',
  setup(props, { root }) {
    // Ref
    const searchProduct = ref('')
    // Computed
    const listProduct = computed(() => {
      return store.getters.getListProduct
    })
    // Variable (Let)
    let loading
    // Methods
    function listReturnProduct(show) {
      if (!show) return
    }
    function close() {
      store.commit('setShowReturnProduct', false)
    }
    console.log('eoale')
    return {
      // Import
      formatPrice,
      formatQuantity,
      // Ref
      loading,
      searchProduct,
      listProduct,
      // Methods
      close,
      listReturnProduct
    }
  }
})
</script>
