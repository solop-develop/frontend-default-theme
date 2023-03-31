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
              <el-form-item label="Orden de Comprar" class="front-item-receipt">
                <el-select v-model="purchaseOrder" placeholder="Please Select Purchase Order" style="width: 100%;">
                  <el-option label="Zone" value="shanghai" />
                  <el-option label="Zone two" value="beijing" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Código Producto" class="front-item-receipt">
                <el-select v-model="purchaseOrder" placeholder="Please Select Purchase Order" style="width: 100%;">
                  <el-option label="Zone one" value="shanghai" />
                  <el-option label="Zone two" value="beijing" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
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
          :width="isEditQuantity ? '200px' : '90px'"
        >
          <template slot-scope="scope">
            <!-- <el-input-number
              v-if="isEditQuantity"
              v-model="scope.row.quantity"
              controls-position="right"
              :min="1"
            /> -->
            <span>
              {{ scope }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
export default defineComponent({
  name: 'ExpressReceipt',
  setup() {
    const route = 'epae'
    const purchaseOrder = ref('')
    const productdeliveryList = ref([])
    const isLoadedServer = ref(false)
    const isEditQuantity = ref(false)
    return {
      route,
      purchaseOrder,
      productdeliveryList,
      isLoadedServer,
      isEditQuantity
    }
  }
})
</script>

<style scoped lang="scss">
.front-item-receipt {
  width: 100%;
}
</style>
