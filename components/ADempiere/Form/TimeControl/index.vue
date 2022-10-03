<template>
  <el-container
    key="child-income-loaded"
    class="view-base child-income-view"
  >
    <el-header>
      <div class="center" style="width: 100%">
        <title-and-help
          :name="$t('window.childIncome')"
          :help="$t('window.childIncome')"
        />
      </div>
    </el-header>

    <el-main>
      <el-card class="box-card">
        <el-form
          ref="form"
          :inline="true"
          label-width="120px"
          style="margin-top: 50px !important;margin-left: 5px !important;margin-bottom: 20px !important;"
        >
          <field-definition
            v-for="(field) in metadataList"
            :key="field.columnName"
            :metadata-field="field"
            :container-uuid="'ChildIncome'"
            :container-manager="containerManager"
          />
          <el-form-item :label="$t('timeControl.name')">
            <el-input v-model="name" type="text" />
          </el-form-item>
          <el-form-item :label="$t('timeControl.description')">
            <el-input v-model="description" type="textarea" autosize />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="isLoadingCreate"
              :disabled="isValidateAdd"
              @click="addChild()"
            >
              {{ $t('timeControl.addChild') }}
            </el-button>
          </el-form-item>
        </el-form>
        <el-table
          :data="tableData"
          stripe
          highlight-current-row
          border
          style="width: 100%;margin-bottom: 20px;"
        >
          <el-table-column
            v-for="(head, key) in heardList"
            :key="key"
            :label="head.label"
            :align="head.align"
            header-align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.isEditRow && (head.columnName === 'name' || head.columnName === 'description')">
                <el-input v-model="scope.row[head.columnName]" type="text" />
              </span>
              <span v-else>
                {{ scope.row[head.columnName] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('form.pos.tableProduct.options')"
          >
            <template slot-scope="scope">
              <el-button :type="scope.row.isEditRow ? 'primary' : 'success'" :icon="scope.row.isEditRow ? 'el-icon-check' : 'el-icon-edit'" size="mini" style="margin-right: 3%;" @click="editChild(scope.row)" />
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteChild(scope.row)" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// componets and mixins
import TitleAndHelp from '@theme/components/ADempiere/TitleAndHelp'
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import heardList from './headerTable'
import fieldsList from './fieldsList'

// api request methods
import {
  requestCreateResource,
  requestUpdateResource,
  requestDeleteResource,
  requestListResource
} from '@/api/ADempiere/form/timeControl.js'

// utils and helper methods
import { createFieldFromDictionary } from '@/utils/ADempiere/lookupFactory'
import { ROW_ATTRIBUTES } from '@/utils/ADempiere/tableUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import { containerManager as containerManagerForm } from '@/utils/ADempiere/dictionary/form/index.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat.js'
// import { containerManager as containerManagerWindow } from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'TimeControl',

  components: {
    FieldDefinition,
    TitleAndHelp
  },

  setup() {
    // Ref
    const name = ref('')
    const description = ref('')
    const tableData = ref([])
    const isLoadingFields = ref(false)
    const isLoadingCreate = ref(false)
    const metadataList = ref([])

    // computed

    const isValidateAdd = computed(() => {
      if (isEmptyValue(recurringType.value) || isEmptyValue(name.value)) {
        return true
      }
      return false
    })

    const recurringType = computed(() => {
      return store.getters.getValueOfField({
        containerUuid: 'ChildIncome',
        columnName: 'S_ResourceType_ID'
      })
    })
    const recurringTypeUuid = computed(() => {
      return store.getters.getValueOfField({
        containerUuid: 'ChildIncome',
        columnName: 'S_ResourceType_ID_UUID'
      })
    })

    // Methods

    function addChild() {
      isLoadingCreate.value = true
      requestCreateResource({
        typeUuid: recurringTypeUuid.value,
        typeId: recurringType.value,
        name: name.value,
        description: description.value
      })
        .then(response => {
          store.commit('updateValuesOfContainer', {
            containerUuid: 'ChildIncome',
            attributes: [
              {
                columnName: 'S_ResourceType_ID',
                value: undefined
              },
              {
                columnName: 'S_ResourceType_ID_UUID',
                value: undefined
              },
              {
                columnName: 'DisplayColumn_S_ResourceType_ID',
                value: undefined
              }
            ]
          })
          name.value = ''
          description.value = ''
        })
        .catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
          console.warn(`requestCreateResource: Add Resource Server (State) - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          listResource()
          isLoadingCreate.value = false
        })
    }

    function updateCurrentRow(row) {
      const { id, uuid, name, description } = row

      requestUpdateResource({
        id,
        uuid,
        name,
        description
      })
        .then(response => {
          console.log({ response })
        })
        .catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
          console.warn(`requestUpdateResource: Update Resource Server (State) - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          listResource()
        })
    }

    function deleteChild(row) {
      const { id, uuid } = row

      requestDeleteResource({
        id,
        uuid
      })
        .then(response => {
          showMessage({
            message: lang.t('recordManager.deleteRecordSuccessful'),
            type: 'success'
          })
        })
        .catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
          console.warn(`requestDeleteResource: Delete Resource Server (State) - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          listResource()
        })
    }

    function editChild(row) {
      if (row.isEditRow) {
        updateCurrentRow(row)
      }
      row.isEditRow = !row.isEditRow
    }

    function setFieldsList() {
      const list = []
      fieldsList.forEach(element => {
        createFieldFromDictionary(element)
          .then(responseField => {
            list.push({
              ...responseField,
              isReadOnly: false,
              containerUuid: 'ChildIncome'
            })
          }).catch(error => {
            showMessage({
              message: error,
              type: 'error'
            })
            console.warn(`createFieldFromDictionary: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
          })
          .finally(() => {
            metadataList.value = list
            isLoadingFields.value = true
          })
      })
    }

    function listResource() {
      requestListResource()
        .then(response => {
          const { records } = response
          const recordsList = records.map(row => {
            let dateTo = null
            if (String(row.assign_date_to).length >= 10) {
              dateTo = translateDateByLong(row.assign_date_to)
            }

            return {
              ...row,
              resourceNameType: row.resource.name,
              dateFrom: translateDateByLong(row.assign_date_from),
              dateTo,
              ...ROW_ATTRIBUTES
            }
          })
          tableData.value = recordsList
        }).catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
          console.warn(`requestListResource: List Resource Server (State) - Error ${error.code}: ${error.message}.`)
        })
    }

    if (!isLoadingFields.value) {
      setFieldsList({})
    }

    listResource()

    return {
      // Ref
      name,
      description,
      tableData,
      isLoadingFields,
      isLoadingCreate,
      metadataList,
      // computeds
      recurringType,
      recurringTypeUuid,
      isValidateAdd,
      // import
      heardList,
      containerManager: {
        ...containerManagerForm
      },
      // methods
      addChild,
      deleteChild,
      editChild,
      listResource
    }
  }
})
</script>
