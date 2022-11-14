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
    <el-container style="height: 85vh;">
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
      <el-footer style="height: 200px !important;overflow: auto;">
        <div class="editor-container">
          <!-- <markdown-editor v-model="message" height="200px" /> -->
          <div id="ChatEditor" />
          <el-button
            type="primary"
            icon="el-icon-check"
            circle
            style="float: right;margin-top: 2%;"
            @click="sendComment"
          />
        </div>
      </el-footer>
    </el-container>
  </span>
</template>

<script>
import { defineComponent, computed, ref, onMounted, watch } from '@vue/composition-api'
import store from '@/store'
import lang from '@/lang'
// import Editor
import '@toast-ui/chart/dist/toastui-chart.css'
import chart from '@toast-ui/editor-plugin-chart'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'Chats',
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
  setup(props, { root }) {
    const message = ref('')
    const ChatEditor = ref(null)
    const ChatViwer = ref(null)

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
      if (isEmptyValue(ChatEditor.value.getMarkdown())) {
        showMessage({
          message: lang.t('window.containerInfo.emptyNote'),
          type: 'warning'
        })
        return
      }
      store.dispatch('createChatEntry', {
        tableName: props.tableName,
        recordId: props.recordId,
        comment: ChatEditor.value.getMarkdown()
      })
        .then(() => {
          cleatChatEditor('')
        })
    }

    function cleatChatEditor(params) {
      ChatEditor.value.setMarkdown(params)
    }

    function viwer(params, key) {
      if (isEmptyValue(params)) {
        return
      }
      params.forEach(element => {
        const initialValue = element.characterData
        ChatViwer.value = new Editor.Factory({
          el: document.querySelector(`#ChatViwer${element.id}`),
          viewer: true,
          initialValue,
          plugins: [[chart, chartOptions]]
        })
      })
    }
    watch(listChats, (newValue, oldValue) => {
      viwer(newValue)
    })

    onMounted(() => {
      ChatEditor.value = new Editor({
        el: document.querySelector('#ChatEditor'),
        initialValue: message.value,
        height: '200px',
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        plugins: [[chart, chartOptions]]
      })
      ChatEditor.value.getMarkdown()
      viwer()
    })

    return {
      message,
      listChats,
      sendComment,
      ChatEditor,
      cleatChatEditor,
      ChatViwer,
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
