<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <div class="main-express-receipt">
    <el-card class="box-card">
      <el-card>
        <!-- <div slot="header">
          <h3 style="text-align: center;margin: 0px;">
            {{ 'Configure Archivo a Importar' }}
          </h3>
        </div> -->
        <el-row :gutter="24">
          <el-form
            ref="form-express-receipt"
            label-position="top"
            class="form-min-label"
            inline
          >
            <el-col :span="8" style="border: 1px solid rgb(230, 235, 245);padding: 0px 10px;">
              <el-form-item
                label="Seleccione Archivo a Importar"
                style="width: 100%;text-align: center;margin-bottom: 0px !important;color: transparent !important;"
              >
                <upload-resource
                  table-name="AD_ImpFormat"
                  :record-id="currrentImportFormats.value"
                  style="text-align: center;"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" style="border: 1px solid #e6ebf5;">
              <el-form-item
                label="lista de conjuntos de caracteres"
                style="width: 100%;text-align: center;margin-bottom: 0px !important;"
              >
                <el-tag>
                  {{ currrentCharsets.label }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="8" style="border: 1px solid #e6ebf5;">
              <el-form-item
                label="Formato de Importación"
                style="width: 100%;text-align: center;margin-bottom: 0px !important;"
              >
                <el-tag>
                  {{ currrentImportFormats.label }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </el-card>
      <br>

      <el-table
        :data="dataTable"
        border
        highlight-current-row
        style="width: 100%"
        empty-text="Sin Datos a Importar"
        height="450"
      >
        <el-table-column
          v-for="item of headerTable"
          :key="item.label"
          :width="(item.length >= 5) ? '350' : 'auto'"
        >
          <template slot="header" slot-scope="scope">
            {{ scope.row }}
            <span v-if="isEmptyValue(formatFields)">
              {{ item.label }}
            </span>
            <span v-else>
              <el-dropdown trigger="click" @command="handleFormat">
                <span class="el-dropdown-link">
                  {{ item.label }} <svg-icon icon-class="more-vertical" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <template
                    v-for="field in formatFields"
                  >
                    <el-dropdown-item
                      :key="field.id"
                      :command="{
                        header: item,
                        field: field.name
                      }"
                    >
                      {{ field.name }}
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </template>
          <template slot-scope="scope">
            {{ scope.row[item.key] }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="padding: 0px 10px !important;">
      <el-row :gutter="10">
        <el-form
          ref="form-express-receipt"
          label-position="top"
          class="form-min-label"
          inline
        >
          <el-col
            v-for="field in formatFields"
            :key="field.sequence"
            :span="6"
          >
            <el-form-item
              :label="field.name"
              style="margin-bottom: 0px !important;width: 100%;"
            >
              <el-input
                v-if="field.dataType === 'S'"
                v-model="field.defaultValue"
                style="width: 100%;"
              />
              <el-input-number
                v-else-if="field.dataType === 'N'"
                v-model="num"
                controls-position="right"
                style="width: 100%;"
              />
              <el-date-picker
                v-else-if="field.dataType === 'D'"
                v-model="field.defaultValue"
                type="date"
                style="width: 100%;"
              />
              <el-input
                v-else-if="field.dataType === 'C'"
                v-model="field.defaultValue"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <el-row>
        <slot
          name="footer"
        />
      </el-row>
    </el-card>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import UploadExcelComponent from '@/themes/default/components/UploadExcel/index.vue'
import UploadResource from '@/themes/default/components/ADempiere/PanelInfo/Component/AttachmentManager/uploadResource.vue'

// Api Request Methods
import {
  listCharsets,
  listImportFormats
} from '@/api/ADempiere/form/VFileImport.js'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'VFileImport',

  components: {
    UploadExcelComponent,
    UploadResource
  },

  setup() {
    /**
     * Ref
     */
    const headerTable = ref([])
    const dataTable = ref([])
    // const formatFields = ref([])

    /**
     * Computed
     */

    const formatFields = computed(() => {
      const { formatFields } = store.getters.getAttribute
      return formatFields
    })

    const currrentCharsets = computed({
      // getter
      get() {
        const { charsets } = store.getters.getAttribute
        const { listCharsets } = store.getters.getOptions
        return listCharsets.find(list => list.value === charsets)
      },
      // setter
      set(value) {
        store.commit('updateAttributeVFileImport', {
          attribute: 'attribute',
          criteria: 'charsets',
          value
        })
      }
    })

    const currrentImportFormats = computed({
      // getter
      get() {
        const { importFormats } = store.getters.getAttribute
        const { listImportFormats } = store.getters.getOptions
        return listImportFormats.find(list => list.value === importFormats)
      },
      // setter
      set(value) {
        store.commit('updateAttributeVFileImport', {
          attribute: 'attribute',
          criteria: 'importFormats',
          value
        })
        infoImportFormats(value)
      }
    })

    // List Options
    const optionsCharsets = computed({
      // getter
      get() {
        const { listCharsets } = store.getters.getOptions
        return listCharsets
        // return []
      },
      // setter
      set(list) {
        store.commit('updateAttributeVFileImport', {
          attribute: 'options',
          criteria: 'listCharsets',
          value: list
        })
      }
    })

    const optionsImportFormats = computed({
      // getter
      get() {
        const { listImportFormats } = store.getters.getOptions
        return listImportFormats
        // return []
      },
      // setter
      set(list) {
        store.commit('updateAttributeVFileImport', {
          attribute: 'options',
          criteria: 'listImportFormats',
          value: list
        })
      }
    })

    /**
     * Methods
     */
    function remoteSearchCharsets(query) {
      if (!isEmptyValue(query) && query.length > 2) {
        const result = optionsCharsets.value.filter(findFilter(query))
        if (isEmptyValue(result)) {
          findCharsets(true, query)
        }
      }
    }

    function findCharsets(isFind, searchValue) {
      if (!isFind) {
        return
      }
      listCharsets({
        searchValue
      })
        .then(response => {
          const { records } = response
          optionsCharsets.value = records.map(list => {
            const { DisplayColumn, ValueColumn } = list.values
            return {
              value: ValueColumn,
              label: DisplayColumn
            }
          })
        })
    }

    function remoteSearchImportFormats(query) {
      if (!isEmptyValue(query) && query.length > 2) {
        const result = optionsImportFormats.value.filter(findFilter(query))
        if (isEmptyValue(result)) {
          findCharsets(true, query)
        }
      }
    }

    function findImportFormats(isFind, searchValue) {
      if (!isFind) {
        return
      }
      listImportFormats({
        searchValue
      })
        .then(response => {
          const { records } = response
          optionsImportFormats.value = records.map(list => {
            const { DisplayColumn } = list.values
            return {
              value: list.id,
              label: DisplayColumn
            }
          })
        })
    }

    function findFilter(queryString) {
      return (query) => {
        const search = queryString.toLowerCase()
        return query.label.toLowerCase().includes(search)
      }
    }

    function infoImportFormats(id) {
      if (isEmptyValue(id)) return
      store.dispatch('importFormats', {
        id
      })
        .then(response => {
          formatFields.value = response.formatFields
        })
    }

    function handleFormat(field) {
      const alo = headerTable.value.map(header => {
        if (field.header === header) {
          return {
            ...header,
            label: field.field
          }
        }
        return header
      })
      headerTable.value = alo
    }

    // Optener Excel

    function beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1
      if (isLt1M) {
        return true
      }
      console.log('error')
      return false
    }

    function handleSuccess({ data, workbook, firstSheetName, worksheet, results, header }) {
      const epale = results.filter((data, index) => {
        if (index <= 50) {
          return data
        }
      })
      dataTable.value = epale
      headerTable.value = header.map(list => {
        return {
          key: list,
          label: list
        }
      })
    }
    /**
     * Watch
     */
    return {
      // Ref
      headerTable,
      dataTable,
      formatFields,
      // Computed
      optionsCharsets,
      currrentCharsets,
      optionsImportFormats,
      currrentImportFormats,
      // Methods
      findCharsets,
      infoImportFormats,
      findImportFormats,
      remoteSearchCharsets,
      remoteSearchImportFormats,
      // Optener CSV
      beforeUpload,
      handleSuccess,
      handleFormat
      // Action Panel Footer
    }
  }
})
</script>
