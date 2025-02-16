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
  <span
    v-if="!isLoading"
  >
    <el-container style="height: 100% !important;">
      <el-main style="overflow: auto;padding: 0px;">
        <!-- {{ !isEmptyValue(currentIssues) }} {{ !isNewIssues }} -->
        <el-card v-if="!isNewIssues" class="all-request-box-card" style="height: 100%;">
          <div slot="header" class="clearfix">
            <b style="color: black; font-size: 19px;">
              {{ $t('issues.allRequest') }}
            </b>
            <el-button style="float: right;" plain type="success" @click="newIssues()">
              {{ $t('issues.createNewRequest') }}
              <i class="el-icon-plus" />
            </el-button>
          </div>

          <div class="table-list-request">
            <el-empty v-if="isEmptyValue(listIssues)" style="height: 600px;" />
            <el-table
              v-else
              :data="listIssues"
              style="width: 100%;"
            >
              <!-- @row-click="selectIssue" -->
              <el-table-column style="display: flex;" :label="$t('issues.allRequest')">
                <template slot-scope="scope">
                  <el-popover
                    placement="top-start"
                    trigger="hover"
                  >
                    <b>
                      {{ $t('issues.expirationType') }}
                    </b>
                    <el-tag :style="dueTypeColor(scope.row)">
                      {{ scope.row.due_type.name }}
                    </el-tag>
                    <b slot="reference" style="font-size: 30px;padding-top: 10px;padding-left: 5px;padding-right: 5px;">
                      <svg-icon icon-class="issues" :style="dueTypeColor(scope.row)" />
                    </b>
                  </el-popover>

                  <span style="margin-top: 0px;margin-bottom: 0px;width: 100%;">
                    <p style="font-size: 18px;width: 100%;margin-top: 5px;margin-bottom: 5px;">
                      <b>
                        <el-popover
                          placement="top-start"
                          trigger="hover"
                          width="900"
                        >
                          <el-descriptions :column="2">
                            <template slot="title">
                              <b>
                                <svg-icon icon-class="guide" />
                                {{ scope.row.subject }}
                              </b>
                            </template>
                            <template slot="extra">
                              <b>
                                <!-- {{ $t('issues.documentNo') }} -->
                                {{ '#' }}
                                {{ scope.row.document_no }}
                              </b>
                            </template>
                            <el-descriptions-item :span="4">
                              <template slot="label">
                                <b>
                                  {{ $t('issues.summary') }}
                                </b>
                              </template>
                              <el-scrollbar wrap-class="scroll-previwer-disable" style="width: 100%; overflow: hidden;">
                                <v-md-preview :text="scope.row.summary" class="previwer-disable" style="padding: 0px" height="150px" />
                              </el-scrollbar>
                              <!-- {{ scope.row.summary }} -->
                            </el-descriptions-item>
                            <el-descriptions-item :span="4">
                              <template slot="label">
                                <b>
                                  {{ $t('issues.created') }}
                                </b>
                              </template>
                              {{ scope.row.user_name }}
                            </el-descriptions-item>
                            <el-descriptions-item style="float: right;">
                              <template slot="label">
                                <b style="padding-top: 10px !important;">
                                  {{ $t('issues.priority') }}
                                </b>
                              </template>
                              <el-button type="primary" size="medium" plain style="float: right;margin-right: 10px;">
                                <svg-icon icon-class="collections" />
                                {{ scope.row.priority.name }}
                              </el-button>
                            </el-descriptions-item>
                            <el-descriptions-item>
                              <template slot="label">
                                <b style="padding-top: 10px !important;">
                                  {{ $t('issues.typeOfRequest') }}
                                </b>
                              </template>
                              <el-button size="medium" plain type="info" style="float: right;margin-right: 10px;">
                                <svg-icon icon-class="label" />
                                {{ scope.row.request_type.name }}
                              </el-button>
                            </el-descriptions-item>
                            <el-descriptions-item>
                              <template slot="label">
                                <b style="padding-top: 5px !important;">
                                  {{ $t('issues.assigned') }}
                                </b>
                              </template>
                              <svg-icon v-if="isEmptyValue(scope.row.sales_representative.avatar)" icon-class="user" />
                              <el-image
                                :src="avatarResize(scope.row.sales_representative)"
                                fit="contain"
                                style="
                                  width: 20px;
                                  height: 20px;
                                  cursor: default;
                                  border-radius: 50%;
                                  position: relative;
                                  display: inline-block;
                                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                                  margin-right: 5px;
                                "
                              />
                              <b style="padding-left: 5px;">
                                {{ scope.row.sales_representative.name }}
                              </b>
                              <!-- <el-avatar icon="el-icon-user-solid" size="small" style="margin-left: 10px;" /> -->
                            </el-descriptions-item>
                            <el-descriptions-item>
                              <template slot="label">
                                <b>
                                  {{ $t('issues.expirationType') }}
                                </b>
                              </template>
                              <el-tag :style="dueTypeColorDescription(scope.row)">
                                {{ scope.row.due_type.name }}
                              </el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item :span="4" style="float: right;">
                              <template slot="label">
                                <b>
                                  <svg-icon icon-class="calendar" style="font-size: 18px;" />
                                  {{ $t('issues.nextActionDate') }}
                                </b>
                              </template>
                              <span>
                                {{ scope.row.dateNextAction }}
                              </span>
                            </el-descriptions-item>
                          </el-descriptions>
                          <el-button
                            slot="reference"
                            style="color: black;font-size: 18px;padding: 0px;"
                            type="text"
                            @click="selectIssue(scope.row)"
                          >
                            <!-- {{ '#' + scope.row.document_no + '  ' + scope.row.subject }} -->
                            <p style="margin: 0px;font-size: 18px;text-align: left;margin-top: 5px;margin-bottom: 5px;">
                              {{ '#' + scope.row.document_no + '  ' + scope.row.subject }}
                            </p>
                            <p style="margin: 0px;">
                              <i style="font-size: 12px;color: #82848a;">
                                <b>
                                  <svg-icon icon-class="calendar" style="font-size: 18px;" />
                                  {{ $t('issues.nextActionDate') + ': ' }}
                                </b>
                                <span>
                                  {{ scope.row.dateNextAction }}
                                </span>
                              </i>
                            </p>
                          </el-button>
                        </el-popover>
                      </b>

                      <el-button
                        type="primary"
                        icon="el-icon-zoom-in"
                        :alt="$t('page.processActivity.zoomIn')"
                        plain
                        style="float: right; margin-right: 5px; margin-left: 0px;margin-top: 5px;"
                        class="button-base-icon"
                        @click="zoomIssues(scope.row)"
                      />

                      <el-button type="primary" size="medium" plain style="float: right;margin-right: 10px;margin-top: 5px;">
                        <b>
                          <svg-icon icon-class="collections" style="font-size: 20px;" />
                          {{ $t('issues.priority') + ': ' }}
                        </b>
                        {{ scope.row.priority.name }}
                      </el-button>

                      <el-popover
                        ref="timeRecord"
                        placement="left"
                        :title="$t('form.timeRecord.timeRecord') + ' (' + scope.row.id + ')'"
                        trigger="click"
                        width="450"
                      >
                        <record-time
                          :issue-id="scope.row.id"
                        />
                        <el-button
                          slot="reference"
                          type="primary"
                          plain
                          class="button-base-icon"
                          style="float: right; margin-right: 5px; margin-left: 0px;margin-top: 5px;"
                          :alt="$t('form.timeRecord.timeRecord')"
                        >
                          <i class="el-icon-time" />
                        </el-button>
                      </el-popover>

                      <el-button size="medium" type="info" plain style="float: right;margin-right: 10px;margin-top: 5px;">
                        <b>
                          <svg-icon icon-class="label" style="font-size: 20px;" />
                          {{ $t('issues.typeOfRequest') + ': ' }}
                        </b>
                        {{ scope.row.request_type.name }}
                      </el-button>
                    </p>
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
        <comment
          v-else
          :table-name="tableName"
          :record-id="recordId"
        />
      </el-main>
    </el-container>
  </span>
  <loading-view
    v-else
    key="Record-Issues-Loading"
  />
</template>

<script>
import {
  defineComponent, computed, ref
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import Comment from './component/Comment.vue'
import RecordTime from '@theme/components/ADempiere/Form/Issues/recordTime.vue'
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'

// Constants
import { REQUEST_WINDOW_UUID } from '@/utils/ADempiere/dictionary/form/Issues.js'

// Utils and Helper Methods
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
import { getImagePath } from '@/utils/ADempiere/resource.js'

export default defineComponent({
  name: 'RecordIssues',

  components: {
    // Editor
    Comment,
    RecordTime,
    LoadingView
  },

  props: {
    tableName: {
      type: String,
      required: false
    },
    recordId: {
      type: Number,
      required: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const message = ref('')
    const filter = ref('')
    const priority = ref('')
    const typeRequest = ref('')
    const dateNextAction = ref(null)

    // const chartOptions = {
    //   minWidth: 100,
    //   maxWidth: 600,
    //   minHeight: 100,
    //   maxHeight: 300
    // }

    const listIssues = computed(() => {
      return store.getters.getListIssues
    })

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

    const currentIssues = computed(() => {
      return store.getters.getCurrentIssues
    })

    function dueTypeColor(issue) {
      const { due_type } = issue
      const { value } = due_type
      const margin = '15px 0px 0px 0px'

      let color = '#3fb950'
      if (value === '5') {
        color = 'orange'
      } else if (value === '3') {
        color = '#ff2121'
      }
      return {
        color,
        margin
      }
    }

    function dueTypeColorDescription(issue) {
      const { due_type } = issue
      const { value } = due_type
      const margin = '0px'
      let color = '#3fb950'
      if (value === '5') {
        color = 'orange'
      } else if (value === '3') {
        color = '#ff2121'
      }
      return {
        color,
        margin
      }
    }

    function selectIssue(issue) {
      isNewIssues.value = !isNewIssues.value
      store.dispatch('changeCurrentIssues', issue)
    }

    function newIssues(issue) {
      isNewIssues.value = !isNewIssues.value
      store.dispatch('changeCurrentIssues', issue)
    }

    function zoomIssues(issues) {
      zoomIn({
        uuid: REQUEST_WINDOW_UUID,
        params: {
          filters: [
            {
              columnName: 'UUID',
              value: issues.uuid
            }
          ]
        }
      })
    }

    function avatarResize(user) {
      const { avatar } = user
      const { uri } = getImagePath({
        file: avatar,
        width: 20,
        height: 20,
        operation: 'resize'
      })
      return uri
    }

    store.dispatch('findListMailTemplates')

    return {
      message,
      listIssues,
      //
      priority,
      typeRequest,
      dateNextAction,
      filter,
      isNewIssues,
      currentIssues,
      // methods
      dueTypeColor,
      formatDate,
      selectIssue,
      dueTypeColorDescription,
      newIssues,
      zoomIssues,
      avatarResize
    }
  }
})
</script>

<style lang="scss">
.all-request-box-card {
  padding: 0px;
  border: 0px;
  .el-card {
    border: 0px;
  }
  .el-card__body {
    padding: 0px;
  }
}
.table-list-request {
  .el-table td.el-table__cell div {
    display: flex;
    padding: 0px;
  }
  .el-table thead {
    display: none;
  }
}
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

.issues-card {
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 0px;
    padding-bottom: 0px!important;
    padding-left: 0px;
  }
}
// .el-descriptions-item__label:not(.is-bordered-label) {
//   padding-top: 10px;
// }
</style>
<style scoped>
.scroll-chats {
  width: 100%;
  height: 500px;
}
</style>
