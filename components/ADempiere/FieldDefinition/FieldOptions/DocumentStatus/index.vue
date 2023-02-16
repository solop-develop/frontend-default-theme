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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-card v-if="fieldAttributes.isColumnDocumentStatus" class="field-option-card document-status-option">
    <div slot="header">
      <span>
        {{ $t('field.field') }}:
        <b> {{ fieldAttributes.name }} </b>
      </span>
    </div>

    <p>
      {{ fieldAttributes.description }}
    </p>

    <el-row :gutter="10">
      <el-col :span="16">
        <el-select
          v-model="valueActionDocument"
          size="mini"
          class="custom-select-document-status"
          :popper-append-to-body="true"
          @change="documentActionChange"
          @visible-change="listActionDocument"
        >
          <!-- Current selected docuemnt status -->
          <el-option
            :label="displayedValue"
            :value="value"
            disabled
            class="custom-option-document-status"
          >
            <span class="displayed-value">
              {{ displayedValue }}
            </span>
            <document-status-tag
              size="mini"
              class="tag-status"
              :value="value"
              :displayed-value="value"
            />
          </el-option>

          <!-- Available document status -->
          <el-option
            v-for="(item, key) in listDocumentActions"
            :key="key"
            :label="item.name"
            :value="item.value"
            class="custom-option-document-status"
          >
            <div style="width: 100%;">
              <span class="displayed-value">
                {{ item.name }}
              </span>
              <document-status-tag
                size="mini"
                class="tag-status"
                :value="item.value"
                :displayed-value="item.value"
              />
            </div>
            <!-- {{ item.description }} -->

            <!-- TODO: Add description legend info -->
            <!--
            <div class="info">
              {{ item.description }}
            </div>
            -->
          </el-option>
        </el-select>
      </el-col>

      <el-col :span="8">
        <document-status-tag
          :style="{
            width: '100%',
            'text-align': 'center'
          }"
          :value="value"
          :displayed-value="displayedValue"
        />
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import DocumentStatusTag from '@theme/components/ADempiere/ContainerOptions/DocumentStatusTag/index.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import {
  refreshRecord
} from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'DocumentStatus',

  components: {
    DocumentStatusTag
  },

  props: {
    fieldAttributes: {
      type: Object,
      required: true
    }
  },

  setup(props, { root }) {
    const displayedValue = computed(() => {
      const { parentUuid, containerUuid, displayColumnName } = props.fieldAttributes
      return store.getters.getValueOfFieldOnContainer({
        parentUuid,
        containerUuid,
        columnName: displayColumnName
      })
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.fieldAttributes.containerUuid)
    })

    const value = computed(() => {
      const { parentUuid, containerUuid, columnName } = props.fieldAttributes
      return store.getters.getValueOfFieldOnContainer({
        parentUuid,
        containerUuid,
        columnName
      })
    })
    const valueActionDocument = ref(value.value)

    const withoutRecord = computed(() => {
      // TODO: Validate with record attribute
      if (isEmptyValue(root.$route.query.action) ||
        ['create-new', 'reference', 'advancedQuery', 'criteria'].includes(root.$route.query.action)) {
        return true
      }
      return false
    })

    const documentActions = computed(() => {
      return store.getters.getListDocumentActions
    })

    const listDocumentActions = computed(() => {
      return documentActions.value.documentActionsList
    })

    const currentActionNode = computed(() => {
      return listDocumentActions.value.find(element => {
        if (element.value === valueActionDocument.value) {
          return element
        }
      })
    })

    const labelDocumentActions = computed(() => {
      if (root.isEmptyValue(currentActionNode.value)) {
        return displayedValue.value
      }
      return currentActionNode.value.name
    })

    function listActionDocument(isShowList) {
      if (!isShowList) {
        return
      }
      if (!withoutRecord.value && root.$route.query.action !== documentActions.value.recordUuid) {
        const tableName = props.fieldAttributes.tabTableName

        store.dispatch('listDocumentActionStatus', {
          recordUuid: root.$route.query.action,
          tableName,
          recordId: root.$route.params.recordId
        })
      }
    }

    function documentActionChange(value) {
      const { tabTableName: tableName, containerUuid } = props.fieldAttributes

      store.commit('setShowFieldOption', false)

      store.dispatch('runDocumentAction', {
        tableName,
        recordUuid: recordUuid.value,
        docAction: value,
        containerUuid
      }).finally(() => {
        refreshRecord.refreshRecord({
          parentUuid: props.fieldAttributes.parentUuid,
          containerUuid
        })
      })
    }

    return {
      valueActionDocument,
      // computeds
      value,
      displayedValue,
      labelDocumentActions,
      listDocumentActions,
      withoutRecord,
      // methods
      listActionDocument,
      documentActionChange
    }
  }

})
</script>

<style lang="scss" src="../common-style.scss">
</style>
<style lang="scss">
.document-status-option {
  &.el-card {
    max-width: 300px;
  }
}

.custom-option-document-status {
  width: 295px !important;

  .displayed-value {
    float: left;
    font-size: 13px !important;
  }

  .tag-status {
    float: right;
    font-size: 13px !important;
  }
}
</style>
