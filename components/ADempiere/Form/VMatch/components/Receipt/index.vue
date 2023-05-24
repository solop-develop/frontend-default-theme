<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanchez@erpya.com www.erpya.com
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
  <el-tabs type="border-card">
    <el-tab-pane :label="$t('form.match.title.invoice')">
      <el-table
        :data="invoiceList"
        :border="true"
        class="table-import"
        style="height: 100% !important;width: 100% !important;"
      >
        <el-table-column
          type="selection"
          :align="'center'"
          width="55"
        />
        <el-table-column
          v-for="(fieldAttributes, key) in labelTable"
          :key="key"
          :column-key="fieldAttributes.columnName"
          :prop="fieldAttributes.columnName"
          :label="fieldAttributes.label"
          :min-width="fieldAttributes.width"
          :align="fieldAttributes.align"
        />
      </el-table>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'
import store from '@/store'

import tableFrom from '../tableFrom'
import labelTable from '@theme/components/ADempiere/Form/VMatch/labelTable.js'
export default defineComponent({
  name: 'Invoices',
  components: {
    tableFrom
  },
  setup(props, { root }) {
    /**
     * Refs
     */
    const selectInvoice = 'selectedInvoceMatch'
    /**
     * Computed
     */
    const invoiceList = computed(() => {
      const list = store.getters.getMatchToList
      return list
    })

    const selectedInvoice = computed(() => {
      return [  ]
    })

    labelTable
    return {
      invoiceList,
      tableFrom,
      selectInvoice,
      selectedInvoice,
      labelTable
    }
  }
})
</script>
