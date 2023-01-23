<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Elsio Sanchez Elsiosanches@gmail.com https://github.com/Elsiosanchez
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
    <el-container style="height: 100% !important;">
      <el-main style="overflow: auto;">
        <el-empty v-if="isEmptyValue(listIssues)" style="height: 600px;" />
        <!-- <el-scrollbar v-else class="scroll-chats"> -->
        <el-timeline v-else>
          <el-timeline-item
            v-for="(issues, key) in listIssues"
            :key="key"
            :timestamp="translateDateByLong(issues.created)"
            type="primary"
            placement="top"
            style="padding-top: 0px;padding-bottom: 0px;"
          >
            <el-card shadow="hover" style="padding-left: 0px;padding-right: 0px;">
              <el-popover
                placement="top-start"
                width="450"
                trigger="hover"
              >
                <b> {{ $t('issues.created') }} : </b>{{ issues.user_name }} <i class="el-icon-user-solid" /> <br>
                <b> {{ $t('issues.typeOfRequest') }} : </b>{{ issues.request_type.name }} <br>
                <b> {{ $t('issues.status') }} : </b><br>
                <b> {{ $t('issues.issues') }} : </b><br>
                <b> {{ $t('issues.summary') }} : </b>{{ issues.summary }} <br>
                <b> {{ $t('issues.assigned') }} : </b>{{ issues.sales_representative.name }} <br>
                <el-button slot="reference" type="text" style="color: black;">
                  <b>
                    {{ issues.document_no }}
                    {{ issues.subject }}
                  </b>
                </el-button>
              </el-popover>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <!-- </el-scrollbar> -->
      </el-main>
      <!-- <el-footer style="height: 30% !important;overflow: auto;">
        <div class="editor-container">
          <div id="ChatEditor" />
          <el-button
            type="primary"
            icon="el-icon-check"
            style="float: right;"
            @click="sendComment"
          />
          <el-button
            type="info"
            plain
            style="float: right;margin-right: 1%;"
            @click="cleatChatEditor('')"
          >
            <svg-icon icon-class="layers-clear" />
          </el-button>
        </div>
      </el-footer> -->
    </el-container>
  </span>
</template>

<script>
import {
  defineComponent, computed, ref, onMounted, nextTick
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Components and Mixins
import '@toast-ui/chart/dist/toastui-chart.css'
import chart from '@toast-ui/editor-plugin-chart'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification'
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'RecordIssues',

  components: {
    Comment
  },

  props: {
    tableName: {
      type: String,
      required: false
    },
    recordId: {
      type: Number,
      required: false
    }
  },

  setup(props) {
    const message = ref('')
    const chatEditor = ref(null)
    const chatViwer = ref(null)

    const chartOptions = {
      minWidth: 100,
      maxWidth: 600,
      minHeight: 100,
      maxHeight: 300
    }

    const listIssues = computed(() => {
      return store.getters.getListIssues
    })

    function sendComment() {
      if (isEmptyValue(chatEditor.value.getMarkdown())) {
        showMessage({
          message: lang.t('window.containerInfo.emptyNote'),
          type: 'warning'
        })
        return
      }
      store.dispatch('createChatEntry', {
        tableName: props.tableName,
        recordId: props.recordId,
        comment: chatEditor.value.getMarkdown()
      })
        .then(() => {
          cleatChatEditor('')
        })
    }

    function cleatChatEditor(params) {
      chatEditor.value.setMarkdown(params)
    }

    function viwer(params, key) {
      if (isEmptyValue(params)) {
        return
      }
      params.forEach(element => {
        const initialValue = element.characterData
        nextTick(() => {
          // eslint-disable-next-line
          chatViwer.value = new Editor.factory({
            el: document.querySelector(`#ChatViwer${element.id}`),
            viewer: true,
            initialValue,
            plugins: [[chart, chartOptions]]
          })
        })
      })
    }
    // watch(listChats, (newValue, oldValue) => {
    //   viwer(newValue)
    // })

    onMounted(() => {
      chatEditor.value = new Editor({
        el: document.querySelector('#ChatEditor'),
        initialValue: message.value,
        height: '200px',
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        plugins: [[chart, chartOptions]]
      })
      chatEditor.value.getMarkdown()
      viwer()
    })

    return {
      message,
      listIssues,
      sendComment,
      chatEditor,
      cleatChatEditor,
      chatViwer,
      viwer,
      translateDateByLong
    }
  }
})
</script>

<style>
.p {
  margin: 0px !important;
}
.el-card__body {
  padding: 20px;
  padding-top: 0px !important;
  padding-right: 20px;
  padding-bottom: 0px!important;
  padding-left: 20px;
}
.tui-editor .te-preview-style-vertical .te-preview {
  float: left;
  width: auto !important;
}
.te-preview {
    overflow: auto;
    width: auto !important;
    padding: 0 25px;
    height: 100%;
}
</style>
<style scoped>
.scroll-chats {
  width: 100%;
  height: 500px;
}
</style>
