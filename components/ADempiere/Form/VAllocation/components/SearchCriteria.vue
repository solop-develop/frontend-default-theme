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
          <el-card style="padding: 5px 10px 5px 10px;">
            <el-form
              :inline="true"
              label-position="top"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item
                    label="Socio de Negocio"
                    style="width: 100%;"
                  >
                    <el-select
                      v-model="businessPartners"
                      style="width: 100%;"
                      filterable
                      @visible-change="findBusinessPartners"
                    >
                      <el-option
                        v-for="item in optionsBusinessPartners"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="Organización"
                    style="width: 100%;"
                  >
                    <el-select
                      v-model="organizations"
                      style="width: 100%;"
                      filterable
                      @visible-change="findOrganizations"
                    >
                      <el-option
                        v-for="item in optionsOrganizations"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item
                    label="Moneda"
                    style="width: 100%;"
                  >
                    <el-select
                      v-model="currency"
                      style="width: 100%;"
                      filterable
                      @visible-change="findCurrencies"
                    >
                      <el-option
                        v-for="item in optionsCurrency"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="Fecha"
                    style="width: 100%;"
                  >
                    <el-date-picker
                      v-model="value1"
                      type="date"
                      style="width: 100%;"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>
        <div style="width: 50%;">
          <el-card style="height: 100%;">
            <div slot="header" class="clearfix" style="text-align: center;">
              <b> {{ 'Tipo de Transacción' }} </b>
            </div>
            <div style="padding: 10px !important;">
              <el-form
                :inline="true"
                label-position="top"
                class="demo-form-inline"
                style="text-align: center;"
              >
                <el-form-item
                  v-for="(type, index) in listTypeTransaction"
                  :key="index"
                  :label="type.DisplayColumn"
                >
                  <el-switch
                    v-model="type.isSelect"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    style="padding: 0px 20px;margin: 0px 5px;"
                    @change="changeType(type)"
                  />
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-card>
      <p style="text-align: center;">
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
      </p>
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
import {
  listTransactionTypes,
  listBusinessPartners,
  listOrganizations,
  listCurrencies
} from '@/api/ADempiere/form/VAllocation.js'
import { isEmptyValue } from '@/utils/ADempiere'

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

    const options = ref([])

    const currentSetp = ref(0)

    // Value the Select

    const currentTypeTransaction = ref('')
    const businessPartners = ref('')
    const organizations = ref('')
    const currency = ref('')

    // List Option the Select

    const optionsBusinessPartners = ref([])
    const optionsOrganizations = ref([])
    const optionsCurrency = ref([])

    const listTypeTransaction = ref([])

    /**
     * Methods
     */

    function findBusinessPartners(isFind) {
      if (!isFind) return
      listBusinessPartners({
        searchValue: businessPartners.value
      })
        .then(response => {
          const { records } = response
          optionsBusinessPartners.value = records.map(business => {
            // const { DisplayColumn } = business.values
            // console.log({ DisplayColumn })
            return {
              ...business,
              label: business.values.DisplayColumn
            }
          })
        })
    }

    function findOrganizations(isFind) {
      if (!isFind) return
      listOrganizations({
        searchValue: organizations.value
      })
        .then(response => {
          const { records } = response
          optionsOrganizations.value = records.map(organizations => {
            const { id, uuid, values } = organizations
            return {
              id,
              uuid,
              label: values.DisplayColumn
            }
          })
        })
    }

    function findCurrencies(isFind) {
      if (!isFind) return
      listCurrencies({
        searchValue: currency.value
      })
        .then(response => {
          const { records } = response
          optionsCurrency.value = records.map(currency => {
            const { id, uuid, values } = currency
            return {
              id,
              uuid,
              label: values.DisplayColumn
            }
          })
        })
    }

    function setListTransactionTypes() {
      if (!isEmptyValue(listTypeTransaction.value)) return
      listTransactionTypes()
        .then(response => {
          const { records } = response
          listTypeTransaction.value = records.map(type => {
            const { KeyColumn, ValueColumn, DisplayColumn } = type.values
            return {
              ...type,
              KeyColumn,
              ValueColumn,
              DisplayColumn,
              isSelect: false
            }
          })
        })
    }

    function changeType(params) {
      currentTypeTransaction.value = params.ValueColumn
      listTypeTransaction.value.forEach(type => {
        type.isSelect = currentTypeTransaction.value === type.ValueColumn
      })
    }

    setListTransactionTypes()

    return {
      // Const
      // Refs
      stepList,
      currentSetp,
      radioPanel2,
      radioPanel3,
      radioPanel4,
      value1,
      options,
      // List Option
      optionsBusinessPartners,
      currentTypeTransaction,
      optionsOrganizations,
      listTypeTransaction,
      optionsCurrency,
      businessPartners,
      organizations,
      currency,
      // Methods,
      setListTransactionTypes,
      findBusinessPartners,
      findOrganizations,
      findCurrencies,
      changeType
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
