<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div style="display: contents;">
    <div style="height: 5% !important;">
      <el-steps :active="currentSetp" finish-status="success">
        <el-step
          v-for="(list, key) in stepList"
          :title="list.name"
        />
      </el-steps>
    </div>
    <div style="height: 80% !important;">
      <carousel
        :step-reference="metadata.fileName"
        :steps="stepList"
        :indicator="currentSetp"
      >
        <search-criteria
          v-show="'searchCriteria' === stepList[currentSetp].key"
        />
        <payments
          v-show="'payments' === stepList[currentSetp].key"
        />
        <invoce
          v-show="'invoce' === stepList[currentSetp].key"
        />
        <summary v-show="'summary' === stepList[currentSetp].key" />
      </carousel>
    </div>
    <div style="height: 5% !important;text-align: end;">
      <el-button v-show="currentSetp > 0" type="danger" icon="el-icon-close" plain @click="currentSetp--" />
      <el-button v-show="currentSetp < 3" type="primary" icon="el-icon-check" plain @click="currentSetp++" />
      <!-- <el-button type="success" icon="el-icon-message" plain /> -->
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
// import lang from '@/lang'
// components and mixins
import Carousel from '@theme/components/ADempiere/Carousel'
// import formMixin from '@theme/components/ADempiere/Form/formMixin.js'
// import fieldsList from './fieldList.js'
import SearchCriteria from './components/SearchCriteria'
import Payments from './components/Payments'
import Invoce from './components/Invoce'
import Summary from './components/Summary'
// import Invoices from './components/Invoices/index'
// import Receipt from './components/Receipt/index'

// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
// import { showMessage } from '@/utils/ADempiere/notification'

// API Request Methods
// import {
//   listPaymentSelection,
//   paymentSelection
// } from '@/api/ADempiere/form/VPayPrint.js'

export default defineComponent({
  name: 'VAllocation',

  components: {
    Carousel,
    SearchCriteria,
    Invoce,
    Payments,
    Summary
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  setup(props, { root }) {
    /**
     * Refs
     */

    const stepList = ref([
      {
        name: 'Selección de Criterio',
        description: '',
        key: 'searchCriteria'
      },
      {
        name: 'Selección de Pagos',
        description: '',
        key: 'payments'
      },
      {
        name: 'Selección de Factura',
        description: '',
        key: 'invoce'
      },
      {
        name: 'Resumen y Ajuste',
        description: 'Resumen y Ajuste',
        key: 'summary'
      }
    ])

    const currentSetp = ref(0)

    /**
     * Methods
     */

    return {
      // Const
      // Refs
      stepList,
      currentSetp
      // Methods
    }
  }
})
</script>

<style lang="scss">
  .from-wf-panel {
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .el-input--medium .el-input__inner {
    text-align: end;
  }
</style>
