<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
    <el-card v-if="!isEmptyValue(getterReferences)" style="padding: 10px;">
      <el-descriptions
        :column="1"
        :border="true"
      >
        <!-- <el-descriptions-item label="Username" label-class-name="my-label" content-class-name="my-content">kooriookami</el-descriptions-item> -->
        <el-descriptions-item
          v-for="(reference, key) in getterReferences.referencesList"
          :key="key"
          :label="reference.displayName"
          content-class-name="zoom-reference"
        >
          <el-button
            style="padding: 3px 0"
            type="text"
            @click="openReference(reference)"
          >
            {{ $t('table.ProcessActivity.zoomIn') }}
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
      <!-- <div v-for="o in 4" :key="o" class="text item">
        {{'List item ' + o }}
      </div> -->
    </el-card>
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
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
import Filters from '@/utils/ADempiere/filters.js'

export default defineComponent({
  name: 'Reference',

  components: {
    DocumentStatusTag
  },

  props: {
    recordUuid: {
      type: String,
      default: () => ''
    },
    parentUuid: {
      type: String,
      default: () => ''
    },
    tableName: {
      type: String,
      default: () => ''
    },
    tabUuid: {
      type: String,
      default: () => ''
    }
  },

  setup(props, { root }) {
    const currentRecordLogs = ref({ name: 'nada' })
    // const listLogs = ref({})
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
    const validate = (list) => {
      return DOCUMENT_STATUS_COLUMNS_LIST.includes(list.columnName)
    }
    const getterReferences = computed(() => {
      return store.getters.getStoredReferences({
        windowUuid: props.parentUuid,
        tableName: props.tableName,
        recordUuid: props.recordUuid
      })
    })

    function openReference(referenceElement) {
      console.log({ referenceElement })
      if (!isEmptyValue(referenceElement.windowUuid)) {
        const pairsValues = Filters.newInstance()
          .setFiltersWithSQL(referenceElement.whereClause)
          .getAsArray().filter(attribute => !isEmptyValue(attribute.value) && !isEmptyValue(attribute.columnName))
        zoomIn({
          uuid: referenceElement.windowUuid,
          params: {
            filters: pairsValues,
            containerUuid: props.tabUuid
          }
        })
      }
    }
    isEmptyValue

    return {
      currentTabLogs,
      currentRecordLogs,
      typeAction,
      currentKey,
      listLogs,
      // Comuted
      getterReferences,
      // methods
      validate,
      showkey,
      openReference
    }
  }

})
</script>

<style>
.zoom-reference {
  text-align: center !important;
}

.scroll-attachment {
  max-height: 80vh;
}
</style>
