<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
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
  <div style="height: 100% !important;">
    <el-card id="panel-top-search-criteria" class="panel-top-search-criteria" style="height: 100% !important;">
      <div style="width: 50% !important;float: left;padding-left: 10px;padding-right: 10px;height: 100% !important;">
        <el-card style="height: 100% !important;">
          <div slot="header" class="clearfix" style="text-align: center;">
            <b>
              {{ 'Movimientos Importados' }}
            </b>
          </div>
          <el-table
            :data="importedMovements"
            :border="true"
            class="table-import"
            style="height: 100% !important;width: 100% !important;"
          >
            <el-table-column
              type="selection"
              :align="'center'"
              width="35"
            />
            <el-table-column
              v-for="(fieldAttributes, key) in headerTableImported"
              :key="key"
              :column-key="fieldAttributes.columnName"
              :prop="fieldAttributes.columnName"
              :label="fieldAttributes.label"
              :min-width="fieldAttributes.width"
              :align="fieldAttributes.align"
            />
          </el-table>
        </el-card>
      </div>
      <div style="width: 50% !important;float: right;padding-left: 10px;padding-right: 10px;height: 100% !important;">
        <el-card style="height: 100% !important;">
          <div slot="header" class="clearfix" style="text-align: center;">
            <b>
              {{ 'Pagos del Sistema' }}
            </b>
          </div>
          <el-table
            :data="systemPayments"
            :border="true"
          >
            <el-table-column
              type="selection"
              :align="'center'"
              width="35"
            />
            <el-table-column
              v-for="(fieldAttributes, key) in headerTableSystem"
              :key="key"
              :column-key="fieldAttributes.columnName"
              :prop="fieldAttributes.columnName"
              :label="fieldAttributes.label"
              :min-width="fieldAttributes.width"
              :align="fieldAttributes.align"
            />
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
  name: 'ManualMatch',
  setup(props, { root }) {
    /**
    * Refs
    */

    const systemPayments = ref([])
    const headerTableSystem = ref([
      {
        label: 'Fecha de la Transacción',
        columnName: 'transactionDate',
        align: 'left',
        width: '190'
      },
      {
        label: 'Cobros',
        columnName: 'receipt',
        align: 'left',
        width: '100'
      },
      {
        label: 'Document No',
        columnName: 'documentNo',
        align: 'left',
        width: '150'
      },
      {
        label: 'Socio del Negocio',
        columnName: 'businessPartner',
        align: 'left',
        width: '180'
      },
      {
        label: 'Tipo de Pago',
        columnName: 'tenderType',
        align: 'left',
        width: '150'
      },
      {
        label: 'Moneda',
        columnName: 'currency',
        align: 'left',
        width: '100'
      },
      {
        label: 'Cantidad',
        columnName: 'quantity',
        align: 'right',
        width: '120'
      },
      {
        label: 'Description',
        columnName: 'description',
        align: 'left',
        width: '120'
      }
    ])

    const importedMovements = ref([])
    const headerTableImported = ref([
      {
        label: 'Fecha de la Transacción',
        columnName: 'transactionDate',
        align: 'left',
        width: '190'
      },
      {
        label: 'Cobros',
        columnName: 'receipt',
        align: 'left',
        width: '100'
      },
      {
        label: 'No. de Referencia',
        columnName: 'documentNo',
        align: 'left',
        width: '150'
      },
      {
        label: 'Socio del Negocio',
        columnName: 'businessPartner',
        align: 'left',
        width: '180'
      },
      {
        label: 'Moneda',
        columnName: 'currency',
        align: 'left',
        width: '150'
      },
      {
        label: 'Cantidad',
        columnName: 'quantity',
        align: 'right',
        width: '100'
      },
      {
        label: 'Memo',
        columnName: 'memo',
        align: 'left',
        width: '120'
      }
    ])

    return {
      systemPayments,
      headerTableSystem,
      importedMovements,
      headerTableImported
    }
  }
})
</script>

<style lang="scss">
.form-item-criteria {
  margin-top: 0px;
  margin-left: 0px;
  margin-bottom: 0px;
  margin-right: 0px;
  padding-bottom: 0px;
  .el-form-item__label {
    padding-bottom: 0px;
  }
  .el-form-item--medium .el-form-item__label {
    padding-bottom: 0px;
  }
  .el-form--inline .el-form-item {
    margin: 0px;
  }
}
.el-table {
  height: 100% !important;
  .el-table--border {
    border-right: none;
    border-bottom: none;
    height: 100% !important;
  }
  .el-table--scrollable-x .el-table__body-wrapper {
    height: 100% !important;
  }
  .el-table__body-wrapper {
    height: 85% !important;
  }
}

</style>
