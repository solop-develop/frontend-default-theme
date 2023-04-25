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
    <el-card id="panel-top-search-criteria" class="panel-top-search-criteria">
      <div style="width: 50%;">
        <el-card style="padding: 5px 10px 5px 10px;">
          <div slot="header" class="clearfix" style="text-align: center;">
            <b> {{ 'Pagos' }} </b>
          </div>
          <el-table
            :data="tableData"
            border
            style="min-height: 400px;width: 100%;"
          >
            <el-table-column
              v-for="(header, key) in headersInvoice"
              :key="key"
              prop="id"
              :width="header.width"
              :label="header.label"
            />
          </el-table>
        </el-card>
      </div>
      <div style="width: 50%;">
        <el-card style="padding: 5px 10px 5px 10px;">
          <div slot="header" class="clearfix" style="text-align: center;">
            <b> {{ 'Facturas' }} </b>
          </div>
          <el-table
            :data="tableData"
            border
            style="min-height: 400px;width: 100%;"
          >
            <el-table-column
              v-for="(header, key) in headersInvoice"
              :key="key"
              prop="id"
              :width="header.width"
              :label="header.label"
            />
          </el-table>
        </el-card>
      </div>
    </el-card>
    <el-card class="box-card">
      <div id="description-payment" class="description-payment" style="display: flex;">
        <el-card
          class="box-card"
          style="width: 50%;float: left;"
        >
          <div>
            <el-form
              :inline="true"
              label-position="left"
              style="padding: 10px !important;"
            >
              <el-col :span="24">
                <el-form-item
                  label="Cantidad de Registro:"
                >
                  <b>
                    5
                  </b>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="Total Factura:"
                >
                  <b>
                    8.506,23
                  </b>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="Convertido:"
                >
                  <b>
                    530,63
                  </b>
                </el-form-item>
              </el-col>
            </el-form>
          </div>
        </el-card>
        <el-card
          class="box-card"
          style="width: 50%;float: right;"
        >
          <div>
            <el-form
              :inline="true"
              label-position="left"
              style="padding: 10px !important;"
            >
              <el-col :span="24">
                <el-form-item
                  label="Pagado:"
                >
                  <b>
                    350,63
                  </b>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="Asignado:"
                >
                  <b>
                    170,00
                  </b>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="Monto Abierto:"
                >
                  <b>
                    10,00
                  </b>
                </el-form-item>
              </el-col>
            </el-form>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import lang from '@/lang'
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
  name: 'Payments',

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

    const tableData = ref([])

    const headersPayments = ref([
      {
        label: lang.t('form.VAllocation.payment.table.date'),
        columnName: '',
        width: '145'
      },
      {
        label: lang.t('form.VAllocation.payment.table.apAr'),
        columnName: '',
        width: '90'
      },
      {
        label: lang.t('form.VAllocation.payment.table.organization'),
        columnName: '',
        width: '130'
      },
      {
        label: lang.t('form.VAllocation.payment.table.documentNo'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.payment.table.description'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.payment.table.converted'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.payment.table.open'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.payment.table.applied'),
        columnName: '',
        width: '150'
      }
    ])

    const headersInvoice = ref([
      {
        label: lang.t('form.VAllocation.invoice.table.date'),
        columnName: '',
        width: '145'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.apAr'),
        columnName: '',
        width: '90'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.organization'),
        columnName: '',
        width: '130'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.documentNo'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.description'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.converted'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.open'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.tradeDiscount'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.writeOff'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.applied'),
        columnName: '',
        width: '150'
      },
      {
        label: lang.t('form.VAllocation.invoice.table.overUnderPay'),
        columnName: '',
        width: '200'
      }
    ])

    /**
     * Methods
     */

    return {
      // Const
      // Refs
      tableData,
      headersPayments,
      headersInvoice
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
