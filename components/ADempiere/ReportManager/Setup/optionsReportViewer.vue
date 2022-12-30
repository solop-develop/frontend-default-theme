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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-card class="box-card">
    <div v-if="isShowTitle" slot="header" class="clearfix">
      <b>
        {{ $t('report.reportSettings') }}
      </b>
    </div>

    <el-collapse v-model="activeCollapse">
      <el-collapse-item name="1">
        <template slot="title">
          <b>
            {{ $t('report.preference') }}
            <i class="el-icon-s-operation" />
          </b>
        </template>
        <el-card class="box-card">
          <div class="text item">
            <el-form
              label-position="top"
              label-width="10px"
              @submit.native.prevent="notSubmitForm"
            >
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item
                    :label="$t('report.printFormats')"
                    style="display: grid;"
                  >
                    <el-select
                      v-model="reportAsPrintFormatValue"
                      style="display: contents;"
                    >
                      <el-option
                        v-for="(item, key) in reportAsPrintFormat.childs"
                        :key="key"
                        :label="item.name"
                        :value="item.printFormatUuid"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="$t('report.reportViews')"
                    style="display: grid;"
                  >
                    <el-select
                      v-model="reportAsViewValue"
                      style="display: contents;"
                    >
                      <el-option
                        v-for="(item, key) in reportAsView.childs"
                        :key="key"
                        :label="item.name"
                        :value="item.reportViewUuid"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="$t('report.typeReport')"
                    style="display: grid;"
                  >
                    <el-select
                      v-model="reportTypeFormatValue"
                      style="display: contents;"
                    >
                      <el-option
                        v-for="(item, key) in reportTypeFormat.childs"
                        :key="key"
                        :label="item.name"
                        :value="item.type"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    :label="$t('report.summary')"
                    style="display: grid;"
                  >
                    <el-switch v-model="value1" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-card>
      </el-collapse-item>

      <!-- report parameters -->
      <el-collapse-item name="2">
        <template slot="title">
          <b>
            {{ $t('actionMenu.changeParameters') }}
            <i class="el-icon-set-up" />
          </b>
        </template>
        <component
          :is="componentRender"
          :container-uuid="containerUuid"
          :container-manager="containerManagerReportViwer"
        />
      </el-collapse-item>
    </el-collapse>

    <el-row
      style="
        position: absolute;
        bottom: 1%;
        right: 2%;
      "
    >
      <el-col :span="24">
        <samp>
          <el-button
            type="danger"
            icon="el-icon-close"
            @click="handleClose()"
          />
          <el-button
            type="primary"
            icon="el-icon-check"
            @click="runReport()"
          />
        </samp>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref, watch } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'

// Components adn Mixins
import CollapseCriteria from '@theme/components/ADempiere/CollapseCriteria/index.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'optionsReportViewer',

  components: {
    CollapseCriteria
  },

  props: {
    containerUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    isShowTitle: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { root }) {
    /**
     * Ref
     * @reportAsViewValue - @params - {String} - (Value the Report Viwer)
     * @reportAsPrintFormatValue - @params - {String} - (Value the Print Format)
     * @reportTypeFormatValue - @params - {String} - (Value the Report Type)
     * @activeCollapse - @params - {Array} - (Nodes activating collapse *Note: Cannot be used if the node is accordion mode*)
     */
    const reportAsViewValue = ref('')
    const reportAsPrintFormatValue = ref('')
    const reportTypeFormatValue = ref('')
    const activeCollapse = ref(['1', '2'])
    const value1 = ref(true)

    /**
     * Computed
     * @reportAsView - List the options the Report Viwer
     * @reportAsPrintFormat - List the options the Print Format
     * @reportAsView - List the options the Report Type
     * @storedPanelReport - Attribute the Panel Report
     * @defaultParams - Parameters with which the report was executed
     * @isShowSetupReport - is to show the configuration report
     * @containerManagerReportViwer - Container Manager the Report Viwer
     * @componentRender - Import the Panel Definitions component
     */
    const reportAsView = computed(() => {
      const options = store.getters.getStoredActionsMenu({
        containerUuid: props.containerUuid
      }).find(repoortOptions => repoortOptions.actionName === 'runReportAsView')
      if (isEmptyValue(options)) {
        return {
          childs: []
        }
      }
      return options
    })

    const reportAsPrintFormat = computed(() => {
      const options = store.getters.getStoredActionsMenu({
        containerUuid: props.containerUuid
      }).find(repoortOptions => repoortOptions.actionName === 'runReportAsPrintFormat')
      if (isEmptyValue(options)) {
        return {
          childs: []
        }
      }
      return options
    })

    const tableName = computed(() => {
      const currentPrintFormat = reportAsPrintFormat.value.childs.find(report => report.printFormatUuid === reportAsPrintFormatValue.value)
      if (isEmptyValue(currentPrintFormat)) {
        return ''
      }
      return currentPrintFormat.tableName
    })

    const reportTypeFormat = computed(() => {
      const options = store.getters.getStoredActionsMenu({
        containerUuid: props.containerUuid
      }).find(repoortOptions => repoortOptions.actionName === 'runReportAs')
      if (isEmptyValue(options)) {
        return {
          childs: []
        }
      }
      return options
    })

    const storedPanelReport = computed(() => {
      return store.getters.getModalDialogManager({
        containerUuid: props.containerUuid
      })
    })

    const defaultParams = computed(() => {
      return store.getters.getReportOutput(root.$route.params.instanceUuid)
    })

    const isShowSetupReport = computed(() => {
      return store.getters.getShowPanelConfig({ containerUuid: props.containerUuid })
    })
    const containerManagerReportViwer = computed(() => {
      const modalDialogStored = storedPanelReport.value
      if (!isEmptyValue(modalDialogStored) && !isEmptyValue(modalDialogStored.containerManager)) {
        return {
          ...props.containerManager,
          ...modalDialogStored.containerManager
        }
      }
      return {
        ...props.containerManager
      }
    })

    const componentRender = computed(() => {
      return () => import('@theme/components/ADempiere/PanelDefinition/index.vue')
    })

    const findTagViwer = computed(() => {
      return store.getters.visitedViews.find(tag => tag.instanceUuid === root.$route.params.instanceUuid)
    })

    /**
     * Methods
     * @updatePrintFormat - @params {String} - Actualizar en el store el parametro Print Format
     * @updateReportView - @params {String} - Actualizar en el store el parametro Report Viwer
     * @updateReportType - @params {String} - Actualizar en el store el parametro Report Type
     * @handleClose - Close Panel and Clean Value
     * @runReport - Run Report and Close Panel
     * @runReport - @params {Object} - Set in the field the parameters with which the report was run
     */

    function updatePrintFormat(value) {
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        printFormatUuid: value,
        reportType: reportTypeFormatValue.value,
        reportViewUuid: reportAsViewValue.value
      })
    }

    function updateReportView(value) {
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        printFormatUuid: reportAsPrintFormatValue.value,
        reportType: reportTypeFormatValue.value,
        reportViewUuid: value
      })
    }

    function updateReportType(value) {
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        reportViewUuid: reportAsViewValue.value,
        printFormatUuid: reportAsPrintFormatValue.value,
        reportType: value
      })
    }

    function handleClose() {
      store.commit('setShowPanelConfig', {
        containerUuid: props.containerUuid,
        value: false
      })
      reportAsViewValue.value = ''
      reportAsPrintFormatValue.value = ''
      reportTypeFormatValue.value = ''
    }

    function runReport() {
      store.dispatch('buildReport', {
        containerUuid: props.containerUuid,
        instanceUuid: root.$route.params.instanceUuid,
        isSummary: value1.value,
        tableName: tableName.value
      })
        .then(response => {
          store.dispatch('tagsView/delCachedView', findTagViwer.value).then(() => {
            const { fullPath } = findTagViwer.value
            this.$nextTick(() => {
              router.replace({
                path: '/redirect' + fullPath
              })
            })
          })
        })
      store.commit('setShowPanelConfig', {
        containerUuid: props.containerUuid,
        value: false
      })
    }

    function defaultReport(report) {
      const { reportViewUuid, printFormatUuid, reportType } = report
      reportAsViewValue.value = reportViewUuid
      reportAsPrintFormatValue.value = printFormatUuid
      reportTypeFormatValue.value = reportType
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        reportViewUuid,
        printFormatUuid,
        reportType
      })
    }

    /**
     * Watch
     */

    watch(reportAsViewValue, (newValue) => {
      updateReportView(newValue)
    })

    watch(reportAsPrintFormatValue, (newValue) => {
      updatePrintFormat(newValue)
    })

    watch(reportTypeFormatValue, (newValue) => {
      updateReportType(newValue)
    })

    watch(isShowSetupReport, (newValue) => {
      if (newValue) {
        defaultReport(defaultParams.value)
      }
    })

    watch(value1, (newValue) => {
      if (newValue) {
        store.commit('setReportGenerated', {
          containerUuid: props.containerUuid,
          printFormatUuid: reportAsPrintFormatValue.value,
          reportType: reportTypeFormatValue.value,
          reportViewUuid: reportAsPrintFormatValue.value,
          isSummary: newValue
        })
      }
    })

    /**
     * Run Methods As soon as I load the panel
     */

    updatePrintFormat(reportTypeFormatValue.value)

    updateReportView(reportAsViewValue.value)

    updateReportType(reportTypeFormatValue.value)

    defaultReport(defaultParams.value)

    return {
      // Ref
      reportAsViewValue,
      reportAsPrintFormatValue,
      reportTypeFormatValue,
      activeCollapse,
      value1,
      // Components
      reportAsView,
      reportAsPrintFormat,
      reportTypeFormat,
      tableName,
      storedPanelReport,
      defaultParams,
      isShowSetupReport,
      containerManagerReportViwer,
      componentRender,
      findTagViwer,
      // methods
      updatePrintFormat,
      updateReportView,
      updateReportType,
      handleClose,
      runReport,
      defaultReport
    }
  }
})
</script>
