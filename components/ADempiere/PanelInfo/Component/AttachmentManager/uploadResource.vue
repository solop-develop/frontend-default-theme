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
  <form id="form" enctype="multipart/form-data">
    <el-upload
      ref="upload"
      class="upload-demo"
      name="avatar"
      action="#"
      :auto-upload="false"
    >
      <el-button slot="trigger" size="small" type="primary">
        {{ $t('window.containerInfo.attachment.selectFile') }}
      </el-button>

      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">
        {{ $t('window.containerInfo.attachment.uploadFile') }}
      </el-button>
    </el-upload>
  </form>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

import lang from '@/lang'

// API Request Methods
import request from '@/utils/request'
// import { uploadAttachment } from '@/api/ADempiere/user-interface/resources.js'

// Utils and Helper Methods
import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'UploadResource',

  setup(props, { refs }) {
    const submitUpload = () => {
      const form = document.getElementById('form')
      const formData = new FormData(form)

      request({
        url: 'http://0.0.0.:8085/api/adempiere/user-interface/component/resource/save-attachment',
        method: 'post',
        data: formData
      })
        .then(resData => {
          showMessage({
            message: lang.t('window.containerInfo.attachment.success'),
            type: 'success'
          })
          refs.upload.submit()
          refs.upload.clearFiles()
          refs.upload.uploadFiles = []
        })
        .catch(err => {
          console.warn({ err })
          showMessage({
            message: lang.t('window.containerInfo.attachment.error'),
            type: 'error'
          })
        })
    }

    return {
      submitUpload
    }
  }
})
</script>
