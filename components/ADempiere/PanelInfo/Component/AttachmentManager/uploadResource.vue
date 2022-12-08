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
  <form
    enctype="multipart/form-data"
    @submit.prevent="notSubmitForm"
  >
    <el-upload
      ref="upload"
      :action="endPointUploadResource"
      class="upload-demo"
      name="file"
      :file-list="filesList"
      :data="additionalData"
      :multiple="false"
      :before-upload="isValidUploadHandler"
      :on-success="loadedSucess"
    >
      <el-button slot="trigger" size="small" type="primary">
        <i class="el-icon-upload" />
        {{ $t('window.containerInfo.attachment.selectFile') }}
      </el-button>
    </el-upload>
  </form>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'

import lang from '@/lang'

// Constants
import { config } from '@/utils/ADempiere/config'

// API Request Methods
import {
  // requestUploadAttachment,
  setResourceReference
} from '@/api/ADempiere/user-interface/component/resource'

// Utils and Helper Methods
import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'UploadResource',

  props: {
    tableName: {
      type: String,
      required: true
    },
    recordId: {
      type: Number,
      default: 0
    },
    recordUuid: {
      type: String,
      default: ''
    }
  },

  setup(props) {
    const endPointUploadResource = config.adempiere.api.url + 'user-interface/component/resource/save-attachment'

    const upload = ref(null)
    const filesList = ref([])
    const additionalData = ref({})

    function isValidUploadHandler(file) {
      return new Promise((resolve, reject) => {
        setResourceReference({
          tableName: props.tableName,
          recordId: props.recordId,
          recordUuid: props.recordUuid,
          fileName: file.name,
          fileSize: file.size
        }).then(response => {
          additionalData.value = {
            resource_uuid: response.resource_uuid,
            file_name: response.file_name
          }
          // filesList.value.push(file)
          resolve(true)
        }).catch(error => {
          showMessage({
            message: error.message || lang.t('window.containerInfo.attachment.error'),
            type: 'error'
          })
          reject(false)
        }).finally(() => {
          // upload.value.uploadFiles = filesList.value
        })
      })
    }

    function loadedSucess(response, file, fileList) {
      additionalData.value = {}
    }

    return {
      additionalData,
      endPointUploadResource,
      filesList,
      upload,
      isValidUploadHandler,
      loadedSucess
    }
  }
})
</script>
