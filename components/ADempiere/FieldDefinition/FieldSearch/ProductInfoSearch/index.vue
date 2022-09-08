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
    :ref="'displayBPartner' + metadata.columnName"
    v-model="displayedValue"
    v-shortkey="{ enter: ['enter'] }"
    v-bind="commonsProperties"
    value-key="name"
    clearable
    style="width: 100%;"
    popper-class="custom-field-bpartner-info"
    :trigger-on-focus="false"
    :fetch-suggestions="localSearch"
    :select-when-unmatched="false"
    @shortkey.native="keyPressField"
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
        <span v-for="(identifier, key) in listFilter" :key="key">
          {{ recordRow.item[identifier.columnName] }}
        </span>
        <!-- {{ recordRow.item[identifier[0].identifier.columnName] }} -->
      </div>
    </template>

    <button-general-info-search
      slot="append"
      :parent-metadata="metadata"
      :is-disabled="isDisabled"
      :container-manager="containerManager"
      :icon="icon"
    />
  </el-autocomplete>
</template>

<script>

// components and mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldSearchMixin from '@theme/components/ADempiere/FieldDefinition/FieldSearch/mixinFieldSearch.js'
import generalInfoSearchMixin from './mixinGeneralInfoSearch'
import ButtonGeneralInfoSearch from './buttonGeneralInfoSearch.vue'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'GeneralInfoSearch',

  components: {
    ButtonGeneralInfoSearch
  },

  mixins: [
    fieldMixin,
    fieldSearchMixin,
    generalInfoSearchMixin
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
    icon: {
      type: Object,
      default: () => {
        return {
          type: 'svg',
          class: 'search'
        }
      }
    },
    containerManager: {
      type: Object,
      required: true
    }
  },

  computed: {
    // to recrods list overwrite
    uuidForm() {
      return this.metadata.containerUuid
    },
    listFilter() {
      const listIdentifier = this.$store.getters.getIdentifier({
        containerUuid: this.uuidForm
      })
      if (this.isEmptyValue(listIdentifier)) {
        return []
      }
      return listIdentifier.filter(identifier => identifier.identifierSequence > 0)
    }
  },

  methods: {
    keyPressField() {
      console.log(this.$refs)
      if (!this.isEmptyValue(this.$refs['displayBPartner' + this.metadata.columnName])) {
        this.remoteSearch(this.displayedValue, true)
      }
    },
    remoteSearch(searchValue, isKeyEnterPress) {
      return new Promise(resolve => {
        this.containerManager.generalInfoSearch({
          containerUuid: this.metadata.containerUuid,
          pageNumber: 1,
          tableName: this.metadata.reference.tableName,
          fieldUuid: this.metadata.uuid,
          searchValue
        })
          .then(responseRecords => {
            if (isEmptyValue(responseRecords)) {
              this.whitOutResultsMessage()
            }
            if (isKeyEnterPress) {
              this.handleSelect(responseRecords[0])
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
