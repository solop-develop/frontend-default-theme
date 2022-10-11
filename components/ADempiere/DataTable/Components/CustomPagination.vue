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
  <el-row class="custom-pagination-content" :gutter="20">
    <el-col :span="24" style="float: right;">
      <el-pagination
        small
        layout="slot, total, sizes, prev, pager, next"
        :current-page="currentPage"
        :page-sizes="NUMBER_RECORDS_PER_PAGE"
        :page-size="currentPageSize"
        :total="total"
        style="float: right;"
        @size-change="handleSizeChange"
        @current-change="handleChangePage"
      >
        <span v-if="isSelection" class="selections-number">
          <span style="position: absolute !important;left: 1px !important;">
            {{ $t('table.dataTable.selected') }}: {{ selection }}
          </span>
          <!-- <span>
            {{ $t('table.dataTable.recordsPage') }} {{ recordsPage }} {{ ' ' }} /
          </span> -->
          <!-- {{ lisPageSize }} -->
          <!-- {{ $t('table.dataTable.selected') }}: {{ selection }} / show total records -->
        </span>
      </el-pagination>
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
// constants
import { ROWS_OF_RECORDS_BY_PAGE, NUMBER_RECORDS_PER_PAGE, totalRowByPage } from '@/utils/ADempiere/tableUtils'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'CustomPagination',

  props: {
    // parentUuid: {
    //   type: String,
    //   default: ''
    // },
    containerUuid: {
      type: String,
      default: ''
    },
    containerManager: {
      type: Object,
      required: false
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
    recordsPage: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: undefined
    },
    // isNavigation: {
    //   type: Boolean,
    //   required: false
    // },
    handleSizeChange: {
      type: Function,
      default: (pageSizeNumber) => {
        console.info('implement change size page number method', pageSizeNumber)
      }
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

    const rowPage = computed(() => {
      return totalRowByPage({
        pageSize: props.pageSize,
        pageNumber: props.currentPage
      })
    })

    const currentPageSize = computed(() => {
      return store.getters.getTabPageSize({ containerUuid: props.containerUuid })
    })

    return {
      // Computed
      isSelection,
      rowPage,
      currentPageSize,
      // Import
      NUMBER_RECORDS_PER_PAGE
    }
  }

})
</script>

<style lang="scss">
.custom-pagination-content {
  margin-left: 0px !important;
  margin-right: 0px !important;
  margin-top: 1% !important;
  .selections-number {
    margin-right: 10px;
    font-weight: normal;
    color: #606266;
  }
}
</style>
