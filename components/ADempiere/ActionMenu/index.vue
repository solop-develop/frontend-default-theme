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
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <div class="auxiliary-menu auxiliary-menu-mobile">
    <!-- actions or process on container -->
    <el-dropdown
      v-if="!isEmptyValue(actionsManager)"
      :hide-on-click="true"
      :size="size"
      :split-button="isWithDefaultAction"
      type="primary"
      trigger="click"
      :class="{ 'action-container': true, 'without-defualt-action': !isWithDefaultAction }"
      @command="runAction"
      @click="runDefaultAction"
    >
      <template v-if="isWithDefaultAction">
        {{ defaultActionName }}
      </template>
      <el-button v-else type="primary" plain :size="size">
        <svg-icon icon-class="more-vertical" />
      </el-button>

      <el-dropdown-menu slot="dropdown" class="action-dropdown-menu">
        <el-dropdown-item
          v-if="isEmptyValue(actionsList)"
          key="withoutActions"
          style="min-height: 26px"
        >
          <span class="contents">
            <b class="label">
              {{ $t('actionMenu.withoutActions') }}
            </b>
          </span>
        </el-dropdown-item>

        <el-scrollbar v-else key="withActions" wrap-class="scroll-child">
          <el-dropdown-item
            v-for="(action, index) in actionsList"
            v-show="!action.displayed || (action.displayed && action.displayed({
              parentUuid,
              containerUuid
            }))"
            :key="index"
            :command="action"
            :disabled="!action.enabled({
              root: $root,
              parentUuid,
              containerUuid,
              containerManager
            })"
            :divided="true"
          >
            <div class="contents">
              <div class="auxiliary-menu-icon">
                <svg-icon
                  v-if="action.isSvgIcon"
                  :icon-class="action.icon"
                  style="font-size: 18"
                />
                <i
                  v-else
                  :class="action.icon"
                  style="font-size: 18"
                />
              </div>

              <!-- for print format -->
              <el-dropdown v-if="!isEmptyValue(action.childs)">
                <span>
                  <b class="label">
                    {{ action.name }}
                  </b>
                  <i class="el-icon-arrow-down" style="float: right;" />
                  <p class="description">
                    <template v-if="isEmptyValue(action.description)">
                      {{ $t('data.noDescription') }}
                    </template>
                    <template v-else>
                      {{ action.description }}
                    </template>
                  </p>
                </span>

                <el-dropdown-menu
                  slot="dropdown"
                  @command="runAction"
                >
                  <el-scrollbar wrap-class="scroll-child">
                    <el-dropdown-item
                      v-for="(actionChild, key) in action.childs"
                      :key="key"
                      :command="actionChild"
                      :divided="true"
                    >
                      <div @click="runAction(actionChild)">
                        <span class="contents">
                          <b class="label">
                            {{ actionChild.name }}
                          </b>
                        </span>

                        <p class="description">
                          <template v-if="isEmptyValue(actionChild.description)">
                            {{ $t('data.noDescription') }}
                          </template>
                          <template v-else>
                            {{ actionChild.description }}
                          </template>
                        </p>
                      </div>
                    </el-dropdown-item>
                  </el-scrollbar>
                </el-dropdown-menu>
              </el-dropdown>

              <div v-else>
                <span class="contents">
                  <b class="label">
                    {{ action.name }}
                  </b>
                </span>

                <p class="description">
                  <template v-if="isEmptyValue(action.description)">
                    {{ $t('data.noDescription') }}
                  </template>
                  <template v-else>
                    {{ action.description }}
                  </template>
                </p>
              </div>
            </div>
          </el-dropdown-item>
        </el-scrollbar>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { computed, defineComponent } from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue, getTypeOfValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'MenuActions',

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
    actionsManager: {
      type: Object,
      default: () => {},
      required: true
    }
  },

  setup(props, { root }) {
    const {
      parentUuid,
      containerUuid,
      tableName
    } = props.actionsManager

    const isMobile = computed(() => {
      return store.getters.device === 'mobile'
    })

    const size = computed(() => {
      if (isMobile.value) {
        return 'mini'
      }
      return 'small'
    })

    const instanceUuid = root.$route.params.instanceUuid
    // set initial value
    const actionsList = computed(() => {
      if (props.actionsManager && props.actionsManager.getActionList) {
        return props.actionsManager.getActionList()
      }
      return []
    })

    const isWithDefaultAction = computed(() => {
      return !props.actionsManager.withoutDefaulAction
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(containerUuid)
    })

    const isWithRecord = computed(() => {
      return !isEmptyValue(recordUuid.value) && recordUuid.value !== 'create-new'
    })

    const isUndoAction = computed(() => {
      if (!isEmptyValue(tableName)) {
        if (!isWithRecord.value) {
          return true
        }
      }
      return false
    })

    const defaultActionToRun = computed(() => {
      if (isUndoAction.value) {
        return actionsList.value.at(1)
      }
      return actionsList.value.at()
    })

    const defaultActionName = computed(() => {
      if (!isEmptyValue(props.actionsManager.defaultActionName)) {
        if (getTypeOfValue(props.actionsManager.defaultActionName) === 'FUNCTION') {
          return props.actionsManager.defaultActionName()
        }
        return props.actionsManager.defaultActionName
      }
      if (!isEmptyValue(actionsList.value)) {
        return actionsList.value.at().name
      }
      return lang.t('actionMenu.runProcess')
    })

    /**
     * Run default action with last parameters
     */
    function runDefaultAction() {
      if (isWithDefaultAction.value) {
        runAction(defaultActionToRun.value)
      }
    } // end runAction

    /**
     * Run selected action
     * @param {object} action
     */
    function runAction(action) {
      const { actionName } = action
      action[actionName]({
        root,
        parentUuid,
        containerUuid,
        tableName,
        instanceUuid,
        containerManager: props.containerManager,
        recordUuid: recordUuid.value,
        uuid: action.uuid
      })
    }

    return {
      size,
      actionsList,
      defaultActionName,
      isWithDefaultAction,
      // methods
      runAction,
      runDefaultAction
    }
  }
})
</script>

<style lang="scss">
.auxiliary-menu {
  z-index: 1;

  .el-dropdown-menu {
    &.el-popper {
      max-height: 250px;
      overflow: auto;
    }

    max-height: 250px;
    overflow: auto;
  }
}

.auxiliary-menu-mobile {
  height: 39px !important;
  right: 0%;
  top: 0;
  display: flex;
}

.scroll-child {
  // max-height: 300px;
  overflow-x: hidden;
}
.el-dropdown .el-button-group {
  display: inline-flex !important;
}
</style>

<style scoped lang="scss" src="./common-style.scss">
</style>
<style scoped lang="scss">
.action-container {
  .el-button-group {
    display: inline-flex;
  }
}

.action-dropdown-menu {
  .auxiliary-menu-icon {
    margin-right: 4px !important;

    >i {
      font-size: 18px;
    }
  }

  // height, and font size of the prefix icons of menu items
  .el-dropdown-menu__item {
    line-height: 17px;
    padding: 0 17px;
    padding-left: 10px !important;
    display: grid;
    font-size: 14px;

    // additional space on top of the first item in the list
    // &:first-child {
    //   margin-top: 10px;
    // }
    // additional space on bottom of the last item in the list
    &:last-child {
      margin-bottom: 10px;
    }
  }
}
</style>
<style lang="scss">
.action-container {
  &.without-defualt-action {
    .el-button {
      padding-left: 5px;
      padding-right: 8px;
    }
  }

  .el-button-group {
    // light blue style of the first section of the menu button
    // >.el-button::first-child {
    >.el-button:not(:last-child) {
      :not(.without-defualt-action) {
        min-width: 105px;
      }
      font-weight: bold;
      // margin-right: -1px;
      color: #0080ff;
      border-color: #0080ff;
      background: #ecf5ff;
    }

    // light blue style of the drop down menu section
    .el-button--primary:last-child {
      // margin-right: 2px;
      color: #0080ff;
      border-color: #0080ff;
      background: #e6f1fd;
      border-left-color: #000000 !important;
    }

    // dark blue style when pointing to the menu
    .el-button--primary:hover {
      background: #1890ff;
      border-color: #1890ff;
      color: #FFFFFF;
    }
  }
}
</style>
