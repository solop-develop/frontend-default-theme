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
import language from '@/lang'
export default [
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.newOrder'),
    class: 'el-icon-news',
    isIcon: true,
    command: 'newOrder'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.ordersHistory'),
    class: 'list',
    isIcon: false,
    command: 'ordersHistory'
  },
  {
    nameOption: language.t('timeControl.addResource'),
    class: 'list',
    isIcon: false,
    command: 'addResource'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.generateImmediateInvoice'),
    class: 'el-icon-document-add',
    isIcon: true,
    command: 'generateImmediateInvoice'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.completePreparedOrder'),
    class: 'el-icon-success',
    isIcon: true,
    command: 'completePreparedOrder'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.cancelSaleTransaction'),
    class: 'el-icon-error',
    isIcon: true,
    command: 'cancelSaleTransaction'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.print'),
    class: 'el-icon-printer',
    isIcon: true,
    command: 'print'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.preview'),
    class: 'el-icon-printer',
    isIcon: true,
    command: 'preview'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.createNewReturnOrder'),
    class: 'el-icon-refresh-left',
    isIcon: true,
    command: 'createNewReturnOrder'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.copyOrder'),
    class: 'el-icon-document-copy',
    isIcon: true,
    command: 'copyOrder'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.cancelOrder'),
    class: 'el-icon-close',
    isIcon: true,
    command: 'cancelOrder'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.confirmDelivery'),
    class: 'shopping',
    isIcon: false,
    command: 'confirmDelivery'
  },
  {
    nameOption: language.t('form.pos.optionsPoinSales.salesOrder.deliverAllProducts'),
    class: 'shopping',
    isIcon: false,
    command: 'deliverAllProducts'
  },
  {
    nameOption: language.t('form.pos.applyDiscountOnOrder'),
    class: 'el-icon-document-remove',
    isIcon: true,
    command: 'applyDiscountOnOrder'
  }
]
