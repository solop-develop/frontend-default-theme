<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-form
    v-shortkey="{ closeForm: ['esc'] }"
    label-position="top"
    size="small"
    class="product-attribute-list"
  >
    <el-row :gutter="0">
      <el-col :span="24">
        <el-table
          :data="listDataAttribute"
          height="250"
          stripe
          style="width: 100%"
          @row-click="selectAttribute"
          @row-dblclick="selectValue"
        >
          <el-table-column
            prop="description"
            :label="$t('field.productAttribute.description')"
            height="100"
            style="padding: 20px !important;"
          >
            <template slot-scope="scope">
              <p v-if="!isEmptyValue(scope.row.description)">
                {{ scope.row.description }}
              </p>
              <p
                v-else
                style="padding: 5px;"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="lot"
            :label="$t('field.productAttribute.lot')"
            height="50"
            style="padding: 20px !important;"
          >
            <template slot-scope="scope">
              <p>
                {{ scope.row.lot }}
              </p>
            </template>
          </el-table-column>
          <el-table-column
            prop="serial"
            :label="$t('field.productAttribute.serial')"
            height="50"
            style="padding: 20px !important;"
          >
            <template slot-scope="scope">
              <p>
                {{ scope.row.serial }}
              </p>
            </template>
          </el-table-column>
        </el-table>
      </el-col>

      <el-col :span="24" class="product-attribute-list-footer">
        <samp style="float: right; padding-top: 4px;">
          <el-button
            :loading="isLoadingRecords"
            type="success"
            class="button-base-icon"
            icon="el-icon-refresh-right"
            size="small"
            @click="listProductAttributesSetInstances();"
          />
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            @click="clearValues(); close()"
          />
          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            @click="setValues(currentSelectAttributes); close()"
          />
        </samp>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { defineComponent, ref, onMounted } from '@vue/composition-api'

import store from '@/store'

// API Request Methods
import {
  requestListProductAttributesSetInstances
} from '@/api/ADempiere/form/productAttribute'

import useProductAttribute from './useProductAttribute.js'

export default defineComponent({
  name: 'ListAttributeInstance',

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
    }
  },

  setup(props) {
    const {
      productId,
      clearValues,
      setValues,
      close
    } = useProductAttribute({
      parentUuid: props.parentUuid,
      containerUuid: props.containerUuid,
      containerManager: props.containerManager,
      fieldAttributes: props.metadata
    })

    const listDataAttribute = ref([])
    const isLoadingRecords = ref(false)
    const currentSelectAttributes = ref({})

    function selectAttribute(row, column, event) {
      store.commit('setCurrentProductAttribute', row)
      currentSelectAttributes.value = row
    }

    function selectValue(row) {
      setValues(row)
      close()
    }

    function listProductAttributesSetInstances() {
      isLoadingRecords.value = true
      requestListProductAttributesSetInstances({
        productId: productId.value
      })
        .then(response => {
          const { records } = response
          listDataAttribute.value = records
        })
        .catch(error => {
          console.warn(error)
        })
        .finally(() => {
          isLoadingRecords.value = false
        })
    }

    onMounted(() => {
      listProductAttributesSetInstances()
    })

    return {
      // Refs
      currentSelectAttributes,
      listDataAttribute,
      isLoadingRecords,
      // Methods
      clearValues,
      setValues,
      selectValue,
      listProductAttributesSetInstances,
      close,
      selectAttribute
    }
  }

})
</script>

<style lang="scss">
.product-attribute-list {
  .product-attribute-list-footer {
    padding-bottom: 10px;
  }
}
</style>
