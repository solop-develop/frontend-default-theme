<template>
  <div v-if="!isFieldOnly" :style="labelStyle" class="label-field">
    <span>
      {{ label }}
    </span>

    <span v-if="isMandatory" :style="'color: #f34b4b'"> * </span>

    <i :class="cssClassName" :style="iconStyle" />
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

export default defineComponent({
  name: 'LabelField',

  props: {
    isMandatory: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    isFieldOnly: {
      type: Boolean,
      default: false
    },
    isButton: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { root }) {
    const isMobile = computed(() => {
      return root.$store.state.app.device === 'mobile'
    })

    const labelStyle = computed(() => {
      let displayStyle = 'display: block;'
      if (isMobile.value) {
        displayStyle = 'display: flex; width: auto;'
      }

      if (props.isButton) return displayStyle + ' margin-left: 3px;color: transparent;'

      return displayStyle + ' margin-left: 3px;'
    })

    const cssClassName = computed(() => {
      const iconClass = 'el-icon-info '
      if (isMobile.value) {
        return iconClass + 'icon-mobile'
      }
      return iconClass + 'icon-desktop'
    })

    const iconStyle = computed(() => {
      if (props.isButton) return 'color: transparent;'
      return ''
    })

    return {
      cssClassName,
      labelStyle,
      iconStyle
    }
  }
})
</script>

<style lang="scss">
.el-popover {
  .el-icon-info.icon-desktop {
    margin-left: 0px !important;
  }
}
</style>
<style lang="scss" scoped>
.label-field {
  .el-icon-info {
    font-size: 11px;
    color: #008fd3;

    &.icon-mobile {
      margin-left: 5px;
      margin-top: 7px;
    }

    &.icon-desktop {
      margin-left: -5px;
      padding-bottom: 6px;
    }
  }
}
</style>
