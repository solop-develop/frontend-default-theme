<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanchez@erpya.com www.erpya.com
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
  <el-form
    v-if="!isEmptyValue(listMetadata)"
    label-position="top"
    class="from-main"
    @submit.native.prevent="notSubmitForm"
  >
    <el-form-item>
      <el-row>
        <el-col v-for="(field, index) in listMetadata" :key="index" :span="6">
          <field-definition
            :key="index"
            :container-uuid="metadata.containerUuid"
            :metadata-field="field"
            :container-manager="{
              isDisplayedField,
              generalInfoSearch,
              searchTableHeader,
              isMandatoryField,
              isReadOnlyField,
              isDisplayedDefault,
              getSearchInfoList
            }"
          />
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
// Components
import FieldDefinition from '@/themes/default/components/ADempiere/FieldDefinition/index.vue'
// Function
import { isEmptyValue } from '@/utils/ADempiere'
import { isHiddenField } from '@/utils/ADempiere/references'

export default defineComponent({
  name: 'SearchCriteria',

  components: {
    FieldDefinition
  },

  props: {
    fieldsList: {
      type: Array,
      required: true,
      default: () => []
    },
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: 'V-Match',
          containerUuid: 'V-Match'
        }
      }
    }
  },
  setup(props, { root }) {
    /**
    * Computed
    */

    const listMetadata = computed(() => {
      return props.fieldsList
    })
    /**
     * Methods
     */

    function isMandatoryField({ isMandatory, isMandatoryFromLogic }) {
      return isMandatory || isMandatoryFromLogic
    }

    function isDisplayedDefault({ isMandatory }) {
      return true
    }

    function isDisplayedField({ displayType, isActive, isDisplayed }) {
      // button field not showed
      if (isHiddenField(displayType)) {
        return false
      }
      // verify if field is active
      return isActive && isDisplayed
    }

    function isReadOnlyField({ isQueryCriteria, isReadOnlyFromLogic }) {
      return isQueryCriteria && isReadOnlyFromLogic
    }

    function generalInfoSearch({
      containerUuid,
      contextColumnNames,
      filters,
      uuid,
      searchValue,
      tableName,
      columnName,
      pageNumber
    }) {
      return store.dispatch('findGeneralInfo', {
        containerUuid,
        contextColumnNames,
        filters,
        // fieldUuid: uuid,
        searchValue,
        tableName,
        columnName,
        pageNumber
      })
    }

    function searchTableHeader({
      containerUuid,
      tableName
    }) {
      return store.dispatch('searchTableHeader', {
        containerUuid,
        tableName
      })
    }

    function getSearchInfoList({ parentUuid, containerUuid, contextColumnNames, tableName, columnName, pageNumber, uuid, filters, searchValue, pageSize }) {
      return store.dispatch('searchInfoList', {
        parentUuid,
        containerUuid,
        contextColumnNames,
        fieldUuid: uuid,
        tableName,
        columnName,
        filters,
        searchValue,
        pageNumber,
        pageSize
      })
    }

    return {
      listMetadata,
      isDisplayedField,
      generalInfoSearch,
      searchTableHeader,
      isMandatoryField,
      isReadOnlyField,
      isDisplayedDefault,
      getSearchInfoList,
      isEmptyValue
    }
  }
})
</script>
