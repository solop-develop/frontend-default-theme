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
  <el-row :gutter="20" style="margin-left: 0px; margin-right: 0px;margin-top: 1%;">
    <el-col :span="16" style="float: left;">
      <b
        v-if="isNavigation"
      >
        <el-button
          type="text"
          plain
          icon="el-icon-arrow-up"
          style="color: black; font-size: x-large;border: 0px;"
          @click="prevRecord"
        />
        <el-button
          type="text"
          plain
          icon="el-icon-arrow-down"
          style="color: black; font-size: x-large;border: 0px;"
          @click="nextRecord"
        />
      </b>
    </el-col>
    <el-col :span="8" style="float: right;">
      <el-pagination
        small
        layout="slot, total, prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        style="float: right;"
        @current-change="handleChangePage"
      >
        <template v-slot>
          <span v-if="!isNavigation">
            {{ $t('table.dataTable.selected') }}: {{ selection }} / <!-- show total records -->
          </span>
        </template>
      </el-pagination>
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
// constants
import { ROWS_OF_RECORDS_BY_PAGE } from '@/utils/ADempiere/constants/table'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'CustomPagination',

  props: {
    parentUuid: {
      type: String,
      default: ''
    },
    containerUuid: {
      type: String,
      default: ''
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    selection: {
      type: Number,
      default: undefined
    },
    pageSize: {
      type: Number,
      default: ROWS_OF_RECORDS_BY_PAGE
    },
    total: {
      type: Number,
      default: undefined
    },
    isNavigation: {
      type: Boolean,
      required: false
    },
    handleChangePage: {
      type: Function,
      default: (pageNumber) => {
        console.info('implement change page number method', pageNumber)
      }
    }
  },

  setup(props) {
    const isSelection = computed(() => {
      if (isEmptyValue(props.selection)) {
        return false
      }
      return true
    })
    const listRecord = computed(() => {
      return store.getters.getTabRecordsList({
        containerUuid: props.containerUuid
      })
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.containerUuid)
    })

    const index = computed(() => {
      // getTabIndexRecord
      // return store.getters.getTabIndexRecord(props.containerUuid)
      return listRecord.value.findIndex(row => row.UUID === recordUuid.value)
    })

    // store.commit('setTabData', {
    //   containerUuid: props.containerUuid,
    //   indexRecord: index.value
    // })

    function nextRecord(params) {
      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        row: listRecord.value[index.value + 1]
      })
    }

    function prevRecord(params) {
      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        row: listRecord.value[index.value - 1]
      })
    }

    return {
      // Computed
      index,
      isSelection,
      recordUuid,
      listRecord,
      // Methodos
      nextRecord,
      prevRecord
    }
  }

})
</script>
