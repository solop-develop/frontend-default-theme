<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
    ref="displayGeneralInfoSearch"
    v-model="displayedValue"
    v-bind="commonsProperties"
    value-key="name"
    clearable
    style="width: 100%;max-height: 60px;"
    popper-class="custom-field-bpartner-info"
    :trigger-on-focus="false"
    :fetch-suggestions="localSearch"
    :select-when-unmatched="true"
    @select="handleSelect"
    @clear="clearValues"
  >
    <!--
    @keyup.enter.native="getRecord"
      -->
    <template slot-scope="recordRow">
      <div class="header">
        <b> {{ generateDisplayedValue(recordRow.item) }} </b>
      </div>
      <span class="info">
        {{ generatedDescription(recordRow.item) }}
      </span>
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
import ButtonGeneralInfoSearch from './button.vue'

// utils and helper methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'GeneralInfoSearch',

  components: {
    ButtonGeneralInfoSearch
  },

  mixins: [
    fieldMixin,
    fieldSearchMixin
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
    recordsList() {
      return this.$store.getters.getGeneralInfoRecordsList({
        containerUuid: this.uuidForm
      })
    }
  },

  // watch: {
  //   recordsList(value) {
  //     if (!this.isEmptyValue(value) && this.isFindKeyPress) {
  //       this.handleSelect(this.displayedValue)
  //     }
  //   }
  // },

  beforeMount() {
    if (this.metadata.displayed) {
      this.setDisplayedValue()
    }
  },

  methods: {
    remoteSearch(searchValue) {
      return new Promise(resolve => {
        this.isLoading = true
        this.containerManager.generalInfoSearch({
          containerUuid: this.metadata.containerUuid,
          parentUuid: this.metadata.containerUuid,
          pageNumber: 1,
          contextColumnNames: this.metadata.reference.contextColumnNames,
          tableName: this.metadata.reference.tableName,
          fieldUuid: this.metadata.uuid,
          searchValue
        })
          .then(responseRecords => {
            if (this.isFindKeyPress && !this.isEmptyValue(responseRecords)) {
              this.$refs.displayGeneralInfoSearch.close()
              const recordKeyPress = responseRecords[0]
              recordKeyPress.id = this.metadata.columnName
              this.setValues(recordKeyPress)
            }
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
          .finally(() => {
            this.isLoading = false
            this.isFindKeyPress = false
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
