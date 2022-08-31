<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Yamel Senih ysenih@erpya.com www.erpya.com
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
  <el-select
    v-model="value"
    v-bind="commonsProperties"
    :filterable="true"
    :loading="isLoading"
    value-key="value"
    clearable
    :multiple="isSelectMultiple"
    :allow-create="metadata.isSelectCreated"
    :collapse-tags="!isSelectMultiple"
    remote
    :remote-method="remoteSearch"
    @change="preHandleChange"
    @visible-change="getDataLookupList"
    @clear="clearLookup"
  >
    <svg-icon
      v-if="isSearchField"
      slot="prefix"
      icon-class="search"
      style="margin-left: 5px; font-size: 16px;"
    />

    <el-option
      v-for="(option, key) in optionsList"
      :key="key"
      :value="option.value"
      :label="option.displayedValue"
    />
  </el-select>
</template>

<script>
// components and mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import selectMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinFieldSelect.js'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

/**
 * This component is a lookup type field, use as a replacement for fields:
 * - Reference List
 * - Table List
 * - Table Direct
 *
 * TODO: String values add single quotation marks 'value'
 * TODO: No blanck option enabled if is mandatory field
 */
export default {
  name: 'FieldSelect',

  mixins: [
    fieldMixin,
    selectMixin
  ],

  computed: {
    /**
     * Lookup search type unsupported
     */
    isSearchField() {
      return this.metadata.componentPath === 'FieldSearch'
    },
    cssClassStyle() {
      let styleClass = ' custom-field-select '
      if (this.isSelectMultiple) {
        styleClass += ' custom-field-select-multiple '
      }

      if (this.isEmptyRequired) {
        styleClass += ' field-empty-required '
      }

      if (!this.isEmptyValue(this.metadata.cssClassName)) {
        styleClass += this.metadata.cssClassName
      }

      return styleClass
    },

    isWithSearchValue() {
      return Boolean(
        this.$store.getters.getStoredSearchValueLookup({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          contextColumnNames: this.metadata.contextColumnNames,
          uuid: this.metadata.uuid
        })
      )
    },

    value: {
      get() {
        const { columnName, containerUuid, inTable } = this.metadata
        // table records values
        if (inTable) {
          // implement container manager row
          if (this.containerManager && this.containerManager.getCell) {
            return this.containerManager.getCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName
            })
          }
        }

        return this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName
        })
      },
      set(value) {
        const { columnName, containerUuid, inTable } = this.metadata

        // table records values
        if (inTable) {
          // implement container manager row
          if (this.containerManager && this.containerManager.setCell) {
            return this.containerManager.setCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName,
              value
            })
          }
        }

        const option = this.findOption(value)
        // always update uuid
        this.uuidValue = option.uuid

        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName,
          value
        })
        // update element column name
        if (columnName !== this.metadata.elementName) {
          this.$store.commit('updateValueOfField', {
            parentUuid: this.metadata.parentUuid,
            containerUuid,
            columnName: this.metadata.elementName,
            value
          })
        }
      }
    },
    uuidValue: {
      get() {
        if (this.metadata.inTable) {
          return undefined
        }
        return this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // 'ColumnName'_UUID
          columnName: this.metadata.columnName + '_UUID'
        })
      },
      set(value) {
        if (this.metadata.inTable) {
          return undefined
        }
        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // 'ColumnName'_UUID
          columnName: this.metadata.columnName + '_UUID',
          value
        })
      }
    },
    displayedValue: {
      get() {
        // DisplayColumn_'ColumnName'
        const { displayColumnName: columnName, containerUuid, inTable } = this.metadata
        // table records values
        if (inTable) {
          // implement container manager row
          if (this.containerManager && this.containerManager.getCell) {
            return this.containerManager.getCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName
            })
          }
        }

        return this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName
        })
      },
      set(value) {
        const { displayColumnName, containerUuid, inTable } = this.metadata

        // table records values
        if (inTable) {
          // implement container manager row
          if (this.containerManager && this.containerManager.setCell) {
            return this.containerManager.setCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName: displayColumnName,
              value
            })
          }
        }

        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: this.metadata.displayColumnName,
          value
        })
      }
    },
    currentTab() {
      if (this.isEmptyValue(this.metadata.parentUuid) || !this.containerManager.getPanel) {
        return {}
      }
      return this.containerManager.getPanel({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid
      })
    },
    currentRecord() {
      return this.$store.getters.getTabCurrentRow({ containerUuid: this.metadata.containerUuid })
    }
  },

  watch: {
    isSelectMultiple(isMultiple) {
      let value = this.value
      if (isMultiple) {
        const valueInArray = []
        if (!this.isEmptyValue(value)) {
          valueInArray.push(value)
        }
        value = valueInArray
      } else {
        if (Array.isArray(value)) {
          if (value.length) {
            // set first value
            value = value[0]
          } else {
            value = this.blankOption.value
          }
        }
      }
      this.value = value
    },
    'metadata.displayed': {
      handler(value) {
        if (value) {
          this.setDisplayedValue()
        }
      },
      deep: true,
      immediate: true
    },
    value(newValue) {
      if (isEmptyValue(newValue)) {
        this.displayedValue = undefined
        this.uuidValue = undefined
        return
      }

      this.setDisplayedValue()
    }
  },

  beforeMount() {
    if (this.metadata.displayed) {
      this.setDisplayedValue()
    }
  },

  methods: {
    preHandleChange(value) {
      const { displayedValue } = this.findOption(value)
      this.displayedValue = displayedValue
      this.handleFieldChange({
        value,
        displayedValue
      })
    },
    findOption(value) {
      const option = this.optionsList.find(item => item.value === value)
      if (option && option.displayedValue) {
        return option
      }
      return {
        displayedValue: undefined,
        value: undefined,
        uuid: undefined
      }
    },
    setDisplayedValue() {
      this.optionsList = this.getStoredLookupAll
      const value = this.value
      // if empty clear all values
      if (isEmptyValue(value)) {
        this.displayedValue = undefined
        this.uuidValue = undefined
        return
      }

      // find local list value
      const option = this.findOption(value)
      if (!isEmptyValue(option.uuid)) {
        this.uuidValue = option.uuid
      }

     if (!isEmptyValue(option.displayedValue)) {
        this.displayedValue = option.displayedValue
        return
      }

      // add to list if no exist
      const displayedValue = this.displayedValue
      if (!isEmptyValue(displayedValue)) {
        // verify if exists to add (in table)
        this.optionsList.push({
          value,
          uuid: option.uuid,
          displayedValue
        })
        return
      }

      // request lookup
      this.getValueOfLookup()
    },
    getValueOfLookup() {
      if (this.metadata.isAdvancedQuery && this.isSelectMultiple) {
        return
      }
      this.isLoading = true

      this.getDefaultValueFromServer()
        .then(responseLookupItem => {
          // with value response update local component list
          if (!this.isEmptyValue(responseLookupItem)) {
            this.value = responseLookupItem.value
            this.displayedValue = responseLookupItem.displayedValue
            this.uuidValue = responseLookupItem.uuid

            // TODO: With remote and filter is enabled not working displayed value
            // https://github.com/ElemeFE/element/issues/20706
            // https://github.com/ElemeFE/element/issues/21287
            // https://github.com/ElemeFE/element/issues/21465
            this.optionsList = []
            this.$nextTick(() => {
              this.optionsList = this.getStoredLookupAll
            })
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /**
     * @param {boolean} isShowList triggers when the pull-down menu appears or disappears
     */
    getDataLookupList(isShowList) {
      // Establish
      this.setContainerInformation()
      // get stored list values
      const list = this.getStoredLookupList
      // refresh local list component
      this.optionsList = list
      if (isShowList) {
        if (this.isEmptyValue(list) || this.isWithSearchValue ||
          (list.length === 1 && this.blankValues.includes(list[0].value))) {
          this.loadListFromServer()
        }
      }
    },
    remoteSearch(searchQuery = '') {
      clearTimeout(this.timeOut)
      const results = this.localSearch(searchQuery)
      if ((this.isEmptyValue(results) && !this.isEmptyValue(searchQuery)) || this.isEmptyValue(searchQuery)) {
        this.timeOut = setTimeout(() => {
          this.loadListFromServer(searchQuery)
        }, 600)
        return
      }
      // use this, if remote is enabled, local search not working
      this.optionsList = results
    },
    localSearch(searchQuery = '') {
      if (this.isEmptyValue(searchQuery)) {
        return this.optionsList
      }
      return this.optionsList.filter(option => {
        return option.displayedValue.toLowerCase().includes(searchQuery.toLowerCase())
      })
    },
    loadListFromServer(searchQuery = '') {
      this.isLoading = true

      this.containerManager.getLookupList({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        contextColumnNames: this.metadata.reference.contextColumnNames,
        uuid: this.metadata.uuid,
        //
        tableName: this.metadata.reference.tableName,
        columnName: this.metadata.columnName,
        columnUuid: this.metadata.columnUuid,
        searchValue: searchQuery,
        referenceUuid: this.metadata.reference.uuid,
        // app attributes
        isAddBlankValue: true,
        blankValue: this.blankOption.value
      })
        .then(responseLookupList => {
          if (!this.isEmptyValue(responseLookupList)) {
            this.optionsList = responseLookupList
          } else {
            this.optionsList = this.getStoredLookupAll
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    clearLookup() {
      this.$store.dispatch('deleteLookup', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        contextColumnNames: this.metadata.contextColumnNames,
        uuid: this.metadata.uuid,
        //
        tableName: this.metadata.reference.tableName,
        columnName: this.metadata.columnName,
        value: this.value
      })
        .then(() => {
          // set empty list and empty option
          this.optionsList = [
            this.blankOption
          ]

          // set empty value
          this.value = this.blankOption.value
        })
    },
    setContainerInformation() {
      if (!this.isEmptyValue(this.currentTab)) {
        this.$store.dispatch('panelInfo', {
          currentTab: this.currentTab,
          currentRecord: this.currentRecord
        })
      }
    }
  }

}
</script>

<style lang="scss" scoped>
  .custom-field-select {
    width: 100%;
  }

  .custom-field-select-multiple {
    overflow: auto;
    max-height: 100px;
    .el-select__tags {
      max-height: 100px;
    }
  }
</style>
