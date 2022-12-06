<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span>
    <el-timeline v-if="!isEmptyValue(listLogs.entityLogsList)">
      <el-timeline-item
        v-for="(entityLogs, keys) in listLogs.entityLogsList"
        :key="entityLogs.logId"
        :type="entityLogs.type"
        :color="'#0bbd87'"
        :timestamp="entityLogs.logDate"
        placement="top"
      >
        <el-card shadow="hover" class="clearfix" style="padding: 2%">
          <div>
            <span style="color: #606266; font-weight: bold;">
              {{ $t('window.containerInfo.log.updatedBy') }} <b>: </b>{{ entityLogs.userName }} <i class="el-icon-user-solid" />
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
            <div v-show="(currentKey === keys)">
              <span v-for="(changeLog, index) in entityLogs.changeLogsList" :key="index">
                <p v-if="isDocument(changeLog)">
                  <b>{{ changeLog.displayColumnName }} :</b>
                  <strike>
                    <document-status-tag
                      :value="changeLog.oldValue"
                      :displayed-value="changeLog.oldDisplayValue"
                    />
                  </strike>
                  <document-status-tag
                    :value="changeLog.newValue"
                    :displayed-value="changeLog.newDisplayValue"
                  />
                </p>

                <el-descriptions v-else class="margin-top" :column="1">
                  <el-descriptions-item
                    :label="$t('window.containerInfo.log.field')"
                    label-style="{ color: #606266; font-weight: bold; }"
                  >
                    <span style="color: #606266; font-weight: bold;">
                      {{ changeLog.displayColumnName }}
                    </span>
                  </el-descriptions-item>

                  <el-descriptions-item
                    :label="$t('window.containerInfo.log.newValue')"
                    label-style="{ color: #606266; font-weight: bold; }"
                  >
                    <el-link type="success">
                      {{ changeLog.newDisplayValue }}
                    </el-link>
                  </el-descriptions-item>

                  <el-descriptions-item
                    :label="$t('window.containerInfo.log.oldValue')"
                    label-style="{ color: #606266; font-weight: bold; }"
                  >
                    <strike>
                      <el-link type="danger">
                        {{ changeLog.oldDisplayValue }}
                      </el-link>
                    </strike>
                  </el-descriptions-item>

                  <el-descriptions-item
                    :label="$t('window.containerInfo.log.column')"
                    label-style="{ color: #606266; font-weight: bold; }"
                  >
                    <span style="color: #606266; font-weight: bold;">
                      {{ changeLog.columnName }}
                    </span>
                  </el-descriptions-item>
                </el-descriptions>
              </span>
            </div>
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

// Components and Mixins
import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'

// Utils and Helper Methods
import { isDocumentStatus } from '@/utils/ADempiere/constants/systemColumns'

export default defineComponent({
  name: 'RecordLogs',

  components: {
    DocumentStatusTag
  },

  setup() {
    const currentRecordLogs = ref({ name: '' })
    const currentKey = ref(0)
    const typeAction = ref(0)
    const currentTabLogs = ref('0')

    // // use getter to reactive properties
    const listLogs = computed(() => {
      return store.getters.getRecordLogs
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
    const isDocument = (changeLog) => {
      return isDocumentStatus({ columnName: changeLog.columnName })
    }

    return {
      currentTabLogs,
      currentRecordLogs,
      typeAction,
      currentKey,
      listLogs,
      // methods
      isDocument,
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
