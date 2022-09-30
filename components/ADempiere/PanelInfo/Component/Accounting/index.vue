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
            :container-uuid="containerUuid"
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
            @click="rePost"
          >
            {{ $t('accounting.rePosAccounting') }}
          </el-button>
          <el-checkbox
            v-model="force"
          >
            {{ 'Forzar' }}
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
import { containerManager } from '@/utils/ADempiere/dictionary/form/index.js'
import {
  createFieldFromDictionary
} from '@/utils/ADempiere/lookupFactory'

// utils and helper methods

import {
  requestAccountingFacts,
  requestStartRePost
} from '@/api/ADempiere/form/accouting.js'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'Accounting',

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
    containerUuidTab: {
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

  setup(props, { root }) {
    // Refs
    const tableData = ref([])
    const metadataList = ref([])
    const isLoadingDataTable = ref(false)
    const isLoadingFields = ref(false)
    const force = ref(false)

    // Computed

    const accoutingSchemaId = computed(() => {
      return store.getters.getValueOfField({
        containerUuid: props.containerUuid,
        columnName: 'C_AcctSchema_ID'
      })
    })

    const filter = computed(() => {
      return store.getters.getValuesView({
        containerUuid: props.containerUuid,
        format: 'array'
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
              containerUuid: props.containerUuid
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

    function findAccountingFacts(params) {
      if (isEmptyValue(accoutingSchemaId.value)) {
        return
      }
      const accoutingSchemaUuid = params.find(schema => schema.columnName === 'C_AcctSchema_ID_UUID').value
      const filters = params.filter(attribute => (attribute.columnName === 'PostingType' && !isEmptyValue(attribute.value)) || attribute.columnName === 'C_AcctSchema_ID')
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
        containerUuid: props.containerUuid,
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
      requestStartRePost({
        tableName: props.tableName,
        recordId: props.recordId,
        recordUuid: props.recordUuid,
        isForce: force.value
      })
        .then(response => {
          console.log({ response })
        })
        .catch(error => {
          console.warn(`LookupFactory: Get Start Re-Post Facts From Server (State) - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          findAccountingFacts(filter.value)
        })
    }

    // Watch

    watch(filter, (newValue) => {
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
      metadataList,
      force,
      // import
      containerManager,
      heardList,
      // computed
      accoutingSchemaId,
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

<style>
.scroll-attachment {
    max-height: 80vh;
}
</style>
