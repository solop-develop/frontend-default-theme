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
  <div class="wrapper" style="margin-right: 10px">
    <el-form
      label-position="top"
      label-width="200px"
      @submit.native.prevent="notSubmitForm"
    >
      <div class="cards-not-group">
        <div class="card">
          <filter-fields
            v-if="isShowFilter"
            :parent-uuid="parentUuid"
            :container-uuid="containerUuid"
            :fields-list="fieldsList"
            :filter-manager="containerManager.changeFieldShowedFromUser"
            :showed-manager="containerManager.isDisplayedField"
            :fields-to-hidden="containerManager.getFieldsToHidden"
          />

          <el-card
            :shadow="shadowGroup"
            :body-style="{ padding: '10px' }"
          >
            <el-row>
              <template v-for="(fieldAttributes, subKey) in fieldsList">
                <field-definition
                  ref="fieldDefinitionRef"
                  :key="subKey"
                  :parent-uuid="parentUuid"
                  :container-uuid="containerUuid"
                  :container-manager="containerManager"
                  :field-metadata="fieldAttributes"
                  :metadata-field="fieldAttributes"
                />
              </template>
            </el-row>
          </el-card>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

import store from '@/store'

// components and mixins
import FieldDefinition from '@theme/components/ADempiere/Field/index.vue'
import FilterFields from '@theme/components/ADempiere/FilterFields/index.vue'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere'
import { FOCUSABLE_FIELDS_LIST } from '@/utils/ADempiere/componentUtils'

export default defineComponent({
  name: 'StandardPanel',

  components: {
    FieldDefinition,
    FilterFields
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
    containerManager: {
      type: Object,
      required: true
    },
    panelMetadata: {
      type: Object,
      default: () => {}
    },
    // TODO: Manage with store and container manager
    isShowFilter: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { root }) {
    const fieldIndex = ref()
    const fieldsList = computed(() => {
      // order and assign groups
      if (!isEmptyValue(props.panelMetadata) && !isEmptyValue(props.panelMetadata.fieldsList)) {
        setFocus(props.panelMetadata.fieldsList)
        return props.panelMetadata.fieldsList
      }

      if (!isEmptyValue(props.containerManager) && props.containerManager.getFieldsList) {
        const fields = props.containerManager.getFieldsList({
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid
        })
        if (!isEmptyValue(fields)) {
          setFocus(fields)
          return fields
        }
      }

      return []
    })

    const recordUuid = computed(() => {
      // TODO: Change query name 'action'
      const { action } = root.$route.query
      return action
    })

    const shadowGroup = computed(() => {
      if (store.state.app.device === 'mobile') {
        return 'never'
      }
      return 'hover'
    })

    const fieldDefinitionRef = ref(null)
    const query = root._route.query

    watch(fieldDefinitionRef, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (newValue[fieldIndex]) {
          newValue[fieldIndex].focusField(newValue[fieldIndex].field.columnName)
        }
      }
    })

    watch(fieldIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (fieldDefinitionRef.value[newValue]) {
          fieldDefinitionRef.value[newValue].focusField(fieldDefinitionRef.value[newValue].field.columnName)
        }
      }
    })

    watch(recordUuid, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (!isEmptyValue(fieldDefinitionRef.value) && !isEmptyValue(fieldIndex.value)) {
          fieldDefinitionRef.value[fieldIndex.value].focusField(fieldDefinitionRef.value[fieldIndex.value].field.columnName)
        }
      }
    })

    function setFocus() {
      const fields = props.containerManager.getFieldsList({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
      fieldIndex.value = fields.findIndex(field =>
        FOCUSABLE_FIELDS_LIST.includes(field.componentPath) &&
        props.containerManager.isDisplayedField(field) &&
        !props.containerManager.isReadOnlyField(field)
      )
    }

    return {
      fieldsList,
      shadowGroup,
      query,
      fieldDefinitionRef,
      recordUuid,
      // methodos
      setFocus
    }
  }
})
</script>

<style scoped>
.el-card {
  width: 100% !important;
}
</style>
