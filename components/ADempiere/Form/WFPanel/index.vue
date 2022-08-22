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
  <el-card shadow="always" class="box-card">
    <el-container>
      <el-header class="header">
        <el-card class="box-card">
          <el-form
            label-position="top"
            label-width="200px"
            class="from-wf-panel"
          >
            <el-row :gutter="24">
              <field-definition
                v-for="(fieldMetadata) in fieldsList"
                :key="fieldMetadata.columnName"
                :metadata-field="{
                  ...fieldMetadata,
                  size: {
                    xl: 8,
                    lg:10,
                    md:12,
                    sm: 24
                  }
                }"
                :container-uuid="'Business-Partner-List'"
                :container-manager="containerManager"
              />
            </el-row>
          </el-form>
        </el-card>
      </el-header>
    </el-container>
    <br>
    <br>

    <workflow-diagram
      v-if="!isEmptyValue(node)"
      :node-transition-list="workflowTranstitionsList"
      :node-list="node"
      :current-node="currentNode"
    />

    <loading-view
      v-if="isLoadingWorkFlow"
      key="window-loading"
    />
  </el-card>
</template>

<script>
import { defineComponent, ref, onUnmounted, computed } from '@vue/composition-api'

import store from '@/store'

// constants
import { COLUMN_NAME, WORKFLOW_EDITOR_FORM } from '@/utils/ADempiere/dictionary/form/workflowEditor.js'
import fieldsListDefinition from './fieldsList.js'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// components and mixins
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'
import useForm from '@theme/components/ADempiere/Form/useForm'
import WorkflowDiagram from '@theme/components/ADempiere/WorkflowDiagram'

/**
 * TODO: Store workflow diagram on vuex to cache on client side.
 */
export default defineComponent({
  name: 'WFPanel',

  components: {
    FieldDefinition,
    LoadingView,
    WorkflowDiagram
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: WORKFLOW_EDITOR_FORM,
          containerUuid: WORKFLOW_EDITOR_FORM
        }
      }
    }
  },

  setup(props, { root }) {
    const formUuid = root.$route.meta.uuid

    // TODO: Manage with uuid
    // TODO: When enabled it duplicates the requests for the fields
    // show title
    // store.commit('changeShowTitleForm', true)

    const {
      containerManager,
      fieldsList,
      isLoading
    } = useForm({
      containerUuid: formUuid,
      metadata: props.metadata,
      fieldsListDefinition
    })

    const optionsList = ref([])

    const node = ref([])

    const currentNode = ref([
      {
        classname: 'delete',
        id: ''
      }
    ])

    const workflowTranstitionsList = ref([])

    const transitions = ref([])

    const isLoadingWorkFlow = ref(false)

    const storedValue = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        containerUuid: formUuid,
        columnName: COLUMN_NAME
      })
    })

    const currentWorkfllowId = ref(storedValue.value)

    // methods
    function selectWorkflow({ workflowId, workflowUuid }) {
      if (isEmptyValue(workflowId) && isEmptyValue(workflowUuid)) {
        // clear diagram
        node.value = []
        return
      }

      isLoadingWorkFlow.value = true

      const workflow = store.getters.getStoredWorkflowById(workflowId)
      if (workflow) {
        listWorkflow(workflow)
        isLoadingWorkFlow.value = true
        return
      }

      store.dispatch('getWorkflowFromServer', {
        id: workflowId,
        uuid: workflowUuid
      })
        .then(response => {
          listWorkflow(response)
        })
        .catch(error => {
          console.warn(`Get Workflow From Server - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          isLoadingWorkFlow.value = false
        })
    }

    function listWorkflow(workflow) {
      if (!isEmptyValue(workflow.node) && !isEmptyValue(workflow.node.uuid)) {
        currentNode.value = [{
          classname: 'delete',
          id: workflow.start_node.uuid
        }]
      }
      const nodes = workflow.workflow_nodes // .filter(node => !isEmptyValue(node.uuid))
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
                  target: nextNode.node_next_uuid,
                  source: uuid
                })
              } else {
                transitions.value.push({
                  id: id + key,
                  label: nextNode.description,
                  target: nextNode.node_next_uuid,
                  source: uuid
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
      workflowTranstitionsList.value = transitions.value.filter(data => {
        const verificar = blon.find(mode => mode.uuid === data.source)
        if (!isEmptyValue(verificar)) {
          return data
        }
      })
    }

    function subscribeWorkflowChange() {
      return store.subscribe((mutation, state) => {
        if (mutation.type === 'updateValueOfField') {
          if (mutation.payload.containerUuid === formUuid && mutation.payload.columnName === COLUMN_NAME) {
            if (mutation.payload.value === currentWorkfllowId.value) {
              return
            }

            currentWorkfllowId.value = mutation.payload.value
            selectWorkflow({
              workflowId: mutation.payload.value
            })
          }
        }
      })
    }

    const unsubscribeWorkflowChange = subscribeWorkflowChange()

    onUnmounted(() => {
      unsubscribeWorkflowChange()
    })

    return {
      // ref
      formUuid,
      isLoadingWorkFlow,
      isLoading,
      optionsList,
      node,
      currentNode,
      workflowTranstitionsList,
      transitions,
      fieldsList,
      containerManager
    }
  }
})
</script>

<style lang="scss">
  .from-wf-panel {
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
  }
</style>
