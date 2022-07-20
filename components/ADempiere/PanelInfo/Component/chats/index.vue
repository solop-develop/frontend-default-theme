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
    <el-container>
      <el-main style="overflow: auto;">
        <el-empty v-if="isEmptyValue(listChats)" />
        <el-scrollbar v-else class="scroll-chats">
          <el-timeline>
            <el-timeline-item
              v-for="(chat, key) in listChats"
              :key="key"
              :timestamp="chat.logDate"
              type="primary"
              placement="top"
              style="padding-top: 0px;padding-bottom: 0px;"
            >
              <el-card shadow="always" class="epale">
                <div v-markdown="chat.characterData" style="padding-top: 0px;padding-bottom: 0px;" />
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-scrollbar>
      </el-main>
      <el-footer height="10%">
        <div class="editor-container">
          <markdown-editor v-model="message" height="200px" />
          <el-button type="primary" icon="el-icon-check" circle style="float: right;margin-top: 2%;" @click="sendComment" />
        </div>
      </el-footer>
    </el-container>
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import MarkdownEditor from '@theme/components/MarkdownEditor'

import store from '@/store'

// // components and mixins
// import { DOCUMENT_STATUS_COLUMNS_LIST } from '@/utils/ADempiere/constants/systemColumns'
// import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'

// // utils and helper methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'Chats',
  components: { MarkdownEditor },
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

    const listChats = computed(() => {
      return store.getters.getChatEntries
    })

    function sendComment() {
      store.dispatch('createChatEntry', {
        tableName: props.tableName,
        recordId: props.recordId,
        comment: message.value
      })
        .then(response => {
          message.value = ''
        })
    }

    return {
      message,
      listChats,
      sendComment
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
