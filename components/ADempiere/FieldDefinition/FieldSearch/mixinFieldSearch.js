/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import lang from '@/lang'
import store from '@/store'

// utils and helper methods
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import { trimPercentage } from '@/utils/ADempiere/valueFormat'

export default {
  name: 'MixinFieldSearch',

  data() {
    return {
      timeOutSearchRecords: null,
      searchText: '',
      controlDisplayed: this.displayedValue,
      unsubscribe: null
    }
  },

  computed: {
    blankValues() {
      return {
        id: undefined,
        uuid: undefined,
        name: undefined
      }
    },
    // implement to overwrite
    recordsList() {
      return []
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

        return store.getters.getValueOfFieldOnContainer({
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

        // const option = this.findOption(value)
        // // always update uuid
        // this.uuidValue = option.uuid

        store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName,
          value
        })
        // update element column name
        if (columnName !== this.metadata.elementName) {
          store.commit('updateValueOfField', {
            parentUuid: this.metadata.parentUuid,
            containerUuid,
            columnName: this.metadata.elementName,
            value
          })
        }
      }
    },
    displayedValue: {
      get() {
        const display = store.getters.getValueOfField({
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.displayColumnName
        })
        return display
      },
      set(value) {
        store.commit('updateValueOfField', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.displayColumnName,
          value
        })
      }
    }
  },

  created() {
    this.unsubscribe = this.subscribeChanges()
  },

  beforeDestroy() {
    this.unsubscribe()
  },

  methods: {
    clearValues() {
      this.setValues(this.blankValues)
    },
    subscribeChanges() {
      return this.$store.subscribe((mutation, state) => {
        if (mutation.type === 'updateValueOfField') {
          if (mutation.payload.containerUuid === this.metadata.containerUuid) {
            // add displayed value to persistence
            if (mutation.payload.columnName === this.metadata.columnName) {
              this.preHandleChange(mutation.payload.value)

              this.$store.dispatch('notifyFieldChange', {
                containerUuid: this.metadata.containerUuid,
                containerManager: this.containerManager,
                field: this.metadata,
                columnName: this.metadata.displayColumnName
              })
            }

            if (mutation.payload.columnName === this.metadata.displayColumnName) {
              // set current displayed value to clean on focus
              this.controlDisplayed = mutation.payload.value
            }
          }
        }
      })
    },
    setNewDisplayedValue() {
      const displayValue = this.displayedValue
      this.displayedValue = '' // clear to enter search
      if (!isSameValues(this.controlDisplayed, displayValue)) {
        this.controlDisplayed = displayValue
      }
    },
    setOldDisplayedValue() {
      if (!isSameValues(this.controlDisplayed, this.displayedValue)) {
        this.displayedValue = this.controlDisplayed
      }
    },
    whitOutResultsMessage() {
      this.$message({
        message: lang.t('notifications.searchWithOutRecords'),
        type: 'info',
        showClose: true
      })
    },

    localSearch(stringToMatch, callBack) {
      if (isEmptyValue(stringToMatch)) {
        // not show list
        callBack([])
        return
      }

      const recordsList = this.recordsList
      let results = recordsList
      if (stringToMatch) {
        const parsedValue = trimPercentage(stringToMatch.toLowerCase().trim())

        results = recordsList.filter(row => {
          for (const column in row) {
            const valueToCompare = String(row[column]).toLowerCase()

            if (valueToCompare.includes(parsedValue)) {
              return true
            }
          }
          return false
        })

        // Remote search
        if (isEmptyValue(results) && String(stringToMatch.length > 3)) {
          clearTimeout(this.timeOutSearchRecords)

          this.timeOutSearchRecords = setTimeout(() => {
            this.remoteSearch(stringToMatch)
              .then(remoteResponse => {
                callBack(remoteResponse)
              })
          }, 2000)
          return
        }
      }

      // call callback function to return suggestions
      callBack(results)
    },

    /**
     * implement to overwrite
     * @param {string} searchValue
     * @returns {promise}
     */
    remoteSearch(searchValue) {
      return new Promise(resolve => {
        console.info('Implememnt to overwrite')
        resolve([])
      })
    },

    generateDisplayedValue({ name }) {
      let displayedValue
      if (!isEmptyValue(name)) {
        displayedValue = name
      }
      return displayedValue
    },

    handleSelect(recordSelected) {
      if (isEmptyValue(recordSelected)) {
        recordSelected = this.blankValues
      }
      this.setValues(recordSelected)

      // prevent losing display value with focus
      this.controlDisplayed = this.generateDisplayedValue(recordSelected)
    }
  }

}
