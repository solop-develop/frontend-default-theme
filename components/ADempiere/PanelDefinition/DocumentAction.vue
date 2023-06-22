<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
  <div>
    isEnabled {{ isEnableRunDocumentAction }}
    <br>
    <br>

    {{ parentUuid }} | {{ containerUuid }}
    <br>
    <br>

    {{ $store.getters.getValueOfFieldOnContainer({
      parentUuid,
      containerUuid,
      columnName: 'DocAction'
    }) }}

    {{ $store.getters.getValueOfFieldOnContainer({
      parentUuid,
      containerUuid,
      columnName: 'DocStatus'
    }) }}

    <br>
    {{ containerManager }}
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

// Utils and Helper Methods
import { isRunableDocumentAction } from '@/utils/ADempiere/dictionary/workflow'

export default defineComponent({
  name: 'DocumentAction',

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const isEnableRunDocumentAction = computed(() => {
      return isRunableDocumentAction({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
    })

    return {
      isEnableRunDocumentAction
    }
  }
})
</script>
