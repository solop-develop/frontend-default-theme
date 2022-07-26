<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Elsio Sanchez elsiosanchez@gmail.com https://github.com/elsiosanchez
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
  <div>
    <el-autocomplete
      ref="displayOrder"
      v-model="displayedValue"
      v-bind="commonsProperties"
      value-key="name"
      style="width: 100%;"
      popper-class="custom-field-order-info"
      :trigger-on-focus="false"
      :fetch-suggestions="localSearch"
      :select-when-unmatched="false"
      @select="handleSelect"
      @clear="setOrderSelectedRow(blankBPartner)"
      @focus="setNewDisplayedValue"
      @blur="setOldDisplayedValue"
    >
      <!--
      @keyup.enter.native="getBPartnerWithEnter"
       -->
      <template slot-scope="recordRow">
        <div class="header">
          <b> {{ recordRow.item.documentNo }} {{ recordRow.item.dateOrdered }} </b>
        </div>
        <!-- <span class="info">
          <b> {{ $t('form.byInvoice.salesRepresentative') }} </b> {{ recordRow.item.customer.name }} <b> {{ $t('form.productInfo.grandTotal') }} </b> {{ recordRow.item.total_lines }}
        </span> -->
      </template>

      <button-order-list
        slot="append"
        :parent-metadata="metadata"
        :is-disabled="isDisabled"
      />
    </el-autocomplete>
  </div>
</template>

<script>
import store from '@/store'

// components and mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import orderListMixin from './mixinOrder'
import ButtonOrderList from './buttonOrderList.vue'

// utils and helper methods
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import { trimPercentage } from '@/utils/ADempiere/valueFormat'

export default {
  name: 'BusinessPartnerInfo',

  components: {
    ButtonOrderList
  },

  mixins: [
    fieldMixin,
    orderListMixin
  ],

  props: {
    parentMetadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: ''
        }
      }
    },
    showsPopovers: {
      type: Object,
      default: () => {
        return {
          isShowCreate: false,
          isShowList: false
        }
      }
    }
  },

  data() {
    return {
      timeOut: null,
      searchText: '',
      controlDisplayed: this.displayedValue
    }
  },

  computed: {
    orderList() {
      return this.$store.getters.getOrderList({
        containerUuid: this.metadata.containerUuid
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

        // const option = this.findOption(value)
        // // always update uuid
        // this.uuidValue = option.uuid

        this.$store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName,
          value
        })
        // update element column name
        if (columnName !== this.metadata.elementName) {
          this.$store.commit('updateValueOfField', {
            parentUuid: this.metadata.parentUuid,
            containerUuid,
            columnName: this.metadata.elementName,
            value
          })
        }
      }
    },
    displayedValue: {
      get() {
        const display = store.getters.getValueOfField({
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.displayColumnName
        })
        return display
      },
      set(value) {
        store.commit('updateValueOfField', {
          containerUuid: this.metadata.containerUuid,
          columnName: this.metadata.displayColumnName,
          value
        })
      }
    }
  },

  methods: {
    setNewDisplayedValue() {
      const displayValue = this.displayedValue
      this.displayedValue = '' // clear to enter search
      if (!isSameValues(this.controlDisplayed, displayValue)) {
        this.controlDisplayed = displayValue
      }
    },
    setOldDisplayedValue() {
      if (!isSameValues(this.controlDisplayed, this.displayedValue)) {
        this.displayedValue = this.controlDisplayed
      }
    },
    localSearch(stringToMatch, callBack) {
      if (isEmptyValue(stringToMatch)) {
        // not show list
        callBack([])
        return
      }


      const recordsList = this.orderList
      let results = recordsList
      if (stringToMatch) {
        const parsedValue = trimPercentage(stringToMatch.toLowerCase().trim())
        results = recordsList.filter(rowBPartner => {
          for (const columnBPartner in rowBPartner) {
            const valueToCompare = String(rowBPartner[columnBPartner]).toLowerCase()

            if (valueToCompare.includes(parsedValue)) {
              return true
            }
          }
          return false
        })

        // Remote search
        if (this.isEmptyValue(results) && String(stringToMatch.length > 3)) {
          clearTimeout(this.timeOut)

          this.timeOut = setTimeout(() => {
            this.remoteSearch(stringToMatch)
              .then(remoteResponse => {
                callBack(remoteResponse)
              })
          }, 2000)
          return
        }
      }

      // call callback function to return suggestions
      callBack(results)
    },

    remoteSearch(searchValue) {
      return new Promise(resolve => {
        const message = {
          message: this.$t('notifications.searchWithOutRecords'),
          type: 'info',
          showClose: true
        }

        store.dispatch('findOrder', {
          containerUuid: this.metadata.containerUuid,
          pageNumber: 1,
          documentNo: searchValue,
          searchValue
        })
          .then(responseRecords => {
            if (isEmptyValue(responseRecords)) {
              this.$message(message)
            }

            resolve(responseRecords)
          })
          .catch(error => {
            console.warn(error.message)

            this.$message(message)
            resolve([])
          })
      })
    },

    handleSelect(businessPartnerSelected) {
      if (this.isEmptyValue(businessPartnerSelected)) {
        businessPartnerSelected = this.blankBPartner
      }
      this.setOrderSelectedRow(businessPartnerSelected)

      // prevent losing display value with focus
      this.controlDisplayed = this.generateDisplayedValue(businessPartnerSelected)
    }
  }
}
</script>

<style lang="scss">
.custom-field-order-info {
  // button icon suffix
  .button-search {
    padding-left: 10px !important;
    padding-right: 10px !important;

    >i {
      font-size: 20px;
    }
  }
}
</style>
<style lang="scss" scope>
.custom-field-order-info {
  // items of lust
  li {
    line-height: normal;
    // padding: 15px;
    padding-bottom: 5px;
    padding-top: 5px;

    .header {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .info {
      color: #7e7e7e;
      float: left;
      font-size: 12px;
    }
  }
}
</style>
