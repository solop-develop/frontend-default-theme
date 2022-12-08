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
        label-position="left"
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
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item
            :label="$t('VPayPrint.bankAccount')"
          >
            {{ currentBankAccount }}
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item
            :label="$t('VPayPrint.currentBalance')"
          >
            {{ currentBalance }}
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item
            :label="$t('VPayPrint.paymentRule')"
          >
            <el-select
              v-model="paymentRule"
            >
              <el-option
                v-for="item in listPaymentRules"
                :key="item.KeyColumn"
                :label="item.DisplayColumn"
                :value="item.KeyColumn"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item
            :label="$t('VPayPrint.currency')"
          >
            {{ currency }}
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
    }

    function setPaymentSelection(payment) {
      if (isEmptyValue(payment)) {
        return
      }

      const { id, uuid } = payment
      paymentSelection({
        id,
        uuid
      })
        .then(response => {
          listPaymentRules.value = response.payment
        })
        .catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
        })
    }

    /**
     * watch
     */
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
