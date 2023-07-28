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
  <el-popover
    placement="bottom"
    trigger="click"
  >
    <el-descriptions class="margin-top" :column="1" border>
      <el-descriptions-item :label="$t('component.attachment.fileName')">
        {{ resourceReference.name }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('component.attachment.fileSize')">
        {{ formatFileSize(resourceReference.file_size) }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('component.attachment.fileFormat')">
        {{ resourceReference.content_type }}
      </el-descriptions-item>

      <el-descriptions-item :label="$t('component.attachment.description')">
        {{ resourceReference.description }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('component.attachment.message')">
        {{ resourceReference.text_message }}
      </el-descriptions-item>
    </el-descriptions>

    <el-button
      slot="reference"
      icon="el-icon-info"
      plain
      v-bind="props"
    />
  </el-popover>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'

// API Request Methods
// import { requestGetResourceReference } from '@/api/ADempiere/user-interface/component/resource'

// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatFileSize } from '@/utils/ADempiere/resource.js'

export default defineComponent({
  name: 'FileInfo',

  props: {
    file: {
      type: Object,
      default: () => {}
    },
    id: {
      type: Number,
      default: -1
    },
    uuid: {
      type: String,
      default: undefined
    },
    resourceName: {
      type: String,
      default: undefined
    },
    imageId: {
      type: Number,
      default: -1
    },
    imageUuid: {
      type: String,
      default: undefined
    },
    archiveId: {
      type: Number,
      default: -1
    },
    archiveUuid: {
      type: String,
      default: undefined
    },
    isEditDescription: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isLoading = ref(false)

    const resourceReference = ref({
      name: 'unknown',
      file_size: 0,
      context_type: 'application/unknown',
      description: '',
      text_message: ''
    })

    // function getResourceReference() {
    //   isLoading.value = false
    //   requestGetResourceReference({
    //     resourceId: props.id,
    //     resourceUuid: props.uuid,
    //     imageId: props.imageId,
    //     imageUuid: props.imageUuid,
    //     resourceName: props.resourceName
    //   })
    //     .then(response => {
    //       resourceReference.value = response
    //     })
    //     .catch(error => {
    //       console.warn(error)
    //     })
    //     .finally(() => {
    //       isLoading.value = false
    //     })
    // }

    // if (isEmptyValue(props.file)) {
    //   getResourceReference()
    // } else {
    //   resourceReference.value = props.file
    // }

    return {
      isLoading,
      resourceReference,
      // Methods
      formatFileSize
    }
  }
})
</script>
