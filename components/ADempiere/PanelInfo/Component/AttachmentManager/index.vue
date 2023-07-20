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
  <div
    v-if="!isLoading"
    style="margin-left: 15px; margin-right: 20px;"
  >
    <div v-if="isEmptyValue(attachmentList)">
      <el-empty />
    </div>

    <el-row :gutter="20" style="margin-left: 0px; margin-right: 10px; margin-bottom: 10px;">
      <el-col :span="12">
        <upload-resource
          style="float: left;"
          :table-name="tableName"
          :record-id="recordId"
          :record-uuid="recordUuid"
        />
      </el-col>

      <el-col :span="8" style="float: right; text-align: end;">
        <el-button
          v-if="isList"
          plain
          style="color: black;"
          @click="isList = !isList"
        >
          <i class="el-icon-menu" />
          {{ $t('component.attachment.toggleView') }}
        </el-button>
        <el-button
          v-else
          plain
          style="color: black;"
          @click="isList = !isList"
        >
          <svg-icon icon-class="list" />
          {{ $t('component.attachment.toggleView') }}
        </el-button>
      </el-col>
    </el-row>

    <!-- Mosaic View -->
    <el-row v-if="!isList" :gutter="20">
      <el-col v-for="(file, key) in attachmentList" :key="key" :span="8" style="line-height: 20px; margin-bottom: 20px;">
        <el-card shadow="hover" :class="{ 'image-attachment': true, 'is-current': isCurrent(file) }">
          <div v-if="isSelectable" slot="header" class="clearfix" style="margin-top: 16px; margin-bottom: 16px;">
            <el-radio
              v-model="resourceReference.id"
              :label="file.id"
              @click="resourceReference = file"
            >
              {{ file.name }}
            </el-radio>
          </div>
          <p
            v-else
            style="box-sizing: border-box;overflow: hidden;text-overflow: ellipsis;white-space: normal;word-break: break-all;"
          >
            {{ file.name }}
          </p>

          <el-image
            class="image-card-attachment"
            :src="file.src"
            fit="contain"
            :preview-src-list="previewList"
            style="padding-left: 0px; padding-right: 0px;border: 1px solid #b8babca3;"
          />
          <span>{{ formatFileSize(file.file_size) }}</span>
          <br>

          <el-button
            icon="el-icon-download"
            plain
            style="margin-bottom: 10px;"
            @click="handleDownload(file)"
          />
          <el-button
            icon="el-icon-delete"
            plain
            style="margin-bottom: 10px;"
            @click="handleRemove(file)"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- List View -->
    <el-row v-else :gutter="20">
      <el-col v-for="(file, key) in attachmentList" :key="key" :span="24">
        <el-card shadow="hover" :class="{ 'image-attachment': true, 'is-current': isCurrent(file) }">
          <div style="float: left;width: 20%; height: 100px;">
            <el-image
              class="image-card-attachment"
              :src="file.src"
              fit="contain"
              :preview-src-list="previewList"
              style="padding-left: 0px; padding-right: 0px;border: 1px solid #b8babca3;width: 150px;height: 100px;float: left;"
            />
          </div>
          <div style="float: left;padding-top: 2%;">
            <el-radio
              v-if="isSelectable"
              v-model="resourceReference.id"
              :label="file.id"
              @click="resourceReference = file"
            >
              {{ file.name }}
            </el-radio>
            <p
              v-else
              style="box-sizing: border-box;overflow: hidden;text-overflow: ellipsis;white-space: normal;word-break: break-all;"
            >
              {{ file.name }}
            </p>
            <!-- <b>{{ file.name }}</b> -->
            <br>
            <span>{{ formatFileSize(file.file_size) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>

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
  formatFileSize,
  getImagePath,
  getImageFromContentType
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
    isSelectable: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    // Ref
    const dialogImageUrl = ref('')
    const isLoadeDialogFileUrl = ref(false)
    const dialogVisible = ref(false)
    const disabled = ref(false)
    const pdfAttachment = ref([])
    const imageAttachment = ref([])
    const isList = ref(false)

    // Computed
    // const listImageAll = computed(() => {
    //   if (imageAttachment.value) {
    //     return imageAttachment.value.concat(pdfAttachment.value)
    //   }
    //   return []
    // })

    // const attachmentStored = computed(() => {
    //   const storedAttachment = store.getters.getAttachment
    //   if (isEmptyValue(storedAttachment)) {
    //     return undefined
    //   }
    //   if (storedAttachment.tableName !== props.tableName) {
    //     return undefined
    //   }
    //   if (!isSameValues(storedAttachment.recordId, props.recordId) && !isSameValues(storedAttachment.recordUuid, props.recordUuid)) {
    //     return undefined
    //   }
    //   return store.getters.getAttachment
    // })

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
          return {
            ...element,
            src: getSurceFile(element)
          }
        })
      }
    })

    const previewList = computed(() => {
      return attachmentList.value.map(file => file.src)
    })
    const imageKey = ref(0)

    const resourceReference = computed({
      set(value) {
        store.commit('setResourceReference', value)
      },
      get() {
        return store.getters.getResourceReference
      }
    })

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
      imageKey.value = attachmentList.value.findIndex(list => list.src === file.src)
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
        const imagen = await fetch(file.src)
        const imagenblob = await imagen.blob()
        const imageURL = URL.createObjectURL(imagenblob)
        link = document.createElement('a')
        link.href = imageURL
        link.download = file.name
        link.click()
        return
      }

      requestResource({
        resourceUuid: file.uuid,
        resourceName: file.file_name
      }).then(response => {
        buildLinkHref({
          fileName: file.name,
          mimeType: file.content_type,
          outputStream: response, // response.data
          isDownload: true
        })
      })
    }

    function getSurceFile(file) {
      if (file.content_type.includes('image')) {
        return getImageFromSource(file).uri
      }
      return getImageFromContentType({
        contentType: file.content_type,
        fileName: file.file_name
      })
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

    function isCurrent(file) {
      if (!props.isSelectable) {
        return false
      }
      if (isEmptyValue(resourceReference.value)) {
        return false
      }
      return resourceReference.value.id === file.id
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
      // listImageAll,
      attachmentList,
      // attachmentStored,
      resourceReference,
      imageKey,
      previewList,
      // Methods
      isCurrent,
      handleRemove,
      handlePictureCardPreview,
      handleDownload,
      formatFileSize
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
.el-card.is-current {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #eaf5fe;
  border: 1px solid #36a3f7;
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
