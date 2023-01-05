<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
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
along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div style="display: contents;height: 100% !important;">
    <div style="height: 100% !important;">
      <el-card id="panel-top-search-criteria" class="panel-top-search-criteria">
        <div style="width: 50%;">
          <el-form
            :inline="true"
            label-position="top"
            style="padding: 10px !important;"
          >
            <el-col :span="12">
              <el-form-item
                label="Socio de Negocio"
              >
                <el-select v-model="value1" placeholder="Select">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="Organización"
              >
                <el-select v-model="value2" placeholder="Select">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="Moneda"
              >
                <el-select v-model="value3" placeholder="Select">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="Fecha"
              >
                <el-date-picker
                  v-model="value1"
                  type="date"
                />
              </el-form-item>
            </el-col>
          </el-form>
          <br>
          <br>
          <br>
          <el-form
            :inline="true"
            label-position="top"
            style="padding: 10px !important;"
          >
          <el-row>
            <el-col :span="24" style="padding-top: 10%;">
                <el-radio
                  v-model="radioPanel3"
                  :border="true"
                  label="Assignar desde Orden"
                />
                <el-radio
                  v-model="radioPanel3"
                  :border="true"
                  label="Monto Completo"
                />
                <el-radio
                  v-model="radioPanel3"
                  :border="true"
                  label="Auto-Asignar"
                />
                <el-radio
                  v-model="radioPanel2"
                  :border="true"
                  label="Manual"
                />
                <el-radio
                  v-model="radioPanel2"
                  :border="true"
                  label="Cierre de Saldo"
                />
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div style="width: 50%;">
          <el-card style="height: 50% !important;">
            <div slot="header" class="clearfix" style="text-align: center;">
              <b> {{ 'Tipo de Transacción' }} </b>
            </div>
            <div style="padding: 10px !important;">
              <el-form
                :inline="true"
                label-position="top"
                class="demo-form-inline"
              >
                <el-col :span="24">
                  <el-radio
                    v-model="radioPanel2"
                    :border="true"
                    label="Todas"
                  />
                  <el-radio
                    v-model="radioPanel2"
                    :border="true"
                    label="Sólo Ventas"
                  />
                  <el-radio
                    v-model="radioPanel2"
                    :border="true"
                    label="Sólo compra"
                  />
                </el-col>
              </el-form>
            </div>
          </el-card>
          <el-card style="height: 50% !important;">
            <div slot="header" class="clearfix" style="text-align: center;">
              <b> {{ 'Seleccionar Primero' }} </b>
            </div>
            <div style="padding: 10px !important;">
              <el-form
                :inline="true"
                label-position="top"
                class="demo-form-inline"
              >
                <el-col :span="24">
                  <el-radio
                    v-model="radioPanel4"
                    :border="true"
                    label="Factura"
                  />
                  <el-radio
                    v-model="radioPanel4"
                    :border="true"
                    label="Pagos"
                  />
                </el-col>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
// import lang from '@/lang'
// components and mixins
import Carousel from '@theme/components/ADempiere/Carousel'
// import formMixin from '@theme/components/ADempiere/Form/formMixin.js'
// import fieldsList from './fieldList.js'
// import SearchCriteria from './components/SearchCriteria/'
// import Invoices from './components/Invoices/index'
// import Receipt from './components/Receipt/index'

// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
// import { showMessage } from '@/utils/ADempiere/notification'

// API Request Methods
// import {
//   listPaymentSelection,
//   paymentSelection
// } from '@/api/ADempiere/form/VPayPrint.js'

export default defineComponent({
  name: 'SearchCriteria',

  components: {
    Carousel
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  setup(props, { root }) {
    /**
     * Refs
     */

    const stepList = ref([
      {
        name: 'Selección de Criterio',
        description: ''
      },
      {
        name: 'Selección de Factura',
        description: ''
      },
      {
        name: 'Selección de Pagos',
        description: ''
      },
      {
        name: '',
        description: 'Resumen y Ajuste'
      }
    ])
    const radioPanel2 = ref('')
    const radioPanel3 = ref('')
    const radioPanel4 = ref('')

    const value1 = ref('')
    const value2 = ref('')
    const value3 = ref('')

    const options = ref([])

    const currentSetp = ref(0)

    /**
     * Methods
     */

    return {
      // Const
      // Refs
      stepList,
      currentSetp,
      radioPanel2,
      radioPanel3,
      radioPanel4,
      value1,
      value2,
      value3,
      options
      // Methods
    }
  }
})
</script>

<style lang="scss">
  .from-wf-panel {
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .el-input--medium .el-input__inner {
    text-align: end;
  }
  .panel-top-search-criteria {
    display: flex;
    .el-card__body {
      display: contents;
      padding-top: 0px !important;
      padding-right: 0px !important;
      padding-bottom: 2px !important;
      padding-left: 0px !important;
      height: 100%!important;
    }
  }
</style>
