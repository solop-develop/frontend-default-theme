<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez esanchez@erpya.com www.erpya.com
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
  <el-container style="height: 100% !important;">
    <el-header id="WorkflowActivity" class="header" :style="!collapse ? 'height: 40% !important;' : 'height: 10%!important'">
      <el-card :style="!collapse ? 'height: 100% !important;' : 'height: auto'">
        <div slot="header">
          <span> {{ $t('form.activity.title') }} </span>
          <el-button style="float: right; padding: 3px 0" type="text" :icon="collapse ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="collapse = !collapse" />
        </div>

        <el-table
          v-show="!collapse"
          v-loading="isLoadActivity"
          :data="activityList"
          highlight-current-row
          style="width: 100%;height: 70% !important;"
          border
          height="60% !important"
          @current-change="handleCurrentChange"
        >
          <el-table-column
            v-for="(workflowColumn) in workflowTableDefinition"
            :key="workflowColumn.columnName"
            :column-key="workflowColumn.columnName"
            :label="workflowColumn.name"
            :align="workflowColumn.isNumeric ? 'right' : 'left'"
            :prop="workflowColumn.columnName"
          />
        </el-table>
        <custom-pagination
          v-show="!collapse"
          :total="recordCount"
          :current-page="currentPagePagination"
          :container-manager="containerManagerBPList"
          :handle-change-page="setPage"
          :handle-size-change="handleChangeSizePage"
          :records-page="activityList.length"
        />
      </el-card>
    </el-header>

    <el-main class="main" style="padding-left: 1%;padding-right: 1%;">
      <el-container style="height: 100%;">
        <!-- <el-aside v-if="!isEmptyValue(currentActivity)" id="workflow" width="70%" style="background: white;">
          <workflow-diagram
            v-if="!isEmptyValue(workflowStatesList) && !isEmptyValue(currentActivity)"
            :node-transition-list="workflowTranstitionsList"
            :node-list="workflowStatesList"
            :current-node="currentNode"
            :workflow-logs="listProcessWorkflow"
          />
        </el-aside> -->
        <el-main v-if="!isEmptyValue(currentActivity)" :style="isMobile ? 'overflow: auto;padding: 0px;' : 'overflow: auto;padding: 0px;'">
          <el-card id="logsWorkflow" class="box-card" :style="collapse2 ? 'height: auto' : 'height: 20%'">
            <div slot="header" class="clearfix">
              {{ $t('field.logsField') }}
              <el-button style="float: right; padding: 3px 0" type="text" :icon="collapse2 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="(collapse2 = !collapse2)" />
            </div>
            <!-- <el-scrollbar v-if="(!isEmptyValue(currentActivity) && collapse2)" wrap-class="scroll-child"> -->
            <el-timeline v-if="(!isEmptyValue(currentActivity) && collapse2)" class="info">
              <el-timeline-item
                v-for="(nodes, key) in listProcessWorkflow"
                :key="key"
                :timestamp="translateDateByLong(nodes.log_date)"
                placement="top"
              >
                <b>  {{ nodes.node_name }} </b> {{ nodes.text_message }}
              </el-timeline-item>
            </el-timeline>
            <!-- </el-scrollbar> -->
          </el-card>
          <el-card id="logsWorkflow" class="box-card" :style="collapse3 ? 'height: 80%' : 'height: 20%'">
            <div slot="header" class="clearfix">
              {{ 'Diagrama del Flujo de Trabajo' }}
              <el-button style="float: right; padding: 3px 0" type="text" :icon="collapse3 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="(collapse3 = !collapse3)" />
            </div>
            <workflow-diagram
              v-if="(!isEmptyValue(workflowStatesList) && !isEmptyValue(currentActivity) && collapse3)"
              :node-transition-list="workflowTranstitionsList"
              :node-list="workflowStatesList"
              :current-node="currentNode"
              :orientation="isMobile ? 'vertical' : 'horizontal'"
              :workflow-logs="listProcessWorkflow"
              :style="isMobile ? 'height: 100% !important;overflow: auto;' : 'height: 100% !important;'"
            />
          </el-card>
        </el-main>
      </el-container>
    </el-main>
    <el-footer v-show="false" :style="isStyleFooter">
      <el-card id="logsWorkflow" class="box-card" style="padding-left: 1%;padding-right: 1%;">
        <el-row v-if="isMobile" :gutter="20">
          <el-col :span="12">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Respuesta">
                <el-input v-model="formInline.user" />
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Mensajes">
                <el-select v-model="formInline.region" placeholder="Activity zone">
                  <el-option label="Zone one" value="shanghai" />
                  <el-option label="Zone two" value="beijing" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Re-enviar">
                <el-select v-model="formInline.region" placeholder="Activity zone">
                  <el-option label="Zone one" value="shanghai" />
                  <el-option label="Zone two" value="beijing" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Opciones">
                <el-button
                  type="primary"
                  icon="el-icon-check"
                />
                <el-button
                  type="success"
                  icon="el-icon-search"
                />
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row v-else :gutter="20">
          <el-col :span="6">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Respuesta">
                <el-input v-model="formInline.user" />
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Mensajes">
                <el-select v-model="formInline.region" placeholder="Activity zone">
                  <el-option label="Zone one" value="shanghai" />
                  <el-option label="Zone two" value="beijing" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Re-enviar">
                <el-select v-model="formInline.region" placeholder="Activity zone">
                  <el-option label="Zone one" value="shanghai" />
                  <el-option label="Zone two" value="beijing" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="6">
            <el-form label-position="top" class="demo-form-inline">
              <el-form-item label="Opciones">
                <el-button
                  type="primary"
                  icon="el-icon-check"
                />
                <el-button
                  type="success"
                  icon="el-icon-search"
                />
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-card>
    </el-footer>
  </el-container>
</template>

<script>
// components and mixins
import formMixin from '@theme/components/ADempiere/Form/formMixin.js'
import CustomPagination from '@theme/components/ADempiere/DataTable/Components/CustomPagination.vue'
import WorkflowDiagram from '@theme/components/ADempiere/WorkflowDiagram'

// constants
import fieldsList from './fieldsList.js'

// utils and helper methods
import { generateWorkflowDiagram } from '@/utils/ADempiere/dictionary/workflow'
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat'

export default {
  name: 'WorkflowActivity',
  components: {
    CustomPagination,
    WorkflowDiagram
  },
  mixins: [
    formMixin
  ],
  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: 'WF-Activity',
          containerUuid: 'WF-Activity',
          fieldsList
        }
      }
    }
  },
  data() {
    return {
      fieldsList,
      collapse: false,
      currentNode: [{
        classname: 'delete',
        id: ''
      }],
      currentWorkflow: {},
      listProcessWorkflow: [],
      workflowStatesList: [],
      workflowTranstitionsList: [],
      workflowTableDefinition: [
        {
          columnName: 'workflow.name',
          name: this.$t('table.ProcessActivity.Name'),
          isNumeric: false
        },
        {
          columnName: 'node.name',
          name: this.$t('form.activity.table.node'),
          isNumeric: false
        },
        {
          columnName: 'node.description',
          name: this.$t('table.ProcessActivity.Description'),
          isNumeric: false
        }
      ],
      input: '',
      collapse2: false,
      collapse3: false,
      formInline: {
        user: '',
        region: ''
      }
    }
  },
  computed: {
    isStyleFooter() {
      if (this.isMobile) return 'height: 35%;padding-left: 1%;padding-right: 1%;'
      return 'height: 20%;padding-bottom: 2%;padding-top: 0%;padding-left: 1%;padding-right: 1%;'
    },
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    styleFooter() {
      const showTitle = this.$store.getters.getIsShowTitleForm
      if (showTitle) {
        return 'show-title-footer'
      }
      return 'footer'
    },
    activityList() {
      const list = this.$store.getters.getActivity
      if (!this.isEmptyValue(list)) {
        return list.filter(activity => !this.isEmptyValue(activity.uuid))
      }
      return []
    },
    recordCount() {
      return this.$store.getters.getRecordCount
    },
    currentActivity() {
      return this.$store.getters.getCurrentActivity
    },
    isLoadActivity() {
      return this.$store.getters.getIsLoadActivity
    },
    containerManagerBPList() {
      return {
        // ...this.containerManager,
        // ...containerManagerForm,
        actionPerformed: () => {},
        getFieldsLit: () => {},
        isReadOnlyColumn: ({ field, row }) => { return true },
        setDefaultValues: () => {},
        setPage: this.setPage
      }
    },
    currentPagePagination() {
      return this.$store.getters.getCurrentPageNumber
    }
  },
  watch: {
    currentActivity(value) {
      this.generateWorkflow(value)
      this.setCurrent()
    }
  },
  mounted() {
    this.$store.dispatch('serverListActivity', {})
    if (!this.isEmptyValue(this.currentActivity)) {
      this.generateWorkflow(this.currentActivity)
    }
  },
  methods: {
    translateDateByLong,
    setCurrent(activity) {
      if (this.isEmptyValue(activity)) {
        return
      }
      activity = this.activityList.find(activity => activity.node === this.currentActivity.node)
      // this.$refs.WorkflowActivity.setCurrentRow(activity)
    },
    setPage(pageNumber) {
      this.$store.dispatch('serverListActivity', { pageNumber })
    },
    handleChangeSizePage(pageSize) {
      this.$store.dispatch('serverListActivity', { pageSize })
    },
    handleCurrentChange(activity) {
      this.$store.dispatch('selectedActivity', activity)
    },
    generateWorkflow(activity) {
      if (this.isEmptyValue(activity)) {
        return
      }
      // Highlight Current Node
      this.currentWorkflow = activity
      this.listProcessWorkflow = !this.isEmptyValue(this.currentWorkflow.workflow_process) ? this.currentWorkflow.workflow_process.workflow_events.reverse() : []

      if (!this.isEmptyValue(activity.node.uuid)) {
        this.currentNode = [{
          classname: 'delete',
          id: activity.node.uuid
        }]
      }

      const {
        transitionsList,
        statesList
      } = generateWorkflowDiagram(activity.workflow)

      this.workflowTranstitionsList = transitionsList
      this.workflowStatesList = statesList
    }
  }
}
</script>

<style lang="scss" scoped>
 .from-main {
    padding-right: 1% !important;
    padding-bottom: 0px !important;
    padding-top: 0px !important;
    padding-left: 1% !important;
  }
  .card-form {
    height: 100% !important;
    overflow: auto;
  }
  .header {
    padding-bottom: 0px;
    padding-top: 1.5%;
    box-sizing: border-box;
    flex-shrink: 0;
    padding-left: 1%;
    padding-right: 1%;
  }
  .from-footer {
    height: 5% !important;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .footer {
    padding-top: 0px;
    height: 10% !important;
    padding-bottom: 0px;
  }
  .main {
    padding-bottom: 0px;
    padding-top: 0px;
  }
  .search {
    height: 100%;
  }
  .show-title-footer {
    padding-top: 0px;
    height: 8% !important;
    padding-bottom: 0px;
  }
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
<style scoped>
  .panel_main {
    height: 100%;
    width: 100%;
  }
</style>
<style lang='scss'>
.scroll-child {
  max-height: 450px;
}
.el-card {
  border-radius: 4px;
  border: 1px solid #e6ebf5;
  background-color: #FFFFFF;
  overflow: hidden;
  color: #303133;
  -webkit-transition: 0.3s;
  transition: 0.3s;
  display: block;
}
