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
  <el-popover
    v-model="popoverListBusinessParnet"
    placement="left-start"
    width="900"
    trigger="click"
  >
    <business-partners-list
      :show-popover="popoverListBusinessParnet"
      :metadata="parentMetadata"
    />

    <el-button
      slot="reference"
      class="button-search"
      :disabled="isDisabled"
    >
      <i
        class="el-icon-user-solid"
      />
    </el-button>
  </el-popover>
</template>

<script>
import store from '@/store'

import BusinessPartnersList from './businessPartnersList.vue'

export default {
  name: 'ButtonBsuinessPartnersList',

  components: {
    BusinessPartnersList
  },

  props: {
    parentMetadata: {
      type: Object,
      default: () => {
        return {
          parentUuid: undefined,
          containerUuid: undefined,
          columnName: 'C_BPartner_ID',
          elementName: 'C_BPartner_ID'
        }
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    popoverListBusinessParnet: {
      get() {
        return store.getters.getBusinessPartnerPopoverList
      },
      set(value) {
        store.commit('changePopoverListBusinessPartner', value)
      }
    }
  }
}
</script>

<style lang="scss">
.button-search {
  padding-left: 9px !important;
  padding-right: 0px !important;

  i {
    font-size: 20px !important;
  }
}
</style>
