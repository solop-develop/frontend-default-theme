<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Yamel Senih ysenih@erpya.com www.erpya.com
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
  <div class="field-definition">
    <component
      :is="componentRender"
      v-if="inTable"
      :id="field.panelType !== 'form' ? field.columnName : ''"
      key="is-table-template"
      class="in-table"
      :parent-uuid="parentUuid"
      :container-uuid="containerUuid"
      :container-manager="containerManager"
      :metadata="fieldAttributes"
      :in-table="true"
    />

    <el-col
      v-else-if="!inTable && isDisplayedField"
      key="is-panel-template"
      :xs="sizeField.xs"
      :sm="sizeField.sm"
      :md="sizeField.md"
      :lg="sizeField.lg"
      :xl="sizeField.xl"
    >
      <el-form-item :class="classFrom">
        <template slot="label">
          <field-options
            v-if="!isOnlyField"
            :metadata="fieldAttributes"
            :container-manager="containerManager"
            :record-uuid="recordUuid"
          />
        </template>

        <component
          :is="componentRender"
          :id="field.panelType !== 'form' ? field.columnName : ''"
          :ref="field.columnName"
          :parent-uuid="parentUuid"
          :container-uuid="containerUuid"
          :container-manager="containerManager"
          :metadata="fieldAttributes"
        />
      </el-form-item>
    </el-col>
  </div>
</template>

<script>
import store from '@/store'

// components and mixins
import FieldOptions from '@theme/components/ADempiere/FieldDefinition/FieldOptions/index.vue'

// constants
import { UUID } from '@/utils/ADempiere/constants/systemColumns'
import { TEXT, DEFAULT_SIZE } from '@/utils/ADempiere/references'
import { OPERATORS_MULTIPLE_VALUES } from '@/utils/ADempiere/dataUtils'
import { LAYOUT_MAX_COLUMNS_PER_ROW, DEFAULT_COLUMNS_PER_ROW } from '@/utils/ADempiere/componentUtils'
import { LOCATION_ADDRESS_FORM } from '@/utils/ADempiere/constants/location.js'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { evalutateTypeField } from '@/utils/ADempiere/dictionaryUtils'

/**
 * This is the base component for linking the components according to the
 * reference (or type of visualization) of each field
 */
export default {
  name: 'FieldDefinition',

  components: {
    FieldOptions
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
    // receives the property that is an object with all the attributes
    metadataField: {
      type: Object,
      default: () => ({})
    },
    // inGroup: {
    //   type: Boolean,
    //   default: false
    // },
    inTable: {
      type: Boolean,
      default: false
    },
    isAdvancedQuery: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      field: {}
    }
  },

  computed: {
    isMobile() {
      return store.state.app.device === 'mobile'
    },
    classFrom() {
      if (['FieldTextLong', 'FieldImage'].includes(this.field.componentPath)) {
        return 'field-text-long'
      }
      if ([TEXT.id].includes(this.field.displayType)) {
        return 'field-text-area'
      }
      return 'field-standard'
    },
    currentColumnSize() {
      return store.getters.getSizeColumn({
        containerUuid: this.containerUuid
      })
    },
    sizeField() {
      if (this.field.containerUuid === LOCATION_ADDRESS_FORM) {
        return {
          // ...this.field.size,
          xs: 24,
          sm: 24,
          md: 24,
          lg: 24,
          xl: 24
        }
      }
      if (!this.field.isCustomField && DEFAULT_COLUMNS_PER_ROW >= 0 && !this.isMobile) {
        const size = parseInt(LAYOUT_MAX_COLUMNS_PER_ROW / this.currentColumnSize, 10)
        return {
          xs: size,
          sm: size,
          md: size,
          lg: size,
          xl: size
        }
      }

      if (isEmptyValue(this.field.size)) {
        const size = 24
        return {
          xs: size,
          sm: size,
          md: size,
          lg: size,
          xl: size,
          ...DEFAULT_SIZE
        }
      }
      return {
        // ...this.field.size,
        xs: this.field.size.xs,
        sm: this.field.size.sm,
        md: this.field.size.md,
        lg: this.field.size.lg,
        xl: this.field.size.xl
      }
    },
    // load the component that is indicated in the attributes of received property
    componentRender() {
      if (isEmptyValue(this.field.componentPath || !this.field.isSupported)) {
        return () => import('@theme/components/ADempiere/FieldDefinition/FieldText')
      }
      if (this.isSelectCreated) {
        return () => import('@theme/components/ADempiere/FieldDefinition/FieldSelectMultiple')
      }

      // return () => import('@theme/components/ADempiere/FieldDefinition/' + this.field.componentPath)
      return () => import(`@theme/components/ADempiere/FieldDefinition/${this.field.componentPath}`)
    },
    fieldAttributes() {
      return {
        ...this.field,
        inTable: this.inTable,
        isAdvancedQuery: this.isAdvancedQuery,
        // DOM properties
        required: this.isMandatoryField,
        readonly: this.isReadOnlyField,
        displayed: this.isDisplayedField,
        disabled: !this.field.isActive,
        isSelectCreated: this.isSelectCreated,
        placeholder: this.field.help ? this.field.help.slice(0, 40) + '...' : ''
      }
    },

    isDisplayedField() {
      if (this.inTable) {
        return true
      }
      // validate with container manager
      if (this.containerManager.isDisplayedField(this.field)) {
        const isDisplayedDefault = this.containerManager.isDisplayedDefault({
          ...this.field,
          isMandatory: this.isMandatoryField
        })
        // madatory. not parent column and without default value to window, mandatory or with default value to others
        if (isDisplayedDefault) {
          return true
        }

        // showed by user
        return this.field.isShowedFromUser
      }
      return false
    },

    /**
     * Idicate if field is read only
     */
    isReadOnlyField() {
      if (this.inTable) {
        // table manage with isReadOnlyColumn method
        // if rendered the component is editable
        return false
      }

      // validate with container manager
      return this.containerManager.isReadOnlyField(this.field)
    },
    isMandatoryField() {
      // validate with container manager
      return this.containerManager.isMandatoryField(this.field)
    },

    recordUuid() {
      // is active record
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid,
        columnName: UUID
      })
    },

    isSelectCreated() {
      return this.isAdvancedQuery &&
        OPERATORS_MULTIPLE_VALUES.includes(this.field.operator) &&
        !['FieldBinary', 'FieldDate', 'FieldSelect', 'FieldYesNo'].includes(this.field.componentPath)
    },

    isOnlyField() {
      return this.field.isFieldOnly ||
        this.field.componentPath === 'FieldButton'
    },
    currentTab() {
      if (this.isEmptyValue(this.parentUuid) || !this.containerManager.getPanel) {
        return {}
      }
      return this.containerManager.getPanel({
        parentUuid: this.parentUuid,
        containerUuid: this.containerUuid
      })
    }
  },

  watch: {
    metadataField(value) {
      this.field = value
    }
  },

  created() {
    // assined field with prop
    this.field = this.metadataField
    if (this.field.isCustomField && !this.field.componentPath) {
      let componentReference = evalutateTypeField(this.field.displayType)
      if (isEmptyValue(componentReference)) {
        componentReference = {
          componentPath: 'FieldText'
        }
      }
      this.field = {
        ...this.metadataField,
        isActive: true,
        isDisplayed: true,
        isDisplayedFromLogic: true,
        isShowedFromUser: true,
        //
        componentPath: componentReference.componentPath
      }
    }
  },

  methods: {
    focusField(columnName) {
      const tabPanel = this.$store.getters.getContainerInfo
      setTimeout(() => {
        if (!this.isMobile && this.field.columnName === columnName && !isEmptyValue(this.$refs)) {
          if (
            this.$refs[columnName] &&
            this.$refs[columnName].$refs &&
            this.$refs[columnName].$refs[columnName] &&
            !this.isEmptyValue(tabPanel) &&
            !this.isEmptyValue(tabPanel.currentTab) &&
            tabPanel.id === this.currentTab.id
          ) {
            this.$refs[columnName].$refs[columnName].focus()
          }
        }
      }, 1000)
    }
  }
}
</script>

<style lang="scss">
.field-definition {
  /**
   * Separation between elements (item) of the form
   */
  .from-text-long {
    max-height: 300px;
    min-height: 250px;
  }
  .from-field {
    max-height: 65px;
  }
  .el-form-item {
    margin-bottom: 12px !important;
    margin-left: 10px;
    margin-right: 10px;
  }
  .field-text-long {
    max-height: 300px;
    min-height: 250px;
  }

  /**
   * Maximum height to avoid distorting the field list
   */
  .field-standard {
    &:not(.in-table) {
      max-height: 60px;
    }

    .el-form-item__content {
      max-height: 36px !important;
    }
  }

  /*
  .in-table {
    margin-bottom: 0px !important;
    margin-left: 0px;
    margin-right: 0px;
  }
  */

  /**
   * Min height all text area, not into table
   */
  .el-textarea__inner:not(.in-table) {
    min-height: 36px !important;
    // height: 36px auto !important;
    // max-height: 54.2333px !important;
  }

  /**
   * Reduce the spacing between the form element and its label
   */
  .el-form-item__label {
    padding-bottom: 0px;
  }

  /*
  .pre-formatted {
    white-space: pre;
  }
  */

  /**
   * Red border in empty mandatory field
   */
  .field-empty-required {
    .el-input__inner,
    .tui-editor-defaultUI,
    .el-textarea__inner {
      border-color: #f55 !important;
    }
  }
}
</style>
