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
  <span>
    <el-card shadow="hover">
      <el-collapse v-model="collapseOption">
        <el-collapse-item :title="$t('form.pos.optionsPoinSales.salesOrder.title')" name="1">
          <el-row :gutter="12" style="padding-right: 10px;">
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-news" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.newOrder') }}
                </p>
              </el-card>
            </el-col>
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <svg-icon icon-class="list" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.ordersHistory') }}
                </p>
              </el-card>
            </el-col>
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <svg-icon icon-class="list" />
                  <br>
                  {{ $t('timeControl.addResource') }}
                </p>
              </el-card>
            </el-col>
            <!-- generateImmediateInvoice -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-document-add" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.generateImmediateInvoice') }}
                </p>
              </el-card>
            </el-col>
            <!-- completePreparedOrder -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-success" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.completePreparedOrder') }}
                </p>
              </el-card>
            </el-col>
            <!-- cancelSaleTransaction -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-error" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.cancelSaleTransaction') }}
                </p>
              </el-card>
            </el-col>
            <!-- printTicket -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-printer" />
                  <br><br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.print') }}
                </p>
              </el-card>
            </el-col>
            <!-- printTicketPreviwer -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-printer" />
                  <br><br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.preview') }}
                </p>
              </el-card>
            </el-col>
            <!-- createNewReturnOrder -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-refresh-left" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.createNewReturnOrder') }}
                </p>
              </el-card>
            </el-col>
            <!-- copyOrder -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-document-copy" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.copyOrder') }}
                </p>
              </el-card>
            </el-col>
            <!-- cancelOrder -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-close" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.cancelOrder') }}
                </p>
              </el-card>
            </el-col>
            <!-- confirmDelivery -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <svg-icon icon-class="shopping" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.confirmDelivery') }}
                </p>
              </el-card>
            </el-col>
            <!-- confirmDeliverAllProducts -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <svg-icon icon-class="shopping" />
                  <br>
                  {{ $t('form.pos.optionsPoinSales.salesOrder.deliverAllProducts') }}
                </p>
              </el-card>
            </el-col>
            <!-- applyDiscountOnOrder -->
            <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
              <el-card shadow="hover" style="height: 100px">
                <p
                  style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                  @click="isAddComand = !isAddComand"
                >
                  <i class="el-icon-document-remove" />
                  <br>
                  {{ $t('form.pos.applyDiscountOnOrder') }}
                </p>
              </el-card>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item :title="$t('form.pos.optionsPoinSales.cashManagement.title')" name="2">
          <!-- cashOpening -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <i class="el-icon-sell" />
                <br>
                {{ $t('form.pos.optionsPoinSales.cashManagement.cashOpening') }}
              </p>
            </el-card>
          </el-col>
          <!-- cashwithdrawal -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <i class="el-icon-money" />
                <br>
                {{ $t('form.pos.optionsPoinSales.cashManagement.cashwithdrawal') }}
              </p>
            </el-card>
          </el-col>
          <!-- closeBox -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <i class="el-icon-sold-out" />
                <br>
                {{ $t('form.pos.optionsPoinSales.cashManagement.closeBox') }}
              </p>
            </el-card>
          </el-col>
          <!-- assignSeller -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <svg-icon icon-class="peoples" />
                <i class="el-icon-bottom-right" />
                <br>
                {{ $t('form.pos.optionsPoinSales.cashManagement.assignSeller') }}
              </p>
            </el-card>
          </el-col>
          <!-- unassignSeller -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <svg-icon icon-class="peoples" />
                <i class="el-icon-top-right" />
                <br>
                {{ $t('form.pos.optionsPoinSales.cashManagement.unassignSeller') }}
              </p>
            </el-card>
          </el-col>
          <!-- moneyIncome -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <i class="el-icon-money" />
                <br>
                {{ $t('form.pos.optionsPoinSales.cashManagement.moneyIncome') }}
              </p>
            </el-card>
          </el-col>
        </el-collapse-item>
        <el-collapse-item :title="$t('form.pos.optionsPoinSales.generalOptions.title')" name="3">
          <!-- changePos -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <i class="el-icon-mobile-phone" />
                <br>
                {{ $t('form.pos.optionsPoinSales.generalOptions.changePos') }}
              </p>
            </el-card>
          </el-col>
          <!-- Product List Price -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <svg-icon icon-class="shopping" />
                <br>
                {{ $t('form.pos.optionsPoinSales.generalOptions.listProducts') }}
              </p>
            </el-card>
          </el-col>
          <!-- List Warehouse -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <svg-icon icon-class="tree-table" />
                <br>
                {{ $t('form.pos.optionsPoinSales.generalOptions.changeWarehouseList') }}
              </p>
            </el-card>
          </el-col>
          <!-- List Price -->
          <el-col :span="6" style="padding-left: 12px;padding-right: 12px;padding-bottom: 10px;">
            <el-card shadow="hover" style="height: 100px">
              <p
                style="cursor: pointer; text-align: center !important; color: black;min-height: 50px;"
                @click="isAddComand = !isAddComand"
              >
                <svg-icon icon-class="list" />
                <br>
                {{ $t('form.pos.optionsPoinSales.generalOptions.changePriceList') }}
              </p>
            </el-card>
          </el-col>
        </el-collapse-item>
        <el-collapse-item :title="$t('form.mnemonicCommand.help')">
          <el-card shadow="never">
            <el-divider>
              <b style="font-size: 15px;">
                {{ $t('form.mnemonicCommand.lockedKeyCombination') }}
              </b>
            </el-divider>
            <el-row :gutter="20">
              <el-col :span="12" :offset="8">
                <p style="text-align: center;display: flex;">
                  <el-card shadow="hover" style="height: 60px;width: 150px  ;padding-top: 10px !important;margin-right: 20px !important;">
                    <b style="font-size: 22px;text-align: center;">
                      {{ 'Ctrl + F4' }}
                    </b>
                  </el-card>
                  <el-card shadow="hover" style="height: 60px;width: 150px;padding-top: 10px !important;margin-left: 20px !important;">
                    <b style="font-size: 22px;text-align: center;">
                      {{ 'Ctrl + F5' }}
                    </b>
                  </el-card>
                </p>
              </el-col>
            </el-row>
            <el-divider>
              <b style="font-size: 15px;">
                {{ $t('form.mnemonicCommand.acceptedKeyCombination') }}
              </b>
            </el-divider>
            <el-table
              :data="keyList"
              border
              style="width: 100%"
            >
              <el-table-column :label="$t('form.mnemonicCommand.listAllowedKeys')" align="center">
                <el-table-column
                  prop="key"
                  :label="$t('form.mnemonicCommand.keys')"
                  align="center"
                />
                <el-table-column
                  prop="shortkeyName"
                  :label="$t('form.mnemonicCommand.shortcutKeyName')"
                  align="center"
                />
              </el-table-column>
            </el-table>
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-card>
    <el-dialog
      :title="$t('form.mnemonicCommand.title')"
      :visible.sync="isAddComand"
      close-on-press-escape
      append-to-body
      width="45%"
      center
      class="dialogo-seller"
    >
      <el-form v-if="isEmptyValue(inputCommand)" label-position="top" label-width="100px">
        <el-form-item :label="$t('form.mnemonicCommand.addKeyboardShortcuts')">
          <el-input
            v-model="inputCommand"
            v-shortkey="{f1: ['ctrl', 'f1'], f2: ['ctrl', 'f2'], f3: ['ctrl', 'f3'], f4: ['ctrl', 'f4'], f5: ['ctrl', 'f5'], F6: ['ctrl', 'f6'], f7: ['ctrl', 'f7'], f8: ['ctrl', 'f8'], f9: ['ctrl', 'f9'], f10: ['ctrl', 'f10'], f11: ['ctrl', 'f11'], f12: ['ctrl', 'f12']}"
            readonly
            style="font-size: 20px;"
            @shortkey.native="theActionCommand"
          />
        </el-form-item>
      </el-form>
      <div
        v-if="!isEmptyValue(inputCommand)"
        style="text-align: center;"
      >
        <p style="text-align: center;">
          <b style="font-size: 22px;text-align: center;"> {{ $t('form.mnemonicCommand.addKeyboardShortcuts') }} </b>
        </p>
        <el-row :gutter="20">
          <el-col :span="12" :offset="8">
            <p style="text-align: center;">
              <el-card v-if="!isEmptyValue(liveKey)" shadow="hover" style="height: 50px;width: 250px;padding-top: 10px !important;">
                <b style="font-size: 22px;text-align: center;">
                  {{ 'Ctrl + ' + liveKey }}
                </b>
              </el-card>
            </p>
          </el-col>
        </el-row>
      </div>
      <br>
      <el-button
        type="primary"
        icon="el-icon-check"
        class="button-base-icon"
        style="float: right; margin: 10px;"
        @click="isAddComand = false"
      />
      <el-button
        type="danger"
        icon="el-icon-close"
        style="float: right;margin-top: 10px;"
        class="button-base-icon"
        @click="isAddComand = false"
      />
      <el-button
        type="info"
        plain
        style="float: right; margin-top: 10px;"
        class="button-base-icon"
        @click="inputCommand = ''"
      >
        <svg-icon icon-class="layers-clear" />
      </el-button>
    </el-dialog>
  </span>
</template>

<script>
export default {
  name: 'MnemonicCommand',
  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: 'Mnemonic-Command',
          containerUuid: 'Mnemonic-Command'
        }
      }
    },
    containerManager: {
      type: Object,
      default: () => ({
        actionPerformed: () => {},
        getFieldsLit: () => {},
        setDefaultValues: () => {}
      })
    }
  },
  data() {
    return {
      inputCommand: '',
      collapseOption: ['1', '2', '3'],
      isAddComand: false,
      displayCommand: '',
      sum: ' + ',
      liveKey: '',
      deatKey: '',
      keyList: [
        {
          key: 'Control',
          shortkeyName: 'ctrl'
        },
        {
          key: 'F1',
          shortkeyName: 'F1'
        },
        {
          key: 'F2',
          shortkeyName: 'f2'
        },
        {
          key: 'F3',
          shortkeyName: 'f3'
        },
        {
          key: 'F6',
          shortkeyName: 'f6'
        },
        {
          key: 'F7',
          shortkeyName: 'f7'
        },
        {
          key: 'F8',
          shortkeyName: 'f8'
        },
        {
          key: 'F9',
          shortkeyName: 'f9'
        },
        {
          key: 'F10',
          shortkeyName: 'f10'
        },
        {
          key: 'F11',
          shortkeyName: 'f11'
        },
        {
          key: 'F12',
          shortkeyName: 'f12'
        }
      ]
    }
  },
  methods: {
    theActionCommand(event) {
      console.log({ event })
      const { srcKey } = event
      if (srcKey === 'control') {
        this.deatKey = 'ctrl'
      } else {
        this.liveKey = srcKey.toUpperCase()
      }
      this.inputCommand = this.deatKey + this.liveKey
      console.log({ event, srcKey })
    }
  }
}
</script>

<style scoped>
  .stylefullPayment {
    font-size: 15px;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif
  }
  .el-button--text {
    border-color: transparent;
    color: #1890ff;
    background: transparent;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0px;
    padding-top: 0px;
  }
  .el-card__header {
    padding: 18px 20px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    background-color: rgb(245, 247, 250);
  }
  .delete-buttom {
    border: none;
    width: 100%;
    text-align: left;
  }
  .el-col-24 {
    width: 100%;
    padding-right: 0px !important;
    padding-left: 0px !important;
  }
  .el-col-6 {
    padding-right: 0px !important;
    padding-left: 0px !important;
  }
  .el-card__body {
    padding-top: 0px !important;
    padding-right: 0px!important;
    padding-bottom: 20px;
    padding-left: 10px!important;
    height: 100%!important;
  }
  .el-card__header {
    padding: 0px 20px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .bottom {
    margin-top: 13px;
    line-height: 12px;
  }
  .custom-card-select {
    margin: 1px;
    cursor: pointer;
    border: 1px solid #bfe3ff;
    background: hsl(206, 100%, 87%);
  }
  .custom-card {
    margin: 1px;
    cursor: pointer;
  }
  .custom-card:hover {
    background-color: #eaf5fe;
    border: 1px solid #36a3f7;
  }
  .footer-product {
    display: flex;
    width: 100%;
  }
  .key-layout {
    width: 100%;
    height: 200px;
    display: block;
    padding-top: 5px;
    padding-right: 5px;
    padding-bottom: 5px;
    padding-left: 5px;
  }
  .label {
    text-align: center;
    width: 100%;
    padding: 0px !important;
    margin: 0px;
  }
  .image-profile {
    width: 100%;
    text-align: center;
  }
  .button {
    padding: 0;
    float: right;
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
  .el-tag--medium {
    height: 34px;
    line-height: 32px;
  }
  .el-col {
    border-radius: 4px;
  }
  .total {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .scroll-seller {
    max-height: 250px;
  }
</style>
