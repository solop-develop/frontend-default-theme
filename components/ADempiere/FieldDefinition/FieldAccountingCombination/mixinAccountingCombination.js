/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// constants
import {
  DISPLAY_COLUMN_PREFIX, UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX
} from '@/utils/ADempiere/dictionaryUtils'
import { COLUMN_NAME } from '@/utils/ADempiere/dictionary/form/accoutingCombination'

export default {
  name: 'mixinAccountingCombination',

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          parentUuid: undefined,
          containerUuid: undefined,
          columnName: COLUMN_NAME,
          elementName: COLUMN_NAME
        }
      }
    }
  },

  computed: {
    blankValues() {
      return {
        C_ValidCombination_ID: undefined,
        UUID: undefined,
        Combination: undefined
      }
    },
    recordsList() {
      return this.$store.getters.getAccountCombinationsRecordsList({
        containerUuid: this.uuidForm
      })
    },
    // context attributes values
    acctSchemaId() {
      return this.$store.getters.getValueOfField({
        containerUuid: this.uuidForm,
        columnName: 'C_AcctSchema_ID'
      })
    },
    organizationId() {
      return this.$store.getters.getValueOfField({
        containerUuid: this.uuidForm,
        columnName: 'AD_Org_ID'
      })
    },
    accoutId() {
      return this.$store.getters.getValueOfField({
        containerUuid: this.uuidForm,
        columnName: 'Account_ID'
      })
    },
    contextAttributesList() {
      return [
        { columnName: 'C_AcctSchema_ID', value: this.acctSchemaId },
        { columnName: 'AD_Org_ID', value: this.organizationId },
        { columnName: 'Account_ID', value: this.accoutId }
      ]
    }
  },

  methods: {
    clearValues() {
      this.setValues(this.blankValues)
    },
    /**
     * @overwrite
     * Get custom displayed value
     * @returns {string}
     */
    generateDisplayedValue(recordRow) {
      // generate with standard columns
      const { Combination } = recordRow

      return Combination
    },
    /**
     * @overwrite
     * Set custom row on fields values
     * @returns {string}
     */
    setValues(rowData) {
      const { parentUuid, containerUuid, columnName, elementName } = this.metadata
      const { C_ValidCombination_ID: id, UUID: uuid } = rowData

      const displayedValue = this.generateDisplayedValue(rowData)

      // set ID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName,
        value: id
      })
      // set display column (name) value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        // DisplayColumn_'ColumnName'
        columnName: DISPLAY_COLUMN_PREFIX + columnName,
        value: displayedValue
      })
      // set UUID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName: columnName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
        value: uuid
      })

      // set on element name, used by columns views aliases
      if (!this.metadata.isSameColumnElement) {
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
          value: displayedValue
        })
        // set UUID value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          columnName: elementName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
          value: uuid
        })
      }

      this.$store.dispatch('notifyFieldChange', {
        containerUuid: this.metadata.containerUuid,
        containerManager: this.containerManager,
        field: this.metadata,
        columnName: this.metadata.columnName,
        newValue: id
      })
    }
  }
}
