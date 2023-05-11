<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com www.erpya.com https://github.com/elsiosanchez
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div>
    <el-button
      plain
      size="small"
      type="primary"
      style="margin-right: 2px;"
      @click="changeShowedRecords"
    >
      <span style="padding: 0px;">
        <svg-icon icon-class="table" />
        <b v-show="!isMobile">
          {{ label }}
        </b>
      </span>
    </el-button>
    <change-record
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
      :container-manager="containerManager"
      :change-previous-record="changePreviousRecord"
      :change-next-record="changeNextRecord"
      :is-change-record="isChangeRecord"
    />
    <convenience-buttons
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
      :container-manager="containerManager"
      :tab-attributes="tabAttributes"
      :additional-options="adicionalesOptions"
      style="display: contents;"
    />

    <full-screen-container
      style="float: right;"
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
    />

    <action-menu
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
      :container-manager="containerManager"
      :actions-manager="listAction"
      style="float: right;"
    />
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// Components and Mixins
import ActionMenu from '@theme/components/ADempiere/ActionMenu/index.vue'
import ConvenienceButtons from '@theme/components/ADempiere/TabManager/convenienceButtons/index.vue'
import FullScreenContainer from '@theme/components/ADempiere/ContainerOptions/FullScreenContainer'
import ChangeRecord from '@theme/components/ADempiere/DataTable/Components/ChangeRecord.vue'

export default defineComponent({
  name: 'TabOptions',

  components: {
    ActionMenu,
    ConvenienceButtons,
    FullScreenContainer,
    ChangeRecord
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
    containerUuid: {
      type: String,
      default: ''
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    // used only window
    adicionalesOptions: {
      type: Object,
      default: () => ({})
    },
    isChangeRecord: {
      type: Boolean,
      required: false
    },
    changeNextRecord: {
      type: Function,
      default: (recordNext) => {
        console.info('implement method Change to Next Record', recordNext)
      }
    },
    changePreviousRecord: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Change to Previous Record ', recordPrevious)
      }
    }
  },

  setup(props) {
    const listAction = computed(() => {
      return {
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid,
        defaultActionName: language.t('actionMenu.createNewRecord'),
        tableName: props.tabAttributes.tableName,
        withoutDefaulAction: true,
        getActionList: () => {
          return store.getters.getStoredActionsMenu({
            containerUuid: props.tabAttributes.uuid
          })
        }
      }
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
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

    const label = computed(() => {
      if (isShowedTableRecords.value) {
        return language.t('window.toggleSingle')
      }
      return language.t('window.multiRecord')
    })

    function changeShowedRecords() {
      const row = store.getters.getTabCurrentRow({ containerUuid: props.currentTabUuid })
      store.dispatch('changeTabAttribute', {
        attributeName: 'currentRowSelect',
        attributeNameControl: undefined,
        attributeValue: row,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
      // props.containerManager.setSelection({
      //   containerUuid: props.containerUuid,
      //   recordsSelected: [tabData.value.currentRowSelect]
      // })
      store.commit('setTabSelectionsList', {
        containerUuid: props.containerUuid,
        recordsSelected: [row]
      })
      // props.containerManager.setSelection({
      //   containerUuid: props.containerUuid,
      //   recordsSelected: [row]
      // })
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
      isMobile,
      listAction,
      isShowedTableRecords,
      label,
      // methods
      changeShowedRecords
    }
  }

})
</script>
