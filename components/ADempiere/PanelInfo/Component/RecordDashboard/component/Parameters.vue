<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Leonel Matos lmatos@erpya.com www.erpya.com
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
  <field-definition
    :key="fieldParameters.columnName"
    :metadata-field="fieldParameters"
    :container-uuid="containerUuid"
    :container-manager="{
      ...containerManagerList
    }"
  />
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import router from '@/router'
// import store from '@/store'
import FieldDefinition from '@theme/components/ADempiere/FieldDefinition/index.vue'
// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { camelizeObjectKeys } from '@/utils/ADempiere/transformObject.js'
import { getFieldTemplate } from '@/utils/ADempiere/lookupFactory.js'
import {
  evalutateTypeField
} from '@/utils/ADempiere/dictionaryUtils.js'

export default defineComponent({
  name: 'Parameters',

  components: {
    FieldDefinition
  },

  props: {
    metadata: {
      type: Object,
      required: true
    },
    dashboardId: {
      type: Number,
      required: true
    }
  },

  setup(props) {
    const containerUuid = computed(() => {
      const currentRoute = router.app._route
      return currentRoute.meta.uuid + 'Parameters' + props.dashboardId
    })
    const fieldParameters = computed(() => {
      return getFieldTemplate({
        ...camelizeObjectKeys(props.metadata),
        containerUuid: containerUuid.value,
        size: {
          lg: 6,
          md: 8,
          sm: 12,
          xl: 6,
          xs: 24
        },
        overwriteDefinition: {
          size: {
            lg: 6,
            md: 8,
            sm: 12,
            xl: 6,
            xs: 24
          }
        }
      })
    })
    const containerManagerList = computed(() => {
      return {
        actionPerformed: () => {},
        getFieldsLit: () => {},
        isDisplayedField: () => { return true },
        isDisplayedDefault: () => { return true },
        isReadOnlyColumn: ({ field, row }) => { return true },
        isMandatoryField: () => { return false },
        isReadOnlyField: () => { return false },
        setDefaultValues: () => {}
      }
    })
    return {
      fieldParameters,
      containerUuid,
      containerManagerList,
      // methods
      getFieldTemplate,
      camelizeObjectKeys,
      evalutateTypeField
    }
  }
})
</script>

<style lang="scss" scoped>
  .custom-title {
    padding: 10px;
  }
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .github-corner {
      position: absolute;
      top: 0px;
      border: 0;
      right: 0;
    }

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }
  .custom-collapse-item.is-disabled {
    .custom-title {
      color: #303133;
    }
  }
  .el-card__header {
    border: 1px solid #36a3f7;
    padding: 0px;
    margin: 0px;
    box-sizing: border-box;
  }
  .dashboard-transitio {
    margin: 0px;
    width: 100%;
    padding-right: 2%;
    border-radius: 4px;
    text-align: center;
    // color: #fff;
    box-sizing: border-box;
    height: 500px;
    overflow: auto;
  }
  .label-dashboard{
    color: black;
    width: 95%;
    text-align: inherit;
    font-weight: 500;
    font-size: large;
    padding-left: 1%;
  }
</style>
<style>
  .el-card__body {
    padding: 5px;
  }
</style>
