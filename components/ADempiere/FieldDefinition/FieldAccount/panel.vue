<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
  <el-main
    v-shortkey="shortsKey"
    v-loading="isLoadingFields"
    class="business-partners-list-container"
    style="padding-top: 0px"
    @shortkey.native="keyAction"
  >
    <el-collapse v-model="activeAccordion" accordion class="business-partners-query-criteria">
      <el-collapse-item name="query-criteria">
        <template slot="title">
          {{ title }}
        </template>

        <el-form
          label-position="top"
          size="small"
          @submit.native.prevent="notSubmitForm"
        >
          <el-row>
            <field-definition
              v-for="(field) in metadataList"
              :key="field.columnName"
              :metadata-field="{
                ...field,
                parentUuid: metadata.parentUuid
              }"
              :container-uuid="'Business-Partner-List'"
              :container-manager="containerManagerBPList"
            />
          </el-row>
        </el-form>
        <el-button
          type="primary"
          style="float: right;margin-top: 0.5%;margin-bottom: 0.5%;"
          @click="save()"
        >
          <svg-icon icon-class="save-AD" />
        </el-button>
      </el-collapse-item>
    </el-collapse>

    <el-table
      ref="accountCombinationsTable"
      v-loading="isLoadingRecords"
      class="business-partners-table"
      :data="recordDataList"
      highlight-current-row
      border
      fit
      :max-height="300"
      size="small"
      @current-change="handleCurrentChange"
      @row-dblclick="changeBusinessPartner"
    >
      <p slot="empty" style="width: 100%;">
        {{ $t('businessPartner.emptyBusinessPartner') }}
      </p>

      <index-column
        :page-number="pageNumber"
      />

      <el-table-column
        v-for="(head, key) in labelTable"
        :key="key"
        :label="head.label"
        prop="value"
        header-align="center"
      >
        <template slot-scope="scope">
          <!-- formatted displayed value -->
          <cell-info
            :parent-uuid="metadata.parentUuid"
            :container-uuid="uuidForm"
            :field-attributes="head"
            :container-manager="containerManagerBPList"
            :scope="scope"
            :data-row="scope.row.attributes"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-row class="business-partners-footer">
      <el-col :span="20">
        <custom-pagination
          :total="businessParnerData.recordCount"
          :current-page="pageNumber"
          :container-manager="containerManagerBPList"
          :handle-change-page="setPage"
          :records-page="recordDataList.length"
          :selection="selection"
        />
      </el-col>

      <el-col :span="4">
        <samp style="float: right;">
          <el-button
            :loading="isLoadingRecords"
            type="success"
            icon="el-icon-refresh-right"
            @click="findListAccount();"
          />

          <el-button
            type="danger"
            icon="el-icon-close"
            @click="closeList(); clearValues();"
          />

          <el-button
            type="primary"
            icon="el-icon-check"
            @click="changeBusinessPartner()"
          />
        </samp>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
// constants
import { BUSINESS_PARTNERS_LIST_FORM } from '@/utils/ADempiere/dictionary/form/businessPartner/businessPartnerList'
import fieldsList from './fieldsList'
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'

// components and mixins
import mixinFieldAccount from './mixinFieldAccount.js'
// import fieldSearchMixin from '../FieldSearch/mixinFieldSearch.js'
import CellInfo from '@theme/components/ADempiere/DataTable/Components/CellInfo.vue'
import CustomPagination from '@theme/components/ADempiere/DataTable/Components/CustomPagination.vue'
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import IndexColumn from '@theme/components/ADempiere/DataTable/Components/IndexColumn.vue'
// /opt/Development/workspace/epale/frontend-core/src/themes/default/components/ADempiere/DataTable/Components/CellInfo.vue
// utils and helper methods
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import {
  // createFieldFromDefinition,
  createFieldFromDictionary
} from '@/utils/ADempiere/lookupFactory'
import { containerManager as containerManagerForm } from '@/utils/ADempiere/dictionary/form'

export default {
  name: 'PanelAccount',

  components: {
    CellInfo,
    CustomPagination,
    FieldDefinition,
    IndexColumn
  },

  mixins: [
    mixinFieldAccount
    // fieldSearchMixin
  ],

  props: {
    containerManager: {
      type: Object,
      default: () => ({
        actionPerformed: () => {},
        getFieldsLit: () => {},
        setDefaultValues: () => {}
      })
    },
    metadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: BUSINESS_PARTNERS_LIST_FORM,
          columnName: 'C_BPartner_ID'
        }
      }
    },
    showPopover: {
      type: Boolean,
      default: () => false
    }
  },

  data() {
    return {
      activeAccordion: 'query-criteria',
      fieldsList,
      metadataList: [],
      recordDataList: [],
      timeOutRecords: null,
      timeOutUpdate: null,
      isLoadingRecords: false,
      timeOutFields: null,
      isLoadingFields: false,
      unsubscribe: () => {}
    }
  },

  computed: {
    title() {
      let title = this.$t('form.pos.order.BusinessPartnerCreate.businessPartner')
      if (!isEmptyValue(this.metadata.panelName) && !isSameValues(this.metadata.panelName, this.metadata.name)) {
        title += ` (${this.metadata.panelName})`
      }
      return title
    },
    uuidForm() {
      if (!isEmptyValue(this.metadata.containerUuid)) {
        return this.metadata.columnName + '_' + this.metadata.containerUuid
      }
      return BUSINESS_PARTNERS_LIST_FORM
    },
    shortsKey() {
      return {
        close: ['esc'],
        refreshList: ['f5']
      }
    },
    selection() {
      if (isEmptyValue(this.currentRow)) {
        return 0
      }
      return 1
    },
    containerManagerBPList() {
      return {
        ...this.containerManager,
        ...containerManagerForm,
        setPage: this.setPage
      }
    },
    labelTable() {
      return this.metadataList.map(field => {
        if (field.columnName === 'AD_Client_ID') {
          return {
            label: field.name,
            columnName: 'DisplayColumn_AD_Client_ID'
          }
        } else if (field.columnName === 'AD_Org_ID') {
          return {
            label: field.name,
            columnName: 'DisplayColumn_AD_Org_ID'
          }
        } else if (field.columnName === 'Account_ID') {
          return {
            label: field.name,
            columnName: 'DisplayColumn_Account_ID'
          }
        } else if (field.columnName === 'M_Product_ID') {
          return {
            label: field.name,
            columnName: 'DisplayColumn_M_Product_ID'
          }
        } else if (field.columnName === 'C_BPartner_ID') {
          return {
            label: field.name,
            columnName: 'DisplayColumn_C_BPartner_ID'
          }
        } else if (field.columnName === 'C_Project_ID') {
          return {
            label: field.name,
            columnName: 'DisplayColumn_C_Project_ID'
          }
        } else if (field.columnName === 'C_Campaign_ID') {
          return {
            label: field.name,
            columnName: 'DisplayColumn_C_Campaign_ID'
          }
        }
        return {
          label: field.name,
          columnName: field.columnName
        }
      })
    },
    businessParnerData() {
      return this.$store.getters.getBusinessPartnerData({
        containerUuid: this.uuidForm
      })
    },
    pageNumber() {
      return this.businessParnerData.pageNumber
    },
    isReadyFromGetData() {
      const { isLoaded } = this.businessParnerData
      return !isLoaded && this.showPopover
    },
    currentRow: {
      set(rowSelected) {
        this.$store.commit('setAccountCombinationsSelectedRow', {
          containerUuid: this.uuidForm,
          currentRow: rowSelected
        })
      },
      get() {
        return this.$store.getters.getAccountCombinationsCurrentRow({
          containerUuid: this.uuidForm
        })
      }
    }
  },

  watch: {
    // isReadyFromGetData(isToLoad) {
    //   if (isToLoad) {
    //     this.findListAccount()
    //   }
    // },
    showPopover(value) {
      if (value && isEmptyValue(this.metadataList)) {
        clearTimeout(this.timeOutFields)
        this.timeOutFields = setTimeout(() => {
          this.setFieldsList()
        }, 500)
      }
    }
  },

  created() {
    this.unsubscribe = this.subscribeChanges()
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs.accountCombinationsTable) {
        this.$refs.accountCombinationsTable.setCurrentRow(this.currentRow)
      }
    })

    if (this.showPopover) {
      clearTimeout(this.timeOutFields)
      this.timeOutFields = setTimeout(() => {
        this.setFieldsList()
      }, 500)
    }
  },

  beforeDestroy() {
    this.unsubscribe()
  },

  methods: {
    save() {
      const attributes = this.$store.getters.getValuesView({
        containerUuid: this.uuidForm,
        format: 'array'
      }).filter(item => !item.columnName.startsWith(DISPLAY_COLUMN_PREFIX) && !item.columnName.includes('_UUID')).map(item => {
        return {
          value: item.value,
          key: item.columnName
        }
      })
      const contextAttributesList = this.$store.getters.getValuesView({
        containerUuid: this.uuidForm,
        format: 'array'
      }).filter(item => item.columnName === 'Account_ID' || item.columnName === 'AD_Org_ID').map(item => {
        return {
          value: item.value,
          key: item.columnName
        }
      })

      const acctSchemaId = this.$store.getters.getValueOfField({
        containerUuid: this.metadata.containerUuid,
        columnName: 'C_AcctSchema_ID'
      })
      contextAttributesList.push({
        key: 'C_AcctSchema_ID',
        value: acctSchemaId
      })
      this.$store.dispatch('saveAccountCombinations', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.uuidForm,
        attributes,
        contextAttributes: contextAttributesList
      })
      this.findListAccount()
    },
    handleCurrentChange(row) {
      this.currentRow = row
    },
    keyAction(event) {
      switch (event.srcKey) {
        case 'refreshList':
          /**
           * TODO: When refreshing you are making 2 list requests, you can be the
           * observer that activates the second request
          */
          this.findListAccount()
          break

        case 'close':
          this.closeList()
          break
      }
    },
    changeBusinessPartner() {
      if (!isEmptyValue(this.currentRow)) {
        this.closeList()
        this.setValues(this.currentRow)
      }
    },
    closeList() {
      this.$store.commit('setAccountCombinationsShow', {
        containerUuid: this.uuidForm,
        show: false
      })
    },
    setPage(pageNumber) {
      this.findListAccount(pageNumber)
    },
    subscribeChanges() {
      return this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'updateValueOfField') {
          if (mutation.payload.containerUuid === this.uuidForm && !this.isEmptyValue(mutation.payload.value) && !mutation.payload.columnName.startsWith(DISPLAY_COLUMN_PREFIX) && !mutation.payload.columnName.includes('_UUID')) {
            clearTimeout(this.timeOutUpdate)
            this.timeOutUpdate = setTimeout(() => {
              this.findListAccount()
            }, 1800)
          }
        }
      })
    },
    setFieldsList() {
      const list = []
      this.isLoadingFields = true
      this.fieldsList.forEach(element => {
        createFieldFromDictionary(element)
          .then(responseField => {
            list.push({
              ...responseField,
              parentUuid: this.metadata.parentUuid,
              containerUuid: this.uuidForm
            })
          }).catch(error => {
            console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
          })
          .finally(() => {
            if (list.length === this.fieldsList.length) {
              this.metadataList = list
              this.isLoadingFields = false
            }
          })
      })
    },
    findListAccount(pageNumber = 0, isConvert = true) {
      let parentUuid = this.metadata.parentUuid
      if (isEmptyValue(parentUuid)) {
        parentUuid = this.metadata.containerUuid
      }
      const filters = this.$store.getters.getValuesView({
        containerUuid: this.uuidForm,
        format: 'array'
      }).filter(item => !this.isEmptyValue(item.value) && !item.columnName.startsWith(DISPLAY_COLUMN_PREFIX) && !item.columnName.includes('_UUID'))
      const contextAttributesList = this.$store.getters.getValuesView({
        containerUuid: this.uuidForm,
        format: 'array'
      }).filter(item => item.columnName === 'Account_ID' || item.columnName === 'AD_Org_ID')
      this.isLoadingRecords = true
      if (this.isEmptyValue(contextAttributesList) && contextAttributesList.length === 2) {
        return
      }
      clearTimeout(this.timeOutRecords)
      this.timeOutRecords = setTimeout(() => {
        // search on server
        this.$store.dispatch('listAccountCombinations', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.uuidForm,
          contextAttributesList,
          contextColumnNames: [this.metadata.columnName],
          uuid: this.metadata.uuid,
          filters,
          pageNumber
        })
          .then(response => {
            this.recordDataList = response
            if (isEmptyValue(response)) {
              this.$message({
                type: 'warning',
                showClose: true,
                message: this.metadata.name + this.$t('infoSearch.notFound')
              })
            }

            this.$nextTick(() => {
              if (this.$refs.accountCombinationsTable) {
                this.$refs.accountCombinationsTable.setCurrentRow(this.currentRow)
              }
            })
          })
          .finally(() => {
            this.isLoadingRecords = false
          })
      }, 500)
    },
    setValues(rowData) {
      const { parentUuid, containerUuid, columnName, elementName } = this.metadata
      const { [columnName]: id, UUID: uuid, IdentifierTable } = rowData
      // set ID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName,
        value: this.isEmptyValue(id) ? rowData[IdentifierTable + '_ID'] : id
      })
      // set display column (name) value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        // DisplayColumn_'ColumnName'
        columnName: DISPLAY_COLUMN_PREFIX + columnName,
        value: rowData.Combination
      })
      // set UUID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName: columnName + '_UUID',
        value: uuid
      })

      // set on element name, used by columns views aliases
      if (!isEmptyValue(elementName) && columnName !== elementName) {
        // set ID value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          columnName: elementName,
          value: id
        })
        // set display column (name) value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: DISPLAY_COLUMN_PREFIX + elementName,
          value: rowData.Combination
        })
        // set UUID value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          columnName: elementName + '_UUID',
          value: uuid
        })
      }
    }
  }
}
</script>

<style lang="scss">
.business-partners-list-container {
  .business-partners-query-criteria {
    // space between quey criteria and table
    .el-collapse-item__content {
      padding-bottom: 0px !important;
    }
  }

  .business-partners-footer {
    button {
      padding: 4px 8px;
      font-size: 24px;
    }
  }
}
</style>
