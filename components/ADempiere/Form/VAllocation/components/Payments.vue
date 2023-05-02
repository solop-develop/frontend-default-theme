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
  <div style="display: contents;height: 100% !important;">
    <div style="height: 89% !important;">
      <el-card id="panel-top-search-criteria" class="panel-top-search-criteria" style="height: 100%;">
        <div style="width: 50%;t: 100%;">
          <el-card style="padding: 5px 10px 5px 10px;height: 100%;">
            <div slot="header" class="clearfix" style="text-align: center;">
              <b> {{ $t('form.VAllocation.payment.title') }} </b>
            </div>
            <el-table
              id="listPaymentsTable"
              ref="listPaymentsTable"
              :data="listPayments"
              border
              style="width: 100%;height: 90%;"
              @select="handleSelectionPayments"
            >
              <el-table-column
                type="selection"
                width="40"
              />
              <el-table-column
                v-for="(header, key) in headersPayments"
                :key="key"
                :align="header.align"
                :width="header.width"
                :label="header.label"
              >
                <template slot-scope="scope">
                  <span v-if="(header.columnName === 'organization' || header.columnName === 'transaction_type')">
                    {{ scope.row[header.columnName].name }}
                  </span>
                  <span v-else-if="header.columnName === 'applied'">
                    <el-input-number
                      v-model="scope.row[header.columnName]"
                      controls-position="right"
                    />
                  </span>
                  <span v-else>
                    {{ scope.row[header.columnName] }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
        <div style="width: 50%;height: 100%;">
          <el-card style="padding: 5px 10px 5px 10px;height: 100%;">
            <div slot="header" class="clearfix" style="text-align: center;">
              <b> {{ $t('form.VAllocation.invoice.title') }} </b>
            </div>
            <!-- {{ listInvoces }} -->
            <el-table
              id="listInvocesTable"
              ref="listInvocesTable"
              :data="listInvoces"
              border
              style="width: 100%;height: 90%;"
              @select="handleSelectionInvoces"
            >
              <el-table-column
                type="selection"
                width="40"
              />
              <el-table-column
                v-for="(header, key) in headersInvoice"
                :key="key"
                prop="id"
                :align="header.align"
                :width="header.width"
                :label="header.label"
              >
                <template slot-scope="scope">
                  <span v-if="(header.columnName === 'organization' || header.columnName === 'transaction_type')">
                    {{ scope.row[header.columnName].name }}
                  </span>
                  <span v-else-if="header.columnName === 'writeOff'">
                    <el-input-number
                      v-model="scope.row[header.columnName]"
                      controls-position="right"
                    />
                  </span>
                  <span v-else-if="header.columnName === 'applied'">
                    <el-input-number
                      v-model="scope.row[header.columnName]"
                      controls-position="right"
                    />
                  </span>
                  <span v-else>
                    {{ scope.row[header.columnName] }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-card>
    </div>
    <div>
      <el-card class="box-card">
        <div id="description-payment" class="description-payment">
          <el-card
            class="box-card"
          >
            <div>
              <el-form
                :inline="true"
                label-position="left"
                style="padding: 10px !important;"
              >
                <el-col :span="6">
                  <el-form-item
                    :label="$t('form.VAllocation.description.difference')"
                  >
                    <el-tag>
                      <b style="text-align: right; font-size: 19px">
                        {{ difference }}
                      </b>
                    </el-tag>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('form.VAllocation.description.charge')"
                  >
                    <el-select
                      v-model="charges"
                      style="width: 100%;"
                      filterable
                      clearable
                      :filter-method="remoteSearchCharges"
                      @visible-change="findCharges"
                    >
                      <el-option
                        v-for="item in optionsCharges"
                        :key="item.id"
                        :label="item.label"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('form.VAllocation.description.organization')"
                  >
                    <el-select
                      v-model="organizationsId"
                      style="width: 100%;"
                      filterable
                      clearable
                      :filter-method="remoteSearchOrganizations"
                      @visible-change="findOrganizations"
                    >
                      <el-option
                        v-for="item in optionsOrganizations"
                        :key="item.id"
                        :label="item.label"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('form.VAllocation.description.description')"
                  >
                    <el-input
                      v-model="description"
                      type="textarea"
                      :autosize="{ minRows: 2, maxRows: 4}"
                    />
                  </el-form-item>
                </el-col>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'
// import lang from '@/lang'
import store from '@/store'

// components and mixins
import headersInvoice from './headersInvoice.js'
import headersPayments from './headersPayments.js'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
// API Request Methods
import {
  listCharges,
  listTransactionOrganizations
} from '@/api/ADempiere/form/VAllocation.js'

export default defineComponent({
  name: 'Payments',

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

    const optionsOrganizations = ref([])
    const listPaymentsTable = ref(null)
    const listInvocesTable = ref(null)
    const optionsCharges = ref([])
    const organizationsId = ref('')
    const description = ref('')
    const tableData = ref([])
    const charges = ref('')

    /**
     * computed
     */

    const selectListPayments = computed(() => {
      return store.getters.getSelectListPayments
    })

    const selectListInvoces = computed(() => {
      return store.getters.getSelectListInvoces
    })

    const difference = computed(() => {
      // const sumPayments = selectListInvoces.value.map(list => list.applied)
      if (!isEmptyValue(selectListPayments.value) && !isEmptyValue(selectListInvoces.value)) {
        const sumPaymentsApplied = selectListPayments.value.map(list => list.applied)
        const sumPayments = sumPaymentsApplied.reduce((valorAnterior, valorActual, indice, vector) => {
          return valorAnterior + valorActual
        })
        const sumInvocesApplied = selectListInvoces.value.map(list => list.applied)
        const sumInvoces = sumInvocesApplied.reduce((valorAnterior, valorActual, indice, vector) => {
          return valorAnterior + valorActual
        })
        const array3 = [sumInvoces, sumPayments]
        const alo = array3.reduce((valorAnterior, valorActual, indice, vector) => {
          return valorAnterior + valorActual
        })
        return alo
      } else if (!isEmptyValue(selectListPayments.value)) {
        const sumPayments = selectListPayments.value.map(list => list.applied)
        return sumPayments.reduce((valorAnterior, valorActual, indice, vector) => {
          return valorAnterior + valorActual
        })
      } else if (!isEmptyValue(selectListInvoces.value)) {
        const sumPayments = selectListInvoces.value.map(list => list.applied)
        return sumPayments.reduce((valorAnterior, valorActual, indice, vector) => {
          return valorAnterior + valorActual
        })
        // return 2
      }
      return 0
    })

    const listPayments = computed(() => {
      return store.getters.getListVAllocation.payments
    })

    const listInvoces = computed(() => {
      return store.getters.getListVAllocation.invoce
    })

    /**
     * Methods
     */

    function findCharges(isFind, searchValue) {
      if (!isFind) return
      listCharges({
        searchValue
      })
        .then(response => {
          const { records } = response
          optionsCharges.value = records.map(currency => {
            const { id, uuid, values } = currency
            return {
              id,
              uuid,
              label: values.DisplayColumn
            }
          })
        })
    }

    function remoteSearchCharges(query) {
      if (!isEmptyValue(query) && query.length > 2) {
        const result = optionsCharges.value.filter(findFilter(query))
        if (isEmptyValue(result)) {
          findCharges(true, query)
        }
      }
    }

    function findFilter(queryString) {
      return (query) => {
        const search = queryString.toLowerCase()
        return query.label.toLowerCase().includes(search)
      }
    }

    function remoteSearchOrganizations(query) {
      if (!isEmptyValue(query) && query.length > 2) {
        const result = optionsOrganizations.value.filter(findFilter(query))
        if (isEmptyValue(result)) {
          findOrganizations(true, query)
        }
      }
    }

    function findOrganizations(isFind, searchValue) {
      if (!isFind) return
      listTransactionOrganizations({
        searchValue
      })
        .then(response => {
          const { records } = response
          optionsOrganizations.value = records.map(organizations => {
            const { id, uuid, values } = organizations
            return {
              id,
              uuid,
              label: values.DisplayColumn
            }
          })
        })
    }

    function handleSelectionPayments(select, row) {
      toggleSelectionPayments(row)
      const { isSelect, applied, open_amount } = row
      const totalApplied = (applied === 0) ? open_amount : applied
      row.isSelect = !isSelect
      row.applied = totalApplied
      store.commit('setListPayments', listPayments.value)
    }

    function handleSelectionInvoces(select, row) {
      const { isSelect, applied, open_amount } = row
      toggleSelectionInvoce(row)
      const totalApplied = (applied === 0) ? open_amount : applied
      const existTypeTranstation = selectListPayments.value.filter(payment => payment.transaction_type.value === row.transaction_type.value)
      const all = (totalApplied < 0) ? -(totalApplied) : -(totalApplied)
      console.log(selectListPayments.value, { existTypeTranstation })
      if (!isEmptyValue(selectListPayments.value) && !isEmptyValue(existTypeTranstation)) {
        console.log({ all })
      }
      row.isSelect = !isSelect
      row.applied = all
      store.commit('setListInvoces', listInvoces.value)
    }

    function toggleSelectionInvoce(invoce) {
      const paymentsTypetransaction = selectListPayments.value.filter(payment => payment.transaction_type.value === invoce.transaction_type.value)
      const appliedPayments = paymentsTypetransaction.map(payment => payment.applied)
      const sumPayments = appliedPayments.reduce((valorAnterior, valorActual, indice, vector) => {
        return valorAnterior + valorActual
      })
      const appliedPay = sumPayments - invoce.open_amount
      console.log({ selectListPayments: selectListPayments.value, invoce, paymentsTypetransaction, appliedPayments, appliedPay })
    }

    function toggleSelectionPayments(payment) {
      const invocesTypetransaction = selectListInvoces.value.filter(list => list.transaction_type.value === payment.transaction_type.value)
      const appliedPayments = invocesTypetransaction.map(payment => payment.applied)
      const sumPayments = appliedPayments.reduce((valorAnterior, valorActual, indice, vector) => {
        return valorAnterior + valorActual
      })
      const appliedPay = sumPayments - payment.open_amount
      console.log({ selectListPayments: selectListPayments.value, payment, invocesTypetransaction, appliedPayments, appliedPay })
    }
    // toggleSelection([currentRow])
    // console.log(listInvocesTable.value)

    // function toggleSelection(array, ref) {
    //   if (isEmptyValue(ref.value)) return
    //   console.log({ array, ref }, ref.value)
    //   console.log({ data: ref.value.data })
    //   ref.value.data.forEach(attribute => {
    //     if (attribute.isSelect) {
    //       ref.value.toggleRowSelection(attribute)
    //     }
    //   })
    // }

    // onUpdated(() => {
    //   toggleSelection(selectListPayments.value, listPaymentsTable)
    //   toggleSelection(selectListInvoces.value, listInvocesTable)
    //   console.log(listPaymentsTable.value)
    // })

    return {
      // Const
      // Refs
      tableData,
      headersPayments,
      headersInvoice,
      optionsCharges,
      charges,
      organizationsId,
      optionsOrganizations,
      listInvocesTable,
      listPaymentsTable,
      description,
      // Computed
      listPayments,
      listInvoces,
      difference,
      selectListPayments,
      selectListInvoces,
      // Methods
      remoteSearchOrganizations,
      handleSelectionPayments,
      handleSelectionInvoces,
      toggleSelectionPayments,
      toggleSelectionInvoce,
      remoteSearchCharges,
      findOrganizations,
      // toggleSelection,
      findCharges,
      findFilter
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
  .panel-top-search-criteria {
    display: flex;
    .el-card__body {
      display: contents;
      padding-top: 0px !important;
      padding-right: 0px !important;
      padding-bottom: 2px !important;
      padding-left: 0px !important;
      height: 100%!important;
    }
  }
</style>
<style>
.el-table--scrollable-x .el-table__body-wrapper {
  height: 90%;
  overflow-x: auto;
}
</style>
