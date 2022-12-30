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
    <el-row v-if="!isMobile && searchRecordTypeSale" :gutter="5">
      <el-col :span="19" :style="styleBarOptions">
        <search-fields
          :parent-uuid="parentUuid"
          :container-uuid="containerUuid"
          :fields-list="fieldsList"
          :container-manager="containerManager"
          style="float: right;"
        />
      </el-col>
      <el-col v-if="!isShowedTableRecords" :span="5" style="float: right;">
        <!-- <el-form :class="cssClass" > -->
          <!-- <el-form-item> -->
            <!--
            <template v-if="!isEmptyValue(groupField)" slot="label">
              {{ groupField }}
            </template>
            -->

            <el-select
              v-model="fieldsListShowed"
              :filterable="!isMobile"
              :placeholder="$t('components.filterableItems')"
              multiple
              collapse-tags
              value-key="key"
              :size="size"
              :popper-append-to-body="true"
              style="width: 250px;"
            >
              <el-option
                v-for="(item, key) in fieldsListAvailable"
                :key="key"
                :label="item.name"
                :value="item.columnName"
              />
            </el-select>

            <fields-display-option
              :parent-uuid="parentUuid"
              :container-uuid="containerUuid"
              :available-fields="fieldsListAvailable"
              :available-fields-with-value="fieldsListAvailableWithValue"
              :showed-fields="fieldsListShowed"
              :filter-manager="filterManager"
            />
          <!-- </el-form-item> -->
        <!-- </el-form> -->
      </el-col>
    </el-row>

    <el-row v-else :gutter="20">
      <el-col :span="24">
        <el-form :class="cssClass" style="float: right;">
          <el-form-item>
            <template v-if="!isEmptyValue(groupField)" slot="label">
              {{ groupField }}
            </template>

            <el-select
              v-model="fieldsListShowed"
              :filterable="!isMobile"
              :placeholder="$t('components.filterableItems')"
              multiple
              collapse-tags
              value-key="key"
              :size="size"
              :popper-append-to-body="true"
              style="width: 250px;"
            >
              <el-option
                v-for="(item, key) in fieldsListAvailable"
                :key="key"
                :label="item.name"
                :value="item.columnName"
              />
            </el-select>

            <fields-display-option
              :parent-uuid="parentUuid"
              :container-uuid="containerUuid"
              :available-fields="fieldsListAvailable"
              :available-fields-with-value="fieldsListAvailableWithValue"
              :showed-fields="fieldsListShowed"
              :filter-manager="filterManager"
            />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

import store from '@/store'

// components and mixins
import FieldsDisplayOption from './fieldsDisplayOptions.vue'
import Search from '@theme/components/HeaderSearch'
import searchFields from '@theme/components/ADempiere/searchRecordField'

export default defineComponent({
  name: 'FilterFields',

  components: {
    Search,
    searchFields,
    FieldsDisplayOption
  },

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    groupField: {
      type: String,
      default: ''
    },
    fieldsList: {
      type: Array,
      default: () => []
    },
    filterManager: {
      type: Function,
      default: ({ filterList }) => { return true }
    },
    fieldsToHidden: {
      type: Function,
      default: ({ filterList }) => { return [] }
    },
    // isDisplayedField or isDisplayedColumn
    showedManager: {
      type: Function,
      default: (field) => {}
    },
    /**
     * If is used in table, by default false
     */
    inTable: {
      type: Boolean,
      default: false
    },
    isFilterRecords: {
      type: Boolean,
      default: true
    },
    containerManager: {
      type: Object,
      required: false
    },
    isShowedTableRecords: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { root }) {
    const size = 'small'

    const cssClass = computed(() => {
      if (props.inTable) {
        return 'form-filter-columns'
      }
      return 'form-filter-fields'
    })

    const showedAttibute = computed(() => {
      if (props.inTable) {
        return 'isShowedTableFromUser'
      }
      return 'isShowedFromUser'
    })

    const searchRecordTypeSale = computed(() => {
      return root.$route.meta.type === 'window' && props.isFilterRecords
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const styleBarOptions = computed(() => {
      // if (props.isShowedTableRecords) {
        // return 'display: flex;width: 100% !important;'
      // }
      // return 'display: flex;width: 99% !important;'
    })
    const valueToSearch = computed({
      get() {
        return store.getters.getSearchValueTabRecordsList({
          containerUuid: props.containerUuid
        })
      },
      set(searchValue) {
        store.commit('setSearchValueTabRecordsList', {
          containerUuid: props.containerUuid,
          searchValue
        })
      }
    })

    const fieldsListAvailable = computed(() => {
      /*
      if (!props.inTable && props.panelType === 'window' && !root.isEmptyValue(props.groupField)) {
        // compare group fields to window
        return store.getters.getFieldsListNotMandatory({
          containerUuid: props.containerUuid,
          fieldsList: props.fieldsList
        })
          .filter(fieldItem => {
            return fieldItem.groupAssigned === props.groupField
          })
      }
      */
      // get fields not mandatory
      return props.fieldsToHidden({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        fieldsList: props.fieldsList,
        showedMethod: props.showedManager,
        isTable: props.inTable
      })
    })

    const fieldsListAvailableWithValue = computed(() => {
      // get fields not mandatory with default value
      return props.fieldsToHidden({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        fieldsList: fieldsListAvailable.value,
        isEvaluateDefaultValue: true,
        showedMethod: props.showedManager,
        isTable: props.inTable
      })
    })

    // fields showed
    const fieldsListShowed = computed({
      get() {
        return fieldsListAvailable.value.filter(itemField => {
          return itemField[showedAttibute.value]
        }).map(itemField => {
          return itemField.columnName
        })
      },
      set(selecteds) {
        // set columns to show/hidden in vuex store
        changeShowed(selecteds)
      }
    })

    /**
     * Set fields/columns to hidden/showed in panel/table
     * if is advanced query or browser panel with values or null/not null
     * operator, dispatch search
     * @param {array} selectedValues
     */
    const changeShowed = (selectedValues) => {
      props.filterManager({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        fieldsShowed: selectedValues,
        fieldsList: fieldsListAvailable.value
      })
    }

    const isLoadFilter = ref(false)
    const timeOutSearch = ref(null)

    function handleChangeSearch(value) {
      clearTimeout(timeOutSearch.value)
      timeOutSearch.value = setTimeout(() => {
        // get records
        filterRecord(value)
      }, 1000)
    }

    function filterRecord(searchText) {
      isLoadFilter.value = true

      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        searchValue: searchText
      })
        .finally(() => {
          isLoadFilter.value = false
        })
    }

    return {
      // const
      cssClass,
      // ref
      isLoadFilter,
      timeOutSearch,
      // computeds
      isMobile,
      size,
      fieldsListShowed,
      fieldsListAvailable,
      fieldsListAvailableWithValue,
      valueToSearch,
      searchRecordTypeSale,
      styleBarOptions,
      showedAttibute,
      // methods
      changeShowed,
      handleChangeSearch,
      filterRecord
    }
  }
})
</script>

<style lang="scss" scoped>
.form-filter-fields {
  .el-form-item {
    display: flex;
    margin-bottom: 0px !important;
    margin-left: 0px !important;
    margin-right: 0px !important;

    >.el-form-item__content {
      display: contents !important;
    }
  }
}

.form-filter-columns {
  margin: 0px;
}
</style>
<style lang="scss">
.form-filter-fields {
  .el-form-item {
    >.el-form-item__content {
      display: contents !important;
    }
  }
}
/*
.form-filter-fields {
  .el-tag--small {
    max-width: 132px !important;
  }

  // text tag
  .el-tag {
    &.el-tag--info {
      &.el-tag--small {
        &.el-tag--light  {
          // max-width: calc(100% - 10px);
          &:first-child {
            .el-select__tags-text {
              max-width: calc(100% - 15px);
            }
          }
        }
      }
    }
  }
  .el-select__tags-text {
    width: 100%;
    overflow: hidden !important;
    white-space: nowrap;
    text-overflow: ellipsis !important; // ... end text
    display: inline-block;
  }

  // icon X close tag
  .el-select i.el-tag__close {
    &.el-tag__close {
      // left: 58%;
      // margin-top: 0px !important;
      // top: 0 !important;
      color: #FFF !important;
      // position: absolute !important;
      position: relative !important;
      top: -7 !important;
    }
  }
}
*/
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

</style>
