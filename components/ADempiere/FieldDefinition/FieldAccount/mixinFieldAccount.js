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
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// constants
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'mixinFieldAccount',

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          parentUuid: undefined,
          containerUuid: undefined,
          columnName: 'C_BPartner_ID',
          elementName: 'C_BPartner_ID'
        }
      }
    }
  },

  computed: {
    blankValues() {
      return {
        id: undefined,
        uuid: undefined,
        value: undefined,
        name: undefined,
        lastName: undefined,
        description: undefined
      }
    },
    recordsList() {
      return this.$store.getters.getBusinessPartnerRecordsList({
        containerUuid: this.uuidForm
      })
    }
  },
  methods: {
    clearValues() {
      this.setValues(this.blankValues)
    },
    generateDisplayedValue({ value, name, lastName }) {
      let displayedValue

      if (!isEmptyValue(value)) {
        displayedValue = value
      }
      if (!isEmptyValue(name)) {
        if (!isEmptyValue(displayedValue)) {
          displayedValue += ' - ' + name
        } else {
          displayedValue = name
        }
      }
      if (!isEmptyValue(lastName)) {
        displayedValue += ' ' + lastName
      }

      return displayedValue
    },
    setValues(rowData) {
      const { parentUuid, containerUuid, columnName, elementName } = this.metadata
      const { [columnName]: id, UUID: uuid, IdentifierTable } = rowData

      const displayedValue = this.generateDisplayedValue(rowData)

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
        value: displayedValue
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
          value: displayedValue
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
