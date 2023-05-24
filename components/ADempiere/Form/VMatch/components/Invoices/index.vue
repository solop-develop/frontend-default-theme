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
  <div>
    <div>
      <el-tabs type="border-card">
        <el-tab-pane :label="matchedFromLabel">
          <el-table
            v-loading="matchFromListLoading"
            :data="matchFromList"
            :border="true"
            height="300px"
            class="table-import"
            style="height: 100% !important;width: 100% !important;"
            @current-change="handleCurrentChangeFrom"
          >
            <el-table-column
              :align="'center'"
              width="55"
            >
              <template slot-scope="scope">
                <i v-if="scope.row.isSelection" class="el-icon-check" style="font-size: 21px;color: green;font-weight: 600;" />
              </template>
            </el-table-column>
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
        <custom-pagination
          :total="matchFromList.length"
          style="margin-top: 10px;"
        />
      </el-tabs>
      <el-tabs type="border-card">
        <el-tab-pane :label="matchedToLabel">
          <el-checkbox
            v-model="isSameQuantity"
            :label="$t('form.match.filtersSearch.sameQuantity')"
            border
            style="margin-top: 10px;margin-bottom: 10px;"
          />
          <el-table
            v-loading="matchToListLoading"
            :data="matchToList"
            :border="true"
            height="250px"
            class="table-import"
            :empty-text="'Por Favro Selecione una' + ' ' + matchedFromLabel"
            style="height: 100% !important;width: 100% !important;"
            @current-change="handleCurrentChangeTo"
          >
            <el-table-column
              :align="'center'"
              width="55"
            >
              <template slot-scope="scope">
                <i v-if="scope.row.isSelection" class="el-icon-check" style="font-size: 21px;color: green;font-weight: 600;" />
              </template>
            </el-table-column>
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
          <custom-pagination
            :total="matchToList.length"
            style="margin-top: 10px;"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-form
      label-position="top"
      class="from-main"
      @submit.native.prevent="notSubmitForm"
    >
      <el-row :gutter="24">
        <el-col :span="8">
          <el-form-item class="front-item-receipt">
            <template slot="label" style="width: 450px;">
              {{ $t('form.match.field.toAssigned') }}
            </template>
            <el-input-number v-model="toAssigned" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="front-item-receipt">
            <template slot="label" style="width: 450px;">
              {{ $t('form.match.field.assigning') }}
            </template>
            <el-input-number v-model="assigning" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item class="front-item-receipt">
            <template slot="label" style="width: 450px;">
              {{ $t('form.match.field.difference') }}
            </template>
            <el-input-number v-model="difference" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <slot name="footer" style="margin-top: 10px !important;" />
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  watch
} from '@vue/composition-api'
import store from '@/store'

import CustomPagination from '@theme/components/ADempiere/DataTable/Components/CustomPagination.vue'
import labelTable from '@theme/components/ADempiere/Form/VMatch/labelTable.js'
import { isEmptyValue } from '@/utils/ADempiere'
export default defineComponent({
  name: 'Invoices',
  components: {
    CustomPagination
  },
  setup(props, { root }) {
    /**
     * Refs
     */
    const selectInvoice = 'selectedInvoceMatch'
    // const isSameQuantity = ref(false)
    /**
     * Computed
     */

    const isSameQuantity = computed({
      // getter
      get() {
        return false
      },
      // setter
      set(id) {
        return id
      }
    })
    const matchFromList = computed(() => {
      const { list } = store.getters.getMatchFromList
      return list
    })

    const selectedInvoice = computed(() => {
      return []
    })

    const matchToList = computed(() => {
      const { list } = store.getters.getMatchToList
      return list
    })

    const matchToListLoading = computed(() => {
      const { isLoading } = store.getters.getMatchToList
      return isLoading
    })

    const matchFromListLoading = computed(() => {
      const { isLoading } = store.getters.getMatchFromList
      return isLoading
    })

    const matchedFromLabel = computed(() => {
      return store.getters.getLabelAssignFrom
    })

    const matchedToLabel = computed(() => {
      return store.getters.getLabelAssignTo
    })

    const isValidateSelectFrom = computed(() => {
      return store.getters.getSelecteAssignFrom
    })

    const toAssigned = computed(() => {
      const toAssigned = store.getters.getSelecteAssignFrom
      if (isEmptyValue(toAssigned)) return 0
      return toAssigned.quantity
    })

    const assigning = computed(() => {
      const assigning = store.getters.getSelecteAssignTo
      if (isEmptyValue(assigning)) return 0
      return assigning.quantity
    })

    const difference = computed(() => {
      const result = assigning.value - toAssigned.value
      return result
    })

    /**
     * Methods
     */
    function handleCurrentChangeFrom(row) {
      if (isEmptyValue(row)) return
      row.isSelection = !row.isSelection
      const {
        id,
        vendorId,
        productId
      } = row
      const list = matchFromList.value.filter(from => from.id !== row.id)
      store.dispatch('findListMatchedTo', {
        id,
        vendorId,
        productId,
        isSameQuantity: isSameQuantity.value
      })
      store.commit('setSelecteAssignFrom', row)
      cleanSelection(list)
    }

    function handleCurrentChangeTo(row) {
      if (isEmptyValue(row)) return
      row.isSelection = !row.isSelection
      const list = matchToList.value.filter(from => from.id !== row.id)
      store.commit('setSelecteAssignTo', row)
      cleanSelection(list)
    }

    function cleanSelection(list) {
      if (isEmptyValue(list)) return
      list.forEach(element => {
        element.isSelection = false
      })
    }

    /**
     * Watch
     */
    watch(isSameQuantity, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        const {
          id,
          vendorId,
          productId
        } = store.getters.getSelecteAssignFrom
        store.dispatch('findListMatchedTo', {
          id,
          vendorId,
          productId,
          isSameQuantity: isSameQuantity.value
        })
      }
    })

    labelTable
    return {
      // Import
      labelTable,
      // Computed
      isValidateSelectFrom,
      matchFromListLoading,
      matchToListLoading,
      matchedFromLabel,
      selectedInvoice,
      matchedToLabel,
      isSameQuantity,
      selectInvoice,
      matchFromList,
      matchToList,
      difference,
      toAssigned,
      assigning,
      // Methods
      handleCurrentChangeFrom,
      handleCurrentChangeTo
    }
  }
})
</script>
