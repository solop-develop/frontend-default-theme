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
          <field-definition
            :metadata-field="bankAccount"
            :container-uuid="metadata.containerUuid"
            :container-manager="{
              isDisplayedField,
              generalInfoSearch,
              searchTableHeader,
              isMandatoryField,
              isReadOnlyField,
              isDisplayedDefault,
              getSearchInfoList,
              getLookupList
            }"
            :in-table="true"
          />
        </el-form-item>
        <el-form-item
          :label="$t('VBankStatementMatch.field.businessPartner')"
          class="form-item-criteria"
        >
          <field-definition
            :metadata-field="bPartner"
            :container-uuid="metadata.containerUuid"
            :container-manager="{
              isDisplayedField,
              generalInfoSearch,
              searchTableHeader,
              isMandatoryField,
              isReadOnlyField,
              isDisplayedDefault,
              getSearchInfoList
            }"
            :in-table="true"
          />
        </el-form-item>
        <el-form-item
          :label="$t('VBankStatementMatch.field.totalPayment')"
          class="form-item-criteria"
        >
          <el-card shadow="never">
            <el-input-number v-model="totalPayment" controls-position="right" />
            <b style="color: #80808078;margin-left: 5px;margin-right: 5px;font-weight: 999;">
              {{ '─' }}
            </b>
            <el-input-number v-model="totalPayment1" controls-position="right" />
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
          <el-select v-model="modeSearch" placeholder="Select">
            <el-option
              v-for="item in modeSearchOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button
            type="primary"
            icon="el-icon-zoom-in"
            plain
            style="float: right; margin-left: 5px;"
            class="button-base-icon"
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

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import FieldDefinition from '@/themes/default/components/ADempiere/FieldDefinition/index.vue'
import { createFieldFromDictionary } from '@/utils/ADempiere/lookupFactory'
// import { isHiddenField } from '@/utils/ADempiere/references'
import AutomaticMatch from './AutomaticMatch.vue'
import store from '@/store'
import lang from '@/lang'
import { isDisplayedField } from './containerManagerFrom.ts'

export default defineComponent({
  name: 'SearchCriteria',
  components: {
    FieldDefinition,
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

    const bankAccount = ref({ componentPath: 'FieldSelect' })

    const bPartner = ref({ componentPath: 'FieldSearch' })

    const totalPayment = ref(0)

    const totalPayment1 = ref(0)

    const transactionDate = ref('')

    const modeSearch = ref('')

    const modeSearchOptions = ref([
      {
        label: lang.t('VBankStatementMatch.field.selectNotMatched'),
        value: 0
      },
      {
        label: lang.t('VBankStatementMatch.field.selectMatched'),
        value: 1
      }
    ])

    const isShowTable = ref(false)

    const isPanelFooter = ref(false)

    /**
     * Methods
     */

    function isMandatoryField({ isMandatory, isMandatoryFromLogic }) {
      return isMandatory || isMandatoryFromLogic
    }

    function isDisplayedDefault({ isMandatory }) {
      return true
    }

    // function isDisplayedField({ displayType, isActive, isDisplayed, isDisplayedFromLogic }) {
    //   // button field not showed
    //   if (isHiddenField(displayType)) {
    //     return false
    //   }
    //   // verify if field is active
    //   return isActive && isDisplayed
    // }

    function isReadOnlyField({ isQueryCriteria, isReadOnlyFromLogic }) {
      return isQueryCriteria && isReadOnlyFromLogic
    }

    function generalInfoSearch({
      containerUuid,
      contextColumnNames,
      filters,
      uuid,
      searchValue,
      tableName,
      columnName,
      pageNumber
    }) {
      return store.dispatch('findGeneralInfo', {
        containerUuid,
        contextColumnNames,
        filters,
        // fieldUuid: uuid,
        searchValue,
        tableName,
        columnName,
        pageNumber
      })
    }

    function searchTableHeader({
      containerUuid,
      tableName
    }) {
      return store.dispatch('searchTableHeader', {
        containerUuid,
        tableName
      })
    }

    function getSearchInfoList({ parentUuid, containerUuid, contextColumnNames, tableName, columnName, pageNumber, uuid, filters, searchValue, pageSize }) {
      return store.dispatch('searchInfoList', {
        parentUuid,
        containerUuid,
        contextColumnNames,
        fieldUuid: uuid,
        tableName,
        columnName,
        filters,
        searchValue,
        pageNumber,
        pageSize
      })
    }

    function getLookupList({ parentUuid, containerUuid, contextColumnNames, columnName, searchValue, isAddBlankValue, blankValue }) {
      return store.dispatch('getLookupListFromServer', {
        parentUuid,
        containerUuid,
        contextColumnNames,
        columnName,
        searchValue,
        tableName: 'C_BankStatement',
        // app attributes
        isAddBlankValue,
        blankValue
      })
    }

    function createField() {
      createFieldFromDictionary({
        containerUuid: props.metadata.containerUuid,
        uuid: '',
        elementUuid: '',
        elementColumnName: '',
        tableName: '',
        columnName: '',
        overwriteDefinition: {
          containerUuid: props.metadata.containerUuid
        },
        columnUuid: props.columnUuid
      })
        .then(response => {
          bPartner.value = response
        }).catch(error => {
          console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
        })
    }

    function createFieldAccount() {
      createFieldFromDictionary({
        containerUuid: props.metadata.containerUuid,
        uuid: '',
        elementUuid: '',
        elementColumnName: '',
        tableName: '',
        columnName: '',
        overwriteDefinition: {
          containerUuid: props.metadata.containerUuid
        },
        columnUuid: '8c104566-fb40-11e8-a479-7a0060f0aa01'
      })
        .then(response => {
          bankAccount.value = response
        }).catch(error => {
          console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
        })
    }

    function searchMatch() {
      const bankAccountId = store.getters.getValueOfFieldOnContainer({
        parentUuid: bankAccount.value.parentUuid,
        containerUuid: bankAccount.value.containerUuid,
        columnName: bankAccount.value.columnName
      })
      const businessPartnerId = store.getters.getValueOfFieldOnContainer({
        parentUuid: bPartner.value.parentUuid,
        containerUuid: bPartner.value.containerUuid,
        columnName: bPartner.value.columnName
      })
      store.dispatch('searchMatch', {
        bankAccountId,
        dateFrom: transactionDate.value[0],
        dateTo: transactionDate.value[1],
        businessPartnerId,
        paymentAmountFrom: totalPayment.value,
        paymentAmountTo: totalPayment1.value,
        matchMode: modeSearch.value
      })
      isPanelFooter.value = true
      setTimeout(() => {
        // isPanelFooter.value = false
        isShowTable.value = true
      }, 3000)
    }

    createField()
    createFieldAccount()

    return {
      bankAccount,
      bPartner,
      totalPayment,
      totalPayment1,
      transactionDate,
      modeSearch,
      modeSearchOptions,
      isShowTable,
      isPanelFooter,
      createField,
      createFieldAccount,
      isMandatoryField,
      isDisplayedField,
      // isHiddenField,
      isReadOnlyField,
      generalInfoSearch,
      searchTableHeader,
      getSearchInfoList,
      getLookupList,
      isDisplayedDefault,
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
</style>
