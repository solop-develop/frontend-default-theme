<template>
  <el-card
    style="height: auto;"
  >
    <div class=""clearfix>
      <el-row :gutter="2">
        <el-col :span="22">
          <el-button
            type="text"
            class="label-dashboard"
            style="font-size: 18px;color: black;font-weight: 9000;"
            @click="show = !show"
          >
            {{ 'Document tasks' }}
          </el-button>
        </el-col>
        <el-col :span="2">
          <el-button
            type="text"
            style="font-size: 18px;color: black;font-weight: 9000;"
            @click="show = !show"
          >
            {{ 'Ver Mas' }}
          </el-button>
        </el-col>
      </el-row>
      <div style="padding-left: 10px;padding-right: 10px;">
        <el-row :gutter="12" class="panel-group">
          <el-col
            v-for="taks in mainTaks"
            :key="taks.id"
            :span="8"
            style="margin-bottom: 10px"
          >
            <div
              class="card-panel"
              @click="handleClick(taks)"
            >
              <div class="card-panel-icon-wrapper icon-message">
                <svg-icon icon-class="tab" class-name="card-panel-icon" />
              </div>
              <div class="card-panel-description">
                <div class="card-panel-text">
                  {{ taks.name }}
                </div>
                <p style="text-align: right;margin-right: 5%;">
                  <b
                    style="font-size: 25px;font-weight: 900;"
                  >
                    {{ taks.recordCount }}
                  </b>
                </p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <br>
    </div>
    <transition name="el-zoom-in-top">
      <div style="padding-left: 10px;padding-right: 10px;">
        <el-row v-if="show" :gutter="12" class="panel-group">
          <el-col
            v-for="taks in documentList"
            :key="taks.id"
            :span="8"
            style="margin-bottom: 10px"
          >
            <div
              class="card-panel"
              @click="handleClick(taks)"
            >
              <div class="card-panel-icon-wrapper icon-message">
                <svg-icon icon-class="tab" class-name="card-panel-icon" />
              </div>
              <div class="card-panel-description">
                <p style="margin: 0px">
                  {{ taks.name }}
                </p>
                <p style="text-align: right;margin-right: 5%;">
                  <b
                    style="font-size: 25px;font-weight: 900;"
                  >
                    {{ taks.recordCount }}
                  </b>
                </p>
              </div>
            </div>
          </el-col>
          <br>
          </br>
        </el-row>
      </div>
    </transition>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import CountTo from 'vue-count-to'
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
import store from '@/store'

export default defineComponent({
  name: 'PanelGroupCards',
  components: {
    CountTo
  },
  setup(props) {
    // Ref
    const show = ref(false)
    // Computed
    const documentList = computed(() => {
      return store.getters.getListTaks
    })

    const mainTaks = computed(() => {
      return documentList.value.splice(0,3)
    })

    console.log(documentList.value)

    function loadPendingDocuments() {
      store.dispatch('listPendingDocuments')
    }

    function handleClick(taks) {
      let tabParent
      if (taks.action === 'window') {
        tabParent = 0
      }

      zoomIn({
        uuid: taks.windowUuid,
        params: {
          ...taks.criteria
        },
        query: {
          tabParent,
          action: 'criteria'
        }
      })
    }

    loadPendingDocuments()

    return {
      // Ref
      show,
      // Computed
      mainTaks,
      documentList,
      // Methods
      handleClick,
      loadPendingDocuments
    }
  }
})
</script>

<style lang="scss">
.panel-group {
  margin: 0px;
  border: 1px solid #dfe4ed;
  border-radius: 10px;
  padding: 5px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      margin-left: 0px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      margin-right: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        margin-bottom: 2px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
