<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <div style="padding: 10px;">
    <div style="height: 8% !important;">
      <el-steps :active="currentSetp" finish-status="success">
        <el-step
          v-for="(list, key) in stepList"
          :key="key"
          :title="list.name"
        />
      </el-steps>
    </div>
    <div style="height: 92% !important;">
      <transition name="el-fade-in-linear">
        <selectTable
          v-if="currentSetp === 1"
        >
          <template v-slot:footer>
            <el-button
              type="primary"
              class="button-base-icon"
              icon="el-icon-check"
              style="float: right;margin-right: 10px;margin-top: 10px;"
              :disabled="!isDisableNextTable"
              @click="nextStep"
            />
            <el-button
              type="danger"
              class="button-base-icon"
              icon="el-icon-close"
              style="float: right;margin-right: 10px;margin-top: 10px;"
            />
            <el-button
              plain
              type="info"
              class="button-base-icon"
              style="float: right;margin-right: 0px;margin-top: 10px;"
              @click="actionClear"
            >
              <svg-icon icon-class="layers-clear" />
            </el-button>
          </template>
        </selectTable>
        <uploadFile
          v-if="currentSetp === 2"
        >
          <template v-slot:footer>
            <el-button
              type="primary"
              class="button-base-icon"
              icon="el-icon-check"
              style="float: right;margin-right: 10px;margin-top: 10px;"
              @click="nextStep"
            />
            <el-button
              type="danger"
              class="button-base-icon"
              icon="el-icon-close"
              style="float: right;margin-right: 10px;margin-top: 10px;"
              @click="prevStep"
            />
            <span v-if="!showNavegationTable">
              <el-button
                type="info"
                plain
                size="small"
                style="float: right;margin-right: 0px;margin-top: 10px;"
                @click="changePrevLine"
              >
                <i class="el-icon-arrow-up" style="font-size: 16px;" />
              </el-button>
              <el-button
                type="info"
                plain
                size="small"
                style="float: right;margin-right: 10px;margin-top: 10px;"
                @click="changeNextLine"
              >
                <i class="el-icon-arrow-down" style="font-size: 16px;" />
              </el-button>
            </span>
          </template>
        </uploadFile>
      </transition>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Components and Mixins
import selectTable from './selectTable.vue'
import uploadFile from './uploadFile.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'VFileImport',

  components: {
    selectTable,
    uploadFile
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  setup(props, { root }) {
    /**
    * Refs
    */

    let index = 0

    const stepList = ref([
      {
        name: 'Seleccione Tabla'
      },
      // {
      //   name: lang.t('VBankStatementMatch.steps.automaticMatch')
      // },
      {
        name: 'Configure Archivo a Importar'
      },
      {
        name: lang.t('VBankStatementMatch.steps.summaryAdjustment')
      }
    ])

    const currentSetp = ref(1)

    /**
    * Computed
    */
    const isBack = computed(() => {
      return currentSetp.value === 1
    })

    const isNext = computed(() => {
      return currentSetp.value === 3
    })

    const initialSept = computed(() => {
      return currentSetp.value - 1
    })

    const label = computed(() => {
      if (currentSetp.value === 3) return lang.t('VBankStatementMatch.steps.summaryAdjustment')
      return ''
    })

    const validate = computed(() => {
      const { matchMode, bankAccounts } = store.getters.getCriteriaVBankStatement
      return isEmptyValue(bankAccounts.id) || isEmptyValue(matchMode.value)
    })

    const isDisableNextTable = computed(() => {
      const {
        tablaId,
        charsets,
        importFormats
      } = store.getters.getAttribute
      return !isEmptyValue(tablaId) && !isEmptyValue(charsets) && !isEmptyValue(importFormats)
    })

    const showNavegationTable = computed(() => {
      const {
        data,
        header
      } = store.getters.getFile
      return isEmptyValue(data) && isEmptyValue(header)
    })

    // Computed

    function nextStep(steps) {
      currentSetp.value++
      store.commit('updateAttributeVFileImport', {
        attribute: 'file',
        criteria: 'header',
        value: []
      })
      store.commit('updateAttributeVFileImport', {
        attribute: 'file',
        criteria: 'data',
        value: []
      })
    }

    function prevStep(steps) {
      currentSetp.value--
      store.commit('updateAttributeVFileImport', {
        attribute: 'file',
        criteria: 'header',
        value: []
      })
      store.commit('updateAttributeVFileImport', {
        attribute: 'file',
        criteria: 'data',
        value: []
      })
    }

    function actionClear() {
      store.commit('updateAttributeVFileImport', {
        attribute: 'attribute',
        criteria: 'tablaId',
        value: undefined
      })
      store.commit('updateAttributeVFileImport', {
        attribute: 'attribute',
        criteria: 'charsets',
        value: ''
      })
      store.commit('updateAttributeVFileImport', {
        attribute: 'attribute',
        criteria: 'importFormats',
        value: ''
      })
    }

    function changeNextLine() {
      const { data } = store.getters.getFile
      store.commit('setNavigationLine', data[index])
      index++
    }

    function changePrevLine() {
      const { data } = store.getters.getFile
      store.commit('setNavigationLine', data[index])
      if (index === 0) return
      index--
    }

    return {
      index,
      stepList,
      currentSetp,
      isBack,
      isNext,
      label,
      initialSept,
      isDisableNextTable,
      validate,
      showNavegationTable,
      prevStep,
      nextStep,
      actionClear,
      changePrevLine,
      changeNextLine
    }
  }
})
</script>

<style scoped>
.carousel-panel {
  height: 100% !important;
  padding: 10px 0px;
}
.el-carousel__item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: inline-block;
  overflow: hidden;
  z-index: 0;
  height: auto;
}
.transition-box {
  margin-bottom: 10px;
  width: 200px;
  height: 100px;
  border-radius: 4px;
  background-color: #409EFF;
  text-align: center;
  color: #fff;
  padding: 40px 20px;
  box-sizing: border-box;
  margin-right: 20px;
}
</style>
