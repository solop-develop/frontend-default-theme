// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Yamel Senih ysenih@erpya.com www.erpya.com
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export default {
  name: 'MixinField',

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
    metadata: {
      type: Object,
      required: true
    }
  },

  computed: {
    autoSave() {
      return this.$store.state.settings.autoSave
    },
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    isDisabled() {
      return Boolean(this.metadata.readonly || this.metadata.disabled)
    },
    /**
     * Commons properties in components fields
     */
    commonsProperties() {
      return {
        class: this.cssClassStyle,
        disabled: this.isDisabled,
        placeholder: this.metadata.placeholder,
        readonly: Boolean(this.metadata.readonly),
        ref: this.metadata.columnName
      }
    },
    cssClassStyle() {
      let styleClass = ''
      if (this.isEmptyRequired) {
        styleClass += ' field-empty-required '
      }

      if (!this.isEmptyValue(this.metadata.cssClassName)) {
        styleClass = this.metadata.cssClassName
      }

      return styleClass
    },
    isEmptyRequired() {
      return this.isEmptyValue(this.value) && this.metadata.required
    },
    storedDefaultValue() {
      return this.$store.getters.getStoredDefaultValue({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        contextColumnNames: this.metadata.contextColumnNames,
        //
        uuid: this.metadata.uuid,
        id: this.metadata.id
      })
    },
    value: {
      get() {
        const { columnName, containerUuid, inTable } = this.metadata

        // table records values
        if (inTable) {
          // implement container manager row
          if (this.containerManager && this.containerManager.getCell) {
            return this.containerManager.getCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName
            })
          }
        }

        // main panel values
        return this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName
        })
      },
      set(value) {
        const { columnName, containerUuid, inTable } = this.metadata

        // table records values
        if (inTable) {
          // implement container manager row
          if (this.containerManager && this.containerManager.setCell) {
            return this.containerManager.setCell({
              containerUuid,
              rowIndex: this.metadata.rowIndex,
              columnName,
              value
            })
          }
        }

        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName,
          value
        })
      }
    },
    currentTab() {
      if (this.isEmptyValue(this.metadata.parentUuid) || !this.containerManager.getPanel) {
        return {}
      }
      return this.containerManager.getPanel({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid
      })
    },
    currentRecord() {
      return this.$store.getters.getTabCurrentRow({ containerUuid: this.metadata.containerUuid })
    },
    currentFieldList() {
      return this.$store.getters.getCurrentFieldList
    }
  },

  watch: {
    currentFieldList(value) {
      const tabPanel = this.$store.getters.getContainerInfo
      const fieldFocusColumnName = this.$store.getters.getFieldFocusColumnName
      if (
        !this.isEmptyValue(fieldFocusColumnName) &&
        !this.isEmptyValue(tabPanel) &&
        fieldFocusColumnName &&
        this.metadata.columnName === fieldFocusColumnName &&
        tabPanel.currentTab.containerUuid === this.metadata.containerUuid &&
        !this.isEmptyValue(this.$refs) &&
        !this.isEmptyValue(this.$refs[fieldFocusColumnName]) &&
        tabPanel.id === this.currentTab.id
      ) {
        this.$refs[fieldFocusColumnName].focus()
      }
      // this.$refs[fieldFocusColumnName].focus()
    }
  },

  created() {
    if (this.metadata.isGetServerValue && this.isEmptyValue(this.value)) {
      this.setDefaultValue()

      // change depends fields
      // this.preHandleChange(value)
      this.activeLogics()
    }
  },

  mounted() {
    const tabPanel = this.$store.getters.getContainerInfo
    if (
      this.metadata.handleRequestFocus &&
      !this.isEmptyValue(tabPanel) &&
      !this.isEmptyValue(tabPanel.currentTab) &&
      tabPanel.id === this.currentTab.id
    ) {
      this.requestFocus()
    }
  },

  methods: {
    /**
     * Parse the value to a new value if required for element-ui component
     * compatibility where this method is overwritten
     * @param {mixed} value
     */
    parseValue(value) {
      return value
    },

    /**
     * Get default value from server
     * @returns promisse with object = { value, defaultValue, uuid, id }
     */
    getDefaultValueFromServer() {
      if (this.containerManager && this.containerManager.getDefaultValue) {
        return this.containerManager.getDefaultValue({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          contextColumnNames: this.metadata.contextColumnNames,
          //
          uuid: this.metadata.uuid,
          id: this.metadata.id,
          columnName: this.metadata.columnName,
          value: this.value
        })
      }

      // return default parsed value
      return Promise.resolve({
        value: this.parseValue(this.value),
        displayedValue: undefined
      })
    },

    async setDefaultValue() {
      let value
      let displayedValue
      const storedValues = this.storedDefaultValue

      if (!this.isEmptyValue(storedValues)) {
        // get from server
        const {
          value: valueOfStore,
          displayedValue: displayedValueOfStore
        } = storedValues

        value = valueOfStore
        displayedValue = displayedValueOfStore
      } else {
        // get from server
        const {
          value: valueOfServer,
          displayedValue: displayedValueOfServer
        } = await this.getDefaultValueFromServer()

        value = valueOfServer
        displayedValue = displayedValueOfServer
      }

      // set value into component and fieldValue store
      this.displayedValue = displayedValue
      this.value = this.parseValue(value)
    },

    /**
     * Set focus if handle focus attribute is true
     */
    requestFocus() {
      if (this.$refs[this.metadata.columnName]) {
        this.$refs[this.metadata.columnName].focus()
      }
    },
    /**
     * Overwrite component method if necessary
     * validate values before send values to store or server
     * @param {mixed} value
     */
    preHandleChange(value) {
      this.handleFieldChange({ value })
    },
    focusGained(value) {
      // const info = {
      //   columnName: this.metadata.columnName
      // }
      // this.$store.dispatch('fieldListInfo', { info })
      this.$store.commit('setFieldFocusColumnName', this.metadata.columnName)

      if (this.metadata.handleContentSelection) {
        // select all the content inside the text box
        if (!this.isEmptyValue(value.target.selectionStart) &&
          !this.isEmptyValue(value.target.selectionStart)) {
          value.target.selectionStart = 0
          value.target.selectionEnd = value.target.value.length
        }
      }
      if (this.metadata.handleFocusGained) {
        this.$store.dispatch('notifyFocusGained', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          value: this.value
        })
      }
      this.setContainerInformation()
    },
    focusLost(value) {
      this.$store.commit('setFieldFocusColumnName', this.metadata.columnName)
      if (this.metadata.handleFocusLost) {
        this.$store.dispatch('notifyFocusLost', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          value: this.value
        })
      }
    },
    keyPressed(value) {
      if (this.metadata.handleKeyPressed) {
        this.$store.dispatch('notifyKeyPressed', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          value: value.key,
          keyCode: value.keyCode
        })
      }
    },
    /**
     * Keyup enter event on DOM element, call this method
     * @param {object} event html
     */
    actionKeyPerformed(event) {
      if (this.metadata.handleActionKeyPerformed) {
        this.$store.dispatch('notifyActionKeyPerformed', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          value: event.target.value,
          keyCode: event.keyCode
        })
      }
      // enter key sends the values
      // this.preHandleChange(event.target.value)
    },
    keyReleased(value) {
      if (this.metadata.handleKeyReleased) {
        this.$store.dispatch('notifyKeyReleased', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          value: value.key,
          keyCode: value.keyCode
        })
      }
    },

    /**
     * Active or calling change logics on depends fields
     */
    activeLogics() {
      let fieldsList = []
      if (this.containerManager.getFieldsList) {
        fieldsList = this.containerManager.getFieldsList({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          root: this
        })
      }

      this.$store.dispatch('changeDependentFieldsList', {
        field: this.metadata,
        fieldsList,
        containerManager: this.containerManager
      })
    },

    /**
     * @param {mixed} value, main value in component
     * @param {mixed} valueTo, used in end value in range
     * @param {string} displayedValue, or displayColumnName to show in select
     */
    handleFieldChange({
      value,
      valueTo,
      displayedValue
    }) {
      // Global Action performed
      const info = {
        columnName: this.metadata.columnName
      }
      this.$store.dispatch('fieldListInfo', { info })
      this.setContainerInformation()
      this.$store.commit('setFieldFocusColumnName', this.metadata.columnName)
      if (this.metadata.handleActionPerformed && this.autoSave) {
        this.$store.dispatch('notifyActionPerformed', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.columnName,
          value
        })
        if (this.metadata.columnName !== this.metadata.elementName) {
          this.$store.dispatch('notifyActionPerformed', {
            containerUuid: this.metadata.containerUuid,
            columnName: this.metadata.elementName,
            value
          })
        }
      }

      // if is custom field, set custom handle change value
      if (this.metadata.isCustomField) {
        if (this.metadata.isActiveLogics) {
          this.activeLogics()
        }
        return
      }

      this.$store.dispatch('notifyFieldChange', {
        containerUuid: this.metadata.containerUuid,
        containerManager: this.containerManager,
        field: this.metadata,
        columnName: this.metadata.columnName
      })
    },
    setContainerInformation() {
      if (!this.isEmptyValue(this.currentTab)) {
        this.$store.dispatch('panelInfo', {
          currentTab: this.currentTab,
          currentRecord: this.currentRecord
        })
      }
    }
  }
}
