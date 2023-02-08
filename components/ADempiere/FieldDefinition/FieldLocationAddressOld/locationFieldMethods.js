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

import store from '@/store'

// utils and helpers methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export function clearValues(uuidForm) {
  setValues(uuidForm)

  store.dispatch('clearValuesOnContainer', {
    containerUuid: uuidForm
  })
}

export function setValues(uuidForm) {
  store.dispatch('updateValuesOfContainer', {
    containerUuid: uuidForm,
    attributes: {
      // DisplayColumn_C_City_ID: cityName,
      // DisplayColumn_C_Region_ID: regionName,
      // DisplayColumn_C_Country_ID: countryName,
      // undefined to force get value with default value
      DisplayColumn_C_City_ID: undefined,
      DisplayColumn_C_Region_ID: undefined,
      DisplayColumn_C_Country_ID: undefined,
      id: undefined,
      uuid: undefined,
      UUID: undefined
    }
  })
}

export function setContainerInformation(currentTab, currentRecord) {
  if (!isEmptyValue(currentTab)) {
    store.dispatch('panelInfo', {
      currentTab,
      currentRecord
    })
  }
}

export function toggleShowedLocationForm() {
  const isShowedLocation = store.getters.getIsShowedLocation
  store.commit('setShowedLocation', !isShowedLocation)
}
