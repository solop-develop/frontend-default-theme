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
    <el-card shadow="always" style="padding: 15px">
      <el-form
        :inline="true"
        label-position="top"
        class="demo-form-inline"
      >
        <el-col :span="6">
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

        <el-col :span="6">
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

        <el-col :span="6">
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

        <el-col :span="6">
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

        <el-col :span="6">
          <el-form-item
            :label="$t('VPayPrint.currency')"
          >
            <el-input
              v-show="!isEmptyValue(currency)"
              v-model="currency"
              disabled
            />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item
            :label="$t('VPayPrint.documentNo')"
          >
            <el-input-number
              v-model="documentNo"
              controls-position="right"
              style="text-align: end;"
            />
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item
            :label="$t('VPayPrint.numberPayments')"
          >
            {{ numberPayments }}
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-button
            type="primary"
            icon="el-icon-printer"
          />
          <el-button
            type="success"
            icon="el-icon-setting"
          />
        </el-col>
      </el-form>
    </el-card>
  </el-row>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'

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
