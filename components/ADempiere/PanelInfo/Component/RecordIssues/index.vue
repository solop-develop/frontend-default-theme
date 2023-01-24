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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <span>
    <el-container style="height: 100% !important;">
      <el-main style="overflow: auto;padding: 0px;">
        <!-- {{ !isEmptyValue(currentIssues) }} {{ !isNewIssues }} -->
        <el-card v-if="!isNewIssues" class="box-card" style="height: 100%;">
          <div slot="header" class="clearfix">
            <b style="color: black; font-size: 19px;">
              {{ 'Todas las Solicitudes' }}
            </b>
            <el-button style="float: right;" plain type="success" @click="newIssues()">
              {{ 'Crear Nueva Solicitud' }}
              <i class="el-icon-plus" />
            </el-button>
          </div>
          <div class="text item">
            <el-empty v-if="isEmptyValue(listIssues)" style="height: 600px;" />
            <div
              v-for="(issues, key) in listIssues"
              :key="key"
              class="text item"
              style="border: 1px solid #d0d7de;display: flex;width: 100%"
            >
              <b style="font-size: 30px;padding-top: 20px;padding-left: 5px;padding-right: 5px;">
                <svg-icon icon-class="issues" style="color: #3fb950;" />
              </b>
              <span style="margin-top: 0px;margin-bottom: 0px;width: 100%;">
                <p style="font-size: 18px; width: 100%;">
                  <b>
                    <el-popover
                      placement="top-start"
                      trigger="hover"
                      width="900"
                    >
                      <el-descriptions :column="2">
                        <template slot="title">
                          <b>
                            <svg-icon icon-class="guide" />
                            {{ issues.subject }}
                          </b>
                        </template>
                        <template slot="extra">
                          <b>
                            {{ $t('issues.documentNo') }}
                            {{ issues.document_no }}
                          </b>
                        </template>
                        <el-descriptions-item :span="4">
                          <template slot="label">
                            <b>
                              {{ $t('issues.summary') }}
                            </b>
                          </template>
                          {{ issues.summary }}
                        </el-descriptions-item>
                        <el-descriptions-item :span="4">
                          <template slot="label">
                            <b>
                              {{ $t('issues.created') }}
                            </b>
                          </template>
                          {{ issues.user_name }}
                        </el-descriptions-item>
                        <el-descriptions-item style="float: right;">
                          <template slot="label">
                            <b style="padding-top: 10px !important;">
                              {{ $t('issues.priority') }}
                            </b>
                          </template>
                          <el-button type="primary" size="medium" plain style="float: right;margin-right: 10px;">
                            <svg-icon icon-class="collections" />
                            {{ issues.priority.name }}
                          </el-button>
                        </el-descriptions-item>
                        <el-descriptions-item>
                          <template slot="label">
                            <b style="padding-top: 10px !important;">
                              {{ $t('issues.typeOfRequest') }}
                            </b>
                          </template>
                          <el-button size="medium" plain style="float: right;margin-right: 10px;">
                            <svg-icon icon-class="label" />
                            {{ issues.request_type.name }}
                          </el-button>
                        </el-descriptions-item>
                        <el-descriptions-item>
                          <template slot="label">
                            <b style="padding-top: 5px !important;">
                              {{ $t('issues.assigned') }}
                            </b>
                          </template>
                          {{ issues.sales_representative.name }}
                          <el-avatar icon="el-icon-user-solid" size="small" style="margin-left: 10px;" />
                        </el-descriptions-item>
                      </el-descriptions>
                      <el-button
                        slot="reference"
                        style="color: black;font-size: 18px;font-weight: 605 !important;"
                        type="text"
                        @click="SelectionIssue(issues)"
                      >
                        <!-- @click="SelectionIssue(issues)" -->
                        {{ $t('issues.request') + ': ' + '  ' + issues.subject }}
                      </el-button>
                    </el-popover>
                  </b>
                  <!-- <el-tag size="medium"> -->
                  <el-button type="primary" size="medium" plain style="float: right;margin-right: 10px;">
                    <b>
                      <svg-icon icon-class="collections" />
                      {{ $t('issues.priority') + ': ' }}
                    </b>
                    {{ issues.priority.name }}
                  </el-button>
                  <!-- </el-tag> -->
                  <!-- <el-tag effect="plain" size="medium"> -->
                  <el-button size="medium" type="info" plain style="float: right;margin-right: 10px;">
                    <b>
                      <svg-icon icon-class="label" />
                      {{ $t('issues.typeOfRequest') + ': ' }}
                    </b>
                    {{ issues.request_type.name }}
                  </el-button>
                  <!-- </el-tag> -->
                </p>
                <!-- <hr /> -->
                <!-- <el-divider style="margin: 0px;" /> -->
              </span>
            </div>
          </div>
        </el-card>
        <comment
          v-else
          :table-name="tableName"
          :record-id="recordId"
        />
      </el-main>
    </el-container>
  </span>
</template>

<script>
import {
  defineComponent, computed, ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Components and Mixins
// import '@toast-ui/chart/dist/toastui-chart.css'
// import chart from '@toast-ui/editor-plugin-chart'
// import Editor from '@toast-ui/editor'
// import '@toast-ui/editor/dist/toastui-editor.css'
import Comment from './component/Comment.vue'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification'
import { translateDateByLong } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'RecordIssues',

  components: {
    // Editor
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
    const filter = ref('')
    const priority = ref('')
    const typeRequest = ref('')
    const chatEditor = ref(null)
    const chatViwer = ref(null)

    // const chartOptions = {
    //   minWidth: 100,
    //   maxWidth: 600,
    //   minHeight: 100,
    //   maxHeight: 300
    // }

    const listIssues = computed(() => {
      return store.getters.getListIssues
    })

    const isNewIssues = computed({
      // getter
      get() {
        return store.getters.getNewIssues
      },
      // setter
      set(newValue) {
        store.commit('setNewIssues', newValue)
      }
    })

    const currentIssues = computed(() => {
      return store.getters.getCurrentIssues
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
      // if (isEmptyValue(params)) {
      //   return
      // }
      // params.forEach(element => {
      //   const initialValue = element.characterData
      //   nextTick(() => {
      //     // eslint-disable-next-line
      //     chatViwer.value = new Editor.factory({
      //       el: document.querySelector(`#ChatViwer${element.id}`),
      //       viewer: true,
      //       initialValue,
      //       plugins: [[chart, chartOptions]]
      //     })
      //   })
      // })
    }

    function SelectionIssue(issues) {
      console.log({ issues })
      isNewIssues.value = !isNewIssues.value
      store.dispatch('changeCurrentIssues', issues)
    }

    function newIssues(issues) {
      isNewIssues.value = !isNewIssues.value
      store.dispatch('changeCurrentIssues', issues)
    }

    return {
      message,
      listIssues,
      sendComment,
      chatEditor,
      cleatChatEditor,
      chatViwer,
      viwer,
      translateDateByLong,
      //
      priority,
      typeRequest,
      filter,
      isNewIssues,
      currentIssues,
      SelectionIssue,
      newIssues
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

.issues-card {
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 0px;
    padding-bottom: 0px!important;
    padding-left: 0px;
  }
}
// .el-descriptions-item__label:not(.is-bordered-label) {
//   padding-top: 10px;
// }
</style>
<style scoped>
.scroll-chats {
  width: 100%;
  height: 500px;
}
</style>
