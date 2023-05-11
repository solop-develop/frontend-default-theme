<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <div style="height: 85vh">
    <el-card class="box-card" style="margin: 0px 5px;padding: 10px 15px;">
      <div slot="header" class="clearfix">
        <h1 style="width: 200px;padding: 0px;margin: 0px 10px;display: contents;">
          {{ $t('form.tasks.title') }}
        </h1>
        <el-button
          type="primary"
          icon="el-icon-refresh-left"
          class="button-base-icon"
          :disabled="isRun"
          style="float: right;"
          @click="restoreJob()"
        />
      </div>
      <el-card class="box-card" style="margin: 0px 10px;padding: : 0px 10px;">
        <el-table
          v-if="isEmptyValue(currentJob)"
          :data="list"
          style="width: 100%"
          @cell-dblclick="SelectJobs"
        >
          <el-table-column
            v-for="(header, key) in headerList"
            :key="key"
            :align="header.align"
            :width="header.width"
            :label="header.label"
          >
            <template slot-scope="scope">
              <el-button v-if="'success' === header.key" :type="scope.row[header.key] ? 'primary' : 'danger'" round>
                {{ scope.row[header.key] }}
              </el-button>
              <span v-else>
                {{ scope.row[header.key] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('form.tasks.table.options')"
            width="200"
          >
            <template slot-scope="scope">
              <el-button
                type="success"
                class="button-base-icon"
                :loading="isRun"
                :disabled="isRun"
                @click="runJob(scope.row)"
              >
                <svg-icon v-if="!isRun" icon-class="run" />
              </el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                class="button-base-icon"
                :disabled="true"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-card v-else class="box-card">
          <div slot="header" class="clearfix">
            <h3 style="width: 200px;padding: 0px;margin: 0px;display: contents;">
              {{ currentJob.displayname }}
            </h3>
            <el-button
              type="success"
              class="button-base-icon"
              :loading="isRun"
              :disabled="isRun"
              style="float: right;font-size: 26px;margin-left: 10px;"
              @click="runJob(currentJob)"
            >
              <svg-icon v-if="!isRun" icon-class="run" />
            </el-button>
            <el-button
              type="primary"
              icon="el-icon-refresh-left"
              class="button-base-icon"
              style="float: right;"
              :disabled="isRun"
              @click="restoreJob(currentJob)"
            />
            <el-button
              type="info"
              class="button-base-icon"
              style="float: right;font-size: 26px;"
              @click="currentJob = {}"
            >
              <svg-icon icon-class="undo" />
            </el-button>
          </div>
          <el-tabs
            v-model="nameTab"
            type="border-card"
            @tab-click="selectTabs"
          >
            <el-tab-pane :label="$t('form.tasks.summary')" name="summaryJobs">
              <el-form label-position="top">
                <span v-if="!isRun">
                  <el-form-item
                    v-for="(summary, index) in summarysList"
                    :key="index"
                    :label="summary.label"
                    style="margin-bottom: 0px"
                  >
                    {{ currentJob[summary.key] }}
                  </el-form-item>
                  <el-form-item style="margin-bottom: 0px">
                    <div id="code" style="background: #282c34;color: #fff;padding: 15px">
                      {{ currentJob.executor_config }}
                    </div>
                  </el-form-item>
                </span>
                <span v-else>
                  <el-skeleton
                    v-for="empty in 4"
                    :key="empty"
                    animated
                    style="margin: 20px 0px;"
                  >
                    <template slot="template">
                      <el-skeleton-item variant="p" style="width: 20%" />
                      <br>
                      <el-skeleton-item variant="p" style="width: 60%" />
                    </template>
                  </el-skeleton>
                  <br>
                  <el-skeleton />
                </span>
              </el-form>
            </el-tab-pane>
            <el-tab-pane :label="$t('form.tasks.executions')" name="executionsJobs">
              <el-table
                :data="executionsLogs"
                lazy
                v-loading="isRun"
                style="width: 100%"
                height="60vh"
              >
                <el-table-column type="expand">
                  <template slot-scope="props">
                    <p v-if="isEmptyValue(props.row.output)" style="text-align: center;">
                      <el-empty :image-size="250" />
                    </p>
                    <!-- <p v-else> -->
                    <div v-else id="code" style="background: #282c34;color: #fff;padding: 15px">
                      {{ $t('form.tasks.empty') }}
                    </div>
                    <!-- </p> -->
                  </template>
                </el-table-column>
                <el-table-column
                  v-for="(header, key) in executionsList"
                  :key="key"
                  :align="header.align"
                  :width="header.width"
                  :label="header.label"
                >
                  <template slot-scope="scope">
                    <el-button v-if="'success' === header.key" :type="scope.row[header.key] ? 'primary' : 'danger'" round>
                      {{ scope.row[header.key] }}
                    </el-button>
                    <span v-else>
                      {{ scope.row[header.key] }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import {
  defineComponent,
  ref
} from '@vue/composition-api'

import summarysList from './summarysList.js'
import executionsList from './executionsList.js'
import headerList from './headerList.js'

// Api Request Methods
import {
  // resumen,
  run,
  restore,
  listJobs,
  executions
} from '@/api/ADempiere/form/Tasks.js'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
// import { showMessage } from '@/utils/ADempiere/notification'
import { dateTimeFormats } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'Tasks',

  setup(props, { root, refs }) {
    /**
     * Ref
     */
    const list = ref([])
    const isRun = ref(false)
    const tasks = ref('Tasks')
    const currentJob = ref({})
    const executionsLogs = ref([])
    const nameTab = ref('summaryJobs')
    /**
     * Computed
     */
    /**
     * Methods
     */

    function SelectJobs(row, column, event) {
      if (column.label === 'Operaciones') return
      currentJob.value = row
    }

    function Jobs() {
      listJobs()
        .then(response => {
          if (!isEmptyValue(response)) list.value = response
        })
        .catch(error => {
          console.warn({ error })
        })
    }

    function selectTabs(tab) {
      const { name } = tab
      if (name === 'executionsJobs') executionsJobs(currentJob.value.id)
    }

    function executionsJobs(id) {
      executions({
        id
      })
        .then(response => {
          if (isEmptyValue(response)) return []
          executionsLogs.value = response.map(list => {
            return {
              ...list,
              startDate: dateTimeFormats(list.started_at, 'YYYY-MM-DD \ HH:MM:SS'),
              finishedDate: dateTimeFormats(list.finished_at, 'YYYY-MM-DD \ HH:MM:SS')
            }
          })
        })
        .catch(error => {
          console.warn({ error })
        })
    }

    function runJob(job) {
      const { id } = job
      isRun.value = true
      run({
        id
      })
        .then(response => {
          Jobs()
          isRun.value = false
        })
        .catch(error => {
          console.warn({ error })
          isRun.value = false
        })
    }

    function restoreJob() {
      restore()
        .then(response => {
          Jobs()
          isRun.value = false
        })
        .catch(error => {
          console.warn({ error })
          isRun.value = false
        })
    }

    Jobs()
    /**
     * Action Panel Footer
     */
    /**
     * Watch
     */
    return {
      // Refs
      executionsLogs,
      executionsList,
      headerList,
      summarysList,
      currentJob,
      nameTab,
      tasks,
      isRun,
      list,
      // Methods
      restoreJob,
      SelectJobs,
      selectTabs,
      runJob,
      Jobs
    }
  }
})
</script>
