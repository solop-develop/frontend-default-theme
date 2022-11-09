<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
  <component
    :is="componentRender"
    :parent-uuid="parentUuid"
    :container-uuid="containerUuid"
    :container-manager="containerManagerPanel"
    :panel-metadata="panelMetadata"
    :is-show-filter="isShowFilter"
    :is-filter-records="isFilterRecords"
    :is-advanced-query="isAdvancedQuery"
  />
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'PanelDefinition',

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
    isShowFilter: {
      type: Boolean,
      default: true
    },
    isFilterRecords: {
      type: Boolean,
      default: true
    },
    isAdvancedQuery: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const containerManagerPanel = computed(() => {
      return props.containerManager
    })

    /**
     * Get the panel object with all its attributes as well as
     * the fields it contains
     */
    const panelMetadata = computed(() => {
      return containerManagerPanel.value.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      }) || {}
    })

    // if (root.$route.query.action === 'create-new') {
    //   containerManagerPanel.value.setDefaultValues({
    //     parentUuid: props.parentUuid,
    //     containerUuid: props.containerUuid
    //   })
    // }

    const componentRender = computed(() => {
      let panelComponent = () => import('@theme/components/ADempiere/PanelDefinition/StandardPanel.vue')

      if (!isEmptyValue(panelMetadata.value) && panelMetadata.value.isSortTab) {
        panelComponent = () => import('@theme/components/ADempiere/PanelDefinition/SortPanel.vue')
      }

      return panelComponent
    })

    return {
      // computeds
      containerManagerPanel,
      panelMetadata,
      componentRender
    }
  }
})
</script>
