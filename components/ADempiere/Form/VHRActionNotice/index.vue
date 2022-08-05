<template>
  <el-card class="box-card">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <p style="text-align: center;">
          <b> {{ metadata.title }} </b>
        </p>
      </div>
      <el-form
        label-position="top"
        label-width="10px"
      >
        <el-row :gutter="20">
           <el-col :span="6">
             <el-form-item label="Proceso Nómina">
                <el-select
                  v-model="valuePayrollProcess"
                  placeholder="Select Proceso Nómina"
                  @visible-change="visibleListPayrollProcess"
                >
                  <el-option
                    v-for="item in optionsPayrollProcess"
                    :key="item.KeyColumn"
                    :label="item.DisplayColumn"
                    :value="item.KeyColumn"
                  />
                </el-select>
              </el-form-item>
           </el-col>
           <el-col :span="6">
            <el-form-item label="Socio del Negocio">
              <el-select
                v-model="valueListEmployee"
                placeholder="Select Socio del Negocio"
                @visible-change="visibleListEmployee"
              >
                <el-option
                  v-for="item in optionsEmployee"
                  :key="item.KeyColumn"
                  :label="item.DisplayColumn"
                  :value="item.KeyColumn"
                />
              </el-select>
              </el-form-item>
            </el-col>
        </el-row>
      </el-form>
    </el-card>
  </el-card>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import {
  listPayrollProcess,
  listEmployeeValid
} from '@/api/ADempiere/form/payrollActionNotice.js'

export default defineComponent({
  name: 'VHRActionNotice',

  props: {
    metadata: {
      type: Object,
      required: true
    }
  },

  setup(props, { root }) {

    function visibleListPayrollProcess(params) {
      listPayrollProcess()
        .then(response => {
          optionsPayrollProcess.value = response.records.map(value => value.values)
        })
        .catch(error => {
          console.warn(`Error getting listPayrollProcess: ${error.message}. Code: ${error.code}.`)
        })
    }
    const optionsPayrollProcess = ref([])
    const optionsEmployee = ref([])
    const valuePayrollProcess = ref()
    const valueListEmployee = ''

    function visibleListEmployee(params) {
      listEmployeeValid({
        contextAttributes: {
          key: 'HR_Process_ID',
          value: valuePayrollProcess.value
        }
      })
        .then(response => {
          optionsEmployee.value = response.records.map(value => value.values)
        })
        .catch(error => {
          console.warn(`Error getting listEmployeeValid: ${error.message}. Code: ${error.code}.`)
        })
    }
    // listPayrollProcess

    return {
      listPayrollProcess,
      listEmployeeValid,
      // ref
      optionsPayrollProcess,
      optionsEmployee,
      valuePayrollProcess,
      valueListEmployee,
      // methodo
      visibleListEmployee,
      visibleListPayrollProcess
    }
  }

})
</script>
