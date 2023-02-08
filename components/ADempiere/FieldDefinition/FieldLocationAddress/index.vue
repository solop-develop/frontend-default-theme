<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
  <location-address-form
    v-if="metadata.pos"
    key="point-of-sales"
    class="location-form"
    :parent-metadata="metadata"
    :parent-uuid="parentUuid"
    :container-uuid="containerUuid"
    :container-manager="containerManager"
  />

  <el-popover
    v-else
    key="standard-location"
    ref="locationAddress"
    v-model="visble"
    class="popover-location"
    placement="left-end"
    width="350"
    trigger="click"
    @hide="hideLocationFrom"
    @show="setContextValues"
  >
    <location-address-form
      class="location-form"
      :parent-uuid="parentUuid"
      :container-uuid="containerUuid"
      :container-manager="containerManager"
      :metadata="metadata"
    />

    <el-button
      slot="reference"
      class="button-location-show"
      type="text"
      style="width: 100%;"
      :disabled="isDisabled"
    >
      <el-input
        v-model="displayedValueNotEdit"
        clearable
        v-bind="commonsProperties"
        :disabled="isDisabled"
        style="width: 100%;"
        @clear="cleanTextValue"
      >
        <i slot="prefix" class="el-icon-location-information el-input__icon" />
      </el-input>
    </el-button>
  </el-popover>
</template>

<script>
import { defineComponent, computed, ref, watch } from '@vue/composition-api'
import store from '@/store'
// Components and Mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
// import mixinLocation from './mixinLocationAddress.js'
import LocationAddressForm from './locationAddressForm.vue'
import useLocationField from './useLocationField.js'
// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'FieldLocationAddress',

  components: {
    LocationAddressForm
  },

  mixins: [
    fieldMixin
    // mixinLocation
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
    containerManager: {
      type: Object,
      required: true
    },
    metadata: {
      type: Object,
      required: true
    }
  },
  setup(props, { root, refs }) {
    const {
      parentUuid,
      containerUuid,
      displayColumnName,
      columnName
    } = props.metadata

    const visble = ref(false)

    const { isShowedLocationForm, uuidForm, setValues } = useLocationField({
      metadata: props.metadata,
      containerManager: props.containerManager
    })

    const displayedValueNotEdit = computed({
      // getter
      get() {
        return displayedValue.value
      },
      // setter
      set(newValue) {
        // emty, dont edit
      }
    })
    // store.commit('setShowedLocation', false)
    const displayedValue = computed({
      get() {
        return store.getters.getValueOfFieldOnContainer({
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: displayColumnName
        })
      },
      set(value) {
        store.commit('updateValueOfField', {
          parentUuid: parentUuid,
          containerUuid: containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: displayColumnName,
          value
        })
      }
    })

    function setContextValues(params) {
      // isShowedLocationForm.value = true
      // if (isShowedLocationForm.value) {
      //   return
      // }
      store.commit('setShowedLocation', true)
    }

    function hideLocationFrom(params) {
      store.commit('setShowedLocation', false)
    }

    function cleanTextValue() {
      displayedValue.value = undefined

      store.dispatch('clearValuesOnContainer', {
        containerUuid: uuidForm.value
      })

      store.dispatch('notifyFieldChange', {
        containerUuid,
        containerManager: props.containerManager,
        field: props.metadata,
        columnName,
        newValue: undefined
      })
    }

    watch(isShowedLocationForm, (newValue, oldValue) => {
      // if (newValue !== visble.value) {
      // visble.value = newValue
      // }
      if (!newValue) {
        visble.value = newValue
      }
    })
    // watch(visble, (newValue, oldValue) => {
    //   console.log({ newValue })
    //   // if (newValue !== visble.value) {
    //   // visble.value = newValue
    //   // }
    // })

    return {
      uuidForm,
      visble,
      isShowedLocationForm,
      displayedValueNotEdit,
      displayedValue,
      setValues,
      cleanTextValue,
      setContextValues,
      hideLocationFrom
    }
  }
})
</script>

<style lang="scss">
/**
 * span tag as button and label text
 */
.button-location-show {
  padding-top: 0px !important;
}
</style>
