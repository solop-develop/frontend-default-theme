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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-autocomplete
    ref="displayBPartner"
    v-model="displayedValue"
    v-bind="commonsProperties"
    value-key="name"
    clearable
    style="width: 100%;"
    popper-class="custom-field-bpartner-info"
    :trigger-on-focus="false"
    :fetch-suggestions="localSearch"
    :select-when-unmatched="false"
    @select="handleSelect"
    @clear="clearValues"
    @focus="setNewDisplayedValue"
    @blur="setOldDisplayedValue"
  >
    <!--
    @keyup.enter.native="getBPartnerWithEnter"
      -->
    <template slot-scope="recordRow">
      <div class="header">
        <!-- <b> -->
        {{ recordRow.item.Name }}
        <!-- {{ recordRow.item.lastName }}</b> -->
      </div>
      <span class="info">
        {{ recordRow.item.Value }} {{ recordRow.item.TaxId }} {{ recordRow.item.Description }}
      </span>
    </template>

    <button-business-partners-list
      slot="append"
      :parent-metadata="metadata"
      :container-manager="containerManager"
      :is-disabled="isDisabled"
    />
  </el-autocomplete>
</template>

<script>
// contants
import { TABLE_NAME } from '@/utils/ADempiere/dictionary/form/businessPartner/businessPartnerList'

// components and mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldSearchMixin from '@theme/components/ADempiere/FieldDefinition/FieldSearch/mixinFieldSearch.js'
import businessPartnerMixin from './mixinBusinessPartner'
import ButtonBusinessPartnersList from './buttonBusinessPartnersList.vue'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'BusinessPartnerInfo',

  components: {
    ButtonBusinessPartnersList
  },

  mixins: [
    fieldMixin,
    fieldSearchMixin,
    businessPartnerMixin
  ],

  props: {
    containerManager: {
      type: Object,
      required: true
    },
    parentMetadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: ''
        }
      }
    }
  },

  computed: {
    // to recrods list overwrite
    uuidForm() {
      return this.metadata.containerUuid
    }
  },

  methods: {
    keyPressField() {
      if (!this.isEmptyValue(this.$refs['displayBPartner' + this.metadata.columnName])) {
        this.remoteSearch(this.displayedValue, true)
      }
    },
    remoteSearch(searchValue, isKeyEnterPress) {
      return new Promise(resolve => {
        let parentUuid = this.metadata.parentUuid
        if (isEmptyValue(parentUuid)) {
          parentUuid = this.metadata.containerUuid
        }

        this.containerManager.getSearchInfoList({
          parentUuid,
          containerUuid: this.metadata.containerUuid,
          contextColumnNames: this.metadata.reference.contextColumnNames,
          tableName: TABLE_NAME,
          uuid: this.metadata.uuid,
          searchValue,
          pageNumber: 1
        })
          .then(responseRecords => {
            if (isEmptyValue(responseRecords)) {
              this.whitOutResultsMessage()
            }

            resolve(responseRecords)
          })
          .catch(error => {
            console.warn(error.message)

            this.whitOutResultsMessage()
            resolve([])
          })
      })
    }
  }
}
</script>

<style lang="scss">
.custom-field-bpartner-info {
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
.custom-field-bpartner-info {
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
