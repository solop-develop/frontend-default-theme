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
  <form
    enctype="multipart/form-data"
    @submit.prevent="notSubmitForm"
  >
    <el-upload
      ref="uploadComponent"
      v-bind="commonsProperties"
      :action="endPointUploadResource"
      :data="additionalData"
      :headers="additionalHeaders"
      drag
      name="file"
      :show-file-list="false"
      :multiple="false"
      :before-upload="isValidUploadHandler"
      :on-success="loadedSucess"
      :on-change="handleChange"
    >
      <img
        v-if="value"
        :alt="altImage"
        :src="imageSource"
        class="image-file"
      >
      <!-- <i v-else class="el-icon-plus icon-image-upload" /> -->
      <svg-icon v-else icon-class="cloud_upload" class="icon-image-upload" style="font-size: 45px;" />
    </el-upload>
  </form>
</template>

<script>
import lang from '@/lang'

// Components and Mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldWithDisplayColumn from '@theme/components/ADempiere/FieldDefinition/mixin/mixinWithDisplayColumn.js'

// Constants
import { config } from '@/utils/ADempiere/config'
import { BEARER_TYPE } from '@/utils/auth'
import { UUID_PATTERN } from '@/utils/ADempiere/recordUtil'
import { RESOURCE_TYPE_IMAGE } from '@/utils/ADempiere/resource'

// API Request Methods
// import { getResource } from '@/api/ADempiere/field/binary.js'
import {
  // requestUploadAttachment,
  setResourceReference
} from '@/api/ADempiere/user-interface/component/resource'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { getToken } from '@/utils/auth'
import {
  getImagePath
} from '@/utils/ADempiere/resource.js'
import { showMessage } from '@/utils/ADempiere/notification'

export default {
  name: 'FieldImage',

  mixins: [
    fieldMixin,
    fieldWithDisplayColumn
  ],

  props: {
    // receives the property that is an object with all the attributes
    binary: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      endPointUploadResource: config.adempiere.api.url + 'user-interface/component/resource/save-attachment',
      additionalData: {},
      fileResource: {},
      valuesImage: [{
        identifier: 'undefined',
        value: '',
        isLoaded: true
      }]
    }
  },

  computed: {
    cssClassCustomField() {
      return ' custom-field-image '
    },
    altImage() {
      const displayedAlt = this.displayedValue
      if (isEmptyValue(displayedAlt)) {
        return this.value
      }
      return displayedAlt.replace(UUID_PATTERN, '')
        .replace(/^-{0,1}/, '')
    },
    imageSource() {
      const displayedAlt = this.displayedValue
      if (isEmptyValue(displayedAlt)) {
        return undefined
      }
      const { uri } = getImagePath({
        file: displayedAlt,
        width: 900,
        height: 500
      })
      return uri
    },
    additionalHeaders() {
      const token = getToken()
      let bearerToken = token
      // Json Web Token
      if (!isEmptyValue(bearerToken) && !bearerToken.startsWith(BEARER_TYPE)) {
        bearerToken = `${BEARER_TYPE} ${token}`
      }
      return {
        Authorization: bearerToken
      }
    }
  },

  methods: {
    isValidUploadHandler(file) {
      return new Promise((resolve, reject) => {
        setResourceReference({
          resourceType: RESOURCE_TYPE_IMAGE,
          resourceId: this.value,
          fileName: file.name,
          fileSize: file.size
        }).then(response => {
          if (response.code >= 400) {
            reject(response)
          }

          this.fileResource = response
          this.additionalData = {
            resource_uuid: response.uuid,
            file_name: response.file_name
          }
          resolve(true)
        }).catch(error => {
          showMessage({
            message: error.message || error.result || lang.t('component.attachment.error'),
            type: 'error'
          })
          reject(error)
        })
      })
    },
    handleChange(file, fileList) {
    },
    handleError(error, file, fileList) {
      return showMessage({
        type: 'error',
        message: error.message || error.result || lang.t('component.attachment.error')
      })
    },
    loadedSucess(response, file, fileList) {
      if (response.code >= 400) {
        setTimeout(() => {
          fileList.pop()
        }, 500)
        return this.handleError(
          new Error(response.result),
          file,
          fileList
        )
      }
      const { result } = response

      this.value = result.resource_id
      this.displayedValue = result.file_name
      this.preHandleChange(this.value)
    }
  }
}
</script>

<style lang="scss">
.custom-field-image {
  .el-upload {
    border: 1px dashed #818181;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #3095fb;
      box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.2);
    }
  }

  .icon-image-upload {
    height: 178px;
    text-align: center;
    color: #8c939d;
  }
  svg.icon-image-upload {
    font-size: 45px;
  }
  i.icon-image-upload {
    font-size: 28px;
    width: 178px;
  }

  .image-file {
    // align center alt text
    display: flex;
    // display: block;
    align-items: center;
    justify-content: center;

    width: 178px;
    height: 178px;
  }
}
</style>
