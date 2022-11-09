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
  <span style="float: right;display: flex;margin-top: 2px;width: 100%; padding-right: 5px;">
    <el-input
      v-model="valueToSearch"
      clearable
      :placeholder="$t('components.searchRecord')"
      size="small"
      class="input-search"
      @input="handleChangeSearch"
    >
      <el-popover
        slot="append"
        v-model="isPanel"
        placement="bottom"
        width="800"
        trigger="click"
        class="option-search-record"
      >
        <el-row :gutter="0">
          <el-col :span="24">
            <el-row style="padding-bottom: 15px;padding-top: 15px;">
              <panel-definition
                :parent-uuid="parentUuid + IS_ADVANCE_QUERY"
                :container-uuid="containerUuid + IS_ADVANCE_QUERY"
                :container-manager="containerManagerAdvancedQuery"
                :is-filter-records="false"
                :is-advanced-query="true"
              />
            </el-row>
          </el-col>

          <el-col :span="24" class="location-address-footer">
            <samp style="float: right; padding-top: 4px;">
              <el-button
                type="danger"
                icon="el-icon-close"
                @click="isPanel = false"
              />

              <el-button
                type="primary"
                icon="el-icon-check"
                @click="searchRecord"
              />
            </samp>
          </el-col>
        </el-row>

        <el-button
          slot="reference"
          class="button-search-record"
        >
          <svg-icon icon-class="manageSearch" />
        </el-button>
      </el-popover>
    </el-input>
  </span>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

import store from '@/store'

// components
import PanelDefinition from '@theme/components/ADempiere/PanelDefinition/index.vue'

// constants
import { DISPLAY_COLUMN_PREFIX, UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX, IS_ADVANCE_QUERY } from '@/utils/ADempiere/dictionaryUtils'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'SearchRecordField',

  components: {
    PanelDefinition
  },

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    fieldsList: {
      type: Array,
      default: () => []
    },
    containerManager: {
      type: Object,
      required: false
    }
  },

  setup(props) {
    /**
     * Refs
     */
    const isLoadFilter = ref(false)
    const timeOutSearch = ref(null)
    const isPanel = ref(false)

    /**
     * Computed
     */
    // value of search
    const valueToSearch = computed({
      get() {
        return store.getters.getSearchValueTabRecordsList({
          containerUuid: props.containerUuid
        }) || ''
      },
      set(searchValue) {
        store.commit('setSearchValueTabRecordsList', {
          containerUuid: props.containerUuid,
          searchValue
        })
      }
    })

    const containerManagerAdvancedQuery = computed(() => {
      return {
        ...props.containerManager,
        isDisplayedDefault({ isSelectionColumn }) {
          // add is showed from user
          return isSelectionColumn
        }
      }
    })

    /**
     * Methods
     */
    function handleChangeSearch(value) {
      clearTimeout(timeOutSearch.value)
      timeOutSearch.value = setTimeout(() => {
        // get records
        filterRecord(value)
      }, 1000)
    }

    function filterRecord(searchText) {
      isLoadFilter.value = true

      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        searchValue: searchText
      })
        .finally(() => {
          isLoadFilter.value = false
        })
    }

    function searchRecord(params) {
      let filters = store.getters.getValuesView({
        containerUuid: props.containerUuid + IS_ADVANCE_QUERY
      })
      if (!isEmptyValue(filters)) {
        filters = filters.filter(attribute => !isEmptyValue(attribute.value) && !attribute.columnName.includes(DISPLAY_COLUMN_PREFIX) && !attribute.columnName.includes(UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX))
      }
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        filters
      })
      isPanel.value = false
    }

    return {
      // Refs
      isLoadFilter,
      timeOutSearch,
      isPanel,
      // Const
      IS_ADVANCE_QUERY,
      // Computeds
      containerManagerAdvancedQuery,
      valueToSearch,
      // Methods
      searchRecord,
      handleChangeSearch
    }
  }
})
</script>

<style lang="scss">
.input-search {
  line-height: 28px;
  display: contents;

  .el-input-group__append {
    height: 32px !important;
  }

  .button-search-record {
    padding-left: 6px !important;
    padding-right: 0px !important;

    i, svg {
      font-size: 28px !important;
    }
  }
}
</style>
