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
            label-width="10px"
            class="from-wf-panel"
          >
            <el-row :gutter="24">
              <el-col :xl="8" :lg="10" :md="12" :sm="24">
                <el-form-item label="Seleccione un Flujo de Trabajo" class="workflow-field-label">
                  <el-select
                    v-model="value"
                    class="workflow-field-select"
                    :filterable="true"
                    remote
                    :remote-method="remoteSearch"
                    :loading="isLoading"
                    @visible-change="getWorkflowsList"
                    @change="selectWorkflow"
                  >
                    <el-option
                      v-for="item in optionsList"
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

    <workflow-diagram
      v-if="!isEmptyValue(node)"
      :node-transition-list="workflowTranstitionsList"
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
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// components and mixins
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'
import WorkflowDiagram from '@theme/components/ADempiere/WorkflowDiagram'

// constants
import { WORKFLOW_EDITOR_FORM, TABLE_NAME, COLUMN_NAME } from '@/utils/ADempiere/dictionary/form/workflowEditor.js'

/**
 * TODO: Add field select with lookup factory from dictionary to zoom, label name and validations rule, and reduce duplicated logic.
 * TODO: Set workflow definition WorkflowDiagram component to unifiy logics.
 * TODO: Store workflow diagram on vuex to cache on client side.
 */
export default defineComponent({
  name: 'WFPanel',

  components: {
    WorkflowDiagram,
    LoadingView
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
    const timeOut = ref(null)
    const isLoading = ref(false)

    const value = ref()

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

    const isLoadWorkflow = ref(false)

    const isWithSearchValue = computed(() => {
      return Boolean(
        store.getters.getStoredSearchValueLookup({
          containerUuid: props.metadata.containerUuid
        })
      )
    })

    const getStoredLookupList = computed(() => {
      // add blanck option in firts element on list
      return store.getters.getStoredLookupList({
        containerUuid: props.metadata.containerUuid,
        //
        tableName: TABLE_NAME,
        columnName: COLUMN_NAME
      })
    })

    // methods
    /**
     * @param {boolean} isShowList triggers when the pull-down menu appears or disappears
     */
    function getWorkflowsList(isShowList) {
      // get stored list values
      const list = getStoredLookupList.value
      // refresh local list component
      optionsList.value = list
      if (isShowList) {
        if (isEmptyValue(list) || isWithSearchValue.value) {
          loadListFromServer()
        }
      }
    }

    function remoteSearch(searchQuery = '') {
      clearTimeout(timeOut.value)
      const results = localSearch(searchQuery)
      if (isEmptyValue(results) || isEmptyValue(searchQuery) ||
        (!isEmptyValue(searchQuery) && searchQuery.length > 2)) {
        timeOut.value = setTimeout(() => {
          loadListFromServer(searchQuery)
        }, 600)
        return
      }
      // use this, if remote is enabled, local search not working
      optionsList.value = results
    }

    function localSearch(searchQuery = '') {
      if (isEmptyValue(searchQuery)) {
        return optionsList.value
      }
      return optionsList.value.filter(option => {
        return option.displayedValue.toLowerCase().includes(searchQuery.toLowerCase())
      })
    }

    function loadListFromServer(searchQuery = '') {
      isLoading.value = true

      store.dispatch('getLookupListFromServer', {
        containerUuid: props.metadata.containerUuid,
        searchValue: searchQuery,
        tableName: TABLE_NAME,
        columnName: COLUMN_NAME,
        isAddBlankValue: true
      })
        .then(responseLookupList => {
          optionsList.value = responseLookupList
        })
        .catch(error => {
          optionsList.value = []
          console.warn(`Get Lookup List, Select Base - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    function selectWorkflow(workflowId) {
      if (isEmptyValue(workflowId)) {
        // clear diagram
        node.value = []
        return
      }

      isLoadWorkflow.value = true
      store.dispatch('getWorkflowFromServer', {
        id: workflowId
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

    return {
      // ref
      formUuid,
      value,
      isLoadWorkflow,
      isLoading,
      optionsList,
      node,
      currentNode,
      workflowTranstitionsList,
      transitions,
      // methods
      getWorkflowsList,
      loadListFromServer,
      remoteSearch,
      selectWorkflow
    }
  }
})
</script>

<style lang="scss">
  .from-wf-panel {
    padding-left: 20px;
    padding-right: 20px;

    .workflow-field-select {
      width: 100%;
    }

    /**
    * Reduce the spacing between the form element and its label
    */
    .el-form-item__label, .workflow-field-label {
      padding-bottom: 0px !important;
    }

  }
</style>
