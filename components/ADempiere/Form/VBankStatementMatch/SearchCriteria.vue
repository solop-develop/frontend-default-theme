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
  <div>
    <el-card id="panel-top-search-criteria" class="panel-top-search-criteria">
      <el-form
        :inline="true"
        label-position="top"
        style="padding: 10px !important;"
      >
        <el-form-item
          :label="$t('VBankStatementMatch.field.bankAccount')"
          class="form-item-criteria"
        >
          <el-select
            v-model="bankAccount.id"
            filterable
            clearable
            @visible-change="listBankAccount"
          >
            <el-option
              v-for="item in bankAccount.list"
              :key="item.KeyColumn"
              :label="item.DisplayColumn"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('VBankStatementMatch.field.businessPartner')"
          class="form-item-criteria"
        >
          <el-select
            v-model="businessPartner.id"
            filterable
            clearable
            @visible-change="listBPartners"
          >
            <el-option
              v-for="item in businessPartner.list"
              :key="item.KeyColumn"
              :label="item.DisplayColumn"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('VBankStatementMatch.field.totalPayment')"
          class="form-item-criteria"
        >
          <el-card shadow="never">
            <el-input-number
              v-model="paymentAmountTo"
              controls-position="right"
            />
            <b style="color: #80808078;margin-left: 5px;margin-right: 5px;font-weight: 999;">
              {{ '─' }}
            </b>
            <el-input-number
              v-model="paymentAmountFrom"
              controls-position="right"
            />
          </el-card>
        </el-form-item>
        <el-form-item
          :label="$t('VBankStatementMatch.field.transactionDate')"
          class="form-item-criteria"
        >
          <el-date-picker
            v-model="transactionDate"
            type="daterange"
            range-separator="-"
            format="yyyy-MM-dd"
            value-format="timestamp"
            start-placeholder="Start date"
            end-placeholder="End date"
          />
        </el-form-item>
        <el-form-item
          :label="$t('VBankStatementMatch.field.searchMode')"
          class="form-item-criteria"
        >
          <el-select
            v-model="matchMode.value"
            filterable
            clearable
            @visible-change="listMatchMode"
          >
            <el-option
              v-for="item in matchMode.list"
              :key="item.ValueColumn"
              :label="item.DisplayColumn"
              :value="item.ValueColumn"
            />
          </el-select>
          <el-button
            type="primary"
            icon="el-icon-refresh-right"
            plain
            style="float: right; margin-left: 5px;"
            class="button-base-icon"
            :disabled="isEmptyValue(bankAccount.id) || isEmptyValue(matchMode.value)"
            @click="searchMatch"
          />
        </el-form-item>
      </el-form>
    </el-card>
    <br>
    <el-card v-if="isPanelFooter">
      <automatic-match
        :loading="!isShowTable"
      />
    </el-card>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
// import FieldDefinition from '@/themes/default/components/ADempiere/FieldDefinition/index.vue'
// import { createFieldFromDictionary } from '@/utils/ADempiere/lookupFactory'
// import { isHiddenField } from '@/utils/ADempiere/references'
import AutomaticMatch from './AutomaticMatch.vue'
import store from '@/store'
// import lang from '@/lang'
// import { isDisplayedField } from './containerManagerFrom.ts'
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'SearchCriteria',
  components: {
    // FieldDefinition,
    AutomaticMatch
    // FieldSearch
  },
  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    },
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      default: ''
    },
    columnUuid: {
      type: String,
      default: '8c05d8e2-fb40-11e8-a479-7a0060f0aa01'
    }
  },
  setup(props, { root }) {
    /**
    * Refs
    */

    const isPanelFooter = ref(false)

    const bankAccount = computed({
      // getter
      get() {
        const { bankAccounts } = store.getters.getCriteriaVBankStatement
        return bankAccounts
      },
      // setter
      set(id) {
        store.commit('updateAttributeCriteria', {
          attribute: 'id',
          criteria: 'bankAccounts',
          value: id
        })
      }
    })

    const businessPartner = computed({
      // getter
      get() {
        const { businessPartner } = store.getters.getCriteriaVBankStatement
        return businessPartner
      },
      // setter
      set(id) {
        store.commit('updateAttributeCriteria', {
          attribute: 'id',
          criteria: 'businessPartner',
          value: id
        })
      }
    })

    const paymentAmountTo = computed({
      // getter
      get() {
        const { paymentAmount } = store.getters.getCriteriaVBankStatement
        return paymentAmount.to
      },
      // setter
      set(value) {
        store.commit('updateAttributeCriteria', {
          attribute: 'to',
          criteria: 'paymentAmount',
          value
        })
      }
    })

    const paymentAmountFrom = computed({
      // getter
      get() {
        const { paymentAmount } = store.getters.getCriteriaVBankStatement
        return paymentAmount.from
      },
      // setter
      set(value) {
        store.commit('updateAttributeCriteria', {
          attribute: 'from',
          criteria: 'paymentAmount',
          value
        })
      }
    })

    const matchMode = computed({
      // getter
      get() {
        const { matchMode } = store.getters.getCriteriaVBankStatement
        return matchMode
      },
      // setter
      set(value) {
        store.commit('updateAttributeCriteria', {
          attribute: 'value',
          criteria: 'matchMode',
          value
        })
      }
    })

    const transactionDate = computed({
      // getter
      get() {
        const { transactionDate } = store.getters.getCriteriaVBankStatement
        if (isEmptyValue(transactionDate.to) && isEmptyValue(transactionDate.from)) return ''
        return [transactionDate.to, transactionDate.from]
      },
      // setter
      set(value) {
        store.commit('updateAttributeCriteria', {
          attribute: 'to',
          criteria: 'transactionDate',
          value: value[0]
        })
        store.commit('updateAttributeCriteria', {
          attribute: 'from',
          criteria: 'transactionDate',
          value: value[1]
        })
      }
    })

    function listBankAccount(isFind) {
      if (!isFind || !isEmptyValue(bankAccount.value.list)) return
      store.dispatch('listBankAccount', {})
    }

    function listBPartners(isFind) {
      if (!isFind || !isEmptyValue(businessPartner.value.list)) return
      store.dispatch('listBusinessPartner', {})
    }

    function listMatchMode(isFind) {
      if (!isFind || !isEmptyValue(matchMode.value.list)) return
      store.dispatch('listMatchMode', {})
    }

    function searchMatch() {
      isPanelFooter.value = true
      store.dispatch('searchListPayments', {})
      store.dispatch('searchListImportedBankMovements', {})
      store.dispatch('searchListMatchingMovements', {})
    }

    return {
      isPanelFooter,
      bankAccount,
      businessPartner,
      paymentAmountTo,
      paymentAmountFrom,
      transactionDate,
      matchMode,
      listBankAccount,
      listBPartners,
      listMatchMode,
      searchMatch
    }
  }
})
</script>

<style lang="scss">
.form-item-criteria {
  margin-top: 0px;
  margin-left: 0px;
  margin-bottom: 0px;
  margin-right: 0px;
  padding-bottom: 0px;
  .el-form-item__label {
    padding-bottom: 0px;
  }
  .el-form-item--medium .el-form-item__label {
    padding-bottom: 0px;
  }
  .el-form--inline .el-form-item {
    margin: 0px;
  }
}
.el-input {
  .el-input__inner {
    text-align-last: end !important;
  }
}
</style>
