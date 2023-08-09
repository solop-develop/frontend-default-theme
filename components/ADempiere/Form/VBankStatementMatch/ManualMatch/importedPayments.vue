<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.www.erpya.com
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-card style="height: 100% !important;">
    <div slot="header" class="clearfix" style="text-align: center;">
      <b>
        {{ $t('form.VBankStatementMatch.importedMovements.title') }}
      </b>

      <el-button
        style="margin-left: 10px;"
        type="success"
        class="button-base-icon"
        icon="el-icon-refresh-right"
        :loading="isLoading"
        @click="refreshSearch"
      />
    </div>

    <el-table
      v-loading="isLoading"
      :data="recorsList"
      :border="true"
      class="table-import"
      max-height="300"
    >
      <!-- <el-table-column
        type="selection"
        :align="'center'"
        width="35"
      /> -->

      <el-table-column
        :label="$t('form.VBankStatementMatch.importedMovements.table.date')"
        width="95"
      >
        <template slot-scope="scope">
          {{ formatDate({ value: scope.row.transaction_date, isDate: true }) }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('form.VBankStatementMatch.importedMovements.table.receipt')"
        width="75"
      >
        <template slot-scope="scope">
          {{ convertBooleanToTranslationLang(scope.row.is_receipt) }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('form.VBankStatementMatch.importedMovements.table.referenceNo')"
        prop="reference_no"
        width="100"
      />

      <el-table-column
        :label="$t('form.VBankStatementMatch.importedMovements.table.businessPartner')"
        width="180"
      >
        <template slot-scope="scope">
          {{ scope.row.business_partner.value }}
          {{ isEmptyValue(scope.row.business_partner.value) ? '': ' - ' }}
          {{ scope.row.business_partner.name }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('form.VBankStatementMatch.importedMovements.table.currency')"
        prop="currency.iso_code"
        width="75"
      />

      <el-table-column
        :label="$t('form.VBankStatementMatch.importedMovements.table.amount')"
        width="150"
      >
        <template slot-scope="scope">
          {{ formatPrice({ value: scope.row.amount, currency: scope.row.currency.iso_code }) }}
        </template>
      </el-table-column>

      <el-table-column
        :label="$t('form.VBankStatementMatch.importedMovements.table.memo')"
        prop="memo"
        width="180"
      />
    </el-table>
  </el-card>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { convertBooleanToTranslationLang } from '@/utils/ADempiere/formatValue/booleanFormat'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { formatPrice } from '@/utils/ADempiere/formatValue/numberFormat'

export default defineComponent({
  name: 'ImportedPayments',

  setup() {
    const isLoading = ref(false)

    const recorsList = computed(() => {
      return store.getters.getImportedPayments
    })

    function refreshSearch() {
      isLoading.value = true
      store.dispatch('searchListImportedBankMovements', {})
        .finally(() => {
          isLoading.value = false
        })
    }

    onMounted(() => {
      if (isEmptyValue(recorsList.value)) {
        refreshSearch()
      }
    })

    return {
      isLoading,
      //
      recorsList,
      //
      formatDate,
      formatPrice,
      convertBooleanToTranslationLang,
      refreshSearch
    }
  }
})
</script>
