<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com www.erpya.com
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
  <span>
    <el-button
      plain
      size="small"
      type="text"
      style="height: 93%;margin-right: 0%;padding-right: 10px; float: left;"
      class="alo"
      @click="changeShowedRecords"
    >
      <span
        style="padding: 10px;"
      >
        <svg-icon icon-class="table" />
        <b>
          {{ $t('window.gridToggle') }}
        </b>
      </span>
    </el-button>
    <div style="float: right;padding-left: 1%;">
      <action-menu
        :parent-uuid="parentUuid"
        :container-uuid="currentTabUuid"
        :container-manager="containerManager"
        :actions-manager="listAction"
        :references-manager="referencesManager"
      />
    </div>
  </span>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// components and mixins
import ActionMenu from '@theme/components/ADempiere/ActionMenu/index.vue'

export default defineComponent({
  name: 'TabOptions',

  components: {
    ActionMenu
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentTabUuid: {
      type: String,
      default: ''
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    actionsManager: {
      type: Object,
      default: () => ({})
    },
    // used only window
    referencesManager: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props) {
    const listAction = computed(() => {
      return {
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid,
        defaultActionName: language.t('actionMenu.createNewRecord'),
        tableName: props.tabAttributes.tableName,
        getActionList: () => {
          return store.getters.getStoredActionsMenu({
            containerUuid: props.tabAttributes.uuid
          })
        }
      }
    })
    const isShowedTableRecords = computed(() => {
      return tabData.value.isShowedTableRecords
    })

    const tabData = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.tabAttributes.uuid
      )
    })

    const tableHeaders = computed(() => {
      const panel = props.tabsList.find(tabs => tabs.uuid === props.currentTabUuid)
      if (panel && panel.fieldsList) {
        return panel.fieldsList
      }
      return []
    })

    // get records list
    const recordsList = computed(() => {
      return tabData.value.recordsList
    })

    function changeShowedRecords() {
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: !tabData.value.isShowedTableRecords,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
    }

    return {
      // computed
      listAction,
      recordsList,
      isShowedTableRecords,
      tableHeaders,
      // methodo
      changeShowedRecords
    }
  }

})
</script>
