<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Yamel Senih ysenih@erpya.com www.erpya.com
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
  <el-container style="height: 100% !important;">
    <el-main style="padding-right: 0px;padding-bottom: 0px;">

      <Split :gutter-size="isShowedPOSOptions ? 10 : 0" @onDrag="onDragOption">
        <SplitArea :size="isShowedPOSOptions ? 20 : 1" :min-size="400">
          <el-container style="height: 100% !important;">
            <el-aside :width="isShowedPOSOptions ? '100%' : '0%'" style="background: white; padding: 0px !important; margin-bottom: 0px">
              <options
                :metadata="metadata"
              />
            </el-aside>
            <div style="width: 36px;padding-top: 30vh; z-index: 100;">
              <el-button
                id="buttonPanelLeftPos"
                :circle="true"
                type="primary"
                :icon="isShowedPOSOptions ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"
                :style="isShowedPOSOptions ? 'position: absolute;': 'position: absolute;left: 0.8%;'"
                @click="isShowedPOSOptions = !isShowedPOSOptions"
              />
            </div>
          </el-container>
        </SplitArea>

        <SplitArea :size="isShowedPOSOptions ? 80 : 99" :min-size="990">
          <Split :gutter-size="isShowedPOSKeyLaout ? 10 : 0" @onDrag="onDragKeyLayout">
            <SplitArea :size="isShowedPOSKeyLaout ? 69 : 99" :min-size="900" style="overflow: auto">
              <component-dialgo
                v-if="!isEmptyValue(listShortkey)"
                :metadata="metadata"
              />
              <order
                v-shortkey="listShortkey"
                :metadata="metadata"
                @shortkey.native="actionShortkey"
              />
            </SplitArea>
            <el-drawer
              title="Cobranza"
              :visible.sync="showCollection"
              :with-header="false"
              :before-close="handleClose"
              size="50%"
            >
              <collection
                key="collection-component"
              />
            </el-drawer>
            <SplitArea
              v-show="isShowedPOSKeyLaout"
              :size="isShowedPOSKeyLaout ? 31: 1"
              :min-size="300"
              style="overflow: auto"
            >
              <key-layout
                key="layout-component"
              />
            </SplitArea>
          </Split>
        </SplitArea>
      </Split>
    </el-main>
    <!-- Requires pin to execute the command -->
    <el-dialog
      :title="$t('form.pos.pinMessage.pin') + titleActionPinCommand"
      :visible.sync="pinCommand"
      close-on-press-escape
      append-to-body
      width="45%"
      center
      class="dialogo-seller"
    >
      <el-form autocomplete="off">
        <el-input
          id="pin"
          ref="pin"
          v-model="inputPin"
          v-shortkey="pinCommand ? {close: ['esc'], enter: ['enter']} : {}"
          autofocus
          type="password"
          :placeholder="$t('form.pos.tableProduct.pin')"
          :focus="true"
          autocomplete="off"
          @shortkey.native="theAction"
        />
      </el-form>
      <br>
      <!-- Foot actions button panel -->
      <el-button
        type="primary"
        icon="el-icon-check"
        class="button-base-icon"
        style="float: right; margin: 10px;"
        @click="sendPin"
      />
      <el-button
        type="danger"
        icon="el-icon-close"
        style="float: right;margin-top: 10px;"
        class="button-base-icon"
        @click="pinCommand = false"
      />
      <el-button
        type="info"
        plain
        style="float: right; margin-top: 10px;"
        class="button-base-icon"
        @click="inputPin = ''"
      >
        <svg-icon icon-class="layers-clear" />
      </el-button>
    </el-dialog>
  </el-container>
</template>

<script>
import Order from '@theme/components/ADempiere/Form/VPOS/Order'
import KeyLayout from '@theme/components/ADempiere/Form/VPOS/KeyLayout'
import Options from '@theme/components/ADempiere/Form/VPOS/Options'
import Collection from '@theme/components/ADempiere/Form/VPOS/Collection'
import { selectCommand } from '../Options/MnemonicCommand/mnemonicCommandAction.js'
import ComponentDialgo from '../Options/MnemonicCommand/component.vue'
import { validatePin } from '@/api/ADempiere/form/point-of-sales.js'

export default {
  name: 'VposDesktop',
  components: {
    Order,
    KeyLayout,
    Options,
    Collection,
    ComponentDialgo
  },
  props: {
    metadata: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      unsubscribePOSList: () => {},
      pinCommand: false,
      isLoadingPin: false,
      titleActionPinCommand: '',
      inputPin: '',
      actionCommand: {}
    }
  },
  computed: {
    // options to POS, panel left
    isShowedPOSOptions: {
      get() {
        return this.$store.getters.getIsShowPOSOptions
      },
      set(val) {
        this.$store.commit('setShowPOSOptions', val)
      }
    },
    isShowedPOSKeyLaout() {
      return this.$store.getters.getShowPOSKeyLayout
    },
    showCollection() {
      return this.$store.getters.getShowCollectionPos
    },
    listPointOfSales() {
      return this.$store.getters.posAttributes.pointOfSalesList
    },
    listShortkey() {
      const list = this.$store.getters.getLisCommantShortkey
      const command = {}
      list.forEach(element => {
        const { shortcut } = element
        const option = shortcut.split(' ')
        command[option[2]] = [option[0], option[2]]
      })
      const isModifyCommand = this.$store.getters.getModifyCommand
      if (isModifyCommand) return
      return command
    }
  },
  watch: {
    isShowedPOSOptions(value) {
      if (value) {
        if (this.isShowedPOSKeyLaout) {
          this.$store.dispatch('changeWidthRight', 3)
        }
      } else {
        this.$store.dispatch('changeWidthRight', 3)
      }
    }
  },
  created() {
    // load pont of sales list
    this.$store.dispatch('listCommand')
    if (this.isEmptyValue(this.listPointOfSales)) {
      // this.$store.dispatch('listCommand')
      // set pos id with query path
      this.$store.dispatch('listPointOfSalesFromServer', this.$route.query.pos)
    }

    this.unsubscribePOSList = this.posListWithOrganization()
  },
  beforeDestroy() {
    this.unsubscribePOSList()
  },
  methods: {
    handleClose() {
      this.$store.commit('setShowPOSCollection', false)
    },
    actionShortkey(event) {
      if (this.isEmptyValue(event)) return
      const { srcKey } = event
      const isRequirePin = selectCommand(srcKey)
      if (isRequirePin.isRequirePin) {
        this.actionCommand = isRequirePin
        this.titleActionPinCommand = isRequirePin.pinName
        this.pinCommand = isRequirePin.isRequirePin
        setTimeout(() => {
          this.focusPin()
        }, 300)
      }
    },
    theAction(event) {
      if (this.pinCommand) {
        switch (event.srcKey) {
          case 'enter':
            this.sendPin()
            break
          case 'close':
            this.pinCommand = false
            break
        }
      }
    },
    sendPin(pin) {
      this.isLoadingPin = true
      validatePin({
        posUuid: this.$store.getters.posAttributes.currentPointOfSales.uuid,
        pin: this.inputPin,
        orderId: this.currentOrder.id,
        requestedAccess: this.actionCommand.requestedAccess
      })
        .then(response => {
          selectCommand({
            ...this.actionCommand,
            pinVerificationApproved: true
          })
          this.$message({
            type: 'success',
            message: this.$t('pointOfSales.pin.validateSuccessfully'),
            showClose: true
          })
          this.pinCommand = false
        })
        .catch(error => {
          this.$message({
            type: 'error',
            message: error.message,
            showClose: true
          })
          this.inputPin = ''
          this.focusPin()
        })
        .finally(() => {
          this.inputPin = ''
          this.isLoadingPin = false
        })
    },
    focusPin() {
      this.$refs.pin.focus()
    },
    posListWithOrganization() {
      return this.$store.subscribe((mutation, state) => {
        // this.$store.dispatch('listCommand')
        if (mutation.type === 'user/SET_ORGANIZATION') {
          this.$store.dispatch('listPointOfSalesFromServer')
        }
      })
    },
    onDragKeyLayout(size) {
      const sizeWidthRight = size[1] / 10
      this.$store.dispatch('changeWidthRight', Math.trunc(sizeWidthRight))
    },
    onDragOption(size) {
      const sizeWidthLeft = size[0] / 10
      this.$store.dispatch('changeWidthLeft', Math.trunc(sizeWidthLeft))
    }
  }
}
</script>

<style scoped>
  .split {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    overflow-y: hidden;
    overflow-x: hidden;
    height: 100%;
    width: 100%;
  }
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 0px!important;
    padding-bottom: 20px;
    padding-left: 10px!important;
    height: 100%!important;
  }

  /* Style of Table */
  .el-table {
    position: relative;
    overflow: hidden;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    width: 100%;
    max-width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    font-size: 14px;
    color: #606266;
  }
  .el-card__header {
    padding: 0px 20px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .time {
    font-size: 13px;
    color: #999;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }
  .el-header {
    background: 'white';
    color: #333;
    line-height: 10px;
  }

  .el-aside {
    color: #333;
  }
  .el-row {
    margin: 0px!important;
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
  .order-header {
    padding-left: 10px;
    font-size: 13px;
  }
</style>
