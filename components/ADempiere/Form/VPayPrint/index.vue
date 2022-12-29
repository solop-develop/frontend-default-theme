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
        <!-- Left Pane Search Filter -->
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
                    filterable
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
                    v-show="!isEmptyValue(currentPaymentSelection)"
                    v-model="paymentRule"
                    filterable
                    @visible-change="findListPaymentRueles"
                  >
                    <el-option
                      v-for="(item, key) in listPaymentRules"
                      :key="key"
                      :label="item.displayColumn"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="Siguiente Secuencia"
                >
                  <el-input
                    v-show="!isEmptyValue(currentBalance)"
                    v-model="numberPayments"
                  />
                </el-form-item>
              </el-col>
            </el-form>
          </el-card>
        </div>
        <!-- Right panel -->
        <div style="width: 50%;">
          <el-card shadow="always" style="padding: 10px !important;">
            <!-- Top Panel Labels / E Payment Selection Information -->
            <el-row>
              <el-form
                :inline="true"
                label-position="top"
                class="demo-form-inline"
              >
                <el-col :span="24">
                  <el-form-item
                    label="Banco"
                    style="margin-bottom: 0px;"
                  >
                    <!-- <el-input
                      v-show="!isEmptyValue(currentBankAccount)"
                      v-model="currentBankAccount"
                      disabled
                    /> -->
                    <b style="font-size: 18px;"> {{ currentBank }} </b>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item
                    :label="$t('VPayPrint.bankAccount')"
                    style="margin-bottom: 0px;"
                  >
                    <!-- <el-input
                      v-show="!isEmptyValue(currentBankAccount)"
                      v-model="currentBankAccount"
                      disabled
                    /> -->
                    <b style="font-size: 18px;"> {{ currentBankAccount }} </b>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item
                    :label="$t('VPayPrint.currentBalance')"
                    style="margin-bottom: 0px;"
                  >
                    <b v-show="!isEmptyValue(currentBankAccount)" style="font-size: 18px;"> {{ formatPrice({ value: currentBalance, currency}) }} </b>
                  </el-form-item>
                </el-col>
              </el-form>
            </el-row>
            <!-- Bottom Panel Button Panel / Form Options -->
            <el-row>
              <el-col :span="24">
                <el-card shadow="never" style="padding: 10px !important;">
                  <div slot="header" class="clearfix" style="text-align: center;">
                    <b> {{ $t('VPayPrint.buttons.labelPanel') }} </b>
                  </div>
                  <div style="text-align: center;padding-top: 20px;">
                    <el-button
                      plain
                      type="info"
                      :loading="isLoadPrint"
                      :disable="isLoadPrint"
                      @click="printPayment"
                    >
                      <span v-show="!isLoadPrint">
                        <i class="el-icon-printer" />
                        <br>
                        <b> {{ $t('VPayPrint.buttons.print') }} </b>
                      </span>
                    </el-button>
                    <el-button
                      plain
                      type="primary"
                      :loading="isLoadExport"
                      :disable="isLoadExport"
                      @click="toExport"
                    >
                      <span v-show="!isLoadExport">
                        <i class="el-icon-download" />
                        <br>
                        <b> {{ $t('VPayPrint.buttons.toExport') }} </b>
                      </span>
                    </el-button>
                    <el-button
                      plain
                      type="success"
                      :loading="isLoadProcess"
                      :disable="isLoadProcess"
                      @click="processPayment"
                    >
                      <span v-show="!isLoadProcess">
                        <i class="el-icon-s-tools" />
                        <br>
                        <b> {{ $t('VPayPrint.buttons.processOnLine') }} </b>
                      </span>
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </div>
      <!-- Payment List Table -->
      <div>
        <el-table
          :data="dataLote"
          style="width: 100%"
        >
          <el-table-column :label="$t('VPayPrint.headerTable.title')">
            <index-column
              :page-number="dataLote.length"
            />
            <el-table-column
              v-for="(head, key) in headerTable"
              :key="key"
              :prop="head.columnName"
              :label="head.label"
              :align="head.align"
            >
              <template slot-scope="scope">
                <span v-if="head.align === 'right'">
                  {{ formatQuantity({ value: scope.row[head.columnName] }) }}
                </span>
                <span v-else>
                  {{ scope.row[head.columnName] }}
                </span>
                <!-- {{ scope.row[head.columnName] }} -->
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-row>
</template>

<script>
import { defineComponent, ref, watch } from '@vue/composition-api'
import lang from '@/lang'
// components and mixins
import IndexColumn from '@theme/components/ADempiere/DataTable/Components/IndexColumn.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import {
  formatQuantity,
  formatPrice
} from '@/utils/ADempiere/formatValue/numberFormat'

// API Request Methods
import {
  // Set
  paymentSelection,
  // List
  paymentSelections,
  paymentRules,
  // Table
  listPaymentTable,
  // Documemnt No Sequence
  documentSequence,
  print,
  exportPayment,
  process
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
    const currentBank = ref('')
    const paymentRule = ref('')
    const listPaymentRules = ref([])
    const documentNo = ref(null)
    const numberPayments = ref('')
    const currency = ref('')
    const currentBankAccountId = ref(0)
    const isLoadPrint = ref(false)
    const isLoadExport = ref(false)
    const isLoadProcess = ref(false)

    // Table
    const dataLote = ref([])
    const headerTable = [
      {
        columnName: 'vendor_name',
        label: lang.t('VPayPrint.headerTable.provider'),
        align: 'left'
      },
      {
        columnName: 'document_no',
        label: lang.t('VPayPrint.headerTable.invoice'),
        align: 'left'
      },
      {
        columnName: 'grand_total',
        label: lang.t('VPayPrint.headerTable.grandTotal'),
        align: 'right'
      },
      {
        columnName: 'payment_amount',
        label: lang.t('VPayPrint.headerTable.subscriber'),
        align: 'right'
      },
      {
        columnName: 'over_under_amount',
        label: lang.t('VPayPrint.headerTable.payable'),
        align: 'right'
      },
      {
        columnName: 'open_amount',
        label: lang.t('VPayPrint.headerTable.pending'),
        align: 'right'
      }
    ]

    /**
     * Methods
     */

    function setPaymentSelection(payment) {
      if (isEmptyValue(payment)) {
        return
      }
      paymentSelection({
        id: payment
      })
        .then(response => {
          listPaymentRules.value = []
          const bankAccount = response.bank_account
          if (isEmptyValue(bankAccount)) {
            return showMessage({ message: 'error', type: 'error' })
          }
          currentBankAccount.value = bankAccount.account_no
          currentBalance.value = bankAccount.current_balance
          currentBank.value = bankAccount.bank_name
          currentBankAccountId.value = bankAccount.id
          currency.value = response.currency.iso_code
        })
        .catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
        })
    }

    // List

    function findListPaymentRueles(isfindRules) {
      if (!isfindRules) return
      paymentRules({
        paymentSelectionId: currentPaymentSelection.value
      })
        .then(response => {
          const { records } = response
          listPaymentRules.value = records.map(rulesPay => {
            return {
              ...rulesPay,
              displayColumn: rulesPay.values.DisplayColumn,
              keyColumn: rulesPay.values.KeyColumn
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

    function findListPaymentSelection(isFind) {
      if (!isFind) {
        return
      }
      paymentSelections()
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

    // List Record in Table

    function listTable({
      paymentSelectionId,
      paymentRuleId
    }) {
      listPaymentTable({
        paymentSelectionId,
        paymentRuleId
      })
        .then(responseTable => {
          dataLote.value = responseTable.records
        })
    }

    // Set Document No

    function setDocument({
      paymentSelectionId,
      paymentRuleId,
      banckAccountId
    }) {
      documentSequence({
        paymentSelectionId,
        paymentRuleId,
        banckAccountId
      })
        .then(response => {
          numberPayments.value = response.document_no
        })
    }

    // Process Payment Selecction

    function processPayment() {
      isLoadProcess.value = true
      process({
        paymentSelectionId: currentPaymentSelection.value,
        paymentRuleId: paymentRule.value,
        documentNo: numberPayments.value
      })
        .then(response => {
          isLoadProcess.value = false
          console.log({
            response
          })
        })
        .catch(error => {
          isLoadProcess.value = false
          showMessage({
            message: error,
            type: 'error'
          })
        })
    }

    function printPayment() {
      isLoadPrint.value = true
      print({
        paymentSelectionId: currentPaymentSelection.value,
        paymentRuleId: paymentRule.value,
        documentNo: numberPayments.value
      })
        .then(response => {
          isLoadPrint.value = false
          console.log({
            response
          })
        })
        .catch(error => {
          isLoadPrint.value = false
          showMessage({
            message: error,
            type: 'error'
          })
        })
    }

    function toExport() {
      isLoadExport.value = true
      exportPayment({
        paymentSelectionId: currentPaymentSelection.value,
        paymentRuleId: paymentRule.value,
        documentNo: numberPayments.value
      })
        .then(response => {
          isLoadExport.value = false
          console.log({
            response
          })
        })
        .catch(error => {
          isLoadExport.value = false
          showMessage({
            message: error,
            type: 'error'
          })
        })
    }

    /**
     * Watch
     */
    watch(currentPaymentSelection, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        listTable({
          paymentSelectionId: newValue,
          paymentRuleId: paymentRule.value
        })
        setDocument({
          paymentSelectionId: newValue,
          paymentRuleId: paymentRule.value
        })
      }
    })
    watch(paymentRule, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        listTable({
          paymentSelectionId: currentPaymentSelection.value,
          paymentRuleId: newValue,
          banckAccountId: currentBankAccountId.value
        })
        setDocument({
          paymentSelectionId: currentPaymentSelection.value,
          paymentRuleId: newValue,
          banckAccountId: currentBankAccountId.value
        })
      }
    })

    return {
      // Const
      headerTable,
      // Refs
      currentPaymentSelection,
      listPayment,
      currentBankAccount,
      currentBalance,
      currentBank,
      paymentRule,
      listPaymentRules,
      documentNo,
      currentBankAccountId,
      numberPayments,
      currency,
      dataLote,
      // loading Button
      isLoadPrint,
      isLoadExport,
      isLoadProcess,
      // Methods
      findListPaymentSelection,
      findListPaymentRueles,
      setPaymentSelection,
      listTable,
      setDocument,
      processPayment,
      toExport,
      printPayment,
      formatQuantity,
      formatPrice
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
