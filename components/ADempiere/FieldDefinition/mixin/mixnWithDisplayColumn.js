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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import store from '@/store'

// Constants
import {
  DISPLAY_COLUMN_PREFIX,
  UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX
} from '@/utils/ADempiere/dictionaryUtils'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'MixinWithDisplayColumn',

  computed: {
    displayedValue: {
      get() {
        // if (isEmptyValue(this.value)) {
        //   return undefined
        // }

        // DisplayColumn_'ColumnName'
        const { displayColumnName: columnName, containerUuid, inTable } = this.metadata
        // table records values
        if (inTable) {
          // implement container manager row
          if (this.containerManager && this.containerManager.getCell) {
            const value = this.containerManager.getCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName
            })
            if (!isEmptyValue(value)) {
              return value
            }
          }
        }

        // return store.getters.getValueOfFieldOnContainer({
        //   parentUuid: this.metadata.parentUuid,
        //   containerUuid,
        //   columnName
        // })
        return store.getters.getValueOfField({
          // parentUuid: this.metadata.parentUuid,
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
            this.containerManager.setCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName: displayColumnName,
              value
            })
          }
        }

        store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: displayColumnName,
          value
        })
        // update element column name
        if (!this.metadata.isSameColumnElement) {
          store.commit('updateValueOfField', {
            parentUuid: this.metadata.parentUuid,
            containerUuid,
            columnName: DISPLAY_COLUMN_PREFIX + this.metadata.elementName,
            value
          })
        }
      }
    },

    uuidValue: {
      get() {
        return store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          // 'ColumnName'_UUID
          columnName: this.metadata.columnName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX
        })
      },
      set(value) {
        const { parentUuid, containerUuid } = this.metadata

        store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          // 'ColumnName'_UUID
          columnName: this.metadata.columnName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
          value
        })
        // update element column name
        if (!this.metadata.isSameColumnElement) {
          store.commit('updateValueOfField', {
            parentUuid,
            containerUuid,
            columnName: this.metadata.elementName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
            value
          })
        }
      }
    }
  }

}
