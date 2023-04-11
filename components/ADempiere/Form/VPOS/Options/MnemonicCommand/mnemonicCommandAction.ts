// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import store from '@/store'
import router from '@/router'

export function selectCommand(command) {
  let isRequirePin = false
  const list = store.getters.getLisCommantShortkey
  const action = list.find(list => list.shortcut === 'ctrl + ' + command)
  switch (action.command) {
    case 'newOrder':
      isRequirePin = newOrder()
      break
    case 'ordersHistory':
      isRequirePin = ordersHistory()
      break
  }
  return isRequirePin
}

function newOrder() {
  const { isAllowsCreateOrder, salesRepresentative, templateCustomer, uuid } = store.getters.posAttributes.currentPointOfSales
  const currentRoute = router.app._route
  const documentTypeUuid = store.getters.getValueOfField({
    containerUuid: currentRoute.meta.uuid,
    columnName: 'C_DocTypeTarget_ID_UUID'
  })
  if (!isAllowsCreateOrder) return true
  store.dispatch('createOrder', {
    posUuid: uuid,
    customerUuid: templateCustomer.uuid,
    salesRepresentativeUuid: salesRepresentative.uuid,
    documentTypeUuid
  })
    .then(response => {
      store.dispatch('reloadOrder', { orderUuid: response.uuid })
      router.push({
        params: {
          ...currentRoute.params
        },
        query: {
          ...currentRoute.query,
          action: response.uuid
        }
      }).then(() => {
        store.commit('setShowPOSCollection', false)
        store.dispatch('listOrdersFromServer', {
          posUuid: uuid
        })
      }).catch(() => {})
    })
  store.dispatch('changeFocusNewOrder', true)
  return false
}

function ordersHistory() {
  store.commit('showListOrders', true)
  return false
}
