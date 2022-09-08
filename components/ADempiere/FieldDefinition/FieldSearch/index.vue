<template>
  <component
    :is="componentRender"
    :parent-uuid="parentUuid"
    :container-uuid="containerUuid"
    :container-manager="containerManager"
    :metadata="metadata"
    :icon="iconComponentRender"
  />
</template>

<script>
// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere'

/**
 * This component emulates the behavior of the search field, contemplating:
 * - Search Field
 * - InfoBPartner
 * - InfoProduct
 * - InfoInvoice
 * - InfoAsset
 * - InfoOrder
 * - InfoInOut
 * - InfoPayment
 * - InfoCashLine
 * - InfoAssignment
 * - InfoGeneral
 */
export default {
  name: 'FieldSearch',

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
    metadata: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    // load the component that is indicated in the attributes of received property
    componentRender() {
      let fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/GeneralInfoSearch')
      if (isEmptyValue(this.metadata.reference)) {
        return fieldRender
      }
      switch (this.metadata.reference.tableName) {
        case 'C_BPartner':
          fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/BusinessPartnerInfo')
          break
        case 'C_Invoice':
        case 'M_Product':
        case 'A_Asset':
        case 'C_Order':
          fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/ProductInfoSearch')
          break
      }

      return fieldRender
    },
    iconComponentRender() {
      let icon = {
        type: 'svg',
        class: 'search'
      }
      switch (this.metadata.reference.tableName) {
        case 'C_Invoice':
          icon = {
            type: 'svg',
            class: 'search'
          }
          break
        case 'M_Product':
          icon = {
            type: 'svg',
            class: 'shopping'
          }
          break
        case 'A_Asset':
          icon = {
            type: 'i',
            class: 'el-icon-office-building'
          }
          break
        case 'C_Order':
          icon = {
            type: 'svg',
            class: 'clipboard'
          }
          break
      }

      return icon
    }
  }
}
</script>
