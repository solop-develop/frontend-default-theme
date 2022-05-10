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
  <el-dialog
    title="modal-dialog"
    :visible="isShowed"
    @close="closeDialog"
  >
    <span slot="title">
      {{ title }}
    </span>

    <span class="content-modal-dialog">
      <component
        v-if="isLoading"
        :is="componentRender"
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :container-manager="containerManager"
      />
      <loading-view
        v-else
        key="form-loading"
      />
    </span>

    <span slot="footer" class="dialog-footer">
      <el-button
        type="danger"
        icon="el-icon-close"
        @click="cancelButton"
      />
      <el-button
        type="primary"
        icon="el-icon-check"
        @click="doneButton"
      />
    </span>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

import store from '@/store'

// components and mixins
import LoadingView from '@theme/components/ADempiere/LoadingView/index.vue'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'
import language from '@/lang'

export default defineComponent({
  name: 'ModalDialog',

  components: {
    LoadingView
  },

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    cancelAction: {
      type: Function,
      default: () => {
      }
    },
    confirmAction: {
      type: Function,
      default: () => {
        console.info('Implement confirm action method')
      }
    }
  },

  setup(props) {
    const isLoading = ref(false)

    const emptyMandatory = computed(() => {
      const fieldsList = store.getters.getStoredFieldsFromProcess(props.containerUuid)
      return store.getters.getFieldsListEmptyMandatory({
        containerUuid: props.containerUuid,
        fieldsList: fieldsList
      })
    })

    const storedModalDialog = computed(() => {
      return store.getters.getModalDialogManager({
        containerUuid: props.containerUuid
      })
    })

    const isShowed = computed(() => {
      return store.getters.getShowedModalDialog({
        containerUuid: props.containerUuid
      })
    })

    const findProcess = computed(() => {
      return store.getters.getStoredProcess(props.containerUuid)
    })

    const title = computed(() => {
      return storedModalDialog.value.title
    })

    const componentRender = computed(() => {
      // return () => import('@theme/components/ADempiere/PanelDefinition/index.vue')
      return storedModalDialog.value.componentPath
    })

    watch(isShowed, (newValue, oldValue) => {
      if (newValue !== oldValue && newValue) {
        dataProcess()
      }
    })

    const dataProcess = () => {
      if (isEmptyValue(findProcess)) {
        isLoading.value = true
        return
      }
      storedModalDialog.value.loadData()
        .then(respose => {
          isLoading.value = true
        })
        .catch(error => {
          console.warn(error)
          isLoading.value = true
        })
    }
    const closeDialog = () => {
      // close modal dialog
      store.commit('setShowedModalDialog', {
        containerUuid: props.containerUuid,
        isShowed: false
      })
    }

    const cancelButton = () => {
      closeDialog()
      // call custom function to cancel
      storedModalDialog.value.cancelMethod()
    }

    const doneButton = () => {
      if (!isEmptyValue(emptyMandatory.value)) {
        showMessage({
          message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory.value,
          type: 'info'
        })
        return
      }
      closeDialog()
      // call custom function to done
      storedModalDialog.value.doneMethod()
    }
    if (isShowed.effect && isShowed.value && !isEmptyValue(findProcess.value) && !isEmptyValue(findProcess.value.isActive)) {
      dataProcess()
    }

    return {
      // computeds
      storedModalDialog,
      componentRender,
      isShowed,
      title,
      isLoading,
      findProcess,
      emptyMandatory,
      // methods
      cancelButton,
      closeDialog,
      dataProcess,
      doneButton
    }
  }
})
</script>
