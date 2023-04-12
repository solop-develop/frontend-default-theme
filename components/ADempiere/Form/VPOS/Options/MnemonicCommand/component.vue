<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <el-dialog
    :title="isComponentTitle"
    :visible.sync="isDialogoComponent"
    close-on-press-escape
    append-to-body
    width="75%"
    top="5vh"
    center
    class="dialogo-component"
    style="max-height: 100%;"
  >
    <component
      :is="isComponentRender"
      style="max-height: 100%;"
    />
  </el-dialog>
</template>

<script>
import store from '@/store'
import lang from '@/lang'
import { defineComponent, computed } from '@vue/composition-api'
export default defineComponent({
  name: 'ComponentDialgo',
  props: {
    metadata: {
      type: Object,
      default: () => {}
    }
  },
  setup() {
    /**
     * Computed
     */
    const isDialogoComponent = computed({
      get() {
        return store.getters.getDialogoComponent
      },
      set(value) {
        console.log({ value })
        store.commit('setDialogoComponent', value)
      }
    })
    const currentCommand = computed(() => {
      return store.getters.getCurrentCommand
    })

    const isComponentRender = computed(() => {
      let component
      switch (currentCommand.value.command) {
        case 'ordersHistory':
          component = () => import('@theme/components/ADempiere/Form/VPOS/OrderList/index')
          break
        case 'addResource':
          component = () => import('@theme/components/ADempiere/Form/TimeControl/table.vue')
          break
      }
      return component
    })

    const isComponentTitle = computed(() => {
      let component
      switch (currentCommand.value.command) {
        case 'ordersHistory':
          component = lang.t('form.pos.optionsPoinSales.salesOrder.ordersHistory')
          break
        case 'addResource':
          component = lang.t('timeControl.addResource')
          break
      }
      return component
    })

    return {
      // Computed
      isDialogoComponent,
      currentCommand,
      isComponentRender,
      isComponentTitle
    }
  }
})
</script>

<style lang="scss">
.dialogo-component{
  .el-dialog__body {
    max-height: 100%;
  }
}
</style>
