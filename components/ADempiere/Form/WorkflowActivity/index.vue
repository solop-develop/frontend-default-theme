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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-container v-if="isMobile" style="height: 100% !important;">
    <el-header id="WorkflowActivity" class="header" :style="!collapse ? 'height: 30% !important; width: 100% !important;' : 'height: 7%!important; width: 100% !important;'">
      <el-card :style="!collapse ? 'height: 100% !important; width: 100% !important;float: left;' : 'height: 100%;width: 100% !important;float: left;'">
        <div slot="header">
          <span> {{ $t('form.workflowActivity.title') }} </span>
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
        <el-header :style="collapse2 ? 'padding: 0px;height: 40%;display: contents;' : 'padding: 0px;height: 10%;display: contents;'">
          <el-card id="logsWorkflow" class="box-card">
            <div slot="header" class="clearfix">
              {{ $t('field.logsField') }}
              <el-button style="float: right; padding: 3px 0" type="text" :icon="collapse2 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="(collapse2 = !collapse2)" />
            </div>
            <!-- {{ currentActivity }} {{ collapse2 }} -->
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
          </el-card>
        </el-header>
        <el-main v-if="!isEmptyValue(currentActivity)" :style="isMobile ? 'overflow: auto;padding: 0px;' : 'overflow: auto;padding: 0px;'">
          <!-- <el-card id="logsWorkflow" class="box-card" :style="collapse2 ? 'height: auto' : 'height: 20%'">
            <div slot="header" class="clearfix">
              {{ $t('field.logsField') }}
              <el-button style="float: right; padding: 3px 0" type="text" :icon="collapse2 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="(collapse2 = !collapse2)" />
            </div>
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
          </el-card> -->
          <el-card id="logsWorkflow" class="box-card" :style="collapse3 ? 'height: 100%;display: contents;' : 'height: 20%'">
            <div slot="header" class="clearfix">
              {{ $t('form.workflowActivity.filtersSearch.workFlowDiagram') }}
              <!-- {{ 'Diagrama del Flujo de Trabajo' }} -->
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
    <el-footer :style="chooseOption ? 'padding: 0px;height: 35% !important;' : 'padding: 0px;height: 30% !important;'">
      <el-card id="logsWorkflow" class="box-card" style="padding: 0%;overflow: auto;overflow-x: hidden;">
        <el-form v-show="!isEmptyValue(currentActivity)" :label-position="chooseOption ? 'top' : 'left'" :inline="true" class="demo-form-inline">
          <el-row :gutter="24" style="text-align: center;">
            <el-col :span="!chooseOption ? 12 : 6" style="text-align: center;margin: 0px;">
              <el-form-item label="Reenviar" style="margin: 0px;padding: 0px;">
                <el-switch v-model="chooseOption" @change="changeOption" />
              </el-form-item>
            </el-col>
            <el-col v-show="isValidateUserChoice" :span="12" style="text-align: center;margin: 0px;">
              <el-form-item :label="$t('form.workflowActivity.filtersSearch.approve')" style="margin: 0px;padding: 0px;">
                <el-switch v-model="isProved" />
              </el-form-item>
            </el-col>
            <el-col v-show="chooseOption" :span="18" style="text-align: center;margin: 0px;padding: 0px">
              <el-form-item :label="$t('form.workflowActivity.filtersSearch.user')" style="margin: 0px;padding: 0px;">
                <el-select
                  v-if="chooseOption"
                  v-model="userId"
                  @visible-change="findSalesReps"
                >
                  <el-option
                    v-for="item in listSalesReps"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <v-md-editor
          v-model="message"
          left-toolbar="undo redo | image"
          :disabled-menus="[]"
        />
        <el-button
          type="primary"
          icon="el-icon-check"
          style="float: right;"
          @click="sendOPeration()"
        />
        <el-button
          type="info"
          plain
          style="float: right;margin-right: 1%;"
          @click="clearMessage()"
        >
          <svg-icon icon-class="layers-clear" />
        </el-button>
      </el-card>
    </el-footer>
  </el-container>
  <el-container v-else style="height: 100% !important;">
    <el-header id="WorkflowActivity" class="header" :style="!collapse ? 'height: 30% !important; width: 100% !important;' : 'height: 10%!important; width: 100% !important;'">
      <el-card :style="!collapse ? 'height: 100% !important; width: 50% !important;float: left;' : 'height: 100%;width: 50% !important;float: left;'">
        <div slot="header">
          <span> {{ $t('form.workflowActivity.title') }} </span>
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
      <el-card id="logsWorkflow" class="box-card" :style="collapse2 ? 'height: 100%; width: 50% !important;float: right;' : 'height: 20%; width: 50% !important;float: right;'">
        <div slot="header" class="clearfix">
          {{ $t('field.logsField') }}
          <el-button style="float: right; padding: 3px 0" type="text" :icon="collapse2 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="(collapse2 = !collapse2)" />
        </div>
        <el-timeline v-if="(!isEmptyValue(currentActivity) && collapse2)" class="info" style="overflow: auto;height: 80%; padding-top: 10px;">
          <el-timeline-item
            v-for="(nodes, key) in listProcessWorkflow"
            :key="key"
            :timestamp="translateDateByLong(nodes.log_date)"
            placement="top"
          >
            <b>  {{ nodes.node_name }} </b> {{ nodes.text_message }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-header>

    <el-main class="main" style="padding-left: 1%;padding-right: 1%;">
      <el-container style="height: 100%;">
        <el-main v-if="!isEmptyValue(currentActivity)" :style="isMobile ? 'overflow: auto;padding: 0px;' : 'overflow: auto;padding: 0px;'">
          <!-- <el-card id="logsWorkflow" class="box-card" :style="collapse2 ? 'height: auto' : 'height: 20%'">
            <div slot="header" class="clearfix">
              {{ $t('field.logsField') }}
              <el-button style="float: right; padding: 3px 0" type="text" :icon="collapse2 ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" @click="(collapse2 = !collapse2)" />
            </div>
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
          </el-card> -->
          <el-card id="logsWorkflow" class="box-card" :style="collapse3 ? 'height: 100%' : 'height: 20%'">
            <div slot="header" class="clearfix">
              {{ $t('form.workflowActivity.filtersSearch.workFlowDiagram') }}
              <!-- {{ 'Diagrama del Flujo de Trabajo' }} -->
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
    <el-footer :style="isStyleFooter">
      <el-card id="logsWorkflow" class="box-card" style="padding-left: 1%;padding-right: 1%;overflow: auto;">
        <el-form v-show="!isEmptyValue(currentActivity)" :inline="true" class="demo-form-inline">
          <el-row :gutter="24">
            <el-col :span="8" style="text-align: center;">
              <el-form-item label="Reenviar">
                <el-switch v-model="chooseOption" @change="changeOption" />
              </el-form-item>
            </el-col>
            <el-col v-show="isValidateUserChoice" :span="8" style="text-align: center;">
              <el-form-item :label="$t('form.workflowActivity.filtersSearch.approve')">
                <el-switch v-model="isProved" />
              </el-form-item>
            </el-col>
            <el-col v-show="chooseOption" :span="8" style="text-align: center;">
              <el-form-item :label="$t('form.workflowActivity.filtersSearch.user')">
                <el-select
                  v-if="chooseOption"
                  v-model="userId"
                  @visible-change="findSalesReps"
                >
                  <el-option
                    v-for="item in listSalesReps"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <v-md-editor v-model="message" />
        <el-button
          type="primary"
          icon="el-icon-check"
          style="float: right;"
          @click="sendOPeration()"
        />
        <el-button
          type="info"
          plain
          style="float: right;margin-right: 1%;"
          @click="clearMessage()"
        >
          <svg-icon icon-class="layers-clear" />
        </el-button>
      </el-card>
    </el-footer>
  </el-container>
</template>

<script>
// Components and Mixins
import formMixin from '@theme/components/ADempiere/Form/formMixin.js'
import CustomPagination from '@theme/components/ADempiere/DataTable/Components/CustomPagination.vue'
import WorkflowDiagram from '@theme/components/ADempiere/WorkflowManager/WorkflowDiagram.vue'
import 'simple-m-editor/dist/simple-m-editor.css'
// Constants
import fieldsList from './fieldsList.js'

// Utils and Helper Methods
import { generateWorkflowDiagram } from '@/utils/ADempiere/dictionary/workflow'
import { showMessage } from '@/utils/ADempiere/notification'
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat'

// API
import {
  listSalesRepresentatives
} from '@/api/ADempiere/window'
import {
  processWorkflowActivity,
  forwardWorkflowActivity
} from '@/api/ADempiere/workflow.js'

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
          name: this.$t('page.processActivity.name'),
          isNumeric: false
        },
        {
          columnName: 'node.name',
          name: this.$t('form.workflowActivity.table.node'),
          isNumeric: false
        },
        {
          columnName: 'node.description',
          name: this.$t('page.processActivity.description'),
          isNumeric: false
        }
      ],
      currentSalesReps: '',
      message: '',
      chartOptions: {
        minWidth: 100,
        maxWidth: 600,
        minHeight: 100,
        maxHeight: 300
      },
      chooseOption: false,
      chooseOptionB: true,
      userId: '',
      isProved: false,
      listAproved: [
        {
          displayedValue: this.$t('components.switchActiveText'),
          value: true
        },
        {
          displayedValue: this.$t('components.switchInactiveText'),
          value: false
        }
      ],
      chatEditor: null,
      listSalesReps: [],
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
    isValidateUserChoice() {
      if (!this.isEmptyValue(this.currentActivity) && !this.isEmptyValue(this.currentActivity.node) && !this.isEmptyValue(this.currentActivity.node.action_name)) {
        if (!this.chooseOption && this.currentActivity.node.action_name === 'USER_CHOICE') {
          return true
        }
      }
      return !this.chooseOption
      // currentActivity.node.action_name === 'USER_CHOICE'
    },
    isStyleFooter() {
      if (this.isMobile) return 'height: auto;padding-left: 1%;padding-right: 1%;'
      return 'height: auto;padding-bottom: 100px;padding-top: 0%;padding-left: 1%;padding-right: 1%;'
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
    },
    activityList(value) {
      if (!this.isEmptyValue(value)) {
        this.handleCurrentChange(value[0])
      }
    }
  },
  mounted() {
    this.$store.dispatch('serverListActivity', {})
    if (!this.isEmptyValue(this.currentActivity)) {
      this.generateWorkflow(this.currentActivity)
    }
    if (!this.isEmptyValue(this.activityList)) {
      this.handleCurrentChange(this.activityList[0])
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
      if (this.isMobile) {
        this.collapse = !this.collapse
      }
      this.collapse2 = true
      this.collapse3 = true
      this.clearData()
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
    },
    clearMessage() {
      this.message = ''
    },
    sendOPeration() {
      if (this.isProved) {
        this.processWorkflow(this.currentActivity)
      } else {
        this.forwardWorkflow(this.currentActivity)
      }
      this.clearMessage()
      this.$store.dispatch('serverListActivity', {})
      this.$store.dispatch('findNotifications')
    },
    forwardWorkflow({ id, uuid }) {
      forwardWorkflowActivity({
        id,
        uuid,
        message: this.message,
        userId: this.userId
      })
        .then(response => {
          showMessage({
            message: response,
            type: 'success'
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
    },
    processWorkflow({ id, uuid }) {
      processWorkflowActivity({
        id,
        uuid,
        message: this.message,
        isApproved: this.isProved
      })
        .then(response => {
          showMessage({
            message: response,
            type: 'success'
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
    },
    clearData() {
      this.message = ''
      this.chooseOption = false
      this.userId = ''
      this.isProved = false
    },
    changeOption(value) {
      this.chooseOptionB = !value
    },
    changeOptionB(value) {
      this.chooseOption = !value
    },
    findSalesReps(isVisible) {
      if (!isVisible) {
        return
      }
      listSalesRepresentatives()
        .then(response => {
          const { records } = response
          this.listSalesReps = records
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
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
</style>
