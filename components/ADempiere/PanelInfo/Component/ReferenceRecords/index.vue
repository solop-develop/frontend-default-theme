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
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span>
    <el-card v-if="!isEmptyValue(getterReferences)" style="padding: 10px;">
      <el-descriptions
        :column="1"
        :border="true"
      >
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
            <i class="el-icon-zoom-in" />
            {{ $t('page.processActivity.zoomIn') }}
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div v-else>
      <el-empty />
    </div>
  </span>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'

export default defineComponent({
  name: 'ReferenceRecords',

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

  setup(props) {
    const storedTab = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.tabUuid
      )
    })

    const getterReferences = computed(() => {
      return store.getters.getStoredReferences({
        windowUuid: props.parentUuid,
        tableName: props.tableName,
        recordUuid: props.recordUuid
      })
    })

    function openReference(referenceElement) {
      if (isEmptyValue(referenceElement.windowUuid)) {
        return
      }
      const { keyColumn } = storedTab.value

      const recordId = store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: props.tabUuid,
        columnName: keyColumn
      })

      const pairsValues = [{
        columnName: keyColumn,
        value: Number(recordId)
      }]

      zoomIn({
        uuid: referenceElement.windowUuid,
        params: {
          filters: pairsValues,
          containerUuid: props.tabUuid
        }
      })
      store.commit('setShowLogs', false)
    }

    return {
      // Computeds
      getterReferences,
      // Methods
      openReference
    }
  }
})
</script>

<style>
.zoom-reference {
  text-align: center !important;
}
</style>
