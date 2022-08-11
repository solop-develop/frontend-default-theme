<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@oulook.com www.erpya.com
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
  <div class="field-options">
    <el-dropdown
      v-if="isMobile"
      key="options-mobile"
      :tabindex="tabIndex"
      size="mini"
      hide-on-click
      trigger="click"
      :style="'text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width:' + labelStyle + '%'"
      @command="handleCommand"
      @click="false"
    >
      <label-field
        :is-mandatory="metadata.required"
        :label="metadata.name"
        :is-field-only="metadata.isFieldOnly"
        :is-mobile="true"
      />
      <el-dropdown-menu slot="dropdown" :tabindex="tabIndex">
        <template
          v-for="(option, key) in optionsList"
        >
          <el-dropdown-item
            v-if="option.enabled"
            :key="key"
            :command="option"
            divided
          >
            <label-popover-option :option="option" :is-mobile="true" />
          </el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </el-dropdown>

    <!-- Desktop menu -->
    <el-menu
      v-else-if="!isMobile && metadata.panelType !== 'form'"
      key="options-desktop"
      mode="horizontal"
      unique-opened
      style="z-index: 0"
      :menu-trigger="triggerMenu"
      @open="handleOpen"
      @close="handleClose"
      @select="handleSelect"
    >
      <el-submenu index="menu" :tabindex="tabIndex">
        <template slot="title">
          <label-field
            :is-mandatory="metadata.required"
            :label="metadata.name"
            :is-field-only="metadata.isFieldOnly"
          />
        </template>

        <el-menu-item
          v-for="(option, key) in optionsList"
          :key="key"
          :index="option.name"
        >
          <el-popover
            placement="top"
            trigger="click"
            class="popover-field-options"
            style="padding: 0px !important; max-width: 400px"
            @hide="closePopover"
          >
            <component
              :is="option.componentRender"
              v-if="visibleForDesktop
                && showPanelFieldOption
                && option.name === currentFieldOption.name"
              :field-attributes="metadata"
              :field-value="valueField"
              :record-uuid="recordUuid"
              :show="visibleForDesktop"
              :container-manager="containerManager"
            />

            <el-button slot="reference" type="text" style="color: #606266;">
              <label-popover-option :option="option" style="display: flex;" />
            </el-button>
          </el-popover>
        </el-menu-item>
      </el-submenu>
    </el-menu>

    <span v-else key="options-form">
      <!-- label or name of field in form -->
      <label-field
        :is-mandatory="metadata.required"
        :label="metadata.name"
        :is-field-only="metadata.isFieldOnly"
      />
    </span>
  </div>
</template>

<script>
import { defineComponent, computed, ref, watch, onMounted } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// components and mixins
import LabelField from './LabelField.vue'
import LabelPopoverOption from './LabelPopoverOption.vue'

// utils and helper methods
import {
  // calculatorOptionItem,
  infoOptionItem,
  optionsListStandad, optionsListAdvancedQuery,
  documentStatusOptionItem, translateOptionItem,
  zoomInOptionItem,
  hideThisField
} from '@theme/components/ADempiere/FieldDefinition/FieldOptions/fieldOptionsList.js'
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
import { isLookup, LIST } from '@/utils/ADempiere/references.js'
import { isEmptyValue, typeValue } from '@/utils/ADempiere/valueUtils.js'
import { logsOptionItem } from './fieldOptionsList'

export default defineComponent({
  name: 'FieldOptions',

  components: {
    LabelField,
    LabelPopoverOption
  },

  props: {
    metadata: {
      type: Object
    },
    containerManager: {
      type: Object,
      default: () => ({})
    },
    recordUuid: {
      type: String,
      default: undefined
    }
  },

  setup(props, { root }) {
    const visibleForDesktop = ref(false)
    const showPopoverPath = ref(false)
    const triggerMenu = ref('click')
    const optionColumnName = ref(root.$route.query.fieldColumnName)

    // focus element with tab key
    const tabIndex = ref(9999)

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    // current option field selected
    const currentFieldOption = computed(() => {
      return store.getters.getFieldContextMenu
    })

    const valueField = computed(() => {
      const { parentUuid, containerUuid, columnName } = props.metadata
      return store.getters.getValueOfFieldOnContainer({
        parentUuid,
        containerUuid,
        columnName
      })
    })

    setTimeout(() => {
      if (isMobile.value && optionColumnName.value === props.metadata.columnName) {
        store.commit('changeShowRigthPanel', true)
        store.dispatch('setOptionField', {
          fieldAttributes: props.metadata,
          name: root.$route.query.typeAction,
          valueField: valueField.value
        })
      } else {
        showPopoverPath.value = true
      }
    }, 2000)

    // TODO: Manage with panel
    const panelContextMenu = computed(() => {
      return store.state.contextMenu.isShowRightPanel
    })

    // TODO: Manage with field
    const showPanelFieldOption = computed(() => {
      return store.state.contextMenu.isShowOptionField
    })

    const labelStyle = computed(() => {
      if (props.metadata.name.length >= 25) {
        return '35'
      } else if (props.metadata.name.length >= 20) {
        return '50'
      }
      return '110'
    })

    const fieldsListShowed = computed(() => {
      const { parentUuid, containerUuid } = props.metadata
      const fieldsList = props.containerManager.getFieldsList({
        parentUuid,
        containerUuid
      })

      return store.getters.getFieldsListNotMandatory({
        containerUuid: props.containerUuid,
        fieldsList,
        showedMethod: props.containerManager.isDisplayedField,
        isTable: props.inTable
      })
        .filter(itemField => {
          return itemField.isShowedFromUser &&
            itemField.columnName !== props.metadata.columnName
        }).map(itemField => {
          return itemField.columnName
        })
    })

    function redirect() {
      const { reference } = props.metadata
      let window = reference.zoomWindows
      if (typeValue(window) === 'ARRAY') {
        window = window[0]
      }
      let value = valueField.value

      let columnName = reference.keyColumnName
        .match(/(\.)(\b\w*)/ig)
        .toString()
        .replace('.', '')

      if (isEmptyValue(columnName)) {
        columnName = props.metadata.columnName
        // to Smart Browser
        if (isEmptyValue(props.parentUuid)) {
          columnName = props.metadata.elementName
        }
      }

      // TODO: Evaluate reference.keyColumnName: AD_Ref_List.Value
      if (props.metadata.displayType === LIST.id) {
        columnName = 'AD_Reference_ID'
        // TODO: Direct query is deprecated
        // const valueQuery = reference.directQuery
        //   .match(/AD_Reference_ID=\d+/i)
        //   .toString()
        // value = Number(valueQuery.replace(/[^\d]/g, ''))
        value = reference.id
      }

      const filters = [{
        columnName,
        value
      }]

      zoomIn({
        uuid: window.uuid,
        query: {
          filters
        }
      })
    }

    const isDocuemntStatus = computed(() => {
      if (!props.metadata.isColumnDocumentStatus) {
        return false
      }

      // if (!isEmptyValue(store.getters.getOrders)) {
      //   reutrn false
      // }

      const { parentUuid, containerUuid, columnName } = props.metadata
      const statusValue = store.getters.getValueOfField({
        parentUuid,
        containerUuid,
        columnName
      })
      if (!isEmptyValue(statusValue)) {
        return true
      }

      return false
    })

    const optionsList = computed(() => {
      const field = props.metadata
      const menuOptions = []
      // if (field.isNumericField) {
      //   menuOptions.push(calculatorOptionItem)
      // }

      // add hide this field with isShowdFromUser
      if (field.isParent || !field.required || !isEmptyValue(field.defaultValue)) {
        menuOptions.push(hideThisField)
      }
      // infoOption, operatorOption
      if (field.isAdvancedQuery) {
        return menuOptions.concat(optionsListAdvancedQuery)
      }

      if (field.isTranslatedField) {
        menuOptions.push(translateOptionItem)
      }
      if (isDocuemntStatus.value) {
        menuOptions.push(documentStatusOptionItem)
      }

      if (field.reference &&
        !isEmptyValue(field.reference.zoomWindows) &&
        isLookup(field.displayType)) {
        menuOptions.push(zoomInOptionItem)
      }

      if (field.componentPath === 'FieldButton') {
        const optionsButton = [
          infoOptionItem
        ]
        return optionsButton.concat(menuOptions)
      }

      // destruct to avoid deleting the reference to the original variable and to avoid mutating
      const optionsList = [
        ...optionsListStandad
      ]

      /**
       * Show change history only in windows
       */
      if (!isEmptyValue(props.metadata.parentUuid)) {
        optionsList.push(logsOptionItem)
      }
      return optionsList.concat(menuOptions)
    })

    const openOptionField = computed({
      get() {
        const option = optionsList.value.find(option => {
          return root.$route.query.typeAction === option.name
        })
        if (!isEmptyValue(root.$route.query) && option) {
          return true
        }
        return false
      },
      set(value) {
        if (!value) {
          showPopoverPath.value = false
          /*
          router.push({
            name: root.$route.name,
            query: {
              ...root.$route.query,
              typeAction: '',
              fieldColumnName: ''
            }
          }, () => {})
          */
        }
      }
    })

    const closePopover = () => {
      visibleForDesktop.value = false
      // store.commit('changeShowRigthPanel', false)
      // store.commit('changeShowPopoverField', true)
      /*
      router.push({
        name: root.$route.name,
        query: {
          ...root.$route.query,
          typeAction: '',
          fieldColumnName: ''
        }
      }, () => {})
      */
    }

    const handleOpen = (key, keyPath) => {
      triggerMenu.value = 'hover'
    }
    const handleClose = (key, keyPath) => {
      triggerMenu.value = 'click'
    }

    /**
     * Used by mobile menu
     */
    const handleCommand = (command) => {
      store.commit('setRecordAccess', false)

      handleOptionSelected(command.name)
    }

    /**
     * Used by desktop menu
     */
    const handleSelect = (key, keyPath) => {
      handleOptionSelected(key)

      triggerMenu.value = 'hover'
    }

    const handleOptionSelected = (optionName) => {
      if (optionName === language.t('table.ProcessActivity.zoomIn')) {
        redirect()
        return
      }
      if (optionName === language.t('fieldOptions.hideThisField')) {
        hideOnlyThisfield()
        return
      }

      if (optionName === language.t('field.logsField')) {
        const currrentRecord = store.getters.getTabCurrentRow({ containerUuid: props.metadata.containerUuid })
        const { tabTableName, columnName } = props.metadata
        store.dispatch('findFieldLogs', {
          tableName: tabTableName,
          recordId: currrentRecord[tabTableName + '_ID'],
          recordUuid: currrentRecord.UUID,
          columnName
        })
      }
      if (isMobile.value) {
        store.commit('changeShowRigthPanel', true)
      } else {
        store.commit('changeShowOptionField', true)
        visibleForDesktop.value = true
        // router.push({
        //   name: root.$route.name,
        //   query: {
        //     ...root.$route.query,
        //     typeAction: key,
        //     fieldColumnName: props.metadata.columnName
        //   }
        // }, () => {})
      }

      const option = optionsList.value.find(option => {
        return option.name === optionName
      })

      store.commit('changeShowPopoverField', true)
      store.dispatch('setOptionField', {
        ...option,
        valueField: valueField.value,
        fieldAttributes: props.metadata
      })
    }

    /**
     * Hide only this field
     */
    const hideOnlyThisfield = () => {
      const { parentUuid, containerUuid } = props.metadata
      props.containerManager.changeFieldShowedFromUser({
        parentUuid,
        containerUuid,
        fieldsShowed: fieldsListShowed.value
      })
    }

    watch(panelContextMenu, (newValue, oldValue) => {
      visibleForDesktop.value = false
    })

    watch(openOptionField, (newValue, oldValue) => {
      if (!newValue) {
        showPopoverPath.value = false
      }
    })

    onMounted(() => {
      // disable focus with tab key on label
      setTimeout(() => {
        tabIndex.value = -1
      }, 1000)
    })

    return {
      tabIndex,
      // computed
      currentFieldOption,
      isMobile,
      labelStyle,
      isDocuemntStatus,
      optionsList,
      openOptionField,
      visibleForDesktop,
      valueField,
      triggerMenu,
      showPanelFieldOption,
      // methods
      closePopover,
      handleClose,
      handleCommand,
      handleOpen,
      handleSelect
    }
  }
})
</script>

<style lang="scss">
.field-options {
  &.el-menu--horizontal,
  .el-menu--horizontal {
    // transparent background color of the field label
    &.el-menu {
      background: #FFF0;
    }
    &.el-menu:hover {
      background: #FFF0;
    }

    // height of the field label
    .el-submenu .el-submenu__title {
      height: 30px;
      line-height: 30px;
    }
    .el-submenu__title {
      height: 30px;
      line-height: 30px;
      // left spacing of field name
      padding: 0px;
    }
  }

  // hidde arrow icon
  .el-submenu .el-submenu__icon-arrow  {
    visibility: hidden;
  }

  // hide bottom line in label
  .el-menu.el-menu--horizontal,
  .el-submenu__title {
    border-bottom: solid 0px transparent !important;
  }
}
</style>
