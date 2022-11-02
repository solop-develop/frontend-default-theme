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
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span style="float: right;display: flex;margin-top: 2px;width: 100%;">
    <el-input
      v-model="valueToSearch"
      clearable
      :placeholder="$t('components.searchRecord')"
      size="small"
      class="input-search"
      @input="handleChangeSearch"
    />
    <el-popover
      v-model="isPanel"
      placement="bottom"
      width="500"
      trigger="click"
      class="option-search-record"
    >
      <panel-search-criteria
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :fields-list="fieldsList"
        :is-show-panel="isPanel"
        :container-manager="containerManager"
      />
      <el-tag
        slot="reference"
        type="info"
        style="display: block;height: 32px;padding-top: 3px;"
      >
        <svg-icon icon-class="manageSearch" style="font-size: 16px;" />
      </el-tag>
    </el-popover>
  </span>
</template>

<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import panelSearchCriteria from './panelSearchCriteria'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import store from '@/store'

export default defineComponent({
  name: 'SearchRecordField',

  components: {
    panelSearchCriteria
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

    const valueToSearch = computed({
      get() {
        return store.getters.getSearchValueTabRecordsList({
          containerUuid: props.containerUuid
        })
      },
      set(searchValue) {
        store.commit('setSearchValueTabRecordsList', {
          containerUuid: props.containerUuid,
          searchValue
        })
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

    watch(isPanel, (newValue, oldValue) => {
      if (newValue) {
        const getPanel = props.containerManager.getPanel({
          parentUuid: props.parentUuid + '_ADVANCE_QUERY',
          containerUuid: props.containerUuid + '_ADVANCE_QUERY'
        })
        if (isEmptyValue(getPanel)) {
          const tab = props.containerManager.getPanel({
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid
          })
          const fieldsListAdvance = isEmptyValue(props.fieldsList) ? getPanel.fieldsList : props.fieldsList
          store.dispatch('addPanel', {
            containerUuid: tab.containerUuid + '_ADVANCE_QUERY',
            isCustomForm: false,
            uuid: tab.uuid,
            panelType: tab.panelType,
            fieldsList: props.fieldsList.map(field => {
              return {
                ...field,
                parentUuid: field.parentUuid + '_ADVANCE_QUERY',
                containerUuid: field.containerUuid + '_ADVANCE_QUERY',
                isAdvancedQuery: true
              }
            })
          })
        }
      }
    })

    return {
      // Refs
      isLoadFilter,
      timeOutSearch,
      isPanel,
      // Computeds
      valueToSearch,
      // Methods
      handleChangeSearch
    }
  }
})
</script>

<style scoped lang="scss">
  .input-search {
    line-height: 28px;
    display: contents;
  }
  .icon-search-record {
    font-size: 20px;
    display: contents;
  }
</style>
