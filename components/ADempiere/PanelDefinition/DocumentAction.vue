<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Elsio Sanchez Elsiosanchez15@outlook.com https://github.com/Elsiosanchez
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
  <div>
    <h3> {{ $t('workflow.changeDocumentAction') }} </h3>
    <b v-if="!isEmptyValue(documentAction)">
      {{ documentAction.description }}
    </b>
    <el-steps :space="200" simple>
      <el-step icon="el-icon-d-arrow-right">
        <template slot="title">
          <el-tag
            :type="tagStatus(currentDocumentAction).type"
            :effect="tagStatus(currentDocumentAction).effect"
            disable-transitions
          >
            {{ currentDocumentAction }}
          </el-tag>
        </template>
      </el-step>
      <el-step icon="el-icon-d-arrow-right">
        <template slot="title">
          <el-select
            v-model="documentActionLabel"
            @change="changeNextDocumentAction"
          >
            <el-option
              v-for="(item, key) in documentActionsList"
              :key="key"
              :value="item.name"
              class="custom-option-document-status"
            >
              <div style="width: 100%;">
                <span class="displayed-value">
                  {{ item.name }}
                </span>
                <document-status-tag
                  size="medium"
                  class="tag-status"
                  :value="item.value"
                  :displayed-value="item.value"
                />
              </div>
            </el-option>
          </el-select>
        </template>
      </el-step>
    </el-steps>
  </div>
</template>

<script>
import store from '@/store'
import router from '@/router'
import {
  defineComponent,
  computed,
  watch,
  ref
} from '@vue/composition-api'

// Component and Mixins
import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'

// Utils and Helper Methods
import { tagRender } from '@/utils/ADempiere/dictionary/workflow'
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'DocumentAction',

  components: {
    DocumentStatusTag
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
    }
  },

  setup(props) {
    // Ref

    const documentAction = ref('')
    const documentActionLabel = ref('')

    // Computed

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.parentUuid)
    })

    const tableName = computed(() => {
      const { tableName } = store.getters.getStoredTab(router.app._route.meta.uuid, props.parentUuid)
      return tableName
    })

    const storedModalDialog = computed(() => {
      return store.getters.getModalDialogManager({
        containerUuid: props.containerUuid
      })
    })

    const nextDocumentAction = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        columnName: 'DocAction'
      })
    })

    const documentActionsList = computed(() => {
      return store.getters.getStoredDocumentActionsList({
        tableName: tableName.value,
        recordUuid: recordUuid.value,
        documentStatus: currentDocumentAction.value
      })
    })

    const currentDocumentAction = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        columnName: 'DocStatus'
      })
    })

    // Set Value

    documentActionLabel.value = documentActionsList.value.find(action => action.value === nextDocumentAction.value).name
    documentAction.value = documentActionsList.value.find(action => action.value === nextDocumentAction.value)

    /**
     * Tag Status
     * @param {String} value
     */
    function tagStatus(value) {
      return tagRender(value)
    }

    /**
     * Change Next Document Action
     * @param {String} newAction
     */

    function changeNextDocumentAction(newAction) {
      const documentValue = currentAction(documentActionsList.value, newAction).value
      store.commit('updateValueOfField', {
        containerUuid: props.containerUuid,
        columnName: 'DocAction',
        value: documentValue
      })
    }

    /**
     * Current Action
     * @param {Array} list
     * @param {String} newValue
     */

    function currentAction(list, newValue) {
      return list.find(action => {
        if (action.name === newValue) {
          return action
        }
      })
    }

    watch(documentActionLabel, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        documentAction.value = currentAction(documentActionsList.value, newValue)
      }
    })

    return {
      // Ref
      documentAction,
      documentActionLabel,
      // Computed
      tableName,
      recordUuid,
      storedModalDialog,
      nextDocumentAction,
      documentActionsList,
      currentDocumentAction,
      // Methods
      tagStatus,
      currentAction,
      changeNextDocumentAction
    }
  }
})
</script>

<style lang="scss">
.el-step.is-simple .el-step__head {
  width: auto;
  font-size: 0;
  padding-right: 10px;
  padding-top: 12px;
}
</style>
