<template>
  <el-badge
    :value="total"
    :hidden="total === 0"
    type="primary"
    class="item"
    style="vertical-align: baseline;"
  >
    <el-popover
      ref="badgeNotifications"
      placement="bottom"
      width="400"
      trigger="click"
    >
      <div class="badge-notifications-table">
        <el-table
          :data="processNotifications"
          :highlight-current-row="true"
          @cell-click="handleCurrentChange"
        >
          <el-table-column prop="name" :label="$t('navbar.badge.Notifications')" />
          <el-table-column prop="quantity" :label="$t('form.pos.tableProduct.quantity')" width="100" />

          <!-- <el-table-column
            fixed="right"
            width="50"
          >
            <template slot="header">
              <el-button
                icon="el-icon-delete"
                type="text"
                @click.native.prevent="deleteAll()"
              />
            </template>

            <template slot-scope="scope">
              <el-button
                icon="el-icon-close"
                type="text"
                size="small"
                @click.native.prevent="deleteRow(scope.$index, processNotifications)"
              />
            </template>
          </el-table-column>

          <el-table-column
            width="50"
          >
            <template slot="header">
              <svg-icon icon-class="tree-table" />
            </template>
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                style="color: black"
                @click="openProcess(scope.$index, getRecordNotification)"
              >
                <svg-icon icon-class="tree-table" />
              </el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </div>

      <el-button
        slot="reference"
        type="text"
        icon="el-icon-bell"
        style="float: left;color: #000000;font-size: 121%;font-weight: 615!important;padding-top: 14px;"
      />
    </el-popover>
  </el-badge>
</template>

<script>
// Utils and Helper Methods
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
// import { listNotifiications } from '@/api/ADempiere/dashboard/dashboard.js'
export default {
  name: 'HeaderNotification',

  data() {
    return {
      // processNotifications: [],
      // total: 0,
      identificadorIntervaloDeTiempo: 0,
      currentRow: null
    }
  },
  computed: {
    total: {
      get() {
        let count = 0
        if (!this.isEmptyValue(this.processNotifications)) {
          this.processNotifications.forEach(element => {
            count += element.quantity
          })
        }
        return count
      },
      set(value) {
        return value
      }
    },
    processNotifications: {
      get() {
        return this.$store.getters.getListNotifiications
      },
      set(value) {
        return value
      }
    }
  },
  watch: {
    show(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    }
  },
  created() {
    this.findNotification()
    // this.repetirCadaSegundo()
  },
  methods: {
    close() {
      this.$refs.badge && this.$refs.badge.blur()
      this.options = []
      this.show = false
    },
    handleCurrentChange(notification) {
      console.log({ notification })
      if (notification.name === 'Solicitud') {
        // zoomIn({
        //   uuid: notification.action_uuid
        // })
        this.$router.push({
          name: 'Issues'
        }, () => {})
        return
      }
      zoomIn({
        uuid: notification.action_uuid
      })
      this.$refs.badgeNotifications.showPopper = false
    },
    openProcess(index, rows) {
      this.$router.push({
        name: '8e51c232-fb40-11e8-a479-7a0060f0aa01'
      }, () => {})
      this.deleteRow(index, this.processNotifications)
    },
    deleteRow(index, rows) {
      rows.splice(index, 1)
    },
    deleteAll() {
      // rows.splice(index, rows.lenght)
      this.processNotifications.splice(0)
    },
    findNotification() {
      this.$store.dispatch('findNotifications')
        .then(() => {
          setTimeout(() => {
            this.refresNotification()
          }, 80000)
        })
    },
    refresNotification() {
      this.findNotification()
      this.total = 0
    }

  }
}
</script>

<style>
  .el-badge__content.is-fixed {
    position: absolute;
    top: 6px;
    right: 10px;
    -webkit-transform: translateY(-50%) translateX(100%);
    transform: translateY(-50%) translateX(100%);
  }
</style>

<style lang="scss">
.badge-notifications-table{
  .el-table tr {
    height: 35px;
  }
}
</style>
