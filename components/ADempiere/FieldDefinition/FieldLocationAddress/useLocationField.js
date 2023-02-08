/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez https://github.com/Elsiosanchez
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

// Vue
import { computed, ref } from '@vue/composition-api'
// Store
import store from '@/store'
// Constants
import { LOCATION_ADDRESS_FORM } from '@/utils/ADempiere/dictionary/form/locationAddress'
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils.js'
// utils and helpers methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { getSequenceAsList } from '@/utils/ADempiere/dictionary/form/locationAddress'
import FieldsList from './fieldsList.js'

export default function useLocationField({
  metadata,
  containerManager
}) {
  /**
   * Const
   */
  const {
    containerUuid,
    columnName,
    displayColumnName,
    elementName,
    parentUuid
  } = metadata

  /**
   * Refs
   */
  const isGettingLocation = ref(false)
  /**
   * Computed
   */

  const uuidForm = computed(() => {
    if (!isEmptyValue(containerUuid)) return columnName + '_' + containerUuid
    return LOCATION_ADDRESS_FORM
  })

  const countryId = computed(() => {
    return store.getters.getValueOfField({
      containerUuid: uuidForm.value,
      columnName: 'C_Country_ID'
    })
  })

  const blankValues = computed(() => {
    return {
      [columnName]: undefined,
      [elementName]: undefined,
      id: undefined,
      uuid: undefined,
      UUID: undefined,
      [displayColumnName]: undefined
    }
  })

  const currentCountryDefinition = computed(() => {
    return store.getters.getStoredCountryFromId({
      id: countryId.value
    })
  })

  const isShowedLocationForm = computed({
    // getter
    get() {
      return store.getters.getIsShowedLocation
    },
    // setter
    set(newValue) {
      // return newValue
      // store.commit('setShowedLocation', newValue)
      // return newValue
    }
  })

  const currentTab = computed(() => {
    if (isEmptyValue(parentUuid) || isEmptyValue(containerManager.getPanel)) return {}
    return containerManager.getPanel({
      parentUuid,
      containerUuid
    })
  })

  const currentRecord = computed(() => {
    store.getters.getTabCurrentRow({ containerUuid })
  })

  /**
   * Methods
   */

  function clearValues() {
    setValues(uuidForm.value)

    store.dispatch('clearValuesOnContainer', {
      containerUuid: uuidForm.value
    })
    store.commit('setShowedLocation', false)
  }

  function setValues({ values }) {
    store.dispatch('updateValuesOfContainer', {
      containerUuid: uuidForm.value,
      attributes: {
        DisplayColumn_C_City_ID: undefined,
        DisplayColumn_C_Region_ID: undefined,
        DisplayColumn_C_Country_ID: undefined,
        id: undefined,
        uuid: undefined,
        UUID: undefined,
        ...values
      }
    })
  }

  function setContainerInformation() {
    if (!isEmptyValue(currentTab.value) && !isEmptyValue(currentRecord.value)) {
      store.dispatch('panelInfo', {
        currentTab: currentTab.value,
        currentRecord: currentRecord.value
      })
    }
  }

  function toggleShowedLocationForm() {
    isShowedLocationForm.value = !isShowedLocationForm.value
  }

  /**
   * Displayed sequence location
   * TODO: Evaluate capture sequence or displayed sequence to generate value
   * TODO: Test capture sequence Germany "@A1@ @A2@ @A3@ @A4@ D-@P@ @R@ @C@ @CO@" with D- suffix in postal code
   * @param {object} entityValues
   * @returns {string}
   */
  function generateDisplayedValue(entityValues) {
    let displayValue = ''

    if (isEmptyValue(entityValues)) {
      return displayValue
    }

    // TODO: Add DisplayColumnName (primary key) in entities
    const displayColumn = displayColumnName
    if (!isEmptyValue(entityValues[displayColumn])) {
      return entityValues[displayColumn]
    }

    // TODO: Change with current country display sequence
    let displaySequence = store.getters.getDisplaySequence
    const country = currentCountryDefinition.value
    if (!isEmptyValue(country)) {
      displaySequence = country.displaySequence
    }
    const locationDisplayedSequence = getSequenceAsList(displaySequence)

    const newFieldsList = FieldsList.map(item => {
      const { sequenceFields } = item.overwriteDefinition
      if (locationDisplayedSequence.includes(sequenceFields)) {
        return {
          ...item,
          isDisplayed: true,
          sequenceFields,
          index: locationDisplayedSequence.indexOf(sequenceFields)
        }
      }
      return {
        ...item,
        sequenceFields,
        isDisplayed: false
      }
    }).filter(field => {
      return field.isDisplayed
    }).sort((itemA, itemB) => {
      return itemA.index - itemB.index
    })

    const addDisplayValue = (value) => {
      if (isEmptyValue(value)) {
        value = ''
      }
      if (!isEmptyValue(displayValue)) {
        displayValue += ', ' + value
      } else {
        displayValue = value
      }
    }

    // displayed value of Address column names
    Object.keys(entityValues).forEach(columnName => {
      if (columnName.includes('Address')) {
        const currrentValue = entityValues[columnName]
        addDisplayValue(currrentValue)
      }
    })

    newFieldsList.forEach(field => {
      const { columnName } = field
      const displayColumnName = DISPLAY_COLUMN_PREFIX + columnName

      let currrentValue = ''
      if (!isEmptyValue(entityValues[displayColumnName])) {
        currrentValue = entityValues[displayColumnName]
      }

      if (isEmptyValue(currrentValue)) {
        if (columnName === 'C_City_ID') {
          currrentValue = entityValues['City']
        }
        if (columnName === 'C_Region_ID') {
          currrentValue = entityValues['RegionName']
        }

        if (isEmptyValue(currrentValue)) {
          currrentValue = store.getters.getValueOfField({
            containerUuid: uuidForm,
            columnName: displayColumnName
          })
        }
      }
      if (isEmptyValue(currrentValue)) {
        currrentValue = entityValues[columnName]
      }

      addDisplayValue(currrentValue)
    })

    return displayValue
  }

  return {
    // ref
    isGettingLocation,
    // Computed
    uuidForm,
    countryId,
    blankValues,
    currentCountryDefinition,
    isShowedLocationForm,
    currentTab,
    currentRecord,
    // Methods
    clearValues,
    setValues,
    setContainerInformation,
    toggleShowedLocationForm,
    generateDisplayedValue
  }
}
