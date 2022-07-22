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
  <el-popover
    v-model="popoverListOrder"
    placement="left-start"
    width="900"
    trigger="click"
  >
    <order-list
      :show-popover="popoverListOrder"
      :metadata="parentMetadata"
    />

    <el-button
      slot="reference"
      class="button-search"
      :disabled="isDisabled"
    >
      <i
        class="el-icon-s-order"
      />
    </el-button>
  </el-popover>
</template>

<script>
import store from '@/store'

import OrderList from './OrderList.vue'

export default {
  name: 'ButtonOrderList',

  components: {
    OrderList
  },

  props: {
    parentMetadata: {
      type: Object,
      default: () => {
        return {
          parentUuid: undefined,
          containerUuid: undefined,
          columnName: 'C_Order_ID',
          elementName: 'C_Order_ID'
        }
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    popoverListOrder: {
      get() {
        return store.getters.getOrderPopoverList
      },
      set(value) {
        store.commit('changePopoverListOrder', value)
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
