<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt edwinBetanc0urt@hotmail.com www.erpya.com
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
  <el-card shadow="always" class="box-card">
    <el-container>
      <el-header class="header">
        <el-card class="box-card">
          <el-form
            label-position="top"
            label-width="10px"
            class="from-wf-panel"
          >
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="Seleccione un Flujo de Trabajo">
                  <el-select
                    v-model="value"
                    @visible-change="findOKptionsWorkflow"
                    @change="selectWorkflow"
                  >
                    <el-option
                      v-for="item in listOptions"
                      :key="item.value"
                      :label="item.displayedValue"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-header>
    </el-container>
    <br>
    <br>
    <panel-workflow
      v-if="!isEmptyValue(node)"
      :node-transition-list="listWorkflowTransition"
      :node-list="node"
      :current-node="currentNode"
    />
    <loading-view
      v-if="isLoadWorkflow"
      key="window-loading"
    />
  </el-card>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import store from '@/store'

// Utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import panelWorkflow from '@theme/components/ADempiere/Workflow'

// Components
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'

// Constants
import { TABLE_NAME, COLUMN_NAME } from '@/utils/ADempiere/constants/form/workflowEditor.js'

export default defineComponent({
  name: 'WFPanel',

  components: {
    panelWorkflow,
    LoadingView
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: 'WFPanel',
          containerUuid: 'WFPanel'
        }
      }
    }
  },

  setup(props) {
    const value = ref()

    const listOptions = ref([])

    const node = ref([])

    const currentNode = ref([
      {
        classname: 'delete',
        id: ''
      }
    ])

    const listWorkflowTransition = ref([])

    const transitions = ref([])

    const isLoadWorkflow = ref(false)

    // methodos

    function findOKptionsWorkflow(params) {
      store.dispatch('getLookupListFromServer', {
        tableName: TABLE_NAME,
        columnName: COLUMN_NAME
      })
        .then(response => {
          listOptions.value = response
        })
        .catch(error => {
          listOptions.value = []
          console.warn(`Get Lookup List, Select Base - Error ${error.code}: ${error.message}.`)
        })
    }

    function selectWorkflow(params) {
      isLoadWorkflow.value = true
      store.dispatch('getWorkflowFromServer', {
        id: params
      })
        .then(response => {
          listWorkflow(response)
        })
        .catch(error => {
          console.warn(`Get Workflow From Server - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          isLoadWorkflow.value = false
        })
    }

    function listWorkflow(workflow) {
      if (!isEmptyValue(workflow.node) && !isEmptyValue(workflow.node.uuid)) {
        currentNode.value = [{
          classname: 'delete',
          id: workflow.start_node.uuid
        }]
      }
      const nodes = workflow.workflow_nodes.filter(node => !isEmptyValue(node.uuid))
      listNodeTransitions(nodes)
      if (!isEmptyValue(nodes)) {
        node.value = nodes.map((workflow, key) => {
          return {
            ...workflow,
            transitions: workflow.transitions,
            id: workflow.uuid,
            key,
            label: workflow.name
          }
        })
      } else {
        node.value = []
      }
    }

    function listNodeTransitions(nodes) {
      nodes.forEach(element => {
        const uuid = element.uuid
        const id = element.value
        if (!isEmptyValue(element.transitions)) {
          element.transitions.forEach((nextNode, key) => {
            if (!isEmptyValue(nextNode.node_next_uuid)) {
              if (isEmptyValue(nextNode.description)) {
                transitions.value.push({
                  id: id + key,
                  target: uuid,
                  source: nextNode.node_next_uuid
                })
              } else {
                transitions.value.push({
                  id: id + key,
                  label: nextNode.description,
                  target: uuid,
                  source: nextNode.node_next_uuid
                })
              }
            }
          })
        }
      })
      const blon = nodes.map(item => {
        return {
          uuid: item.uuid
        }
      })
      listWorkflowTransition.value = transitions.value.filter(data => {
        const verificar = blon.find(mode => mode.uuid === data.source)
        if (!isEmptyValue(verificar)) {
          return data
        }
      })
    }

    return {
      // ref
      value,
      isLoadWorkflow,
      listOptions,
      node,
      currentNode,
      listWorkflowTransition,
      transitions,
      // methodos
      findOKptionsWorkflow,
      selectWorkflow,
      listWorkflow,
      listNodeTransitions
    }
  }
})
</script>
<style scoped>
.from-wf-panel {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
