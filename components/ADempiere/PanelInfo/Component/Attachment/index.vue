<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com www.erpya.com
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
    <!-- <el-card v-if="!isEmptyValue(newImage)" shadow="always">
      <div slot="header" class="clearfix">
        <span>{{ $t('window.containerInfo.attachment.newFiles') }}</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          icon="el-icon-upload2"
          @click="submitUpload"
        >
          {{ $t('window.containerInfo.attachment.uploadFiles') }}
        </el-button>
      </div>
      <el-image
        v-for="(file, key) in newImage"
        :key="key"
        style="width: 150px;height: 150px;margin-left: 1%;margin-right: 1%;"
        :src="file"
        fit="fill"
        :preview-src-list="newImage"
      />
    </el-card> -->
    <div v-if="!Attachment">
      <el-empty />
    </div>
    <el-upload
      ref="upload"
      action="#"
      list-type="picture-card"
      :auto-upload="true"
      :file-list="Attachment"
      :before-upload="beforeAvatarUpload"
    >
      <i slot="default" class="el-icon-plus" />
      <div slot="file" slot-scope="{file}">
        <el-image
          v-if="file.content_type.includes('image')"
          style="width: 100%; height: 250px"
          :src="file.image"
          :preview-src-list="listImage"
        />

        <img :src="file.image" alt="" class="el-upload-list__item-thumbnail">
        <span class="el-upload-list__item-actions">
          <span
            v-show="file.content_type.includes('image')"
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
      <form id="form" enctype="multipart/form-data">
        <el-upload
          ref="upload"
          class="upload-demo"
          name="avatar"
          action="#"
          :auto-upload="false"
        >
          <el-button slot="trigger" size="small" type="primary">Selecciona un archivo</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">Cargar al servidor</el-button>
        </el-upload>
      </form>
    </span>
    <el-dialog
      :visible.sync="dialogVisible"
      :append-to-body="true"
      :show-close="false"
    >
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import {
  buildImageFromArrayBuffer
  // buildLinkHref
} from '@/utils/ADempiere/resource.js'
// import { uploadAttachment } from '@/api/ADempiere/user-interface/resources.js'
import { getImagePath } from '@/utils/ADempiere/resource.js'
// import { buildBlobAndValues } from '@/utils/ADempiere/resource'
import request from '@/utils/request'
import axios from 'axios'
import { showMessage } from '@/utils/ADempiere/notification'
import lang from '@/lang'
import store from '@/store'

export default defineComponent({
  name: 'Attachment',
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
  setup(props, { root, refs }) {
    /**
     * Refs
     */
    const dialogImageUrl = ref('')
    const dialogVisible = ref(false)
    const disabled = ref(false)
    const organizationBackground = ref('')
    const organizationImagePath = ref('')
    const currentImageOfProduct = ref('')
    const pdfAttachment = ref([])
    const newImage = ref([])
    const imageAttachment = ref([])
    const fileList = ref([])
    /**
     * Computed
     */
    const listImageAll = computed(() => {
      if (imageAttachment.value) {
        return imageAttachment.value.concat(pdfAttachment.value)
      }
      return []
    })
    const listImage = computed(() => {
      if (listImageAll) {
        return listImageAll.value.map(image => image.image)
      }
      return []
    })
    const Attachment = computed(() => {
      if (store.getters.getAttachment) {
        const cafe = store.getters.getAttachment.map(element => {
          // return {
          //   ...element,
          //   image: 'data:image/png;base64,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'
          // }
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
        return cafe
      }
      return store.getters.getAttachment
    })
    /**
     * Methods
     */
    const handleRemove = (file) => {
      console.log(file)
    }
    const handlePictureCardPreview = (file) => {
      dialogImageUrl.value = file.image
      dialogVisible.value = true
    }
    const handleDownload = async(file) => {
      const urlImage = await axios.get(file.url.uri)
        .then(response => {
          const { data } = response
          const blob = new Blob([Uint8Array.from(data.result.data)], {
            type: 'application/pdf'
          })
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = file.file_name
          link.click()
        })
      return urlImage
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
    const converImage = async(image) => {
      const urlImage = await axios.get(image.url.uri)
        .then(response => {
          return {
            name: 'file',
            type: image.content_type,
            url: buildImageFromArrayBuffer({
              arrayBuffer: response.data.result.data
            })
          }
        })
        .catch(() => {
          return {
            name: '',
            type: image.content_type,
            url: ''
          }
        })
      return urlImage
    }
    const submitUpload = () => {
      const form = document.getElementById('form')
      const formData = new FormData(form)
      request({
        url: 'http://0.0.0.:8085/api/adempiere/user-interface/component/attachment/save-attachment',
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
    const beforeAvatarUpload = (file) => {
      listImageAll.value.push({
        name: file.name,
        type: file.type,
        status: 'newImage',
        uuid: file.uid,
        url: URL.createObjectURL(file)
      })
      newImage.value.push(URL.createObjectURL(file))
    }
    const getImageFromSource = (file) => {
      const image = getImagePath({
        file: file.file_name,
        width: 300,
        height: 300
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
      dialogVisible,
      disabled,
      newImage,
      fileList,
      imageAttachment,
      pdfAttachment,
      organizationBackground,
      currentImageOfProduct,
      organizationImagePath,
      // computed
      listImage,
      listImageAll,
      Attachment,
      // methods
      // submitUpload,
      submitUpload,
      beforeAvatarUpload,
      converFile,
      // isEmptyValue,
      converImage,
      handleRemove,
      handlePictureCardPreview,
      handleDownload,
      // image
      getImageFromSource,
      octetStream
    }
  }
})
</script>
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
