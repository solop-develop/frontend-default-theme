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
  <el-row style="padding-top: 25px;padding-left: 10px;padding-right: 10px;">
    <div>
      <div style="display: flex">
        <div style="width: 50%;">
          <el-card shadow="always" style="padding: 10px !important;height: 100%;">
            <el-form
              :inline="true"
              label-position="top"
              class="demo-form-inline"
            >
              <el-col :span="24">
                <el-form-item
                  :label="$t('VPayPrint.paymentSelection')"
                >
                  <el-select
                    v-model="currentPaymentSelection"
                    @visible-change="findListPaymentSelection"
                    @change="setPaymentSelection"
                  >
                    <el-option
                      v-for="item in listPayment"
                      :key="item.KeyColumn"
                      :label="item.DisplayColumn"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  :label="$t('VPayPrint.paymentRule')"
                >
                  <el-select
                    v-show="!isEmptyValue(paymentRule)"
                    v-model="paymentRule"
                  >
                    <el-option
                      v-for="item in listPaymentRules"
                      :key="item.uuid"
                      :label="item.name"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="Siguiente Secuencia"
                >
                  {{ numberPayments }}
                </el-form-item>
              </el-col>
            </el-form>
          </el-card>
        </div>
        <div style="width: 50%;">
          <el-card shadow="always" style="padding: 10px !important;">
            <el-row>
              <el-form
                :inline="true"
                label-position="top"
                class="demo-form-inline"
              >
                <el-col :span="24">
                  <el-form-item
                    label="Banco"
                  >
                    <el-input
                      v-show="!isEmptyValue(currentBankAccount)"
                      v-model="currentBankAccount"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item
                    :label="$t('VPayPrint.bankAccount')"
                  >
                    <el-input
                      v-show="!isEmptyValue(currentBankAccount)"
                      v-model="currentBankAccount"
                      disabled
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item
                    :label="$t('VPayPrint.currentBalance')"
                  >
                    <el-input
                      v-show="!isEmptyValue(currentBalance)"
                      v-model="currentBalance"
                      disabled
                    />
                  </el-form-item>
                </el-col>
              </el-form>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-card shadow="never" style="padding: 10px !important;">
                  <div slot="header" class="clearfix" style="text-align: center">
                    <b> {{ $t('VPayPrint.button.labelPanel') }} </b>
                  </div>
                  <div style="text-align: center">
                    <el-button plain type="info">
                      <i class="el-icon-printer" />
                      <br>
                      <b> {{ $t('VPayPrint.button.print') }} </b>
                    </el-button>
                    <el-button plain type="primary">
                      <i class="el-icon-share" />
                      <br>
                      <b> {{ $t('VPayPrint.button.toExport') }} </b>
                    </el-button>
                    <el-button plain type="success">
                      <i class="el-icon-s-tools" />
                      <br>
                      <b> {{ $t('VPayPrint.button.processOnLine') }} </b>
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </div>
      <div>
        <el-table
          :data="dataLote"
          style="width: 100%"
        >
          <index-column
            :page-number="dataLote.length"
          />
          <el-table-column
            v-for="(head, key) in headerTable"
            :key="key"
            :prop="head.columnName"
            :label="head.label"
          />
        </el-table>
      </div>
    </div>
  </el-row>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import lang from '@/lang'
// components and mixins
import IndexColumn from '@theme/components/ADempiere/DataTable/Components/IndexColumn.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'

// API Request Methods
import {
  listPaymentSelection,
  paymentSelection
} from '@/api/ADempiere/form/VPayPrint.js'

export default defineComponent({
  name: 'VPayPrint',

  components: {
    IndexColumn
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
     * @param {string} currentPaymentSelection - Selection of Current Payment
     * @param {array} listPayment - List of Available Payment Selection
     * @param {string} currentBankAccount - Current Payment Selection Bank Account
     * @param {string} currentBalance - Current Balance of Current Payment Selection
     * @param {string} paymentRule - Current Payment Rule of the Current Payment Selection
     * @param {array} listPaymentRules - List of Payment Rule of the Current Payment Selection
     */
    const currentPaymentSelection = ref('')
    const listPayment = ref([])
    const currentBankAccount = ref('')
    const currentBalance = ref('')
    const paymentRule = ref('')
    const listPaymentRules = ref([])
    const documentNo = ref(null)
    const numberPayments = ref('')
    const currency = ref('')

    // Table
    const dataLote = ref([])
    const headerTable = [
      {
        columnName: 'provider',
        label: lang.t('VPayPrint.headerTable.provider')
      },
      {
        columnName: 'invoice',
        label: lang.t('VPayPrint.headerTable.invoice')
      },
      {
        columnName: 'grandTotal',
        label: lang.t('VPayPrint.headerTable.grandTotal')
      },
      {
        columnName: 'subscriber',
        label: lang.t('VPayPrint.headerTable.subscriber')
      },
      {
        columnName: 'payable',
        label: lang.t('VPayPrint.headerTable.payable')
      },
      {
        columnName: 'pending',
        label: lang.t('VPayPrint.headerTable.pending')
      }
    ]

    /**
     * Methods
     */
    function findListPaymentSelection(isFind) {
      if (!isFind) {
        return
      }
      listPaymentSelection()
        .then(response => {
          const { records } = response
          listPayment.value = records.map(selectionPay => {
            return {
              ...selectionPay.values,
              id: selectionPay.values.KeyColumn,
              uuid: selectionPay.values.UUID
            }
          })
        })
        .catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
        })
    }

    function setPaymentSelection(payment) {
      if (isEmptyValue(payment)) {
        return
      }
      paymentSelection({
        id: payment
      })
        .then(response => {
          if (isEmptyValue(response.bank_account)) {
            return showMessage({ message: 'error', type: 'error' })
          }
          currentBankAccount.value = response.bank_account.account_no
          currentBalance.value = response.bank_account.current_balance
          currency.value = response.bank_account.currency.iso_code
          listPaymentRules.value = response.payment_rules
          paymentRule.value = response.payment_rules[0].value
          // listPaymentRules.value = response.payment
        })
        .catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
        })
    }

    return {
      // Const
      headerTable,
      // Refs
      currentPaymentSelection,
      listPayment,
      currentBankAccount,
      currentBalance,
      paymentRule,
      listPaymentRules,
      documentNo,
      numberPayments,
      currency,
      dataLote,
      // Methods
      findListPaymentSelection,
      setPaymentSelection
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
</style>
