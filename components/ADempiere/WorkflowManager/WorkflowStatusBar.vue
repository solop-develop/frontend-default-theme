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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-steps :active="indexStepActions" :space="500" align-center finish-status="success">
    <el-step
      v-for="(actions, key) in documentActionsList"
      :key="key"
      :title="actions.name"
    />
  </el-steps>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Constants
import { DOCUMENT_STATUS } from '@/utils/ADempiere/constants/systemColumns'

// Utils and Melper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'WorkflowStatusBar',

  props: {
    containerUuid: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const currentDocStatus = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        containerUuid: props.containerUuid,
        columnName: DOCUMENT_STATUS
      })
    })

    const documentActionsList = computed(() => {
      const list = store.getters.getWorkFlowActions({
        containerUuid: props.containerUuid
      })
      if (isEmptyValue(list)) {
        return []
      }
      return list.options
    })

    const indexStepActions = computed(() => {
      if (isEmptyValue(documentActionsList.value)) {
        return 0
      }
      return documentActionsList.value.findIndex(docs => {
        return docs.value === currentDocStatus.value
      })
    })

    return {
      currentDocStatus,
      documentActionsList,
      indexStepActions
    }
  }
})
</script>
