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
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-container>
    <el-header style="height: 40% !important;">
      <el-card class="box-card">
        <el-divider content-position="left">
          {{ $t('window.containerInfo.accountingInformation.selection') }}
        </el-divider>
        <el-form
          label-position="top"
          size="small"
          @submit.native.prevent="notSubmitForm"
        >
          <field-definition
            v-for="(field) in metadataList"
            :key="field.columnName"
            :metadata-field="field"
            :container-uuid="uuidForm"
            :container-manager="containerManager"
          />
        </el-form>
      </el-card>
    </el-header>

    <el-main>
      <el-card
        style="padding: 20px;"
      >
        <el-table
          v-loading="isLoadingDataTable"
          :data="tableData"
          :element-loading-text="$t('notifications.loading')"
          element-loading-background="rgba(255, 255, 255, 0.8)"
          border
          height="68vh"
        >
          <el-table-column
            type="index"
            label="#"
            min-width="30"
            header-align="center"
          />
          <el-table-column
            v-for="(head, key) in heardList"
            :key="key"
            :label="head.label"
            :align="head.align"
            min-width="170"
            header-align="center"
          >
            <template slot-scope="scope">
              {{ scope.row[head.columnName] }}
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 10px;">
          <el-button
            type="primary"
            plain
            style="margin-right: 10px; !important"
            :loading="isLoadingRePost"
            :disabled="isLoadingRePost"
            @click="rePost"
          >
            {{ $t('accounting.rePosAccounting') }}
          </el-button>
          <el-checkbox
            v-model="force"
          >
            {{ $t('accounting.force') }}
          </el-checkbox>
        </div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

import store from '@/store'

// components and mixins
import fieldsList from './fieldsList'
import heardList from './heardList'
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import { containerManager as containerManagerForm } from '@/utils/ADempiere/dictionary/form/index.js'
import { containerManager as containerManagerWindow } from '@/utils/ADempiere/dictionary/window'
import {
  createFieldFromDictionary
} from '@/utils/ADempiere/lookupFactory'

import {
  requestAccountingFacts,
  requestStartRePost
} from '@/api/ADempiere/form/accouting.js'

// utils and helper methods
import { DISPLAY_COLUMN_PREFIX, UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX } from '@/utils/ADempiere/dictionaryUtils'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'AccountingFact',

  components: {
    FieldDefinition
  },

  props: {
    allTabsList: {
      type: Array,
      default: () => []
    },
    containerUuid: {
      type: String,
      default: () => ''
    },
    tableName: {
      type: String,
      default: () => ''
    },
    recordId: {
      type: Number,
      default: () => 0
    },
    recordUuid: {
      type: String,
      default: () => ''
    }
  },

  setup(props) {
    const ACCOUTING_FACT_FORM = 'Accouting-Fact-Form'
    // Refs
    const tableData = ref([])
    const metadataList = ref([])
    const isLoadingDataTable = ref(false)
    const isLoadingFields = ref(false)
    const isLoadingRePost = ref(false)
    const force = ref(false)

    // Computed
    const uuidForm = computed(() => {
      return ACCOUTING_FACT_FORM + '_' + props.containerUuid
    })

    const accoutingSchemaId = computed({
      set(value) {
        store.commit('updateValueOfField', {
          containerUuid: uuidForm.value,
          columnName: 'C_AcctSchema_ID',
          value: value
        })
      },
      get() {
        return store.getters.getValueOfField({
          containerUuid: uuidForm.value,
          columnName: 'C_AcctSchema_ID'
        })
      }
    })

    const accoutingFilters = computed(() => {
      return store.getters.getValuesView({
        containerUuid: uuidForm.value,
        format: 'array'
      }).filter(attribute => {
        return !isEmptyValue(attribute.value) &&
          !(attribute.columnName.startsWith(DISPLAY_COLUMN_PREFIX) ||
          attribute.columnName.endsWith(UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX))
      })
    })

    const showContainerInfo = computed(() => {
      return store.getters.getShowLogs
    })

    // Function

    function setFieldsList() {
      const list = []
      fieldsList.forEach(element => {
        createFieldFromDictionary(element)
          .then(responseField => {
            list.push({
              ...responseField,
              isReadOnly: false,
              containerUuid: uuidForm.value
            })
          }).catch(error => {
            console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
          })
          .finally(() => {
            metadataList.value = list
            isLoadingFields.value = true
          })
      })
    }

    function findAccountingFacts(filters) {
      if (isEmptyValue(accoutingSchemaId.value)) {
        // showMessage({
        //   message: lang.t('notifications.mandatoryFieldMissing') + 'C_AcctSchema_ID',
        //   type: 'info'
        // })
        return
      }

      const accoutingSchemaUuid = store.getters.getValueOfField({
        containerUuid: uuidForm.value,
        columnName: 'C_AcctSchema_ID_UUID'
      })

      isLoadingDataTable.value = true
      requestAccountingFacts({
        accoutingSchemaId: accoutingSchemaId.value,
        accoutingSchemaUuid,
        tableName: props.tableName,
        recordId: props.recordId,
        recordUuid: props.recordUuid,
        filters
      })
        .then(response => {
          const recordsList = response.recordsList.map(record => {
            const { id, uuid, tableName, attributes } = record
            return {
              ...attributes,
              DateAcct: formatDate({ value: attributes.DateAcct }),
              id,
              uuid,
              tableName
            }
          })
          tableData.value = recordsList
        })
        .catch(error => {
          console.warn(`LookupFactory: Get Accounting Facts From Server (State) - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          isLoadingDataTable.value = false
        })
    }

    function clearData() {
      tableData.value = []
      store.commit('updateValuesOfContainer', {
        containerUuid: uuidForm.value,
        attributes: [
          {
            columnName: 'C_AcctSchema_ID',
            value: undefined
          },
          {
            columnName: 'C_AcctSchema_ID_UUID',
            value: undefined
          },
          {
            columnName: 'DisplayColumn_C_AcctSchema_ID',
            value: undefined
          },
          {
            columnName: 'PostingType',
            value: undefined
          },
          {
            columnName: 'PostingType_UUID',
            value: undefined
          },
          {
            columnName: 'DisplayColumn_PostingType',
            value: undefined
          }
        ]
      })
    }

    function rePost() {
      isLoadingRePost.value = true
      requestStartRePost({
        tableName: props.tableName,
        recordId: props.recordId,
        recordUuid: props.recordUuid,
        isForce: force.value
      })
        .then(response => {
          if (!isEmptyValue(response.errorMsg)) {
            showMessage({
              message: response.errorMsg,
              type: 'error'
            })
          }
        })
        .catch(error => {
          console.warn(`LookupFactory: Get Start Re-Post Facts From Server (State) - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          isLoadingRePost.value = false
          findAccountingFacts(accoutingFilters.value)
        })
    }

    if (isEmptyValue(accoutingSchemaId.value)) {
      const globalAccoutingSchemaId = computed(() => {
        return store.getters.getSessionContext({
          columnName: '$C_AcctSchema_ID'
        })
      })
      accoutingSchemaId.value = globalAccoutingSchemaId.value
    }

    // Watch
    watch(accoutingFilters, (newValue) => {
      findAccountingFacts(newValue)
    })
    watch(showContainerInfo, (newValue) => {
      clearData()
    })

    if (!isLoadingFields.value) {
      setFieldsList({})
    }

    return {
      // ref
      tableData,
      isLoadingFields,
      isLoadingDataTable,
      isLoadingRePost,
      metadataList,
      force,
      containerManager: {
        ...containerManagerForm,
        getDefaultValue: containerManagerWindow.getDefaultValue
      },
      heardList,
      // computed
      accoutingSchemaId,
      uuidForm,
      showContainerInfo,
      // methods
      setFieldsList,
      clearData,
      findAccountingFacts,
      rePost
    }
  }

})
</script>
