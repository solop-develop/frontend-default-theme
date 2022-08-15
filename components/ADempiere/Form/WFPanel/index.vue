<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt edwinBetanc0urt@hotmail.com www.erpya.com
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
  <el-card shadow="always" class="box-card">
    <el-container>
      <el-header class="header">
        <el-card class="box-card">
          <el-form
            label-position="top"
            label-width="10px"
            class="from-wf-panel"
          >
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="Seleccione un Flujo de Trabajo">
                  <el-select
                    v-model="value"
                    @visible-change="findPayrollProcess"
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-header>
    </el-container>
  </el-card>
</template>

<script>
// import { getListScale, getWeight } from '@/api/ADempiere/form/weight.js'

export default {
  name: 'WFPanel',
  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          uuid: 'WFPanel',
          containerUuid: 'WFPanel'
        }
      }
    }
  },
  data() {
    return {
      options: [],
      value: ''
    }
  },
  methods: {
    findPayrollProcess(params) {
      console.log(params)
      this.$store.dispatch('getLookupListFromServer', {
        tableName: 'AD_Form',
        columnName: 'AD_Form_ID'
      })
        .then(response => {
          const { recordsList } = response
          this.options = recordsList
        })
        .catch(error => {
            console.warn(`Get Lookup List, Select Base - Error ${error.code}: ${error.message}.`)
          })
    }
  }
}
</script>
<style scoped>
.from-wf-panel {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
