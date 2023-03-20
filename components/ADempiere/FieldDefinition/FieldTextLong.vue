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
  <div
    v-if="isDisabled"
    key="text-long-readonly"
    v-markdown="value"
    class="custom-field-text-long-disable"
  />
  <v-md-editor
    v-else
    key="text-long-writable"
    v-model="value"
    left-toolbar="clear h bold italic strikethrough quote ul ol table hr link image | emoji listMailTemplates"
    height="250px"
    @change="preHandleChange"
  />
</template>

<script>
// Components and Mixins
import fieldMixin from '@theme/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldMixinText from '@theme/components/ADempiere/FieldDefinition/mixin/mixinFieldText.js'

export default {
  name: 'FieldTextLong',

  mixins: [
    fieldMixin,
    fieldMixinText
  ],

  data() {
    return {
      mode: 'markdown', // 'markdown' or 'wysiwyg'
      height: '200px',
      editor: null
    }
  },

  computed: {
    cssClassCustomField() {
      let styleClass = ' custom-field-text-long '
      if (this.isDisabled) {
        styleClass += ' custom-field-text-long-disable '
      }
      return styleClass
    }
  }
}
</script>

<style scoped>
.custom-field-text-long-disable {
  background: #F5F7FA;
}
</style>
