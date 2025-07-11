<template>
  <div class="figures"
       @mousedown="startSelection"
       @mousemove="updateSelection"
       @mouseup="endSelection"
       @mouseleave="endSelection">
    <div v-if="isSelecting" class="selection-box"
         :style="{
            left: `${selectionLeft}px`,
            top: `${selectionTop}px`,
            width: `${selectionWidth}px`,
            height: `${selectionHeight}px`
         }">
    </div>
    <div class="figures-content">
      <div class="figure-item">
        <div style="margin-bottom: 10px;font-weight: bold">素材(快捷键: Ctrl + A 全选)</div>
        <div class="figures-list">
          <div v-for="item in processMaterials" :key="item.id">
            <div class="figure-image-wrapper shining">
              <el-image
                class="figures-img"
                style="filter: blur(15px);opacity: 0.8"
                :src="require('/public/images/4.jpg')"
                fit="cover">
              </el-image>
              <div class="shine-layer"></div>
              <div class="figure-progress">
                <div>素材上传中</div>
                <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
              </div>
            </div>
            <div class="figure-name" :title="item.name">{{ item.name }}</div>
          </div>

          <div v-for="(item, index) in materials"
               :key="index"
               @contextmenu.stop="handleContextMenu(item, $event)"
               @click="selectMaterial(item)"
               ref="materialItems">
            <el-image class="figures-img" :class="{'figure-img-active': selected_materials.includes(item.id)}"
                      :src="item.picture" fit="cover" lazy></el-image>
            <div class="figure-name"  :class="{'figure-name-active': selected_materials.includes(item.id)}"
                 :title="item.name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="figure-item">
        <div style="margin-bottom: 10px;font-weight: bold">形象</div>
        <div class="figures-list">
          <div v-for="item in processTasks" :key="item.id">
            <div class="image-wrapper shining">
              <el-image style="width: 120px; height: 158px; border-radius: 8px;filter: blur(15px);opacity: 0.8"
                        :src="require('/public/images/4.jpg')" fit="cover">
              </el-image>
              <div class="shine-layer"></div>
              <div class="figure-progress">
                <div>形象克隆中</div>
                <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 22px">{{ dot }}</div>
              </div>
            </div>
            <div class="figure-name" :title="item.name">{{ item.name }}</div>
          </div>
          <div v-for="(item, index) in figures"
               :key="index"
               @contextmenu.stop="handleContextMenu(item, $event)"
               @click="selectItem(item)">
            <el-image class="figures-img" :src="item.picture" fit="cover"></el-image>
            <div class="figure-name" :title="item.name">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div :style="menuStyle" v-if="rightMenuVisible" style="padding: 8px 12px">
        <div class="material-function" @click="preview">
          <i class="el-icon-view menu-icon"></i>
          预览
        </div>
        <div class="material-function" @click="rename">
          <i class="el-icon-edit-outline menu-icon"></i>
          重命名
        </div>
        <div class="material-function" @click="deleteItem">
          <i class="el-icon-delete-solid menu-icon"></i>
          删除
        </div>
        <div class="material-function" @click="detail" v-if="selectedItem.video_type === 'material'">
          <i class="el-icon-document menu-icon"></i>
          详情
        </div>
      </div>
    </div>
    <div style="display: flex;margin-top: 30px;gap: 100px">
      <div style="text-align: end;flex: 1">
        <el-button type="primary" @click="uploadDialogVisible = true">上传素材</el-button>
      </div>
      <div style="flex: 1">
        <el-upload
            class="avatar-uploader"
            action="http://127.0.0.1:6006/figure/clone"
            :show-file-list="false"
            accept=".mp4, .mov"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :before-upload="beforeUpload"
            :data="{ lip_sync: true }">
          <el-button type="primary">添加形象</el-button>
        </el-upload>
      </div>
    </div>
    <el-dialog class="detail-dialog" title="素材分析结果" :visible.sync="detailDialogVisible" width="640px">
      <div v-html="htmlContent" class="markdown-content"></div>
    </el-dialog>
    <el-dialog class="upload-dialog" :visible.sync="uploadDialogVisible" width="32rem"
               title="上传素材" :before-close="beforeUploadClose">
      <el-form ref="uploadForm" label-position="top" label-width="80px" :model="uploadData">
        <el-form-item label="">
          <el-upload
              drag
              ref="materialUpload"
              class="material-uploader"
              style="width: 100%"
              action="http://127.0.0.1:6006/figure/clone_only"
              accept=".mp4, .mov"
              :on-success="uploadMaterialsSuccess"
              :on-error="uploadMaterialsError"
              :before-upload="beforeUpload"
              :on-progress="handleFileChange"
              :file-list.sync="materialList"
              :data="uploadData"
              :auto-upload="false"
              multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-form-item>
        <el-form-item label="关联店铺 (必选)" prop="store_id">
          <el-select v-model="uploadData.store_id" placeholder="请选择要关联的店铺" style="width: 100%">
            <el-option
                v-for="shop in shops"
                :key="shop.id"
                :label="shop.name"
                :value="shop.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义标签 (可选)" prop="tags">
          <el-input v-model="uploadData.tags" placeholder="多标签请使用逗号(,)分隔"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="handleSubmit" size="small">确认上传</el-button>
      </span>
    </el-dialog>
    <el-dialog class="preview-dialog" :visible.sync="dialogVisible" :before-close="beforeClose"
               :width="aspectRatio > 1? '640px' : '390px'">
      <div style="width: 100%;text-align: center;position: relative">
        <video style="border-radius: 10px;width: calc(100% - 40px)"
               ref="video"
               :src="src"
               @ended="isPlaying = false"
               @loadedmetadata="checkAspectRatio">
        </video>
        <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
          <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
        </div>
      </div>
    </el-dialog>
    <el-drawer title="重命名形象名称" :visible.sync="drawer" direction="rtl">
      <div style="width: 100%; text-align: center">
        <el-form ref="form" style="width: 70%; margin: 0 auto">
          <el-form-item label="新名称" prop="newName">
            <el-input v-model="newName" placeholder="请输入新名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSave">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <div class="figures-footer">
      上传的视频文件格式需为:mp4、mov、MP4、MOV格式；上传的视频文件的时长最少应不低于30秒，建议不超过90秒；上传的视频内容必须符合规范，包含单个人物形象，脸部无遮挡；容量小的原始视频（建议50-100M左右）有利于提高模型速度。
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {delAction, getAction, postAction} from "@/api/api";
import {mapGetters} from "vuex";
import axios from "axios";
import {marked} from "marked";
export default {
  name: "figures",
  mixins: [RightMenuMixin],
  data() {
    return {
      selected_materials: [],
      uploadDialogVisible: false,
      uploadData: {
        store_id: '',
        tags: '',
        lip_sync: true
      },
      dialogVisible: false,
      drawer: false,
      src: "",
      aspectRatio: 0,
      isPlaying: false,
      figureId: null,
      newName: "",
      dotCount: 1,
      dotTimer: null,
      dot: '.',
      materialList: [],
      response_list: [],
      detailDialogVisible: false,
      detail_content: '',

      // 框选相关状态
      isSelecting: false,
      initialX: 0,     // 初始X坐标
      initialY: 0,     // 初始Y坐标
      selectionLeft: 0,  // 选框左边界
      selectionTop: 0,   // 选框上边界
      selectionWidth: 0, // 选框宽度
      selectionHeight: 0, // 选框高度
      initial_material_list: [], // 初始选中的素材列表
      selectingThreshold: 10, // 新增：框选最小移动阈值（像素）
      isVideoItemClick: false, // 新增：标记是否为视频项点击
      shouldShowPopover: false,
      shops: []
    };
  },
  computed: {
    ...mapGetters("task", ["figureTasks"]), // 获取任务列表
    processMaterials() {
      return this.figureTasks.filter((item) => item.status === "pending");
    },
    processTasks() {
      return this.figureTasks.filter((item) => item.status === "ready");
    },
    figures() {
      return this.figureTasks.filter((item) => item.status === "success" && item.video_type === 'figure');
    },
    materials() {
      return this.figureTasks.filter((item) => item.status === "success" && item.video_type === 'material');
    },
    htmlContent() {
      return marked(this.detail_content);
    }
  },
  mounted() {
    this.queryShops()
    this.startDotAnimation();
    this.$store.dispatch("task/pollFigureTasks");
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    clearInterval(this.dotTimer);
  },
  methods: {
    queryShops() {
      getAction('/store/all').then(res => {
        if (res.data.status === 'success') {
          this.shops = res.data.data
        }else {
          this.$message.error('获取店铺列表失败')
        }
      }).catch(err => {
        this.$message.error('获取店铺列表失败')
      })
    },
    handleKeyDown(event) {
      if (event.ctrlKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        this.selectAllMaterials();
      }
    },
    selectAllMaterials() {
      this.selected_materials = this.materials.map(item => item.id)
    },
    selectMaterial(item) {
      this.selected_materials = [item.id]
    },
    beforeUploadClose() {
      this.materialList = []
      this.uploadData.store_id = ''
      this.uploadData.tags = ''
      this.uploadDialogVisible = false
    },
    handleSubmit() {
      let files = this.$refs.materialUpload.uploadFiles || []
      if (files.length === 0) {
        this.$message.warning('请选择要上传的素材！');
        return;
      }
      if (!this.uploadData.store_id) {
        this.$message.warning('请必须选择一个关联店铺！');
        return;
      }
      this.$refs.materialUpload.submit()
    },
    startDotAnimation() {
      this.dotTimer = setInterval(() => {
        this.dotCount = this.dotCount % 3 + 1;
        this.dot = '.'.repeat(this.dotCount);
      }, 1000);
    },
    selectItem(item) {
      this.selectedItem = item;
      this.preview()
    },
    preview() {
      this.src = this.selectedItem.filepath;
      this.dialogVisible = true;
    },
    rename() {
      this.figureId = this.selectedItem.id;
      this.newName = "";
      this.drawer = true;
    },
    onSave() {
      let params = {
        figure_id: this.figureId,
        name: this.newName,
      };
      postAction("/figure/update_name", params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功");
          this.$store.dispatch("task/pollFigureTasks");
        } else {
          this.$message.error(res.data.message);
        }
        this.drawer = false;
      }).catch((err) => {
        this.$message.error("重命名失败，请稍后重试！");
      });
    },
    deleteItem() {
      let ids = this.selected_materials;
      let msg = '此操作将删除该素材, 是否继续?'
      if (ids.length > 1) {
        msg = `确定要删除这${ids.length}个素材吗？ 删除后将无法恢复`
      }
      this.$confirm(msg, '删除素材', {
        type: 'warning'
      }).then(() => {
        delAction("/figure/delete", {ids: ids.join(',')}).then((res) => {
          if (res.data.status === "success") {
            this.$message.success("删除成功");

            const material_list = JSON.parse(sessionStorage.getItem('material_list')) || [];
            const new_material_list = material_list.filter(item => !ids.includes(item));
            sessionStorage.setItem('material_list', JSON.stringify(new_material_list));

            const mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || [];
            const new_mention_list = mention_list.filter(item => !ids.includes(item.id));
            sessionStorage.setItem('mention_list', JSON.stringify(new_mention_list));

            let figure = JSON.parse(sessionStorage.getItem('figure')) || {}
            if (figure.id === this.selectedItem.id) {
              sessionStorage.removeItem('figure');
            }

            console.log(111)
            this.$store.dispatch("task/pollFigureTasks");
          } else {
            this.$message.error(res.data.message);
          }
        }).catch((err) => {
          console.log(err)
          this.$message.error("删除失败，请稍后重试！");
        });
      }).catch(() => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    detail() {
      this.detailDialogVisible = true;
      this.detail_content = this.selectedItem.material_summary;
    },
    checkAspectRatio() {
      const video = this.$refs.video;
      const width = video.videoWidth;
      const height = video.videoHeight;
      this.aspectRatio = width / height
    },
    controlVideo() {
      const video = this.$refs.video;
      if (this.isPlaying) {
        video.pause();
        this.isPlaying = false;
      } else {
        video.play();
        this.isPlaying = true;
      }
    },
    beforeClose() {
      this.isPlaying = false;
      const video = this.$refs.video;
      video.pause();
      this.dialogVisible = false;
    },
    async beforeUpload(file) {
      return getAction('/verify/activation').then(res => {
        if (res.data.status === 'success') {
          return true;
        } else {
          this.$alert(res.data.message, "验证失败");
          return Promise.reject('验证失败，停止上传');
        }
      })
    },
    handleFileChange(event, file, fileList) {
      this.materialList = fileList;
    },
    uploadMaterialsError(file) {
      this.response_list.push({name: file.name, status: "failed", msg: "上传失败"})
      if (this.response_list.length === this.materialList.length) {
        let success = this.response_list.filter(item => item.status === "success").map(res => res.name);
        let failed = this.response_list.filter(item => item.status === "failed")
        let content = ''
        if (success.length > 0)
          content += `创建${success.join('、')}素材上传任务成功\n`
        if (failed.length > 0) {
          failed.forEach(item => {
            content += `创建${item.name}素材上传任务失败，${item.msg}\n`
          })
        }
        this.response_list = [];
        this.materialList = [];
        this.$alert(content, "任务创建提醒");
      }
    },
    uploadMaterialsSuccess(res, file) {
      if (res.status === "success") {
        this.response_list.push({name: file.name, status: "success"})
        if (this.response_list.length === this.materialList.length) {
          let success = this.response_list.filter(item => item.status === "success").map(res => res.name);
          let failed = this.response_list.filter(item => item.status === "failed")
          let content = ''
          if (success.length > 0)
            content += `创建${success.join('、')}素材上传任务成功\n`
          if (failed.length > 0) {
            failed.forEach(item => {
              content += `创建${item.name}素材上传任务失败，${item.msg}\n`
            })
          }
          this.response_list = [];
          this.materialList = [];
          this.$alert(content, "任务创建提醒");
          this.uploadDialogVisible = false
        }
        this.$store.dispatch("task/pollFigureTasks");
      } else {
        this.response_list.push({name: file.name, status: "failed", msg: res.message})
        if (this.response_list.length === this.materialList.length) {
          let success = this.response_list.filter(item => item.status === "success").map(res => res.name);
          let failed = this.response_list.filter(item => item.status === "failed")
          let success_content = ''
          let error_content = ''
          if (success.length > 0)
            success_content += `创建${success.join('、')}素材上传任务成功`
          if (failed.length > 0) {
            failed.forEach(item => {
              error_content += `创建${item.name}素材上传任务失败，${item.msg}\n`
            })
          }
          this.response_list = [];
          this.materialList = [];
          this.$alert(success_content, "素材上传成功任务").then(() => {
            this.$alert(error_content, "素材上传失败任务")
          }).catch(() => {
            this.$alert(error_content, "素材上传失败任务")
          })
        }
      }
    },
    uploadError(file) {
      let content = `创建${file.name}形象克隆任务失败`;
      this.$alert(content, "任务创建提醒");
    },
    uploadSuccess(res, file) {
      if (res.status === "success") {
        let content = `已创建${file.name}形象克隆任务，形象克隆成功后会自动更新形象列表`;
        this.$alert(content, "任务创建提醒");
        this.$store.dispatch("task/pollFigureTasks");
      } else {
        let content = `创建${file.name}形象克隆任务失败，${res.data}`;
        this.$alert(content, "任务创建提醒");
      }
    },

    startSelection(event) {
      if (event.button !== 0) {
        return
      }
      event.preventDefault()
      event.stopPropagation()

      const rect = this.$el.getBoundingClientRect()
      this.initialX = event.clientX - rect.left
      this.initialY = event.clientY - rect.top

      this.selectionLeft = this.initialX
      this.selectionTop = this.initialY
      this.selectionWidth = 0
      this.selectionHeight = 0

      this.isSelecting = true

      this.initial_material_list = [...this.selected_materials]
    },

    // 更新框选
    updateSelection(event) {
      if (!this.isSelecting) return

      const rect = this.$el.getBoundingClientRect()
      const currentX = event.clientX - rect.left
      const currentY = event.clientY - rect.top

      // 计算位移距离
      const distance = Math.sqrt(
          Math.pow(currentX - this.initialX, 2) +
          Math.pow(currentY - this.initialY, 2)
      );

      // 只有当移动超过阈值时，才认为是真正的框选
      if (distance >= this.selectingThreshold) {
        event.preventDefault();
        event.stopPropagation();
        this.isVideoItemClick = false
        // 计算选框位置和大小（考虑任意方向）
        this.selectionLeft = Math.min(this.initialX, currentX)
        this.selectionTop = Math.min(this.initialY, currentY)
        this.selectionWidth = Math.abs(currentX - this.initialX)
        this.selectionHeight = Math.abs(currentY - this.initialY)

        this.updateSelectedItems()
      }
    },

    // 结束框选
    endSelection() {
      if (!this.isSelecting) return

      this.isSelecting = false
      // 重置选框尺寸
      this.selectionWidth = 0
      this.selectionHeight = 0
    },

    // 更新选中项
    updateSelectedItems() {
      // 获取选框区域
      const selectionRect = {
        left: this.selectionLeft,
        top: this.selectionTop,
        right: this.selectionLeft + this.selectionWidth,
        bottom: this.selectionTop + this.selectionHeight
      }

      // 检查每个视频项是否在选框内
      this.$refs.materialItems.forEach((el, index) => {
        const rect = el.getBoundingClientRect()
        const containerRect = this.$el.getBoundingClientRect()

        // 计算相对于容器的位置
        const itemRect = {
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          right: rect.right - containerRect.left,
          bottom: rect.bottom - containerRect.top
        }

        // 判断矩形是否重叠
        const isOverlapping =
            itemRect.left < selectionRect.right &&
            itemRect.right > selectionRect.left &&
            itemRect.top < selectionRect.bottom &&
            itemRect.bottom > selectionRect.top

        // 更新选中状态
        let id = this.materials[index].id
        if (isOverlapping && !this.selected_materials.includes(id)) {
          this.selected_materials.push(id)
        }
        if (!isOverlapping && !this.initial_material_list.includes(id)) {
          this.selected_materials = this.selected_materials.filter(item => item !== id)
        }
      })
    }
  },
};
</script>

<style scoped>
.figures {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.selection-box {
  position: absolute;
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 20;
  transition: all 0.1s ease;
}

.figure-name {
  width: 120px;
  text-align: center;
  line-height: 23px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  color: #101010;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.preview-dialog >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
}

.preview-dialog >>> .el-dialog__headerbtn .el-dialog__close {
  font-size: 24px;
  color: #9a9a9a;
}

.figures-content {
  width: 100%;
  height: calc(100% - 140px);
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  gap: 20px;
}

.figure-item {
  flex: 1;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.figures-list {
  height: calc(100% - 40px);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-auto-rows: 190px;
  gap: 20px;
  justify-items: center;
  overflow: auto;
}

.figure-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.figures-img {
  width: 120px;
  height: 160px;
  border-radius: 8px;
}

.figure-img-active {
  border: 2px solid #4c8df1;
  box-sizing: border-box;
}

.figure-name-active {
  color: #4c8df1 !important;
}

.control-icon {
  font-size: 30px;
  color: #fff;
  cursor: pointer;
  filter: drop-shadow(0px 0px 10px #292929);
}

.figures-footer {
  width: 80%;
  height: 60px;
  margin-top: 20px;
  color: #6d7177;
  font-size: 15px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.markdown-content {
  max-height: 400px;
  overflow: auto;
}

.detail-dialog {
  border-radius: 8px !important;
}

.detail-dialog >>> .el-dialog__title {
  font-weight: bold;
}

.detail-dialog >>> .el-dialog__body {
  padding: 0 20px 20px 20px !important;
}

.upload-dialog >>> .el-dialog {
  border-radius: 10px;
}

.upload-dialog >>> .el-dialog__title {
  font-weight: 700;
}

.upload-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.upload-dialog >>> .el-dialog__body {
  padding: 10px 20px !important;
}

.material-uploader >>> .el-upload {
  width: 100%;
}

.material-uploader >>> .el-upload-dragger {
  width: 100%;
}

.material-uploader >>> .el-upload-list {
  max-height: 80px;
  overflow: auto;
}

::v-deep .el-form-item__label {
  font-weight: bold;
  padding: 0 !important;
  line-height: 22px !important;
}

::v-deep .el-dialog__body {
  padding: 20px 25px 5px;
}
</style>
