<template>
  <el-container
    key="child-income-loaded"
    class="view-base child-income-view"
  >
    <el-main class="form-time-control" :style="isMobile ? 'overflow: auto;' : ''">
      <el-card class="box-card" style="padding-bottom: 20px;">
        <el-form
          label-position="top"
        >
          <el-row style="padding-bottom: 10px;">
            <el-col :span="sizeColumn">
              <el-form-item
                :label="$t('table.recentItems.date')"
                :rules="{
                  required: true
                }"
                :style="cssStyleFrontName"
              >
                <el-date-picker
                  v-model="dateValue"
                  type="date"
                  placeholder="Pick a day"
                  style="width: -webkit-fill-available;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="sizeColumn">
              <el-form-item
                :label="$t('timeControl.name')"
                :rules="{
                  required: true
                }"
                :style="cssStyleFrontName"
              >
                <el-input v-model="name" type="text" />
              </el-form-item>
            </el-col>
            <el-col :span="sizeColumn">
              <el-form-item
                :label="$t('timeControl.description')"
                :style="cssStyleFront"
              >
                <el-input v-model="description" type="textarea" autosize />
              </el-form-item>
            </el-col>
            <el-col :span="sizeColumn">
              <el-form-item
                :label="$t('accounting.quantity')"
                :rules="{
                  required: true
                }"
                :style="cssStyleFront"
              >
                <el-input-number v-model="num" controls-position="right" :precision="2" style="width: -webkit-fill-available;" />
              </el-form-item>
            </el-col>
            <el-col :span="sizeColumn">
              <el-form-item
                :label="$t('accounting.Project')"
                :style="cssStyleFront"
              >
                <el-select
                  v-model="proyect"
                  filterable
                  style="width: -webkit-fill-available;"
                  @visible-change="findProyect"
                >
                  <el-option
                    v-for="item in listProyect"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="sizeColumn">
              <el-form-item
                :label="$t('issues.request')"
                :style="cssStyleFront"
              >
                <el-select
                  v-model="request"
                  filterable
                  style="width: -webkit-fill-available;"
                  @visible-change="findRequest"
                >
                  <el-option
                    v-for="item in listRequest"
                    :key="item.id"
                    :label="item.summary"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                :style="cssStyleButton"
              >
                <el-button
                  type="primary"
                  :loading="isLoadingCreate"
                  :disabled="isValidateAdd"
                  style="float: right;"
                  @click="addNewRecord()"
                >
                  {{ $t('timeControl.addChild') }}
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-table
          v-loading="isLoadingRecords"
          :data="tableData"
          stripe
          height="540"
          highlight-current-row
          border
          @row-click="handleRowClick"
        >
          <el-table-column
            v-for="(head, key) in heardList"
            :key="key"
            :label="head.label"
            :align="head.align"
            :width="isMobile ? '180px' : head.size"
            header-align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.isEditRow && (head.columnName === 'name')">
                <el-input ref="namePanelEdit" v-model="scope.row[head.columnName]" :autofocus="true" type="text" />
              </span>
              <span v-else-if="scope.row.isEditRow && (head.columnName === 'description')">
                <el-input v-model="scope.row[head.columnName]" :autofocus="true" type="text" />
              </span>
              <span v-else>
                {{ scope.row[head.columnName] }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <el-row :gutter="24">
          <el-col :span="24">
            <custom-pagination
              :total="recordCount"
              :records-page="tableData.length"
              :selection="selection"
              :handle-change-page="setPage"
            />
          </el-col>
        </el-row>
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
import CustomPagination from '@theme/components/ADempiere/DataTable/Components/CustomPagination.vue'

// api request methods
import {
  requestCreateResource,
  requestlistIssues,
  requestlistProject,
  requestListTimeRecord
} from '@/api/ADempiere/form/timeRecord.js'

// utils and helper methods
import { generatePageToken } from '@/utils/ADempiere/dataUtils'
import { createFieldFromDictionary } from '@/utils/ADempiere/lookupFactory'
import { ROW_ATTRIBUTES } from '@/utils/ADempiere/tableUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import { containerManager as containerManagerForm } from '@/utils/ADempiere/dictionary/form/index.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { dateTimeFormats } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'TimeControl',

  // Components Used on the Panel

  components: {
    FieldDefinition,
    TitleAndHelp,
    CustomPagination
  },

  // Components Used on the Panel

  props: {
    metadata: {
      type: Object,
      required: true
    }
  },

  setup() {
    /**
     * Ref
     * @param {string} name - Header Name Field Value
     * @param {string} nameEdit - Temporary value of the selected column name to validate before saving
     * @param {number} timeOutFocus - Timeout for activating focus when editing a column
     * @param {string} descriptionEdit -Temporary value of the selected column description to validate before saving
     * @param {string} description - Header Description Field Value
     * @param {array} tableData - Records to be shown in the Template table
     * @param {boolean} isLoadingFields - Bandera de Carga de Campos
     * @param {boolean} isLoadingCreate - Button Load Flag when adding a new record to the timekeeping table
     * @param {array} metadataList - List of field metadata created with createFieldFromDictionary
     */
    const activeCollapse = ref(['query-criteria'])
    const name = ref('')
    const nameFind = ref('')
    const nameEdit = ref('')
    const timeOutFocus = ref(null)
    const descriptionEdit = ref('')
    const descriptionFind = ref('')
    const description = ref('')
    const tableData = ref([])
    const isLoadingFields = ref(false)
    const isLoadingCreate = ref(false)
    const metadataList = ref([])
    const confirmedFind = ref('N')
    const dateValue = ref('')
    const num = ref(0)
    const listRequest = ref([])
    const listProyect = ref([])
    const request = ref('')
    const proyect = ref('')
    const confirmedOptionsList = ref([
      {
        value: undefined,
        label: ' '
      },
      {
        value: 'Y',
        label: lang.t('components.switchActiveText')
      },
      {
        value: 'N',
        label: lang.t('components.switchInactiveText')
      }
    ])
    const isLoadingRecords = ref(false)
    // Pagination
    const recordCount = ref(0)
    const pageNumber = ref(0)
    const currentResource = ref({})
    const visible = ref(false)

    /**
     * Computed
     * isValidateAdd - Validate required fields before sending save
     * recurringType - Get ID of the resource value
     * recurringTypeUuid - Get UUID of the resource value
     * isMobile - Detect a mobile device
     * sizeColumn - Column size if it is a mobile device
     * cssStyleFront - Customized style for the Form
     * cssStyleFrontName -Customized style for the Form Name
     * cssStyleButton Customized style for the Button
     */

    const isValidateAdd = computed(() => {
      if (isEmptyValue(dateValue.value) || isEmptyValue(name.value) || isEmptyValue(num.value)) {
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

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const sizeColumn = computed(() => {
      if (isMobile.value) {
        return 24
      }
      return 8
    })

    const cssStyleFront = computed(() => {
      if (isMobile.value) {
        return 'margin: 10px 10px 0px;'
      }
      return 'margin-right: 10px;margin-left: 10px;'
    })

    const cssStyleFrontName = computed(() => {
      if (isMobile.value) {
        return 'margin-top: 20px;margin-right: 10px;margin-bottom: 0px;margin-left: 10px;'
      }
      return 'margin-right: 10px;margin-left: 10px;'
    })

    const cssStyleButton = computed(() => {
      if (isMobile.value) {
        return 'padding-top: 20px;padding-bottom: 10px;text-align: center;margin-bottom: 0px !important;'
      }
      return 'padding-top: 35px;'
    })

    const selection = computed(() => {
      if (isEmptyValue(currentResource.value)) {
        return 0
      }
      return 1
    })

    /**
     * Methods
     * addNewRecord - Add new record in time control table
     * @param {object} editChild - Update record in time control table
     * setFieldsList - Load field list with createFieldFromDictionary
     * listResource - List Control Table
     * @param {object} confirmResiurce - Change status of a record in the time control table
     */

    function addNewRecord() {
      isLoadingCreate.value = true
      requestCreateResource({
        requestId: request.value,
        projectId: proyect.value,
        name: name.value,
        description: description.value,
        quantity: num.value,
        date: dateValue.value
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
          showMessage({
            message: lang.t('data.createRecordSuccessful'),
            type: 'success'
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

    function findRequest(isFind) {
      if (isFind) {
        requestlistIssues()
          .then(response => {
            const { records } = response
            listRequest.value = records
          })
      }
    }

    function findProyect(isFind) {
      if (isFind) {
        requestlistProject()
          .then(response => {
            const { records } = response
            listProyect.value = records
          })
      }
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

    function confirmResiurce(row) {
      const { id, uuid } = row
      console.log({ id, uuid })
      // requestConfirmResourceAssignnment({
      //   id,
      //   uuid
      // })
      //   .then(() => {
      //     showMessage({
      //       message: lang.t('timeControl.recordConfirmed'),
      //       type: 'success'
      //     })
      //   })
      //   .catch(error => {
      //     showMessage({
      //       message: error,
      //       type: 'error'
      //     })
      //     console.warn(`requestConfirmResourceAssignnment: Confirme Resource Server (State) - Error ${error.code}: ${error.message}.`)
      //   })
      //   .finally(() => {
      //     listResource()
      //     this.$refs[id].doClose()
      //     this.$refs[id ].doShow()
      //     this.$refs[id].showPopper = false
      //   })
    }

    function listResource(pageNumber) {
      const resourceTypeId = store.getters.getValueOfField({
        containerUuid: 'ChildIncome',
        columnName: 'RecurringTypeSearch'
      })
      const pageToken = generatePageToken({ pageNumber })

      isLoadingRecords.value = true
      requestListTimeRecord({
        resourceTypeId,
        name: nameFind.value,
        description: descriptionFind.value,
        confirmed: confirmedFind.value,
        pageToken
      })
        .then(response => {
          recordCount.value = response.recordCount
          const { records } = response
          const recordsList = records.map(row => {
            return {
              ...row,
              resourceNameType: row.resource.resource_type.name,
              dateFrom: dateTimeFormats(row.assign_date_from, 'YYYY-MM-DD'),
              isConfirmed: row.is_confirmed,
              ...ROW_ATTRIBUTES
            }
          })
          tableData.value = recordsList
          isLoadingRecords.value = false
        }).catch(error => {
          showMessage({
            message: error,
            type: 'error'
          })
          isLoadingRecords.value = false
          console.warn(`requestListTimeRecord: List Resource Server (State) - Error ${error.code}: ${error.message}.`)
        })
    }

    function handleRowClick(row) {
      currentResource.value = row
    }

    if (!isLoadingFields.value) {
      setFieldsList({})
    }

    // Get Record Control Table
    function setPage(pageNumber) {
      listResource(pageNumber)
    }

    function closeList(params) {
      this.$refs[params].doClose()
      this.$refs[params].doShow()
      this.$refs[params].showPopper = false
    }

    listResource()

    return {
      // Ref
      activeCollapse,
      name,
      nameEdit,
      descriptionEdit,
      description,
      tableData,
      isLoadingFields,
      isLoadingCreate,
      metadataList,
      timeOutFocus,
      confirmedFind,
      confirmedOptionsList,
      nameFind,
      descriptionFind,
      isLoadingRecords,
      recordCount,
      pageNumber,
      currentResource,
      visible,
      dateValue,
      num,
      request,
      proyect,
      listProyect,
      findProyect,
      listRequest,
      findRequest,
      // Computeds
      recurringType,
      recurringTypeUuid,
      isValidateAdd,
      isMobile,
      // Css - Computeds
      sizeColumn,
      cssStyleFront,
      cssStyleFrontName,
      cssStyleButton,
      selection,
      // import
      heardList,
      containerManager: {
        ...containerManagerForm
      },
      // Methods
      addNewRecord,
      listResource,
      confirmResiurce,
      setPage,
      handleRowClick,
      closeList
    }
  }
})
</script>

<style lang="scss">
.el-card__body {
  padding-right: 20px !important;
  padding-left: 20px !important;
}

.form-time-control {
  /**
   * Reduce the spacing between the form element and its label
   */
  .el-form-item__label {
    padding-bottom: 0px;
  }
}
</style>
