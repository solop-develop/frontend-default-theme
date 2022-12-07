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
  <el-row :gutter="0">
    <el-col :span="24">
      <el-row style="padding-bottom: 15px;padding-top: 15px;">
        <!-- <template v-for="(fieldAttributes, subKey) in fieldsList">
          <field-definition
            ref="fieldDefinitionRef"
            :key="subKey"
            :parent-uuid="parentUuid"
            :container-uuid="containerUuid"
            :container-manager="{
              ...containerManager,

            }"
            :field-metadata="fieldAttributes"
            :metadata-field="fieldAttributes"
          />
        </template> -->
        <panel-definition
          :parent-uuid="parentUuid + '_ADVANCE_QUERY'"
          :container-uuid="containerUuid + '_ADVANCE_QUERY'"
          :container-manager="containerManager"
          :is-filter-records="false"
          :is-advanced-query="true"
          :is-tab-panel="true"
        />
      </el-row>
    </el-col>
    <el-col :span="24" class="location-address-footer">
      <samp style="float: right; padding-top: 4px;">
        <el-button
          type="danger"
          icon="el-icon-close"
        />

        <el-button
          type="primary"
          icon="el-icon-check"
          @click="searchRecord"
        />
      </samp>
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'
import PanelDefinition from '@theme/components/ADempiere/PanelDefinition/index.vue'
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
// import FilterFields from '@theme/components/ADempiere/FilterFields'
import store from '@/store'

export default defineComponent({
  name: 'PanelSearchCriteria',

  components: {
    FieldDefinition,
    PanelDefinition
    // FilterFields
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
    },
    isShowPanel: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    /**
     * Refs
     */

    const isLoadFilter = ref(false)
    const timeOutSearch = ref(null)

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

    function searchRecord(params) {
      const filters = store.getters.getValuesView({
        containerUuid: props.containerUuid + '_ADVANCE_QUERY'
      })
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        filters
      })
    }

    return {
      // Refs
      isLoadFilter,
      timeOutSearch,
      // Computeds
      valueToSearch,
      // Methods
      handleChangeSearch,
      searchRecord
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
