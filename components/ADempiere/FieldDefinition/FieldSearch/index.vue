<template>
  <component
    :is="componentRender"
    :parent-uuid="parentUuid"
    :container-uuid="containerUuid"
    :container-manager="containerManager"
    :metadata="metadata"
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
      // let fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/GeneralInfo')
      let fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSelect')
      if (isEmptyValue(this.metadata.reference)) {
        return fieldRender
      }

      switch (this.metadata.reference.tableName) {
        case 'C_BPartner':
          fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/BusinessPartnerInfo')
          break
        // case 'M_Product':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/ProductInfo')
        //   break
        // case 'C_Invoice':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/InvoiceInfo')
        //   break
        // case 'A_Asset':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/AssetInfo')
        //   break
        // case 'C_Order':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/OrderInfo')
        //   break
        // case 'M_InOut':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/InOutPartnerInfo')
        //   break
        // case 'C_Payment':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/PaymentInfo')
        //   break
        // case 'C_CashLine':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/CashLineInfo')
        //   break
        // case 'S_ResourceAssigment':
        //   fieldRender = () => import('@theme/components/ADempiere/FieldDefinition/FieldSearch/ResourceAssigmentInfo')
        //   break
      }

      return fieldRender
    }
  }
}
</script>
