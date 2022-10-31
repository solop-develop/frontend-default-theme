<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
  <el-row :gutter="0">
    <el-col :span="24">
      <el-table
        :data="listData"
        height="250"
        stripe
        style="width: 100%"
        @row-click="selectAttribute"
      >
        <el-table-column
          prop="description"
          label="Description"
          height="100"
          style="padding: 20px !important;"
        >
          <template slot-scope="scope">
            <p v-if="!isEmptyValue(scope.row.description)">
              {{ scope.row.description }}
            </p>
            <p
              v-else
              style="padding: 5px;"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="lot"
          label="Lote"
          height="50"
          style="padding: 20px !important;"
        >
          <template slot-scope="scope">
            <p>
              {{ scope.row.lot }}
            </p>
          </template>
        </el-table-column>
        <el-table-column
          prop="serial"
          label="serial"
          height="50"
          style="padding: 20px !important;"
        >
          <template slot-scope="scope">
            <p>
              {{ scope.row.serial }}
            </p>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
    <el-col :span="24" class="location-address-footer">
      <samp style="float: right; padding-top: 4px;">
        <el-button
          type="danger"
          icon="el-icon-close"
          @click="close"
        />

        <el-button
          type="primary"
          icon="el-icon-check"
          @click="setSelectedAttributeSet"
        />
      </samp>
    </el-col>
  </el-row>
</template>

<script>
import store from '@/store'
import { defineComponent, ref } from '@vue/composition-api'
import { DISPLAY_COLUMN_PREFIX, UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX } from '@/utils/ADempiere/dictionaryUtils'

export default defineComponent({
  name: 'ListTable',

  props: {
    listData: {
      type: Array,
      default: () => []
    },
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    metadata: {
      type: Object,
      required: true
    }
  },
  setup(props, { refs }) {
    const currentSelectAttributes = ref({})

    function setSelectedAttributeSet(row) {
      const columnName = 'M_AttributeSetInstance_ID'
      const containerUuid = props.containerUuid
      const parentUuid = props.parentUuid
      const { id, uuid, description } = currentSelectAttributes.value
      store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName,
        value: id
      })
      // set display column (name) value
      store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        // DisplayColumn_'ColumnName'
        columnName: DISPLAY_COLUMN_PREFIX + columnName,
        value: description
      })
      // set UUID value
      store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName: columnName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
        value: uuid
      })
      store.dispatch('notifyFieldChange', {
        containerUuid,
        containerManager: props.containerManager,
        field: props.metadata,
        columnName
      })
      close()
    }

    function close(row) {
      store.commit('setShowProductAttribute', false)
    }

    function selectAttribute(row, column, event) {
      store.commit('setProductAttribute', row)
      currentSelectAttributes.value = row
    }

    return {
      // Refs
      currentSelectAttributes,
      // Methods
      setSelectedAttributeSet,
      close,
      selectAttribute
    }
  }

})
</script>
