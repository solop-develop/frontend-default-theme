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
        :is-show-filter="false"
        :is-filter-records="false"
        :is-advanced-query="false"
        :is-tab-panel="true"
      />
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, computed, ref, watch } from '@vue/composition-api'

import store from '@/store'

// API Request Methods
import { requestListTreeNodes } from '@/api/ADempiere/user-interface/component/tree-trab'

// Constants
import { UUID } from '@/utils/ADempiere/constants/systemColumns.js'

// Components and Mixins
import StandardPanel from '@theme/components/ADempiere/PanelDefinition/StandardPanel.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

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

    function setRecord(recordUuid) {
      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid
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
