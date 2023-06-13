<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
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
along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-dropdown
    size="small"
    plain
    :split-button="true"
    type="primary"
    :class="{ 'action-container': true, 'without-defualt-action': true }"
    @command="handleOperator"
  >
    {{ operator }}
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="(operator, index) in operatorList"
        :key="index"
        :command="operator"
      >
        {{ operator }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import store from '@/store'

import {
  defineComponent,
  computed
} from '@vue/composition-api'
// Constants
import {
  FIELD_OPERATORS_LIST
} from '@/utils/ADempiere/dataUtils'

export default defineComponent({
  name: 'Condition',
  props: {
    metadataField: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { root }) {
    /**
     * Computed
     */
    const operator = computed(() => {
      return props.metadataField.operator
    })
    const operatorList = computed(() => {
      const isComparisonField = !['FieldBinary', 'FieldButton', 'FieldImage'].includes(props.metadataField.componentPath)
      if (isComparisonField) {
        const operatorsField = FIELD_OPERATORS_LIST.find(item => {
          return item.componentPath === props.metadataField.componentPath
        })
        if (operatorsField) {
          return operatorsField.operatorsList
        }
      }

      return props.metadataField.operatorsList
    })
    /**
     * Methods
     */
    function handleOperator(operator) {
      const {
        columnName,
        containerUuid
      } = props.metadataField
      store.commit('updateValueOfField', {
        containerUuid,
        columnName,
        value: null
      })
      store.dispatch('changeFieldAttribure', {
        containerUuid,
        columnName,
        attributeName: 'operator',
        attributeValue: operator,
        field: props.metadataField
      })
      }

    return {
      // Computed
      operator,
      operatorList,
      // Methods
      handleOperator
    }
  }
})
</script>
