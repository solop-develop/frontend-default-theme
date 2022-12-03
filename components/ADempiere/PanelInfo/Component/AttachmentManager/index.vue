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
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span>
    <div v-if="isEmptyValue(attachmentList)">
      <el-empty />
    </div>

    <el-upload
      ref="upload"
      action="#"
      list-type="picture-card"
      :auto-upload="true"
      :file-list="attachmentList"
      :before-upload="beforeAvatarUpload"
    >
      <i slot="default" class="el-icon-plus" />
      <div slot="file" slot-scope="{file}">
        <el-image
          class="image-card-attachment"
          :src="file.image"
          fit="contain"
        >
          <div slot="error" class="image-slot-error">
            <h1 class="image-slot-error">
              <b>
                .{{ getExtensionFromFile(file.file_name) }}
              </b>
            </h1>
          </div>
        </el-image>

        <span class="el-upload-list__item-actions">
          <span
            class="el-upload-list__item-preview"
            @click="handlePictureCardPreview(file)"
          >
            <i class="el-icon-zoom-in" />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleDownload(file)"
          >
            <i class="el-icon-download" />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <i class="el-icon-delete" />
          </span>
        </span>
      </div>
    </el-upload>
    <br>

    <span>
      <upload-resource />
    </span>

    <el-dialog
      v-if="!isEmptyValue(dialogImageUrl.content_type)"
      :visible.sync="dialogVisible"
      :title="dialogImageUrl.file_name"
      :append-to-body="true"
      :show-close="true"
    >
      <span v-if="!isLoadeDialogFileUrl">
        <img v-if="dialogImageUrl.content_type.includes('image')" width="100%" :src="dialogImageUrl.src" alt="">
        <file-render
          v-else
          :format="'pdf'"
          :content="dialogImageUrl.src"
          :src="dialogImageUrl.src"
          :mime-type="dialogImageUrl.content_type"
          :name="dialogImageUrl.file_name"
        />
      </span>
      <loading-view
        v-else
        key="attachment-loading"
      />
    </el-dialog>
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import axios from 'axios'
import store from '@/store'

// API Request Methods
import { deleteResourceReference } from '@/api/ADempiere/user-interface/component/resource'

// Components and Mixins
import FileRender from '@theme/components/ADempiere/FileRender/index.vue'
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'
import UploadResource from './uploadResource.vue'

// Utils and Helper Methods
import { getImagePath } from '@/utils/ADempiere/resource.js'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { getExtensionFromFile } from '@/utils/ADempiere/resource.js'

export default defineComponent({
  name: 'AttachmentManager',

  components: {
    FileRender,
    LoadingView,
    UploadResource
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerUuid: {
      type: String,
      required: false
    },
    recordId: {
      type: Number,
      default: 0
    },
    tableName: {
      type: String,
      default: ''
    },
    recordUuid: {
      type: String,
      default: ''
    },
    isActiveTab: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    /**
     * Refs
     */
    const dialogImageUrl = ref('')
    const isLoadeDialogFileUrl = ref(false)
    const dialogVisible = ref(false)
    const disabled = ref(false)
    const pdfAttachment = ref([])
    const imageAttachment = ref([])

    /**
     * Computed
     */
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
          if (element.content_type.includes('image')) {
            return {
              ...element,
              image: getImageFromSource(element)
            }
          }
          return {
            ...element,
            image: converFile(element)
          }
        })
      }
    })

    /**
     * Methods
     */
    const handleRemove = (file) => {
      deleteResourceReference({
        resourceUuid: file.resource_uuid,
        resourceName: file.file_name
      }).then(() => {
        const resourceReferencesList = attachmentList.value.filter(resourceReference => {
          return resourceReference.resource_uuid !== file.resource_uuid ||
            resourceReference.file_name !== file.file_name
        })
        attachmentList.value = resourceReferencesList
      })
    }

    const handlePictureCardPreview = (file) => {
      // if (file.content_type.includes('application/pdf')) {
      isLoadeDialogFileUrl.value = true
      dialogImageUrl.value = handleDownload(file, false)
      dialogVisible.value = true
      //   return
      // }
      // dialogImageUrl.value = file
      // dialogVisible.value = true
    }
    const handleDownload = async(file, isDownload = true) => {
      if (isEmptyValue(file.url)) return
      let link
      const urlImage = await axios.get(file.url.uri)
        .then(response => {
          const { data } = response
          const blob = new Blob([Uint8Array.from(data.result.data)], {
            type: 'application/pdf'
          })
          link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = file.file_name
          if (isDownload) {
            link.click()
          }
          dialogImageUrl.value = {
            ...file,
            src: link.href
          }
          isLoadeDialogFileUrl.value = false
        })
      return {
        urlImage,
        link
      }
    }

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
        default:
          urlImage
          break
      }
      return urlImage
    }

    const beforeAvatarUpload = (file) => {
      listImageAll.value.push({
        name: file.name,
        type: file.type,
        status: 'newImage',
        uuid: file.uid,
        url: URL.createObjectURL(file)
      })
    }
    const getImageFromSource = (file) => {
      const image = getImagePath({
        file: file.file_name,
        width: 900,
        height: 500
      })
      return image.uri
    }
    const octetStream = (file) => {
      let urlImage
      if (file.file_name.includes('.xlsx')) {
        urlImage = require('@/image/ADempiere/attachment/xlsx.png')
      } else if (file.file_name.includes('.rar')) {
        urlImage = require('@/image/ADempiere/attachment/rar.png')
      } else if (file.file_name.includes('.sql')) {
        urlImage = require('@/image/ADempiere/attachment/sql.png')
      }
      return urlImage
    }

    return {
      dialogImageUrl,
      isLoadeDialogFileUrl,
      dialogVisible,
      disabled,
      imageAttachment,
      pdfAttachment,
      // computed
      listImageAll,
      attachmentList,
      // methods
      beforeAvatarUpload,
      converFile,
      handleRemove,
      handlePictureCardPreview,
      handleDownload,
      // image
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
