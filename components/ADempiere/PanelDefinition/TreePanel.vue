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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-row class="tree-panel-definition" :gutter="10">
    <el-col :span="6" class="tree-col" style="height: 100%;">
      <div class="tree-panel-container">
        <el-input
          v-model="filterValue"
          :placeholder="$t('component.tree.searchNodesOnTree')"
          class="tree-input-search"
          clearable
          suffix-icon="el-icon-search"
        />

        <el-tree
          ref="treePanel"
          :data="nodesList"
          :props="defaultProps"
          node-key="record_uuid"
          :filter-node-method="filterNode"
          highlight-current
          :default-expanded-keys="expandedTree"
          @node-click="handleNodeClick"
        />
      </div>
    </el-col>

    <el-col class="tree-col-standard-panel" :span="18">
      <standard-panel
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :container-manager="containerManager"
        :panel-metadata="panelMetadata"
        :is-show-filter="true"
        :is-filter-records="true"
        :is-advanced-query="true"
        :is-tab-panel="true"
      />
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, computed, ref, watch } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'

// API Request Methods
import { requestListTreeNodes } from '@/api/ADempiere/user-interface/component/tree-trab'
import { getEntity } from '@/api/ADempiere/user-interface/persistence'

// Constants
import { UUID } from '@/utils/ADempiere/constants/systemColumns.js'

// Components and Mixins
import StandardPanel from '@theme/components/ADempiere/PanelDefinition/StandardPanel.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { convertObjectToKeyValue } from '@/utils/ADempiere/valueFormat'

/**
 * Order or sequence panel based on the functionality of the `org.compiere.grid.VSortTab`
 */
export default defineComponent({
  name: 'TreePanel',

  components: {
    StandardPanel
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
    }
  },

  setup(props) {
    const treePanel = ref(null)
    const nodesList = ref([])
    const filterValue = ref('')
    const nodeName = 'name'

    const defaultProps = {
      children: 'childs',
      label: nodeName
    }

    const recordUuid = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        columnName: UUID
      })
    })

    const expandedTree = computed(() => {
      if (isEmptyValue(recordUuid.value) || recordUuid.value === 'create-new') {
        return []
      }
      return [recordUuid.value]
    })

    const elementId = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        columnName: 'C_Element_ID'
      })
    })

    watch(filterValue, (newValue, oldValue) => {
      treePanel.value.filter(newValue)
    })

    // when element accouting change load tree data
    watch(elementId, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        loadData()
      }
    })

    // if changed record in parent tab, reload tab child
    watch(recordUuid, (newValue, oldValue) => {
      if (isEmptyValue(newValue) || recordUuid.value === 'create-new') {
        treePanel.value.setCurrentKey(null)
      } else if (newValue !== oldValue) {
        treePanel.value.setCurrentKey(newValue)
      }
    })

    /**
     * Get the panel object with all its attributes as well as
     * the fields it contains
     */
    const panelMetadata = computed(() => {
      return props.containerManager.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      }) || {}
    })

    function handleNodeClick(nodeData) {
      setRecord(nodeData.record_uuid)
    }

    async function getRowValues(recordUuid) {
      const { parentUuid, containerUuid } = props
      let row = store.getters.getTabRowData({
        containerUuid,
        recordUuid
      })

      if (isEmptyValue(row)) {
        row = await getEntity({
          tabUuid: containerUuid,
          recordUuid
        }).then(response => {
          return response.attributes
        })
      }

      const currentRoute = router.app._route
      const defaultValues = store.getters.getParsedDefaultValues({
        parentUuid,
        containerUuid,
        isSOTrxMenu: currentRoute.meta.isSalesTransaction,
        formatToReturn: 'object'
      })

      const attributes = convertObjectToKeyValue({
        object: Object.assign(defaultValues, row)
      })

      store.dispatch('notifyPanelChange', {
        parentUuid,
        containerUuid,
        attributes
        // isOverWriteParent: tabDefinition.isParentTab
      })

      return row
    }

    function setRecord(recordUuid) {
      /*
      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid
      })
      */
      customSeekRecord(recordUuid)
    }

    function customSeekRecord(recordUuid) {
      const { parentUuid, containerUuid } = props
      const row = getRowValues(recordUuid)

      const tabDefinition = store.getters.getStoredTab(parentUuid, containerUuid)

      const fieldsList = store.getters.getStoredFieldsFromTab(parentUuid, containerUuid)

      // clear old values
      store.dispatch('clearPersistenceQueue', {
        containerUuid,
        recordUuid: row[UUID]
      }, {
        root: true
      })

      // active logics with set records values
      fieldsList.forEach(field => {
        // change Dependents
        store.dispatch('changeDependentFieldsList', {
          field,
          fieldsList,
          containerManager: props.containerManager,
          isGetDefaultValue: false
        })
      })

      // update records and logics on child tabs
      tabDefinition.childTabs.filter(tabItem => {
        // get loaded tabs with records
        return store.getters.getIsLoadedTabRecord({
          containerUuid: tabItem.uuid
        })
      }).forEach(tabItem => {
        // if loaded data refresh this data
        // TODO: Verify with get one entity, not get all list
        store.dispatch('getEntities', {
          parentUuid,
          containerUuid: tabItem.uuid,
          pageNumber: 1 // reload with first page
        })
      })
    }

    function loadData() {
      requestListTreeNodes({
        tableName: panelMetadata.value.tableName,
        elementId: elementId.value
      }).then(response => {
        nodesList.value = response.recordsList
      }).finally(() => {
        treePanel.value.setCurrentKey(recordUuid.value)
      })
    }

    function filterNode(value, data) {
      if (!value) {
        return true
      }
      return data[nodeName].toLowerCase().indexOf(value.toLowerCase()) !== -1
    }

    loadData()

    return {
      treePanel,
      filterValue,
      defaultProps,
      nodesList,
      // computeds
      elementId,
      expandedTree,
      panelMetadata,
      recordUuid,
      // methods
      handleNodeClick,
      filterNode
    }
  }
})
</script>

<style lang="scss">
.tree-panel-container {
  // background: #e5e9f2;
  border-radius: 5px;
  border: 3px solid #d3dce6;

  padding: 5px;
  padding-top: 6px;
}
</style>
