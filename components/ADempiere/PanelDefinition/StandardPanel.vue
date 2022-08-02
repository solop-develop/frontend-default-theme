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
  <div id="tab-panel-content-from" class="wrapper" style="margin-right: 10px">
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
            :body-style="{ padding: '5px' }"
          >
            <el-row v-if="!isMobile">
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
            <el-scrollbar v-else :wrap-class="panelMetadata.isParentTab ? 'scroll-tab-panel-conten' : 'scroll-tab-child-panel-conten'" :style="styleScrollPanelTab">
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
            </el-scrollbar>
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
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
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
    const currentFieldList = computed(() => {
      return store.getters.getCurrentFieldList
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const recordUuid = computed(() => {
      // TODO: Change query name 'action'
      const { action } = root.$route.query
      return action
    })

    const shadowGroup = computed(() => {
      if (isMobile.value) {
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

    watch(currentFieldList, (newValue, oldValue) => {
      if (newValue !== oldValue && !isEmptyValue(newValue) && !isEmptyValue(newValue.fieldsList) && !isEmptyValue(newValue.columnName)) {
        const fieldFocusColumnName = store.getters.getFieldFocusColumnName
        const index = newValue.fieldsList.findIndex(field => field.columnName === fieldFocusColumnName)
        if (!isEmptyValue(fieldDefinitionRef.value[index])) {
          fieldDefinitionRef.value[index].focusField(fieldFocusColumnName)
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

    const heightPanel = computed(() => {
      const main = document.getElementById('mainWindow')
      if (
        !isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)
      ) {
        return main.clientHeight + 200 + 'px'
      }
      return 500 + 'px'
    })

    const styleScrollPanelTab = computed(() => {
      if (props.panelMetadata.isParentTab) {
        const isFullScreenTabsParent = store.getters.getStoredWindow(props.panelMetadata.parentUuid).isFullScreenTabsParent 
        if (isFullScreenTabsParent) {
          return {
            'max-height': '550px',
            'min-height': '150px',
            'overflow-x': 'hidden'
          }
        }
        return {
          'max-height': '650px!important;',
          'min-height': '150px',
          'overflow-x': 'hidden'
        }
      }
      return {
        'max-height': '550px',
        'min-height': '250px',
        'overflow-x': 'hidden'
      }
    })

    return {
      fieldsList,
      shadowGroup,
      heightPanel,
      query,
      styleScrollPanelTab,
      fieldDefinitionRef,
      recordUuid,
      isMobile,
      // methodos
      setFocus
    }
  }
})
</script>

<style>
.el-card {
  width: 100% !important;
}
.el-tabs--border-card > .el-tabs__content {
  padding: 15px;
  height: 100%;
  overflow: hidden;
}
.scroll-tab-panel-conten {
  max-height: 500px;
  min-height: 150px;
  overflow-x: hidden;
}
.scroll-tab-child-panel-conten {
  max-height: 300px;
  min-height: 200px;
  overflow-x: hidden;
}
</style>
