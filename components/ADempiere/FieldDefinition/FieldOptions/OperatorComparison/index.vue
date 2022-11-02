<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com www.erpya.com
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
  <div class="operator-comparison">
    <span class="custom-tittle-popover">
      {{ $t('operators.compareSearch') }}:
    </span>
    <br>
    {{ fieldAttributes.operator }} <hr>
    {{ fieldAttributes.oldOperator }} <hr>
    {{ fieldAttributes.name }} <hr>
    {{ fieldAttributes.columnName }} <hr>
    {{ fieldAttributes.containerUuid }}
    <el-select
      v-model="currentOperator"
      @change="changeOperator"
    >
      <el-option
        v-for="(itemOperator, key) in operatorsList"
        :key="key"
        :value="itemOperator"
        :label="$t('operators.' + itemOperator)"
      />
    </el-select>
  </div>
</template>

<script>
import { computed, defineComponent, ref } from '@vue/composition-api'

import store from '@/store'

// constants
import { OPERATORS_MULTIPLE_VALUES } from '@/utils/ADempiere/dataUtils'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'OperatorComparisonField',

  props: {
    fieldAttributes: {
      type: Object,
      required: true
    },
    containerManager: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props) {
    const { parentUuid, containerUuid, columnName } = props.fieldAttributes

    const operatorsList = ref(props.fieldAttributes.operatorsList)
    const currentOperator = computed({
      get() {
        const ppp = store.getters.getFieldFromColumnName({
          containerUuid,
          parentUuid,
          columnName
        })
        const { operator } = store.getters.getFieldFromColumnName({
          containerUuid,
          parentUuid,
          columnName
        })

        console.log({
          ppp,
          containerUuid,
          parentUuid,
          columnName,
          aaa: store.getters.getValuesView({
            parentUuid,
            format: 'object'
          }),
          bbb: store.getters.getValueOfField({
            parentUuid,
            columnName
          }),
          getters: store.getters,
          operator
        })

        return operator
      },
      set(newValue) {
        console.log({
          newValue,
          containerUuid,
          columnName,
          attributeName: 'operator',
          attributeValue: newValue
        })
        store.commit('updateValueOfField', {
          containerUuid,
          columnName,
          value: newValue
        })
        store.dispatch('changeFieldAttribure', {
          containerUuid,
          columnName,
          attributeName: 'operator',
          attributeValue: newValue,
          field: props.fieldAttributes
        })
      }
    })

    const fieldValue = computed(() => {
      // main panel values
      return store.getters.getValueOfFieldOnContainer({
        parentUuid,
        containerUuid,
        columnName
      })
    })

    /**
     * @param {mixed} value, main value in component
     */
    const handleChange = (value) => {
      console.log({ value })
      store.dispatch('notifyFieldChange', {
        containerUuid,
        field: props.fieldAttributes,
        columnName,
        newValue: value,
        containerManager: props.containerManager
      })
    }

    /**
     * @param {string} operatorValue
     */
    const changeOperator = (operatorValue) => {
      const value = fieldValue.value
      if (!isEmptyValue(value) || OPERATORS_MULTIPLE_VALUES.includes(operatorValue)) {
        handleChange(value)
      }
    }

    return {
      currentOperator,
      operatorsList,
      changeOperator
    }
  }
})
</script>

<style scoped lang="scss">
.custom-tittle-popover {
  font-size: 14px;
  font-weight: bold;
  float: left;
}

.operator-comparison {
  margin: 10px;
  padding: 10px;
}
</style>
