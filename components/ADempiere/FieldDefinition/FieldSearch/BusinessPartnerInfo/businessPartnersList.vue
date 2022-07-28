<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
              :metadata-field="field"
              :container-uuid="'Business-Partner-List'"
              :container-manager="containerManagerBPList"
            />
          </el-row>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <el-table
      ref="businessPartnerTable"
      v-loading="isLoadingRecords"
      class="business-partners-table"
      :data="recordsList"
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

      <el-table-column
        type="index"
        label="#"
        width="35"
        header-align="center"
      />

      <el-table-column
        v-for="(heard, key) in labelTable"
        :key="key"
        :label="heard.label"
        prop="value"
        header-align="center"
      >
        <span v-if="heard.columnName === 'Value'" slot-scope="scope">
          {{ scope.row.value }}
        </span>
        <span v-else-if="heard.columnName === 'TaxID'" slot-scope="scope">
          {{ scope.row.taxId }}
        </span>
        <span v-else-if="heard.columnName === 'Name'" slot-scope="scope">
          {{ scope.row.name }}
        </span>
        <span v-else-if="heard.columnName === 'Name2'" slot-scope="scope">
          {{ scope.row.lastName }}
        </span>
      </el-table-column>
    </el-table>

    <el-row :gutter="24" class="business-partners-footer">
      <el-col :span="12">
        <custom-pagination
          :total="businessParnerData.recordCount"
          :current-page="pageNumber"
          :container-manager="containerManagerBPList"
          :handle-change-page="setPage"
          :selection="selection"
        />
      </el-col>

      <el-col :span="12">
        <samp style="float: right; padding-right: 10px;">
          <el-button
            type="danger"
            class="custom-button-create-bp"
            icon="el-icon-close"
            @click="closeList(); clearValues();"
          />

          <el-button
            type="primary"
            class="custom-button-create-bp"
            icon="el-icon-check"
            @click="changeBusinessPartner"
          />
        </samp>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>

import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import CustomPagination from '@theme/components/ADempiere/DefaultTable/CustomPagination.vue'

// constants
import { BUSINESS_PARTNERS_LIST_FORM } from '@/utils/ADempiere/dictionary/form/businessPartner/businessPartnerList'
import fieldsList from './fieldsListSearch'

// components and mixins
import businessPartnerMixin from './mixinBusinessPartner'

// utils and helper methods
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import {
  // createFieldFromDefinition,
  createFieldFromDictionary
} from '@/utils/ADempiere/lookupFactory'
import { containerManager as containerManagerForm } from '@/utils/ADempiere/dictionary/form'

export default {
  name: 'BusinessPartnersList',

  components: {
    CustomPagination,
    FieldDefinition
  },

  mixins: [
    businessPartnerMixin
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
      timeOutRecords: null,
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
        return BUSINESS_PARTNERS_LIST_FORM + '_' + this.metadata.containerUuid
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
        this.$store.commit('setBusinessPartnerSelectedRow', {
          containerUuid: this.uuidForm,
          currentRow: rowSelected
        })
      },
      get() {
        return this.$store.getters.getBusinessPartnerCurrentRow({
          containerUuid: this.uuidForm
        })
      }
    }
  },

  watch: {
    isReadyFromGetData(isToLoad) {
      if (isToLoad) {
        this.searchBPartnerList()
      }
    },
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

    if (this.isReadyFromGetData) {
      this.searchBPartnerList()
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$refs.businessPartnerTable) {
        this.$refs.businessPartnerTable.setCurrentRow(this.currentRow)
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
          this.searchBPartnerList()
          break

        case 'close':
          this.closeList()
          break
      }
    },
    changeBusinessPartner() {
      if (!isEmptyValue(this.currentRow)) {
        this.setValues(this.currentRow)
        this.closeList()
      }
    },
    closeList() {
      this.$store.commit('setBusinessPartnerShow', {
        containerUuid: this.uuidForm,
        show: false
      })
    },
    setPage(pageNumber) {
      this.searchBPartnerList(pageNumber)
    },
    subscribeChanges() {
      return this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'updateValueOfField') {
          if (mutation.payload.containerUuid === this.uuidForm) {
            this.searchBPartnerList()
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
    searchBPartnerList(pageNumber = 0, isConvert = true) {
      const values = this.$store.getters.getValuesView({
        containerUuid: this.uuidForm,
        format: 'object'
      })

      let parsedValues = values
      if (isConvert && !isEmptyValue(values)) {
        parsedValues = this.convertValuesToSend(values)
      }
      this.isLoadingRecords = true

      clearTimeout(this.timeOutRecords)
      this.timeOutRecords = setTimeout(() => {
        // search on server
        this.$store.dispatch('getBusinessPartners', {
          ...parsedValues,
          containerUuid: this.uuidForm,
          pageNumber
        })
          .then(response => {
            if (isEmptyValue(response)) {
              this.$message({
                type: 'warning',
                showClose: true,
                message: this.$t('businessPartner.notFound')
              })
            }

            this.$nextTick(() => {
              if (this.$refs.businessPartnerTable) {
                this.$refs.businessPartnerTable.setCurrentRow(this.currentRow)
              }
            })
          })
          .finally(() => {
            this.isLoadingRecords = false
          })
      }, 500)
    },
    /**
     * ColumnName equals property to set into request's system-core
     * TODO: Add keyServer and keyClient
     * @param {object} values
     * @returns {object}
     */
    convertValuesToSend(values) {
      const valuesToSend = {}
      Object.keys(values).forEach(key => {
        const value = values[key]
        if (isEmptyValue(value)) {
          return
        }
        switch (key) {
          // case 'TaxID':
          //   valuesToSend['taxId'] = value
          //   break
          case 'Value':
            valuesToSend['value'] = value
            break
          case 'Name':
            valuesToSend['name'] = value
            break
        }
      })

      valuesToSend['posUuid'] = this.$store.getters.posAttributes.currentPointOfSales.uuid
      return valuesToSend
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
}
</style>
