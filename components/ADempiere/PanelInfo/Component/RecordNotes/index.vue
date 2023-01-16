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
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span>
    <el-container style="height: 100% !important;">
      <el-main style="overflow: auto;">
        <el-empty v-if="isEmptyValue(listChats)" style="height: 600px;" />
        <!-- <el-scrollbar v-else class="scroll-chats"> -->
        <el-timeline v-else>
          <el-timeline-item
            v-for="(chat, key) in listChats"
            :key="key"
            :timestamp="chat.logDate"
            type="primary"
            placement="top"
            style="padding-top: 0px;padding-bottom: 0px;"
          >
            <el-card shadow="always" class="epale">
              <div :id="'ChatViwer' + chat.id" />
              <!-- {{ viwer(chat.characterData) }} -->
              <!-- <div v-markdown="chat.characterData" style="padding-top: 0px;padding-bottom: 0px;" /> -->
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <!-- </el-scrollbar> -->
      </el-main>
      <el-footer style="height: 30% !important;overflow: auto;">
        <div class="editor-container">
          <!-- <markdown-editor v-model="message" height="200px" /> -->
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
      </el-footer>
    </el-container>
  </span>
</template>

<script>
import {
  defineComponent, computed, ref, onMounted, watch, nextTick
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

export default defineComponent({
  name: 'RecordNotes',

  components: {
    Editor
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

    const listChats = computed(() => {
      return store.getters.getChatEntries
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
    watch(listChats, (newValue, oldValue) => {
      viwer(newValue)
    })

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
      listChats,
      sendComment,
      chatEditor,
      cleatChatEditor,
      chatViwer,
      viwer
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
