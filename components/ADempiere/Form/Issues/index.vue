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
        <!-- {{ !isEmptyValue(currentIssues) }} {{ !isNewIssues }} -->
        <el-card v-if="!isNewIssues" class="all-request-box-card" style="height: 100%;overflow: auto;">
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
              @row-click="selectIssue"
            >
              <el-table-column style="display: flex;" :label="$t('issues.allRequest')">
                <template slot-scope="scope">
                  <el-popover
                    placement="top-start"
                    trigger="hover"
                  >
                    <b>
                      {{ $t('issues.expirationType') }}
                    </b>
                    <el-tag :style="dueTypeColorDescription(scope.row)">
                      {{ scope.row.due_type.name }}
                    </el-tag>
                    <b slot="reference" style="font-size: 30px;padding-top: 10px;padding-left: 5px;padding-right: 5px;">
                      <svg-icon icon-class="issues" :style="dueTypeColor(scope.row)" />
                    </b>
                  </el-popover>

                  <div style="margin-top: 0px;margin-bottom: 0px;width: 100%;">
                    <p style="font-size: 18px;width: 100%;margin-top: 10px;margin-bottom: 10px;">
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
                              {{ scope.row.sales_representative.name }}
                              <el-avatar icon="el-icon-user-solid" size="small" style="margin-left: 10px;" />
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
                              <span v-if="scope.row.date_next_action > 0">
                                {{ translateDateByLong(scope.row.date_next_action) }}
                              </span>
                            </el-descriptions-item>
                          </el-descriptions>
                          <el-button
                            slot="reference"
                            style="color: black;padding: 0px;"
                            type="text"
                            @click="selectIssue(scope.row)"
                          >
                            <p style="margin: 0px;font-size: 18px;text-align: left;margin-top: 5px;margin-bottom: 5px;">
                              {{ '#' + scope.row.document_no + '  ' + scope.row.subject }}
                            </p>
                            <p style="margin: 0px;">
                              <i style="font-size: 12px;color: #82848a;">
                                <b>
                                  <svg-icon icon-class="calendar" style="font-size: 18px;" />
                                  {{ $t('issues.nextActionDate') + ': ' }}
                                </b>
                                <span v-if="scope.row.date_next_action > 0">
                                  {{ translateDateByLong(scope.row.date_next_action) }}
                                </span>
                              </i>
                            </p>
                          </el-button>
                        </el-popover>
                      </b>
                      <el-button type="primary" size="medium" plain style="float: right;margin-right: 10px;">
                        <b>
                          <svg-icon icon-class="collections" style="font-size: 20px;" />
                          {{ $t('issues.priority') + ': ' }}
                        </b>
                        {{ scope.row.priority.name }}
                      </el-button>
                      <el-button size="medium" type="info" plain style="float: right;margin-right: 10px;">
                        <b>
                          <svg-icon icon-class="label" style="font-size: 20px;" />
                          {{ $t('issues.typeOfRequest') + ': ' }}
                        </b>
                        {{ scope.row.request_type.name }}
                      </el-button>
                    </p>
                  </div>
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
</template>

<script>
import {
  defineComponent, computed, ref
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import Comment from './component/Comment.vue'
// Utils and Helper Methods
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'Issues',

  components: {
    // Editor
    Comment
  },

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

  setup(props) {
    const message = ref('')
    const filter = ref('')
    const priority = ref('')
    const typeRequest = ref('')

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
      const margin = '20px 0px 0px 0px'
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

    function loadIssues() {
      store.dispatch('listRequest', {})
      store.dispatch('findListMailTemplates')
    }

    loadIssues()

    return {
      message,
      listIssues,
      translateDateByLong,
      //
      priority,
      typeRequest,
      filter,
      isNewIssues,
      currentIssues,
      // methods
      dueTypeColor,
      dueTypeColorDescription,
      selectIssue,
      newIssues,
      loadIssues
    }
  }
})
</script>

<style lang="scss">
.all-request-box-card {
  padding: 0px;
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
  .el-table--medium .el-table__cell {
    padding: 0px;
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
