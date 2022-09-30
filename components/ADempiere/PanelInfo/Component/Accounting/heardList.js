// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
    label: language.t('accounting.organization'),
    columnName: 'DisplayColumn_AD_Org_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.account'),
    columnName: 'DisplayColumn_Account_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.debitPosted'),
    columnName: 'AmtAcctDr',
    align: 'right'
  },
  {
    label: language.t('accounting.PostedCredit'),
    columnName: 'AmtSourceCr',
    align: 'right'
  },
  {
    label: language.t('accounting.product'),
    columnName: 'DisplayColumn_M_Product_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.businessPartner'),
    columnName: 'DisplayColumn_C_BPartner_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.Project'),
    columnName: 'DisplayColumn_C_Project_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.Campaign'),
    columnName: 'DisplayColumn_C_Campaign_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.accountingDate'),
    columnName: 'DateAcct',
    align: 'center'
  },
  {
    label: language.t('accounting.period'),
    columnName: 'DisplayColumn_C_Period_ID',
    align: 'right'
  },
  {
    label: language.t('accounting.um'),
    columnName: 'DisplayColumn_C_UOM_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.quantity'),
    columnName: 'Qty',
    align: 'right'
  },
  {
    label: language.t('accounting.table'),
    columnName: 'DisplayColumn_AD_Table_ID',
    align: 'center'
  },
  {
    label: language.t('accounting.recordId'),
    columnName: 'Record_ID',
    align: 'right'
  }
]
