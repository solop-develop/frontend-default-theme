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
  <el-select
    v-model="fieldAttributes.operator"
    style="width: 200px;"
    @change="handleOperator"
  >
    <el-option
      v-for="(operator, key) in operatorList"
      :key="key"
      :value="operator"
      :label="$t('operators.' + operator)"
    />
  </el-select>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'

export default defineComponent({
  name: 'Operator',

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    fieldAttributes: {
      type: Object,
      required: true
    },
    containerManager: {
      type: Object,
      required: false
    }
  },

  setup(props) {
    /**
     * Const
     */

    const { columnName } = props.fieldAttributes

    /**
    * Computed
    */

    const operatorList = computed(() => {
      return props.fieldAttributes.operatorsList
    })

    /**
    * Methods
    */

    function handleOperator(newOperator) {
      store.commit('changeFieldPanelAttribute', {
        windowUuid: props.parentUuid,
        tabUuid: props.containerUuid,
        attributeName: 'operator',
        attributeValue: newOperator,
        columnName
      })
    }

    return {
      // Refs
      // Computeds
      operatorList,
      // Methods
      handleOperator
    }
  }
})
</script>

<style scoped>
  .tag-operator {
    font-size: 15px;
    line-height: 36px;
    padding: 0px;
    margin: 0px;
    height: 36px !important;
    width: 110px;
    padding-left: 5px;
    padding-right: 5px;
  }
</style>
