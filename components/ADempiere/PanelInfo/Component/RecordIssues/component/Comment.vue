<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Elsio Sanchez Elsiosanches@gmail.com https://github.com/Elsiosanchez
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
  <span>
    <el-container style="height: 100% !important;">
      <el-main style="overflow: auto;padding: 0px;">
        <el-card v-if="isEmptyValue(currentIssues)" class="comments-card" style="height: 100%;padding: 0px;">
          <div slot="header" class="clearfix">
            <b style="color: black; font-size: 19px;">
              {{ 'Nueva Solicitud' }}
            </b>
            <el-button style="float: right;" plain type="info" @click="SelectionIssue">
              {{ 'Regresar a la Lista' }}
              <svg-icon icon-class="undo" />
            </el-button>
          </div>
          <div class="text item">
            <el-row>
              <el-form label-position="top">
                <el-col :span="24">
                  <el-form-item label="Asunto">
                    <el-input v-model="subject" placeholder="Asunto" />
                  </el-form-item>
                </el-col>
              </el-form>
            </el-row>
            <el-row :gutter="20">
              <el-form label-position="top">
                <el-col :span="6">
                  <el-form-item label="Agente Comercial">
                    <el-select
                      v-model="currentSalesReps"
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
                <el-col :span="6">
                  <el-form-item label="Tipo de Solicitud">
                    <el-select
                      v-model="currentRequestTypes"
                      @visible-change="findRequestTypes"
                    >
                      <el-option
                        v-for="item in listIssuesTypes"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="Estatus">
                    <el-select
                      v-model="currentStatus"
                      @visible-change="findStatus"
                    >
                      <el-option
                        v-for="item in listStatuses"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="Prioridad">
                    <el-select
                      v-model="currentPriority"
                      @visible-change="findPriority"
                    >
                      <el-option
                        v-for="item in listPriority"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-form>
            </el-row>
            <el-row>
              <el-form label-position="top">
                <el-col :span="24">
                  <el-form-item label="Resumen">
                    <el-input
                      v-model="summary"
                      placeholder="Resumen"
                      type="textarea"
                      :rows="3"
                    />
                  </el-form-item>
                </el-col>
              </el-form>
            </el-row>
            <el-button
              style="float: right;"
              plain
              :disabled="isDisabledSave"
              type="primary"
              icon="el-icon-check"
              @click="saveIssues()"
            />
          </div>
        </el-card>
        <el-card v-else class="comments-card" style="padding: 0px;">
          <div slot="header" class="comments-card-clearfix">
            <b style="color: black; font-size: 18px;">
              {{ currentIssues.subject }}
              {{ currentIssues.document_no }}
            </b>
            <el-button style="float: right;margin-right: 10px;" plain size="mini" type="primary">
              {{ 'Editar' }}
              <i class="el-icon-edit" />
            </el-button>
            <el-button style="float: right;margin-right: 10px;" size="mini" plain type="danger">
              {{ 'Eliminar' }}
              <i class="el-icon-delete" />
            </el-button>
            <el-button style="float: right;" size="mini" plain type="info" @click="cancelEdit(currentIssues)">
              {{ 'Cancelar' }}
              <svg-icon icon-class="undo" />
            </el-button>
          </div>
          <div id="panel-issues" style="display: flex;">
            <div id="panel-left" style="width: 80% !important;">
              <p style="font-size: 14px;margin: 0px;">
                <b>
                  <!-- <el-scrollbar wrap-class="scroll-comments"> -->
                  {{ currentIssues.summary }}
                  <!-- </el-scrollbar> -->
                </b>
              </p>
            </div>
            <el-divider
              class="divider-vertical"
              direction="vertical"
            />
            <div id="panel-rigth" style="width: 20% !important;">
              <!-- <el-divider class="divider-issues-horizontal" /> -->
              <el-row>
                <el-form label-position="top" class="form-comments">
                  <el-col :span="24" style="text-align: center;">
                    <el-form-item style="margin-bottom: 0px;">
                      <template slot="label">
                        <b style="padding-top: 0px !important;">
                          {{ $t('issues.typeOfRequest') }}
                          <el-popover
                            ref="typeOfRequest"
                            trigger="click"
                          >
                            <el-form label-position="top">
                              <el-form-item :label="$t('issues.typeOfRequest')">
                                <el-select
                                  v-model="currentRequestTypes"
                                  filterable
                                  @visible-change="findRequestTypes"
                                  @change="updateIssuesTypeRequest"
                                >
                                  <el-option
                                    v-for="item in listIssuesTypes"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                  />
                                </el-select>
                              </el-form-item>
                            </el-form>
                            <el-button slot="reference" type="text" style="color: black;">
                              <svg-icon icon-class="settings" />
                            </el-button>
                          </el-popover>
                        </b>
                      </template>
                      <el-button size="mini" type="info" plain style="margin-bottom: 0px;">
                        <b>
                          <svg-icon icon-class="label" />
                          {{ currentIssues.request_type.name }}
                        </b>
                      </el-button>
                      <el-divider class="divider-issues-horizontal" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24" style="text-align: center;">
                    <el-form-item style="margin-bottom: 0px;">
                      <template slot="label">
                        <b style="padding-top: 0px !important;">
                          {{ $t('issues.priority') }}
                          <el-popover
                            ref="updatePriority"
                            trigger="click"
                          >
                            <el-form label-position="top">
                              <el-form-item :label="$t('issues.priority')">
                                <el-select
                                  v-model="currentPriority"
                                  filterable
                                  @visible-change="findPriority"
                                  @change="updateIssuesPriority"
                                >
                                  <el-option
                                    v-for="item in listPriority"
                                    :key="item.value"
                                    :label="item.name"
                                    :value="item.value"
                                  />
                                </el-select>
                              </el-form-item>
                            </el-form>
                            <el-button slot="reference" type="text" style="color: black;">
                              <svg-icon icon-class="settings" />
                            </el-button>
                          </el-popover>
                        </b>
                      </template>
                      <el-button size="mini" type="primary" plain style="margin-bottom: 0px;">
                        <b>
                          <svg-icon icon-class="collections" />
                          {{ currentIssues.priority.name }}
                        </b>
                      </el-button>
                      <el-divider class="divider-issues-horizontal" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24" style="text-align: center;">
                    <el-form-item style="margin-bottom: 0px;">
                      <template slot="label">
                        <b style="padding-top: 0px !important;">
                          {{ $t('issues.assigned') }}
                          <el-popover
                            ref="updateSalesReps"
                            trigger="click"
                          >
                            <el-form label-position="top">
                              <el-form-item label="Agente Comercial">
                                <el-select
                                  v-model="currentSalesReps"
                                  filterable
                                  @visible-change="findSalesReps"
                                  @change="updateIssuesSalesReps"
                                >
                                  <el-option
                                    v-for="item in listSalesReps"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                  />
                                </el-select>
                              </el-form-item>
                            </el-form>
                            <el-button slot="reference" type="text" style="color: black;">
                              <svg-icon icon-class="settings" />
                            </el-button>
                          </el-popover>
                        </b>
                      </template>
                      {{ currentIssues.sales_representative.name }} <svg-icon icon-class="user" />
                      <el-divider class="divider-issues-horizontal" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24" style="text-align: center;">
                    <el-form-item style="margin-bottom: 0px;">
                      <template slot="label">
                        <b style="padding-top: 0px !important;">
                          {{ $t('issues.created') }}
                        </b>
                      </template>
                      {{ currentIssues.user_name }} <svg-icon icon-class="user" />
                    </el-form-item>
                  </el-col>
                </el-form>
              </el-row>
            </div>
          </div>
          <el-divider class="divider-issues-horizontal" />
        </el-card>
        <br>
        <el-timeline>
          <el-timeline-item
            v-for="(comment, index) in listComments"
            :key="index"
            type="primary"
            :timestamp="translateDateByLong(comment.created)"
          >
            <el-card class="list-comments">
              <div slot="header" class="list-comments-clearfix">
                <span>
                  {{ comment.user_name }} <svg-icon icon-class="user" />
                </span>
                <el-dropdown trigger="click" style="float: right" @command="handleCommand">
                  <span class="el-dropdown-link">
                    <el-button type="text" size="mini" style="color: black;">
                      <b>
                        <svg-icon icon-class="more-vertical" />
                      </b>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item icon="el-icon-edit" :command="{comment, option:'edit'}">Editar</el-dropdown-item>
                    <el-dropdown-item icon="el-icon-delete" :command="{comment, option:'delete'}">Eliminar</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <div>
                <span v-if="!comment.isEdit">
                  {{ comment.result }}
                </span>
                <span v-else>
                  <el-input
                    v-model="commentUpdate"
                    type="textarea"
                    :rows="2"
                  />
                  <el-button
                    type="primary"
                    icon="el-icon-check"
                    style="float: right;margin-top: 5px;"
                    @click="updateComment(comment)"
                  />
                  <el-button
                    type="danger"
                    icon="el-icon-close"
                    style="float: right;margin-right: 1%;margin-top: 5px; margin-bottom: 5px;"
                    @click="comment.isEdit = !comment.isEdit"
                  />
                  <el-button
                    type="info"
                    plain
                    style="float: right;margin-top: 5px;margin-bottom: 5px;"
                    @click="commentUpdate = ''"
                  >
                    <svg-icon icon-class="layers-clear" />
                  </el-button>
                </span>
              </div>
            </el-card>
            <!-- {{activity.content}} -->
          </el-timeline-item>
        </el-timeline>
      </el-main>
      <el-footer style="height: auto;padding: 0px;">
        <el-input
          v-model="comments"
          type="textarea"
          :rows="5"
        />
        <el-button
          type="primary"
          icon="el-icon-check"
          style="float: right;"
          @click="addNewComments()"
        />
        <el-button
          type="info"
          plain
          style="float: right;margin-right: 1%;"
          @click="clearComments()"
        >
          <svg-icon icon-class="layers-clear" />
        </el-button>
      </el-footer>
    </el-container>
  </span>
</template>

<script>
import {
  defineComponent, computed, ref
} from '@vue/composition-api'

// import lang from '@/lang'
import store from '@/store'

// Components and Mixins

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification'
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat'

import {
  listSalesRepresentatives,
  listRequestTypes,
  listStatus,
  listPriorities
} from '@/api/ADempiere/window'

export default defineComponent({
  name: 'Comment',

  props: {
    tableName: {
      type: String,
      required: false
    },
    recordId: {
      type: Number,
      required: false
    }
  },

  setup(props, { refs }) {
    // Const
    const tableName = props.tableName
    const recordId = props.recordId
    // Ref
    const subject = ref('')
    const currentSalesReps = ref('')
    const currentRequestTypes = ref('')
    const currentStatus = ref('')
    const currentPriority = ref('')
    const summary = ref('')
    const comments = ref('')
    const commentUpdate = ref('')
    // List
    const listSalesReps = ref([])
    const listIssuesTypes = ref([])
    const listStatuses = ref([])
    const listPriority = ref([])

    const isNewIssues = computed({
      // getter
      get() {
        return store.getters.getNewIssues
      },
      // setter
      set(newValue) {
        store.commit('setNewIssues', newValue)
      }
    })

    const isDisabledSave = computed(() => {
      return isEmptyValue(subject.value) ||
      isEmptyValue(currentSalesReps.value) ||
      isEmptyValue(currentRequestTypes.value) ||
      isEmptyValue(currentStatus.value) ||
      isEmptyValue(currentPriority.value) ||
      isEmptyValue(summary.value)
    })

    const currentIssues = computed(() => {
      return store.getters.getCurrentIssues
    })

    const listComments = computed(() => {
      return store.getters.getListComments
    })

    function findSalesReps(isVisible) {
      if (!isVisible) {
        return
      }
      listSalesRepresentatives()
        .then(response => {
          const { records } = response
          listSalesReps.value = records
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function findRequestTypes(isVisible) {
      if (!isVisible) {
        return
      }
      listRequestTypes()
        .then(response => {
          const { records } = response
          listIssuesTypes.value = records
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function findStatus(isVisible) {
      if (!isVisible) {
        return
      }
      listStatus({
        requestTypeId: currentRequestTypes.value
      })
        .then(response => {
          const { records } = response
          listStatuses.value = records
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function findPriority(isVisible) {
      if (!isVisible) {
        return
      }
      listPriorities()
        .then(response => {
          const { records } = response
          listPriority.value = records
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function saveIssues() {
      store.dispatch('newIssues', {
        tableName,
        recordId,
        subject: subject.value,
        summary: summary.value,
        requestTypeId: currentRequestTypes.value,
        salesRepresentativeId: currentSalesReps.value,
        statusId: currentStatus.value,
        priorityValue: currentPriority.value
      })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'warning'
          })
        })
    }

    function updateIssuesSalesReps(newValue) {
      const {
        id,
        uuid,
        subject,
        summary
      } = currentIssues.value
      store.dispatch('editIssues', {
        id,
        uuid,
        subject,
        summary,
        requestTypeId: currentIssues.value.request_type.id,
        requestTypeUuid: currentIssues.value.request_type.uuid,
        salesRepresentativeId: newValue,
        priorityValue: currentIssues.value.priority.value
      })
      refs.updateSalesReps.showPopper = false
    }

    function updateIssuesTypeRequest(newValue) {
      const {
        id,
        uuid,
        subject,
        summary
      } = currentIssues.value
      store.dispatch('editIssues', {
        id,
        uuid,
        subject,
        summary,
        requestTypeId: newValue,
        salesRepresentativeId: currentIssues.value.sales_representative.id,
        salesRepresentativeUuid: currentIssues.value.sales_representative.uuid,
        priorityValue: currentIssues.value.priority.value
      })
      refs.typeOfRequest.showPopper = false
      // refs.typeOfRequest.activated = false
    }

    function updateIssuesPriority(newValue) {
      const {
        id,
        uuid,
        subject,
        summary
      } = currentIssues.value
      store.dispatch('editIssues', {
        id,
        uuid,
        subject,
        summary,
        requestTypeId: currentIssues.value.request_type.id,
        requestTypeUuid: currentIssues.value.request_type.uuid,
        salesRepresentativeId: currentIssues.value.sales_representative.id,
        salesRepresentativeUuid: currentIssues.value.sales_representative.uuid,
        priorityValue: newValue
      })
      refs.updatePriority.showPopper = false
    }

    function SelectionIssue(issues) {
      isNewIssues.value = !isNewIssues.value
      // store.dispatch('changeCurrentIssues', issues)
    }

    function cancelEdit(issues) {
      isNewIssues.value = !isNewIssues.value
      store.dispatch('changeCurrentIssues', issues)
    }

    function addNewComments(params) {
      const { id, uuid } = currentIssues.value
      store.dispatch('newComments', {
        id,
        uuid,
        result: comments.value
      })
      clearComments()
    }

    function clearComments() {
      comments.value = ''
    }

    function handleCommand(command) {
      const { comment, option } = command
      if (option === 'delete') {
        deleteComment(comment)
        return
      }
      editComment(comment)
    }

    function editComment(comment) {
      comment.isEdit = true
      commentUpdate.value = comment.result
    }

    function deleteComment(comment) {
      const { id, uuid } = comment
      store.dispatch('deleteComments', {
        id,
        uuid,
        issuesId: currentIssues.value.id,
        issuesUuid: currentIssues.value.uuid
      })
    }

    function updateComment(comment) {
      const { id, uuid } = comment
      comment.isEdit = false
      store.dispatch('updateComments', {
        id,
        uuid,
        issuesId: currentIssues.value.id,
        issuesUuid: currentIssues.value.uuid,
        result: commentUpdate.value
      })
    }

    return {
      // Ref
      subject,
      currentSalesReps,
      currentRequestTypes,
      currentStatus,
      currentPriority,
      summary,
      comments,
      commentUpdate,
      // list
      listSalesReps,
      listIssuesTypes,
      listStatuses,
      listPriority,
      // Computed
      isNewIssues,
      isDisabledSave,
      currentIssues,
      listComments,
      // Methodos
      findSalesReps,
      findRequestTypes,
      findStatus,
      findPriority,
      saveIssues,
      SelectionIssue,
      cancelEdit,
      updateIssuesSalesReps,
      updateIssuesTypeRequest,
      updateIssuesPriority,
      addNewComments,
      clearComments,
      translateDateByLong,
      handleCommand,
      deleteComment,
      updateComment,
      editComment
    }
  }
})
</script>

<style>
.p {
  margin: 0px !important;
}
.el-card__body {
  padding: 20px;
  padding-top: 0px !important;
  padding-right: 20px;
  padding-bottom: 0px!important;
  padding-left: 20px;
}
.tui-editor .te-preview-style-vertical .te-preview {
  float: left;
  width: auto !important;
}
.te-preview {
    overflow: auto;
    width: auto !important;
    padding: 0 25px;
    height: 100%;
}
</style>
<style lang="scss">
.scroll-comments {
  max-height: 150px;
}
.divider-vertical {
  height: auto !important;
  width: 2px !important;
}
.divider-issues-horizontal {
  margin: 0px;
  padding: 0px;
}
.option-setting {
  .el-form-item--medium .el-form-item__content {
    line-height: 50px;
  }
}
.comments-card {
  .comments-card .el-card__header {
    padding-top: 5px;
    padding-right: 10px;
    padding-bottom: 5px;
    padding-left: 10px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .el-card__header {
    padding-top: 5px;
    padding-right: 10px;
    padding-bottom: 5px;
    padding-left: 10px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 10px;
    padding-bottom: 0px!important;
    padding-left: 10px;
  }
}
.form-comments {
  .el-form-item--medium .el-form-item__label {
    line-height: 20px;
    padding: 0px;
  }
}
.list-comments {
  .comments-card .el-card__header {
    padding-top: 5px;
    padding-right: 10px;
    padding-bottom: 5px;
    padding-left: 10px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .el-card__header {
    padding-top: 5px;
    padding-right: 10px;
    padding-bottom: 5px;
    padding-left: 10px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 10px;
    padding-bottom: 0px!important;
    padding-left: 10px;
  }
}
</style>
