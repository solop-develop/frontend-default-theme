<!-- ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanches
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
  <el-card class="box-card">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <p style="text-align: center;">
          <title-and-help
            :name="metadata.title"
            :help="metadata.description"
          />
        </p>
      </div>
      <el-form
        label-position="top"
        label-width="10px"
        class="from-action-notice"
      >
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item :label="$t('actionNotice.payrollProcess')">
              <el-select
                :id="$t('actionNotice.payrollProcess')"
                v-model="displayValuePrecess"
                :placeholder="$t('actionNotice.select') + $t('actionNotice.payrollProcess')"
                style="display: contents;"
                @visible-change="findPayrollProcess"
              >
                <el-option
                  v-for="item in optionsPayrollProcess"
                  :key="item.KeyColumn"
                  :label="item.DisplayColumn"
                  :value="item.KeyColumn"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('actionNotice.businessPartner')">
              <el-select
                :id="$t('actionNotice.businessPartner')"
                v-model="displayValueEmployee"
                :placeholder="$t('actionNotice.select') + $t('actionNotice.businessPartner')"
                style="display: contents;"
                @visible-change="findOptionsEmployee"
              >
                <el-option
                  v-for="item in optionsPayrollEmployee"
                  :key="item.KeyColumn"
                  :label="item.DisplayColumn"
                  :value="item.KeyColumn"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('actionNotice.payrollConcept')">
              <el-select
                :id="$t('actionNotice.payrollConcept')"
                v-model="displayValueConcept"
                :placeholder="$t('actionNotice.select') + $t('actionNotice.payrollConcept')"
                style="display: contents;"
                @visible-change="findPayrollConcept"
              >
                <el-option
                  v-for="item in optionsPayrollConcept"
                  :key="item.KeyColumn"
                  :label="item.DisplayColumn"
                  :value="item.KeyColumn"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- {{ formatDate(ValidFrom, true, 'YYYY-MM-DD T HH:MM:SS') }} 1 -->
          <el-col :span="8">
            <el-form-item label="Fecha">
              <el-date-picker
                v-model="ValidFrom"
                type="date"
                :value-format="format"
                placeholder="Pick a day"
                style="display: contents;"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item label="Valor">
              <type-field
                :row="currentRow"
              />
            </el-form-item>
          </el-col> -->
          <el-col v-if="currentRow.ColumnType === 'Texto'" :span="8">
            <el-form-item label="Valor">
              <el-input
                v-model="FieldValue"
                style="display: contents;"
              />
            </el-form-item>
          </el-col>
          <el-col v-else :span="8">
            <el-form-item label="Valor">
              <el-input-number
                v-model="FieldValue"
                controls-position="right"
                style="display: contents;"
                :precision="2"
                :step="0.1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Descripción">
              <el-input
                v-model="description"
                style="display: contents;"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <br>
      <el-button-group style="float: right;margin-right: 1.5%;">
        <el-button
          type="success"
          icon="el-icon-refresh"
          plain
          @click="refresh"
        />
        <el-button
          type="danger"
          icon="el-icon-delete"
          :disabled="validateDelete"
          plain
          @click="deleteConcepts"
        />
        <el-button
          type="info"
          icon="el-icon-edit"
          :disabled="isEmptyValue(currentRow.uuid)"
          plain
          @click="updateMovements(currentRow)"
        />
        <el-button
          type="primary"
          icon="el-icon-document-add"
          plain
          @click="sendAtribute"
        />
      </el-button-group>
      <br>
    </el-card>
    <el-table
      :data="listConcepts"
      border
      style="width: 100%"
      @row-click="select"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <template v-for="(attributes, key) in header">
        <el-table-column
          :key="key"
          :prop="attributes.key"
          :label="attributes.label"
        />
      </template>
    </el-table>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import store from '@/store'

// Components
import TitleAndHelp from '@theme/components/ADempiere/TitleAndHelp'
import TypeField from '@theme/components/ADempiere/Form/VHRActionNotice/typeField'

// Utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/valueFormat.js'

export default defineComponent({
  name: 'VHRActionNotice',
  components: {
    TitleAndHelp,
    TypeField
  },

  props: {
    metadata: {
      type: Object,
      required: true
    }
  },

  setup(props, { root }) {
    /**
     * Computeds
     */

    // List Options

    const optionsPayrollProcess = computed(() => {
      return store.getters.getListOptionsPayrollProcess
    })

    const optionsPayrollEmployee = computed(() => {
      return store.getters.getListOptionsEmployee
    })

    const optionsPayrollConcept = computed(() => {
      return store.getters.getListOptionsPayrollConcept
    })

    // Values

    const displayValuePrecess = computed({
      get() {
        return store.getters.getValuePayrollProcess
      },
      set(value) {
        store.commit('setPayrollProcess', {
          listOptions: optionsPayrollProcess.value,
          value
        })
        return value
      }
    })

    const displayValueEmployee = computed({
      get() {
        return store.getters.getValueEmployee
      },
      set(value) {
        store.commit('setEmployee', {
          listOptions: optionsPayrollProcess.value,
          value
        })
        return value
      }
    })

    const displayValueConcept = computed({
      get() {
        return store.getters.getValuePayrollConcept
      },
      set(value) {
        store.commit('setPayrollConcept', {
          listOptions: optionsPayrollProcess.value,
          value
        })
        return value
      }
    })

    // validate

    const validateDelete = computed(() => {
      return isEmptyValue(uuids.value)
    })

    // Data List

    const listConcepts = computed(() => {
      return store.getters.getDataListConcept.map(concepts => {
        return {
          ...concepts,
          ValidFrom: formatDate(concepts.ValidFrom)
        }
      })
    })

    /**
     * Refs
     */

    const description = ref('')
    const ValidFrom = ref('')

    const header = ref([
      {
        label: 'Organización',
        key: 'DisplayColumn_AD_Org_ID'
      },
      {
        label: 'Concepto Nómina',
        key: 'DisplayColumn_HR_Movement_ID'
      },
      {
        label: 'Válido Desde',
        key: 'ValidFrom'
      },
      {
        label: 'Cantidad',
        key: 'Qty'
      },
      {
        label: 'Monto',
        key: 'Amount'
      },
      {
        label: 'Mensaje de texto',
        key: 'TextMsg'
      },
      {
        label: 'Descripción',
        key: 'Description'
      }
    ])

    const uuids = ref([])
    const id = ref([])
    const FieldValue = ref()
    const currentRow = ref({ attributes: [], id: 0, uuid: '' })
    const Amount = ref(0.0)
    const TextMsg = ref('')
    const Qty = ref(0)
    const columnNameChange = ref('')
    const format = computed(() => {
      let format = ''
      if (isEmptyValue(format)) {
        format = 'yyyy-MM-dd'
      }
      // if (this.typePicker.replace('range', '') === 'datetime') {
      format = format + ' hh:mm:ss'
      // }
      return format
    })

    /**
     * Functions
     */
    function findPayrollConcept() {
      store.dispatch('findPayrollConcepts')
    }

    function findPayrollProcess() {
      store.dispatch('findPayrollProcess')
    }

    function findOptionsEmployee() {
      store.dispatch('findEmployee')
    }

    function sendAtribute() {
      store.dispatch('saveMovement', {
        id: currentRow.value.id,
        attributes: [
          {
            key: 'AD_Org_ID',
            value: 0
          },
          {
            key: 'HR_Process_ID',
            value: displayValuePrecess.value
          },
          {
            key: 'C_BPartner_ID',
            value: displayValueEmployee.value
          },
          {
            key: 'HR_Concept_ID',
            value: displayValueConcept.value
          },
          {
            key: 'DisplayColumn_AD_Org_ID',
            value: '*'
          },
          {
            key: 'DisplayColumn_HR_Movement_ID',
            value: 'i_A'
          },
          {
            key: 'ColumnType',
            value: 'Monto'
          },
          {
            key: 'HR_Movement_ID',
            value: currentRow.value.id
          },
          {
            key: 'Description',
            value: description.value
          },
          {
            key: 'ValidFrom',
            value: ValidFrom.value
          },
          {
            key: 'Amount',
            value: FieldValue.value
          },
          {
            key: 'TextMsg',
            value: TextMsg.value
          },
          {
            key: 'Qty',
            value: Qty.value
          }
        ]
      })
    }

    function select(params) {
      currentRow.value = params
      ValidFrom.value = params.ValidFrom
      description.value = params.Description

      switch (params.ColumnType) {
        case 'Texto':
          columnNameChange.value = 'TextMsg'
          TextMsg.value = params.TextMsg
          FieldValue.value = params.TextMsg
          break
        case 'Monto':
          columnNameChange.value = 'Amount'
          Amount.value = params.Amount
          FieldValue.value = params.Amount
          break
        case 'Cantidad':
          columnNameChange.value = 'Qty'
          Qty.value = params.Qty
          FieldValue.value = params.Qty
          break
      }
    }

    function handleSelectionChange(val) {
      uuids.value = val.map(select => select.uuid)
      id.value = val.map(select => select.id)
    }

    function deleteConcepts() {
      store.dispatch('deleteConcepts', { uuids: uuids.value, ids: id.value })
    }

    function refresh() {
      store.dispatch('findListConcepts')
    }

    function updateMovements(currentMovements) {
      const { attributes, id, uuid } = currentMovements
      const attributesFilter = attributes.filter(row => (row.key !== 'Description'))
      attributesFilter.push(
        {
          key: 'Description',
          value: description.value
        },
        {
          key: columnNameChange.value,
          value: FieldValue.value
        }
      )
      store.dispatch('saveMovement', {
        id,
        uuid,
        attributes: attributesFilter
      })
    }

    return {
      // Ref
      ValidFrom,
      description,
      header,
      uuids,
      id,
      currentRow,
      FieldValue,
      TextMsg,
      Qty,
      format,
      Amount,
      columnNameChange,
      // Computed
      optionsPayrollProcess,
      optionsPayrollEmployee,
      optionsPayrollConcept,
      displayValuePrecess,
      displayValueEmployee,
      displayValueConcept,
      listConcepts,
      validateDelete,
      // methodos
      findPayrollConcept,
      findPayrollProcess,
      findOptionsEmployee,
      sendAtribute,
      select,
      handleSelectionChange,
      deleteConcepts,
      refresh,
      updateMovements
    }
  }

})
</script>

<style scoped>
.from-action-notice {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
