<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
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
  <div style="height: -webkit-fill-available;">
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
            v-model="bankAccount"
            placeholder="Select"
            @visible-change="findListBankAccount"
            @change="changeBankAccount"
          >
            <el-option
              v-for="item in bankAccountOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
            range-separator="To"
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
          />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import FieldDefinition from '@/themes/default/components/ADempiere/FieldDefinition/index.vue'
import { createFieldFromDictionary } from '@/utils/ADempiere/lookupFactory'
import { isHiddenField } from '@/utils/ADempiere/references'
import store from '@/store'
// import lang from '@/lang'

export default defineComponent({
  name: 'SearchCriteria',
  components: {
    FieldDefinition
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

    const bankAccountOptions = ref([])

    const bankAccount = ref('')

    const bPartner = ref({ componentPath: 'FieldSearch' })

    const totalPayment = ref(0)

    const totalPayment1 = ref(0)

    const transactionDate = ref('')

    const modeSearch = ref('')

    const modeSearchOptions = ref([
      {
        label: 'Not Matched',
        value: 0
      },
      {
        label: 'Matched',
        value: 1
      }
    ])

    const systemPayment = ref([])

    const importedMovements = ref([])

    const item = {
      date: '2016-05-02',
      collection: 'Si',
      documentNo: '45256',
      businessPartner: 'Tom',
      paymentType: 'Check',
      currency: 'VES',
      amount: '213.20',
      desciption: 'No. 189, Grove St, Los Angeles'
    }

    systemPayment.value = Array(20).fill(item)
    importedMovements.value = Array(20).fill(item)

    /**
     * Methods
     */

    function isMandatoryField({ isMandatory, isMandatoryFromLogic }) {
      return isMandatory || isMandatoryFromLogic
    }

    function isDisplayedDefault({ isMandatory }) {
      return true
    }

    function isDisplayedField({ displayType, isActive, isDisplayed, isDisplayedFromLogic }) {
      // button field not showed
      if (isHiddenField(displayType)) {
        return false
      }
      // verify if field is active
      return isActive && isDisplayed
    }

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

    function findListBankAccount(isVisible) {
      if (!isVisible) return
      // listBankAccount()
      //   .then(response => {
      //     const { records } = response
      //     bankAccountOptions.value = records
      //   })
      //   .catch(error => {
      //     showMessage({
      //       message: error.message,
      //       type: 'warning'
      //     })
      //   })
    }

    function changeBankAccount(value) {
      bankAccount.value = value
    }

    createField()

    return {
      bankAccountOptions,
      bankAccount,
      bPartner,
      totalPayment,
      totalPayment1,
      transactionDate,
      modeSearch,
      modeSearchOptions,
      systemPayment,
      importedMovements,
      createField,
      isMandatoryField,
      isDisplayedField,
      isHiddenField,
      isReadOnlyField,
      generalInfoSearch,
      searchTableHeader,
      getSearchInfoList,
      isDisplayedDefault,
      findListBankAccount,
      changeBankAccount
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
