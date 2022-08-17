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
  <span>
    <el-steps :active="indexStepActions" :space="500" align-center finish-status="success">
      <el-step
        v-for="(actions, key) in listActions"
        :key="key"
        :title="actions.name"
      />
    </el-steps>
    <el-timeline v-if="!isEmptyValue(listLogs.list)">
      <el-timeline-item
        v-for="(worrkflow, keys) in listLogs.list"
        :key="worrkflow.logId"
        :type="worrkflow.type"
        :color="'#0bbd87'"
        :timestamp="worrkflow.logDate"
        placement="top"
      >
        <el-card shadow="hover" class="clearfix" style="padding: 2%">
          <div>
            <span style="color: #606266; font-weight: bold;">
              Actualizado Por <b>:</b> {{ worrkflow.userName }} <i class="el-icon-user-solid" />
            </span>
            <el-link
              type="primary"
              style="float: right;"
              @click="showkey(keys)"
            >
              {{ $t('window.containerInfo.changeDetail') }}
            </el-link>
          </div>
          <el-collapse-transition>
            <el-scrollbar wrap-class="scroll-child">
              <div v-show="(currentKey === keys)">
                <el-timeline>
                  <el-timeline-item
                    v-for="(events, index) in worrkflow.workflowEventsList"
                    :key="index"
                    :color="index === 0 ? 'red' : '#0bbd87'"
                    :timestamp="events.logDate"
                  >
                    <span style="color: #606266; font-weight: bold;">
                      Nodo <b>:</b> {{ events.nodeName }} <svg-icon icon-class="example" /> <br>
                      Nombre Del estatus <b>:</b> {{ events.workflowStateName }} <svg-icon icon-class="documentation" /> <br>
                    </span>
                    <span v-if="!isEmptyValue(events.textMessage)" style="color: #606266; font-weight: bold;">
                      <!-- <el-scrollbar wrap-class="scroll-child"> -->
                        Mensaje <b>:</b> {{ events.textMessage }} <svg-icon icon-class="message" />
                      <!-- </el-scrollbar> -->
                    </span>
                    <!-- {{ events.nodeName }} -->
                  </el-timeline-item>
                </el-timeline>
                <!-- <span v-for="(list, index) in entityLogs.changeLogsList" :key="index">
                  <p v-if="validate(list)">
                    <b> {{ list.displayColumnName }} :</b>
                    <strike>
                      <document-status-tag
                        :value="list.oldValue"
                        :displayed-value="list.oldDisplayValue"
                      />
                    </strike>
                    <document-status-tag
                      :value="list.newValue"
                      :displayed-value="list.newDisplayValue"
                    />
                  </p>
                  <el-descriptions v-else class="margin-top" :column="1">
                    <el-descriptions-item label="Nombre" label-style="{ color: #606266; font-weight: bold; }">
                      <span style="color: #606266; font-weight: bold;"> {{ list.displayColumnName }} </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="Nuevo Valor" label-style="{ color: #606266; font-weight: bold; }">
                      <el-link type="success">
                        {{ list.newDisplayValue }}
                      </el-link>
                    </el-descriptions-item>
                    <el-descriptions-item label="Valor Antiguo" label-style="{ color: #606266; font-weight: bold; }">
                      <strike>
                        <el-link type="danger">
                          {{ list.oldDisplayValue }}
                        </el-link>
                      </strike>
                    </el-descriptions-item>
                    <el-descriptions-item label="Columna" label-style="{ color: #606266; font-weight: bold; }">
                      <span style="color: #606266; font-weight: bold;"> {{ list.columnName }} </span>
                    </el-descriptions-item>
                  </el-descriptions>
                </span> -->
              </div>
            </el-scrollbar>
          </el-collapse-transition>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <div v-else>
      <el-empty />
    </div>
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'

// components and mixins
import { DOCUMENT_STATUS_COLUMNS_LIST } from '@/utils/ADempiere/constants/systemColumns'
import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'RecordLogs',

  components: {
    DocumentStatusTag
  },

  props: {
    allTabsList: {
      type: Array,
      default: () => []
    },
    containerUuid: {
      type: String,
      default: () => ''
    },
  },

  setup(props, { root }) {
    const currentRecordLogs = ref({ name: 'nada' })
    // const listLogs = ref({})
    const currentKey = ref(0)
    const typeAction = ref(0)
    const currentTabLogs = ref('0')

    // // use getter to reactive properties
    const listLogs = computed(() => {
      return store.getters.getWorkFlowLogs({ containerUuid: props.containerUuid })
    })
    const listActions = computed(() => {
      const list = store.getters.getWorkFlowActions({ containerUuid: props.containerUuid })
      if (isEmptyValue(list)) {
        return []
      }
      return list.options
    })

    const indexStepActions = computed(() => {
      if (isEmptyValue(listActions.value)) {
        return 0
      }
      return listActions.value.findIndex(docs => docs.value === currentDocStatus.value)
    })

    const currentDocStatus = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        containerUuid: props.containerUuid,
        columnName: 'DocStatus'
      })
    })
    /**
     * showkey
     */
    const showkey = (key, index) => {
      if (key === currentKey.value && index === typeAction.value) {
        currentKey.value = 1000
      } else {
        currentKey.value = key
        typeAction.value = index
      }
    }
    const validate = (list) => {
      return DOCUMENT_STATUS_COLUMNS_LIST.includes(list.columnName)
    }
    isEmptyValue

    return {
      currentTabLogs,
      currentRecordLogs,
      typeAction,
      currentKey,
      listLogs,
      listActions,
      currentDocStatus,
      indexStepActions,
      // methods
      validate,
      showkey
    }
  }

})
</script>

<style>
.scroll-attachment {
    max-height: 80vh;
}
</style>
