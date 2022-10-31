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
          class="location-address"
        >
          <el-row v-if="!isEmptyValue(panelAttribute)" :gutter="0">
            <!-- <template v-if="!isLoadingFields">
              <el-col v-for="(fieldAttributes) in fieldDefaultLocation" :key="fieldAttributes.columnName" :span="24">
                <field-definition
                  :parent-uuid="parentUuid"
                  :container-uuid="containerUuid"
                  :container-manager="containerManagerLocation"
                  :metadata-field="fieldAttributes"
                />
              </el-col>
            </template>
            <div
              v-else
              key="form-loading"
              v-loading="isLoadingFields"
              :element-loading-text="$t('notifications.loading')"
              element-loading-spinner="el-icon-loading"
              element-loading-background="rgba(255, 255, 255, 0.8)"
              style="min-height: calc(50vh - 84px)"
              class="loading-panel"
            /> -->
            <!-- <el-form :label-position="'left'"> -->
            <el-col v-for="attribute in panelAttribute" :key="attribute.id" :span="24">
              <el-form-item :label="attribute.name">
                <el-input
                  v-if="attribute.value_type === 'S'"
                  v-model="value"
                  disabled
                />
                <el-input-number
                  v-else-if="attribute.value_type === 'N'"
                  v-model="value"
                  controls-position="right"
                  disabled
                />
                <el-select
                  v-else-if="attribute.value_type === 'L'"
                  v-model="value"
                  style="display: flex;"
                  disabled
                >
                  <el-option
                    v-for="item in attribute.product_attribute_values"
                    :key="item.id"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <!-- </el-form> -->

            <el-col v-show="!metadata.pos" :span="24" class="location-address-footer">
              <samp style="float: right; padding-top: 4px;">
                <el-button
                  type="danger"
                  icon="el-icon-close"
                />

                <el-button
                  type="primary"
                  icon="el-icon-check"
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
// import store from '@/store'
// Components
import ListTable from './listTable'
// Api
import {
  listProductAttributesSetInstances,
  getProductAttribute
} from '@/api/ADempiere/form/productAttribute'

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
      unsubscribe: () => {}
    }
  },
  created() {
    this.setAttribute()
  },
  methods: {
    optionsAttribute(option) {
      this[option.name]()
    },
    listProductAttribute() {
      const productId = this.$store.getters.getValueOfField({
        containerUuid: this.containerUuid,
        columnName: 'M_Product_ID'
      })
      listProductAttributesSetInstances({
        productId
      })
        .then(response => {
          const { records } = response
          this.listDataAttribute = records
        })
        .catch(error => {
          console.warn(error)
        })
    },
    setAttribute() {
      const productId = this.$store.getters.getValueOfField({
        containerUuid: this.containerUuid,
        columnName: 'M_Product_ID'
      })
      getProductAttribute({
        productId
      })
        .then(response => {
          const { productAttributes } = response
          this.panelAttribute = productAttributes
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
