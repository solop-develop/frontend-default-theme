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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span>
    <el-container style="height: 100% !important;">
      <el-main style="overflow: auto;padding-left: 10px;padding-right: 10px;">
        <el-empty v-if="isEmptyValue(listChats)" style="height: 600px;" />
        <!-- <el-scrollbar v-else class="scroll-chats"> -->
        <el-timeline v-else style="padding-left: 0px">
          <el-timeline-item
            v-for="(chat, key) in listChats"
            :key="key"
            :timestamp="translateDateByLong(chat.logDate)"
            type="primary"
            placement="top"
            style="padding-top: 0px;padding-bottom: 0px;"
          >
            <el-card v-if="!isEmptyValue(chat.userName)" shadow="always" class="list-notes-previwer">
              <div slot="header" class="clearfix">
                <span style="color: #606266; font-weight: bold;">
                  {{ $t('window.containerInfo.log.updatedBy') }} <b>: </b>{{ chat.userName }} <i class="el-icon-user-solid" />
                </span>
              </div>
              <el-scrollbar wrap-class="scroll-previwer-list-note">
                <v-md-preview :text="chat.characterData" class="previwer-disable" style="padding: 0px" height="150px" />
              </el-scrollbar>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-main>

      <el-footer style="height: auto;padding: 5px;">
        <el-card shadow="never" class="is-add-new-comments">
          <div slot="header">
            {{ $t('window.containerInfo.logWorkflow.addNote') }}
          </div>
          <div class="editor-container">
            <el-scrollbar v-if="isShowPreviwer" wrap-class="scroll-previwer-note">
              <v-md-preview :text="message" class="previwer-disable" style="padding: 0px" height="150px" />
            </el-scrollbar>
            <v-md-editor
              v-else
              v-model="message"
              left-toolbar="undo redo clear h bold italic strikethrough quote ul ol table hr link image code | emoji listMailTemplates"
              :toolbar="listOption"
              right-toolbar="sync-scroll fullscreen"
              mode="edit"
              height="150px"
              :placeholder="$t('window.containerInfo.logWorkflow.addNote')"
            />

            <el-button
              type="primary"
              icon="el-icon-check"
              class="button-base-icon"
              style="float: right;margin: 10px;"
              :disabled="isEmptyValue(message)"
              @click="sendComment"
            />
            <el-button
              type="danger"
              icon="el-icon-close"
              class="button-base-icon"
              style="float: right;margin-top: 10px;"
              @click="closeNote"
            />
            <el-button
              type="info"
              plain
              style="float: right; margin-top: 10px;"
              class="button-base-icon"
              :disabled="isEmptyValue(message)"
              @click="message = ''"
            >
              <svg-icon icon-class="layers-clear" />
            </el-button>
            <el-checkbox
              v-model="isShowPreviwer"
              :label="$t('issues.preview')"
              class="button-base-icon"
              :border="true"
              :disabled="isEmptyValue(message)"
              style="float: right;margin-top: 10px;"
            />
          </div>
        </el-card>
      </el-footer>
    </el-container>
  </span>
</template>

<script>
import {
  defineComponent, computed, ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification'
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'RecordNotes',

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
    const isShowPreviwer = ref(false)

    const listChats = computed(() => {
      return store.getters.getChatEntries
    })

    const listOption = computed(() => {
      return store.getters.getListMailTemplates
    })

    function sendComment() {
      if (isEmptyValue(message.value)) {
        showMessage({
          message: lang.t('window.containerInfo.emptyNote'),
          type: 'warning'
        })
        return
      }
      store.dispatch('createChatEntry', {
        tableName: props.tableName,
        recordId: props.recordId,
        comment: message.value
      })
        .then(() => {
          message.value = ''
        })
    }

    function closeNote() {
      store.dispatch('showLogs', {
        show: false
      })
    }

    function loadListMail() {
      store.dispatch('findListMailTemplates')
    }

    loadListMail()

    return {
      message,
      listChats,
      listOption,
      isShowPreviwer,
      sendComment,
      closeNote,
      loadListMail,
      translateDateByLong
    }
  }
})
</script>

<style lang="scss">
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
.scroll-previwer-note {
  max-height: 120px;
}
.scroll-previwer-list-note {
  max-height: 100px;
}
.github-markdown-body {
  padding: 10px;
}
.list-notes-previwer {
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 5px;
    padding-bottom: 0px !important;
    padding-left: 5px;
  }
  .el-card__header {
    padding: 18px 10px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
}
</style>
<style scoped>
.scroll-chats {
  width: 100%;
  height: 500px;
}
</style>
