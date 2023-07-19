<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <span
    v-if="!isLoading"
  >
    <div v-if="isEmptyValue(attachmentList)">
      <el-empty />
    </div>
    <el-row :gutter="20" style="margin-left: 0px; margin-right: 5px; text-align: end;">
      <el-button v-if="isList" plain type="text" style="color: black;" @click="isList = !isList">
        <b style="font-size: 28px;">
          <svg-icon icon-class="grid-gallery" />
        </b>
      </el-button>
      <el-button v-else plain type="text" style="color: black;" @click="isList = !isList">
        <b style="font-size: 28px;">
          <svg-icon icon-class="list-gallery" />
        </b>
      </el-button>
    </el-row>

    <!-- Mosaic View -->
    <el-row v-if="!isList" :gutter="20">
      <el-col v-for="(file, key) in attachmentList" :key="key" :span="8">
        <el-card shadow="hover" class="image-attachment">
          <p style="box-sizing: border-box;overflow: hidden;text-overflow: ellipsis;white-space: normal;word-break: break-all;"> {{ file.title }} </p>
          <el-image
            class="image-card-attachment"
            :src="file.content_type.includes('image') ? getImageFromSource(file).uri : converFile(file).uri"
            fit="contain"
            :preview-src-list="previewList"
            style="padding-left: 0px; padding-right: 0px;border: 1px solid #b8babca3;"
          />
          <el-button
            icon="el-icon-download"
            plain
            style="margin-bottom: 10px;"
            @click="handleDownload(file)"
          />
          <el-button
            icon="el-icon-delete"
            plain style="margin-bottom: 10px;"
            @click="handleRemove(file)"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- List View -->
    <el-row v-else :gutter="20">
      <el-col v-for="(file, key) in attachmentList" :key="key" :span="24">
        <el-card shadow="hover" class="image-attachment">
          <div style="float: left;width: 20%; height: 100px;">
            <el-image
              class="image-card-attachment"
              :src="file.imageDate.uri"
              fit="contain"
              :preview-src-list="previewList"
              style="padding-left: 0px; padding-right: 0px;border: 1px solid #b8babca3;width: 150px;height: 100px;float: left;"
            />
          </div>
          <div style="float: left;padding-top: 5%;">
            <span> {{ file.title }} </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <br>

    <span>
      <upload-resource
        :table-name="tableName"
        :record-id="recordId"
        :record-uuid="recordUuid"
      />
    </span>
  </span>
  <loading-view
    v-else
    key="Attachment-Manager-Loading"
  />
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

// import axios from 'axios'
import store from '@/store'

// API Request Methods
import {
  requestResource,
  deleteResourceReference
} from '@/api/ADempiere/user-interface/component/resource'

// Components and Mixins
import FileRender from '@theme/components/ADempiere/FileRender/index.vue'
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'
import UploadResource from './uploadResource.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import {
  buildLinkHref,
  getExtensionFromFile,
  getImagePath,
} from '@/utils/ADempiere/resource.js'

export default defineComponent({
  name: 'AttachmentManager',

  components: {
    FileRender,
    LoadingView,
    UploadResource
  },

  props: {
    tableName: {
      type: String,
      default: ''
    },
    recordId: {
      type: Number,
      default: 0
    },
    recordUuid: {
      type: String,
      default: ''
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    // Ref
    const dialogImageUrl = ref('')
    const isLoadeDialogFileUrl = ref(false)
    const dialogVisible = ref(false)
    const disabled = ref(false)
    const pdfAttachment = ref([])
    const imageAttachment = ref([])
    const isList = ref(false)

    // Computed
    const listImageAll = computed(() => {
      if (imageAttachment.value) {
        return imageAttachment.value.concat(pdfAttachment.value)
      }
      return []
    })

    const attachmentList = computed({
      set(value) {
        store.commit('setListAttachment', value)
      },
      get() {
        const storedResourcesList = store.getters.getListAttachment
        if (isEmptyValue(storedResourcesList)) {
          return []
        }
        return storedResourcesList.map(element => {
          const valueToReplace = element.uuid + '-'
          if (element.content_type.includes('image')) {
            return {
              ...element,
              title: element.file_name.replace(valueToReplace, ''),
              imageDate: getImageFromSource(element)
            }
          }
          return {
            ...element,
            title: element.file_name.replace(valueToReplace, ''),
            imageDate: converFile(element)
          }
        })
      }
    })

    const previewList = computed(() => {
      return attachmentList.value.map(file => file.imageDate.uri)
    })
    const imageKey = ref(0)
    // Methods

    /**
     * Handle Remove
     * @param {Object} file
     */
    const handleRemove = (file) => {
      deleteResourceReference({
        resourceUuid: file.uuid,
        resourceName: file.file_name
      }).then(() => {
        const resourceReferencesList = attachmentList.value.filter(resourceReference => {
          return resourceReference.uuid !== file.uuid ||
            resourceReference.file_name !== file.file_name
        })
        attachmentList.value = resourceReferencesList
      })
    }

    /**
     * Handle Picture Card Preview
     * @param {Object} file
     */
    const handlePictureCardPreview = (file) => {
      imageKey.value = attachmentList.value.findIndex(list => list.imageDate.uri === file.imageDate.uri)
      // if (file.content_type.includes('application/pdf')) {
      isLoadeDialogFileUrl.value = true
      dialogImageUrl.value = handleDownload(file, false)
      dialogVisible.value = true
    }

    /**
     * Handle Download
     * @param {Object} file
     * @param {Boolean} isDownload
     */
    const handleDownload = async(file, isDownload = true) => {
      let link
      if (file.content_type.includes('image')) {
        const imagen = await fetch(file.imageDate.uri)
        const imagenblob = await imagen.blob()
        const imageURL = URL.createObjectURL(imagenblob)
        link = document.createElement('a')
        link.href = imageURL
        link.download = file.title
        link.click()
        return
      }

      requestResource({
        resourceUuid: file.uuid,
        resourceName: file.title
      }).then(response => {
        buildLinkHref({
          fileName: file.title,
          mimeType: file.content_type,
          outputStream: response, // response.data
          isDownload: true
        })
      })
    }

    /**
     * Conver File
     * @param {Object} image
     */
    const converFile = (image) => {
      let urlImage
      switch (image.content_type) {
        case 'application/pdf':
          urlImage = require('@/image/ADempiere/attachment/pdf.png')
          break
        case 'application/x-javascript':
          urlImage = require('@/image/ADempiere/attachment/javascript.png')
          break
        case 'application/octet-stream':
          urlImage = octetStream(image)
          break
        case 'text/csv':
          urlImage = require('@/image/ADempiere/attachment/csv.png')
          break
        case 'text/plain':
          urlImage = require('@/image/ADempiere/attachment/txt.png')
          break
        case 'application/vnd.ms-excel':
          urlImage = require('@/image/ADempiere/attachment/xlsx.png')
          break
        default:
          urlImage
          break
      }
      return {
        uri: urlImage
      }
    }

    /**
     * Image From Source
     * @param {Object} file
     */
    const getImageFromSource = (file) => {
      const image = getImagePath({
        file: file.file_name,
        width: 900,
        height: 500
      })
      return image
    }

    /**
     * Octet Stream
     * @param {Object} file
     */
    const octetStream = (file) => {
      let urlImage
      if (['.xlsx', '.xls'].includes(file.file_name)) {
        urlImage = require('@/image/ADempiere/attachment/xlsx.png')
      } else if (file.file_name.includes('.rar')) {
        urlImage = require('@/image/ADempiere/attachment/rar.png')
      } else if (file.file_name.includes('.sql')) {
        urlImage = require('@/image/ADempiere/attachment/sql.png')
      }
      return urlImage
    }

    return {
      // Ref
      dialogImageUrl,
      isLoadeDialogFileUrl,
      dialogVisible,
      disabled,
      imageAttachment,
      pdfAttachment,
      isList,
      // Computed
      listImageAll,
      attachmentList,
      imageKey,
      previewList,
      // Methods
      converFile,
      handleRemove,
      handlePictureCardPreview,
      handleDownload,
      // Image
      getImageFromSource,
      octetStream,
      getExtensionFromFile
    }
  }
})
</script>

<style scoped>
  .image-slot-error {
    text-align: center;
    padding-top: 20%;
  }
  .image-card-attachment {
    width: 100%;
    height: 150px;
  }
</style>
<style>
.scroll-attachment {
  max-height: 80vh;
}
.el-upload--picture-card {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 148px;
  height: 148px;
  cursor: pointer;
  line-height: 146px;
  vertical-align: top;
  width: 100%;
}
.el-upload--picture-card {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 148px;
  height: 148px;
  cursor: pointer;
  line-height: 146px;
  vertical-align: top;
  display: none;
  width: 100%;
}
</style>
<style lang="scss">
.image-attachment {
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 0px;
    padding-bottom: 0px!important;
    padding-left: 0px;
    text-align: center;
  }text-align: center;
  .el-card:hover {
    background-color: #eaf5fe;
    border: 1px solid #36a3f7;
  }
}
.image-attachment:hover {
  background-color: #eaf5fe;
  border: 1px solid #36a3f7;
}
</style>
