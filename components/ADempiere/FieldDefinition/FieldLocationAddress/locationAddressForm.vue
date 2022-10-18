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
  <div class="wrapper">
    <el-form
      v-shortkey="{ closeForm: ['esc'] }"
      label-position="top"
      size="small"
      class="location-address"
      @shortkey.native="keyAction"
    >
      <el-row :gutter="0">
        <template v-if="!isLoadingFields">
          <el-col v-for="(fieldAttributes) in metadataList" :key="fieldAttributes.columnName" :span="24">
            <field-definition
              :parent-uuid="parentUuid"
              :container-uuid="containerUuid"
              :container-manager="containerManagerLocation"
              :metadata-field="fieldAttributes"
            />
          </el-col>
        </template>

        <div
          v-else
          key="form-loading"
          v-loading="isLoadingFields"
          :element-loading-text="$t('notifications.loading')"
          element-loading-spinner="el-icon-loading"
          element-loading-background="rgba(255, 255, 255, 0.8)"
          style="min-height: calc(50vh - 84px)"
          class="loading-panel"
        />

        <el-col v-show="!metadata.pos" :span="24" style="padding-left: 12px;padding-right: 12px;padding-top: 3%;padding-bottom: 3%;">
          <samp style="float: right; padding-right: 10px;">
            <el-button
              :disabled="isLoadingFields"
              type="primary"
              class="custom-button-address-location"
              icon="el-icon-check"
              @click="sendValuesToServer"
            />
            <el-button
              type="danger"
              class="custom-button-address-location"
              icon="el-icon-close"
              @click="cancelChanges"
            />
          </samp>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import store from '@/store'

// components and mixins
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
import mixinLocation from './mixinLocationAddress.js'

// constants
import FieldsList from './fieldsList.js'
import { DISPLAY_COLUMN_PREFIX, UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX } from '@/utils/ADempiere/dictionaryUtils'
import { COLUMN_NAME, LOCATION_ADDRESS_FORM } from '@/utils/ADempiere/dictionary/form/locationAddress'

// api request methods
import { getLocationAddress } from '@/api/ADempiere/field/location.js'
import {
  createLocationAddress,
  updateLocationAddress
} from '@/api/ADempiere/field/location.js'

// utils and helper methods
import { createFieldFromDictionary } from '@/utils/ADempiere/lookupFactory'
import { showNotification } from '@/utils/ADempiere/notification.js'
import { getSequenceAsList } from '@/utils/ADempiere/dictionary/form/locationAddress'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

/**
 * Location Address form to field
 */
export default {
  name: 'LocationAdressFrom',

  components: {
    FieldDefinition
  },

  mixins: [
    mixinLocation
  ],

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    metadata: {
      type: Object,
      default: () => {
        return {
          // TODO: Add container uuid parent
          uuid: LOCATION_ADDRESS_FORM,
          containerUuid: LOCATION_ADDRESS_FORM,
          columnName: COLUMN_NAME
        }
      }
    }
  },

  data() {
    return {
      metadataList: [],
      isLoadingFields: false,
      fieldsList: FieldsList,
      timeOutFields: null,
      isCustomForm: true,
      unsubscribe: () => {}
    }
  },

  computed: {
    containerManagerLocation() {
      return {
        ...this.containerManager,

        getFieldsList({ containerUuid }) {
          return store.getters.getFieldLocation
        },

        isReadOnlyField({ isReadOnly }) {
          return isReadOnly
        }
      }
    },
    fieldsListLocation() {
      if (!this.isEmptyValue(this.$store.getters.getFieldLocation)) {
        return this.$store.getters.getFieldLocation
      }
      return []
    },
    locationId() {
      return this.$store.getters.getValueOfField({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        columnName: this.metadata.columnName
      })
    }
  },

  created() {
    this.unsubscribe = this.subscribeChanges()
  },

  mounted() {
    if (this.metadata.pos) {
      this.fieldsList.forEach(element => {
        element.containerUuid = this.metadata.containerUuid
      })
    }
    this.getLocation()

    clearTimeout(this.timeOutFields)
    this.timeOutFields = setTimeout(() => {
      this.getFieldsList()
    }, 500)
  },

  beforeDestroy() {
    this.unsubscribe()
  },

  methods: {
    keyAction(event) {
      if (event.srcKey === 'closeForm') {
        this.toggleShowedLocationForm()
      }
    },

    /**
     * Set values into form
     * TODO: Displayed value not wortking
     */
    setValues({ values }) {
      // let cityName = values['DisplayColumn_C_City_ID']
      // if (isEmptyValue(cityName)) {
      //   cityName = values['City']
      //   if (!isEmptyValue(values['C_City_ID']) && values['C_City_ID'] > 0) {
      //     // get with default value
      //     cityName = undefined
      //   } else {
      //     // set with empty id
      //     // values['C_City_ID'] = -1
      //   }
      // }

      // let regionName = values['DisplayColumn_C_Region_ID']
      // if (isEmptyValue(regionName)) {
      //   regionName = values['RegionName']
      //   if (!isEmptyValue(values['C_Region_ID']) && values['C_Region_ID'] > 0) {
      //     // get with default value
      //     regionName = undefined
      //   } else {
      //     // set with empty id
      //     // values['C_Region_ID'] = -1
      //   }
      // }

      // let countryName = values['DisplayColumn_C_Region_ID']
      // if (isEmptyValue(countryName)) {
      //   if (!isEmptyValue(this.currentCountryDefinition)) {
      //     countryName = this.currentCountryDefinition.name
      //     values['C_Region_ID_UUID'] = this.currentCountryDefinition.uuid
      //   }
      // }

      // set context values to form continer
      this.$store.dispatch('updateValuesOfContainer', {
        containerUuid: this.uuidForm,
        attributes: {
          // DisplayColumn_C_City_ID: cityName,
          // DisplayColumn_C_Region_ID: regionName,
          // DisplayColumn_C_Country_ID: countryName,
          // undefined to force get value with default value
          DisplayColumn_C_City_ID: undefined,
          DisplayColumn_C_Region_ID: undefined,
          DisplayColumn_C_Country_ID: undefined,
          ...values
        }
      })
    },
    cancelChanges() {
      // TODO: Set old values
      this.isShowedLocationForm = false
    },
    sortSequence(itemA, itemB) {
      return itemA.index - itemB.index
    },
    subscribeChanges() {
      return this.$store.subscribe((mutation, state) => {
        // if changed country field
        if (
          mutation.type === 'updateValueOfField' &&
          mutation.payload.containerUuid === this.uuidForm &&
          mutation.payload.columnName === 'C_Country_ID'
        ) {
          // Get country definition to sequence fields and displayed value
          this.changeCaptureSequence(mutation.payload.value)
        }
      })
    },

    /**
     * Change fields order
     * @param {number} countryId
     */
    changeCaptureSequence(countryId) {
      this.$store.dispatch('getCountryDefinition', {
        id: countryId
      })
        .then(responseCountry => {
          const { captureSequence, regionName } = responseCountry

          // capture sequence by form fields
          const newSequence = getSequenceAsList(captureSequence)
          let newFieldsList = this.fieldsListLocation
            .map(item => {
              if (newSequence.includes(item.sequenceFields)) {
                return {
                  ...item,
                  isDisplayed: true,
                  index: newSequence.indexOf(item.sequenceFields)
                }
              }
              return {
                ...item,
                isDisplayed: false
              }
            })
            .filter(item => item.isDisplayed)
            .sort((itemA, itemB) => {
              return itemA.index - itemB.index
            })

          // rename field title on region
          if (captureSequence.includes('@R@') && !isEmptyValue(regionName)) {
            newFieldsList = newFieldsList.map(field => {
              if (field.sequenceFields === 'R') {
                return {
                  ...field,
                  name: regionName
                }
              }
              return field
            })
          }

          // set new order of fields
          this.metadataList = newFieldsList
        })
        .catch(error => {
          this.$message({
            message: error.message,
            isShowClose: true,
            type: 'error'
          })
          console.warn(`Error getting Country Definition: ${error.message}. Code: ${error.code}.`)
        })
    },

    /**
     * set context values to parent continer
     * @param {object} values
     */
    setParentValues(rowData) {
      const { parentUuid, containerUuid, columnName, elementName, displayColumnName } = this.metadata
      const { UUID: uuid } = rowData

      const displayedValue = this.generateDisplayedValue(rowData)

      let value = rowData[columnName]
      if (isEmptyValue(value) && !this.metadata.isSameColumnElement) {
        value = rowData[elementName]
      }

      // set ID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName,
        value: rowData[columnName]
      })
      // set display column (name) value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        // DisplayColumn_'ColumnName'
        columnName: displayColumnName,
        value: displayedValue
      })
      // set UUID value
      this.$store.commit('updateValueOfField', {
        parentUuid,
        containerUuid,
        columnName: columnName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
        value: uuid
      })

      // set on element name, used by columns views aliases
      if (!this.metadata.isSameColumnElement) {
        // set ID value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          columnName: elementName,
          value
        })
        // set display column (name) value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: DISPLAY_COLUMN_PREFIX + elementName,
          value: displayedValue
        })
        // set UUID value
        this.$store.commit('updateValueOfField', {
          parentUuid,
          containerUuid,
          columnName: elementName + UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX,
          value: uuid
        })
      }
    },

    /**
     * Get attributes list to server
     * @returns {array} attributesToServer
     */
    getAttributesToServer(attributesList) {
      const attributesToServer = attributesList
        .filter(attributeItem => {
          const { columnName } = attributeItem
          if (columnName.startsWith(DISPLAY_COLUMN_PREFIX) || columnName === 'C_Location_ID') {
            return false
          }
          return true
        })

      const cityName = this.$store.getters.getValueOfField({
        containerUuid: this.containerUuid,
        columnName: 'DisplayColumn_C_City_ID'
      })
      if (!this.isEmptyValue(cityName)) {
        attributesToServer.push({
          columnName: 'City',
          value: cityName
        })
      }

      const regionName = this.$store.getters.getValueOfField({
        containerUuid: this.containerUuid,
        columnName: 'DisplayColumn_C_Region_ID'
      })
      if (!this.isEmptyValue(cityName)) {
        attributesToServer.push({
          columnName: 'RegionName',
          value: regionName
        })
      }

      return attributesToServer
    },

    sendValuesToServer() {
      const emptyMandatoryFields = this.$store.getters.getFieldsListEmptyMandatory({
        containerUuid: this.containerUuid,
        formatReturn: 'name'
      })

      if (!this.isEmptyValue(emptyMandatoryFields)) {
        showNotification({
          type: 'warning',
          title: this.$t('notifications.emptyValues'),
          name: '<b>' + emptyMandatoryFields + '.</b> ',
          message: this.$t('notifications.fieldMandatory'),
          isRedirect: false
        })
        return
      }

      const attributes = this.$store.getters.getValuesView({
        containerUuid: this.containerUuid
      })
      const attributesToServer = this.getAttributesToServer(attributes)

      const updateLocation = (responseLocation) => {
        // set form values
        this.setValues({
          values: responseLocation.attributes
        })

        // set field parent values
        this.setParentValues(responseLocation.attributes)
        this.isShowedLocationForm = false

        // set context values to form continer
        this.$store.dispatch('updateValuesOfContainer', {
          parentUuid: this.parentUuid,
          containerUuid: this.containerUuid,
          attributes
        })

        return responseLocation.attributes
      }

      const locationId = this.locationId
      if (this.isEmptyValue(locationId) || locationId === 0) {
        createLocationAddress({
          attributesList: attributesToServer
        })
          .then(updateLocation)
          .then(responseCreate => {
            const {
              parentUuid,
              containerUuid,
              columnName // 'C_Location_ID' by default
            } = this.metadata

            const recordUuid = this.$store.getters.getValueOfField({
              parentUuid,
              containerUuid,
              columnName: 'UUID'
            })

            this.containerManager.actionPerformed({
              containerUuid,
              field: this.metadata,
              value: responseCreate[columnName],
              recordUuid
            })
          })
          .catch(error => {
            this.$message({
              message: error.message,
              isShowClose: true,
              type: 'error'
            })
            console.warn(`Error create Location Address: ${error.message}. Code: ${error.code}.`)
          })
        // break to only create
        return
      }
      updateLocationAddress({
        id: locationId,
        attributesList: attributesToServer
      })
        .then(updateLocation)
        .catch(error => {
          this.$message({
            message: error.message,
            isShowClose: true,
            type: 'error'
          })
          console.warn(`Error update Location Address: ${error.message}. Code: ${error.code}.`)
        })
    },

    /**
     * TODO: Manage with vuex module
     */
    getLocation() {
      if (this.isGettingLocation) {
        return
      }

      const id = this.locationId
      if (isEmptyValue(id)) {
        this.clearValues()
        return
      }

      this.isGettingLocation = true
      getLocationAddress({
        id
      })
        .then(responseLocation => {
          const { attributes } = responseLocation

          this.setValues({
            values: attributes
          })

          const countryId = attributes['C_Country_ID']
          this.changeCaptureSequence(countryId)
        })
        .catch(error => {
          console.warn(`Get Location Address, Form Location - Error ${error.code}: ${error.message}.`)
        })
        .finally(() => {
          this.isGettingLocation = false
        })
    },
    getFieldsList() {
      this.isLoadingFields = true
      const listOfFields = []

      if (!isEmptyValue(this.fieldsListLocation)) {
        this.metadataList = this.fieldsListLocation
        this.changeCaptureSequence(this.countryId)
        this.isLoadingFields = false
        return
      }

      this.fieldsList.forEach(element => {
        // get of server
        createFieldFromDictionary(element)
          .then(responseField => {
            listOfFields.push({
              ...responseField,
              parentUuid: this.metadata.parentUuid,
              containerUuid: this.uuidForm
            })
          }).catch(error => {
            console.warn(`LookupFactory: Get Field From Server (State) - Error ${error.code}: ${error.message}.`)
          })
          .finally(() => {
            if (listOfFields.length === this.fieldsList.length) {
              this.$store.commit('setFieldsListLocation', listOfFields)

              this.metadataList = listOfFields
              this.changeCaptureSequence(this.countryId)
              this.isLoadingFields = false
            }
          })
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .location-address {
    .el-form-item {
        margin-bottom: 0px !important;
    }

    .custom-button-address-location {
      float: right;
      margin-right: 10px;
    }
  }
</style>
<style lang="scss">
.location-address {
  .el-form-item--small .el-form-item__label {
    line-height: 22px !important;
  }
  .el-form-item--small.el-form-item {
    margin-bottom: 5px !important;
  }
}
</style>
