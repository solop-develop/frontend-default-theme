<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com, Elsio Sanchez elsiosanche@gmail.com www.erpya.com
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
    class="modal-dialog"
    :visible="isShowed"
    @close="closeDialog"
  >
    <span slot="title">
      {{ title }}
    </span>

    <span class="content-modal-dialog">
      <span v-if="isLoaded">
        <component
          :is="componentRender"
          :parent-uuid="parentUuid"
          :container-uuid="containerUuid"
          :container-manager="containerManagerModalDialog"
        />
      </span>
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

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

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
    const isLoaded = ref(false)

    const storedModalDialog = computed(() => {
      return store.getters.getModalDialogManager({
        containerUuid: props.containerUuid
      })
    })

    const containerManagerModalDialog = computed(() => {
      const modalDialogStored = storedModalDialog.value
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

    const isShowed = computed(() => {
      return store.getters.getShowedModalDialog({
        containerUuid: props.containerUuid
      })
    })

    const title = computed(() => {
      if (isEmptyValue(storedModalDialog.value)) {
        return ''
      }
      return storedModalDialog.value.title
    })

    const componentRender = computed(() => {
      return storedModalDialog.value.componentPath
    })

    watch(isShowed, (newValue, oldValue) => {
      if (newValue !== oldValue && newValue) {
        loadModal()
      }
    })

    const loadModal = () => {
      if (!isEmptyValue(storedModalDialog.value.beforeOpen)) {
        storedModalDialog.value.beforeOpen()
      }

      storedModalDialog.value.loadData()
        .finally(() => {
          isLoaded.value = true
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
      props.cancelAction()
    }

    const doneButton = () => {
      closeDialog()
      // call custom function to done
      storedModalDialog.value.doneMethod()
      props.confirmAction()
    }
    if (isShowed.effect && isShowed.value) {
      loadModal()
    }

    return {
      // computeds
      containerManagerModalDialog,
      storedModalDialog,
      componentRender,
      isLoaded,
      isShowed,
      title,
      // methods
      cancelButton,
      closeDialog,
      doneButton
    }
  }
})
</script>
