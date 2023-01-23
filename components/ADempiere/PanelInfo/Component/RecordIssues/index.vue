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
      <el-main style="overflow: auto;">
        <el-empty v-if="isEmptyValue(listIssues)" style="height: 600px;" />
        <!-- <el-card shadow="never"> -->
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
                >
                  <lu>
                    <li>
                      <b>
                        {{ $t('issues.documentNo') + ': ' }}
                      </b>
                      {{ issues.document_no }}
                    </li>
                    <li>
                      <b>
                        {{ $t('issues.issues') + ': ' }}
                      </b>
                      {{ issues.subject }}
                    </li>
                    <li>
                      <b>
                        {{ $t('issues.summary') + ': ' }}
                      </b>
                      {{ issues.summary }}
                    </li>
                    <li>
                      <b>
                        {{ $t('issues.created') + ': ' }}
                      </b>
                      {{ issues.user_name }}
                    </li>
                    <li>
                      <b>
                        {{ $t('issues.Priority') + ': ' }}
                      </b>
                      {{ issues.priority.name }}
                    </li>
                    <li>
                      <b>
                        {{ $t('issues.typeOfRequest') + ': ' }}
                      </b>
                      {{ issues.request_type.name }}
                    </li>
                    <li>
                      <b>
                        {{ $t('issues.assigned') + ': ' }}
                      </b>
                      {{ issues.sales_representative.name }}
                    </li>
                  </lu>
                  <el-button
                    slot="reference"
                    style="color: black;font-size: 18px;font-weight: 605 !important;"
                    type="text"
                  >
                    {{ $t('issues.request') + ': ' + '  ' + issues.subject }}
                  </el-button>
                </el-popover>
              </b>
              <!-- <el-tag size="medium"> -->
              <el-button type="primary" size="medium" plain style="float: right;margin-right: 10px;">
                <svg-icon icon-class="collections" />
                {{ $t('issues.Priority') + ': '+ '  ' + issues.priority.name }}
              </el-button>
              <!-- </el-tag> -->
              <!-- <el-tag effect="plain" size="medium"> -->
              <el-button size="medium" plain style="float: right;margin-right: 10px;">
                <svg-icon icon-class="label" />
                {{ $t('issues.typeOfRequest') + ': ' + '  ' + issues.request_type.name }}
              </el-button>
              <!-- </el-tag> -->
            </p>
            <!-- <hr /> -->
            <!-- <el-divider style="margin: 0px;" /> -->
          </span>
        </div>
        <!-- </el-card> -->
        <!-- <el-row>
          <el-col
            :span="24"
            v-for="a in 10"
          >
            <svg-icon icon-class="issues" style="color: #3fb950;" />
            {{ 'Solicitudes_' + a }}
          </el-col>
        </el-row> -->
        <!-- <el-descriptions direction="vertical" :column="1" border>
          <el-descriptions-item
            v-for="a in 10"
          >
            <template slot="label">
              <svg-icon icon-class="issues" style="color: #3fb950;" />
              {{ 'Solicitudes_' + a }}
            </template>
          </el-descriptions-item>
        </el-descriptions> -->
        <!-- <lu>
          <li
            v-for="a in 6"
          >
            <svg-icon icon-class="issues" style="color: #3fb950;" />
            {{ 'Solicitudes_' + a }}
          </li>
        </lu> -->
        <!-- <el-scrollbar v-else class="scroll-chats"> -->
        <!-- <el-timeline v-else>
          <el-timeline-item
            v-for="(issues, key) in listIssues"
            :key="key"
            :timestamp="translateDateByLong(issues.created)"
            type="primary"
            placement="top"
            style="padding-top: 0px;padding-bottom: 0px;"
          > -->
        <!-- <el-card
          v-for="(issues, key) in listIssues"
          :key="key"
          shadow="hover"
          class="issues-card"
        >
          <el-popover
            placement="top-start"
            width="450"
            trigger="hover"
          >
            <b> {{ 'Creado' }} : </b>{{ issues.user_name }} <i class="el-icon-user-solid" /> <br>
            <b> {{ 'Tipo de Solicitud' }} : </b>{{ issues.user_name }} <br>
            <b> {{ 'Estado' }} : </b><br>
            <b> {{ 'Asunto' }} : </b><br>
            <b> {{ 'Resumen' }} : </b>{{ issues.summary }} <br>
            <b> {{ 'Asignado' }} : </b>{{ issues.sales_representative.name }} <br>
            <el-button slot="reference" type="text" style="padding-bottom: 0px;padding-top: 10px;">
              <svg-icon icon-class="issues" style="color: #3fb950;" />
              <b style="color: black;">
                {{ issues.document_no }}
                {{ issues.subject }}
              </b>
            </el-button>
          </el-popover>
          <br>
          <i style="color: #909399; font-size: 11px;">
            {{ translateDateByLong(issues.created) }}
          </i>
        </el-card> -->
        <!-- </el-timeline-item>
        </el-timeline> -->
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
</style>
<style scoped>
.scroll-chats {
  width: 100%;
  height: 500px;
}
</style>
