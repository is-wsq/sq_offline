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
    <div class="classify-btn-group">
      <div v-for="item in classify_types" :key="item.type" @click="classify_type = item.type"
           class="classify-btn" :class="{'classify-btn-active': classify_type === item.type}" >
        <i :class="item.icon"></i>
        {{ item.name }}
      </div>
    </div>
    <div class="classify-content">
      <template v-if="classify_type === 'character'">
        <div style="margin-bottom: 10px;font-weight: bold">形象</div>
        <div class="figures-list">
          <div class="source-item upload-item" @click="uploadFigureVisible = true">
            <i class="el-icon-upload" style="font-size: 30px"></i>
            <span style="font-size: 14px;margin-top: 8px">上传形象</span>
          </div>
          <div v-for="item in processTasks" :key="item.id" class="source-item">
            <div class="figure-image-wrapper shining">
              <el-image
                  class="figures-img"
                  style="filter: blur(15px);opacity: 0.8"
                  :src="require('/public/images/4.jpg')"
                  fit="cover">
              </el-image>
              <div class="shine-layer"></div>
              <div class="figure-progress">
                <div style="font-size: 14px">形象克隆中</div>
                <div style="width: 10px;text-align: left;margin-left: 5px;font-size: 20px">{{ dot }}</div>
              </div>
            </div>
            <div class="source-title" :title="item.name">{{ item.name }}</div>
          </div>
          <div v-for="(item, index) in figures"
               :key="index"
               class="source-item"
               @contextmenu.stop="handleContextMenu(item, $event)"
               @click="selectItem(item)">
            <el-image class="figures-img" :src="item.picture" fit="cover"></el-image>
            <div class="source-title" :title="item.name">{{ item.name }}</div>
          </div>
        </div>
      </template>

      <template v-else-if="classify_type === 'material'">
        <div style="margin-bottom: 10px;font-weight: bold">素材(快捷键: Ctrl + A 全选)</div>
        <div class="filter-tags">
          <el-tag :class="{'filter-tag-active': filter_active_tags.length === 0 && filter_active_store.length === 0}"
                  class="filter-tag" size="small" @click="tagFilter('')">
            全部</el-tag>
          <template v-for="store_id in storeIds">
            <el-tag :key="store_id" size="small" v-if="shops.some(shop => shop.id.includes(store_id))"
                    class="filter-tag" :class="{'filter-tag-active': filter_active_store.includes(store_id)}"
                    @click="storeFilter(store_id)">
              {{ shops.find(shop => shop.id === store_id).name }}</el-tag>
          </template>
          <el-tag v-for="(tag, tag_index) in tags" :key="tag_index" size="small" @click="tagFilter(tag)"
                  class="filter-tag" :class="{'filter-tag-active': filter_active_tags.includes(tag)}">
            {{ tag }}</el-tag>
        </div>
        <div class="figures-list" ref="materialsRef">
          <div class="source-item upload-item" @click="openUploadDialog">
            <i class="el-icon-upload" style="font-size: 30px"></i>
            <span style="font-size: 14px;margin-top: 8px">上传素材</span>
          </div>
          <div v-for="item in processMaterials" :key="item.id" class="source-item">
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
            <div class="source-title" :title="item.name">{{ item.name }}</div>
          </div>
          <div v-for="(item, index) in filteredMaterials"
               :key="index"
               class="source-item"
               @contextmenu.stop="handleContextMenu(item, $event)"
               @click="e => selectMaterial(item, e)"
               ref="materialItems">
            <el-image class="figures-img" :class="{'figure-img-active': selected_materials.includes(item.id)}"
                      :src="item.picture" fit="cover" lazy :scroll-container="$refs.materialsRef"></el-image>
            <div class="source-title" :title="item.name">{{ item.name }}</div>
          </div>
        </div>
      </template>

      <template v-else>
        <div style="margin-bottom: 10px;font-weight: bold">产品图片</div>
        <div class="product-list">
          <div v-for="(item, index) in product_list" :key="index" class="product-item">
            <div class="product-item-name" @dblclick="renameProduct(item)">{{ item.name }}</div>
            <div class="product-item-img" @click="operateProductImage(item, 0)">
              <div class="img-content" v-for="(img, img_index) in item.images" :key="img_index"
                   @click.stop="operateProductImage(item, img_index)">
                <el-image :src="img.filepath" class="product-item-img-item" fit="cover"></el-image>
                <div class="delete-img-icon">
                  <i class="el-icon-delete" @click.stop="deleteProductImage(img)"></i>
                </div>
                <div class="extra flex-center" v-if="item.images.length > 4 && img_index === 3">
                  +{{ item.images.length - 4 }}
                </div>
              </div>
            </div>
            <div class="product-item-detail">
              <span style="flex: 1">{{ item.images.length }}张图片</span>
              <i class="el-icon-plus font-weight cursor-pointer" @click="addImage(item)"></i>
              <i class="el-icon-delete font-weight cursor-pointer" @click="deleteProduct(index)"></i>
            </div>
          </div>
        </div>
      </template>

      <div :style="menuStyle" v-if="rightMenuVisible" style="padding: 8px 12px">
        <div class="material-function" @click="preview">
          <i class="el-icon-view menu-icon"></i>
          播放
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
    <el-dialog class="upload-dialog" :visible.sync="uploadFigureVisible" width="600px" :before-close="beforeFigureClose">
      <div slot="title" class="upload-dialog-title" @mousedown.stop="">上传形象</div>
      <div class="upload-dialog-body" @mousedown.stop="">
        <el-upload
            drag
            class="material-uploader"
            ref="figureUpload"
            action="http://127.0.0.1:6006/figure/clone"
            :auto-upload="false"
            accept=".mp4, .mov"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :on-change="handleProgress"
            :file-list.sync="uploadFigureList"
            :data="{ lip_sync: true }">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </div>
      <div slot="footer" class="upload-dialog-footer" @mousedown.stop="">
        <el-button :disabled="loading" @click="beforeFigureClose" size="small">取消</el-button>
        <el-button type="primary" @click="handleFigureSubmit" size="small" :loading="loading">
          {{ loading? '上传中': '确认上传' }}</el-button>
      </div>
    </el-dialog>
    <el-dialog class="detail-dialog" title="素材分析结果" :visible.sync="detailDialogVisible" width="640px">
      <div style="max-height: calc(70vh - 100px);overflow-y: auto">
        <div v-html="htmlContent" class="markdown-content" @mousedown.stop=""></div>
        <div class="total-score-card">
          <div class="total-score-header">
            <div class="left-title">素材质量评估结果</div>
            <div class="right-score-box">{{ video_score.total }}&nbsp;/&nbsp;30</div>
          </div>
        </div>

        <div class="detail-score-card">
          <el-collapse v-model="activeCollapseNames" accordion>
            <el-collapse-item
                v-for="(dimension, dimIndex) in video_score.dimensionality"
                :key="dimIndex"
                :title="`${dimension.name}（${dimension.score}分）`"
                :name="dimIndex.toString()"
                class="dimension-collapse-item"
            >
              <div class="dimension-reason">
                <p class="reason-content">{{ dimension.reason }}</p>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-dialog>
    <el-dialog class="upload-dialog" :visible.sync="uploadDialogVisible" width="600px" :before-close="beforeUploadClose">
      <div slot="title" class="upload-dialog-title" @mousedown.stop="">上传素材</div>
      <div class="upload-dialog-body" @mousedown.stop="">
        <el-form ref="uploadForm" label-position="top" label-width="80px" :model="uploadData">
          <el-form-item label="">
            <el-upload
                drag
                ref="materialUpload"
                class="material-uploader"
                style="width: 100%"
                action="#"
                accept=".mp4, .mov"
                :http-request="handleUploadImage"
                :on-change="handleMaterialChange"
                :on-remove="handleMaterialRemove"
                :file-list.sync="materialList"
                :data="uploadData"
                :auto-upload="false"
                :limit="100"
                :on-exceed="handleExceed"
                :disabled="loading"
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
          <el-form-item label="自定义标签 (可选)" prop="tag">
            <div class="tags">
              <el-button v-if="!inputVisible" class="button-new-tag" size="small" @click="showInput">添加新标签
              </el-button>
              <el-tag v-for="(tag, index) in show_tags" :key="index" size="small" class="tag"
                      :class="{ 'tag-active': activeTags.includes(tag) }" @click="selectTag(tag)">
                {{ tag }}
              </el-tag>
            </div>
            <el-input v-model="new_tag" placeholder="多标签请使用逗号(,)分隔;输入完成后按回车创建" v-if="inputVisible" ref="saveTagInput"
                      @change="handleInputConfirm"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="upload-dialog-footer" @mousedown.stop="">
        <el-button @click="beforeUploadClose" size="small">取消</el-button>
        <el-button type="primary" @click="handleSubmit" size="small" :loading="loading">
          {{ loading? '上传中': '确认上传' }}
        </el-button>
      </div>
    </el-dialog>
    <el-dialog class="preview-dialog" :visible.sync="dialogVisible" :before-close="beforeClose"
               :width="aspectRatio < 1? '720px' : '420px'" top="10vh">
      <div style="width: 100%;text-align: center;position: relative">
        <video style="border-radius: 10px;width: calc(100% - 40px)"
               ref="video"
               :src="src"
               @ended="isPlaying = false">
        </video>
        <div style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">
          <i class="el-icon-play control-icon" @click="controlVideo" v-if="!isPlaying"></i>
        </div>
      </div>
    </el-dialog>
    <el-dialog class="upload-dialog" :visible.sync="renameDialogVisible" width="600px">
      <div slot="title" class="upload-dialog-title" @mousedown.stop="">重命名</div>
      <div class="upload-dialog-body" @mousedown.stop="">
        <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">原名称</div>
        <el-input v-model="form.original" readonly></el-input>
        <div style="margin: 10px 0 5px 0;font-size: 15px;font-weight: bold">新名称</div>
        <el-input v-model="form.name"  placeholder="请输入新名称"></el-input>
      </div>
      <div slot="footer" class="upload-dialog-footer" @mousedown.stop="">
        <el-button @click="renameDialogVisible = false" size="small">取消</el-button>
        <el-button type="primary" @click="sureRename" size="small">确认</el-button>
      </div>
    </el-dialog>
    <el-dialog class="upload-dialog" :visible.sync="uploadImageDialogVisible" width="600px" :before-close="handleClear">
      <div slot="title" class="upload-dialog-title">{{ readonly? '添加产品图片' : '新增产品' }}</div>
      <div class="upload-dialog-body">
        <el-form ref="uploadForm" label-position="top" label-width="80px" :model="uploadImageData">
          <el-form-item label="">
            <el-upload
                drag
                ref="imageUpload"
                class="material-uploader"
                style="width: 100%"
                action="#"
                accept=".png, .jpg, .jpeg"
                :http-request="handleUploadImage"
                :on-change="handleImagesChange"
                :on-remove="handleImagesRemove"
                :file-list.sync="imagesList"
                :data="uploadImageData"
                :auto-upload="false"
                :limit="100"
                :on-exceed="handleExceed"
                :disabled="loading"
                multiple>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-form-item>
          <el-form-item label="产品名称" prop="name">
            <el-input v-model="uploadImageData.name" placeholder="输入产品名称" :readonly="readonly || loading"></el-input>
          </el-form-item>
          <el-form-item label="关联店铺 (必选)" prop="store_id">
            <el-select v-model="uploadImageData.store_id" placeholder="请选择要关联的店铺" :disabled="readonly || loading"
                       style="width: 100%">
              <el-option
                  v-for="shop in shops"
                  :key="shop.id"
                  :label="shop.name"
                  :value="shop.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="upload-dialog-footer" @mousedown.stop="">
        <el-button @click="handleClear" size="small">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload" size="small" :loading="loading">
          {{ loading? '上传中': '确认上传' }}</el-button>
      </div>
    </el-dialog>
    <div class="figures-footer">
      <el-button type="primary" v-if="classify_type === 'image'" style="width: 150px" @click="addProduct">新增产品</el-button>
      <span v-else>上传的视频文件格式需为:mp4、mov、MP4、MOV格式；上传的视频文件的时长最少应不低于30秒，建议不超过90秒；上传的视频内容必须符合规范，包含单个人物形象，脸部无遮挡；容量小的原始视频（建议50-100M左右）有利于提高模型速度。</span>
    </div>
  </div>
</template>

<script>
import {RightMenuMixin} from "@/mixins/RightMenuMixin";
import {delAction, getAction, postAction} from "@/api/api";
import {mapGetters} from "vuex";
import {marked} from "marked";
import axios from "axios";

export default {
  name: "figures",
  mixins: [RightMenuMixin],
  data() {
    return {
      activeCollapseNames: ['0'],
      filter_active_store: [],
      filter_active_tags: [],
      classify_type: 'character',
      classify_types: [
        { type: 'character', name: '形象库', icon: 'el-icon-fa-user' },
        { type: 'material', name: '素材库', icon: 'el-icon-film-c' },
        { type: 'image', name: '图片库', icon: 'el-icon-fa-image' },
      ],
      selected_materials: [],
      uploadDialogVisible: false,
      uploadData: {
        store_id: '',
        tag: '',
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
      video_score: {},

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
      shops: [],
      show_tags: [],
      activeTags: [],
      new_tag: '',
      inputVisible: false,

      renameDialogVisible: false,
      form: {
        original: '',
        name: ''
      },
      scoreItems: [
        {
          key: 'composition_and_visual_guidance',
          label: '构图与视觉引导',
          englishLabel: 'Composition and Visual Guidance'
        },
        {
          key: 'lighting_and_color',
          label: '光影与色彩运用',
          englishLabel: 'Lighting and Color'
        },
        {
          key: 'focus_and_depth_of_field',
          label: '焦点与景深控制',
          englishLabel: 'Focus and Depth of Field'
        },
        {
          key: 'camera_movement_and_dynamic_aesthetics',
          label: '运镜与动态美感',
          englishLabel: 'Camera Movement and Dynamic Aesthetics'
        },
        {
          key: 'narrative_and_emotional_expression',
          label: '叙事与情感表达',
          englishLabel: 'Narrative and Emotional Expression'
        }
      ],

      resizeObserver: null,
      // product data
      product_list: [],
      productId: '',
      uploadImageDialogVisible: false,
      uploadImageData: {
        name: '',
        store_id: ''
      },
      imagesList: [],
      readonly: false,
      loading: false,
      uploadFigureVisible: false,
      uploadFigureList: []
    };
  },
  watch: {
    classify_type: {
      handler(newValue, oldValue) {
        sessionStorage.setItem('classify_type', newValue);
      },
      deep: true
    },
    tags: {
      handler(newValue, oldValue) {
        if (newValue.join(',') === oldValue.join(','))
          return;
        this.show_tags = [...newValue]
      },
      deep: true
    },
    activeTags() {
      this.uploadData.tag = this.activeTags.join(',')
    }
  },
  computed: {
    ...mapGetters("generate", ["figureTasks"]), // 获取任务列表
    processMaterials() {
      return this.figureTasks.filter((item) => item.status === "pending" && item.video_type === 'material');
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
    filteredMaterials() {
      const base_filter = item => item.status === "success" && item.video_type === 'material';
      const filtered = this.figureTasks.filter(base_filter);

      if (!this.filter_active_tags.length && !this.filter_active_store.length) {
        return filtered;
      }

      const tag_filter = item => {
        if (!item.tag) return false;
        const item_tags = item.tag.split(/[,，]/).map(tag => tag.trim());
        return item_tags.some(tag => this.filter_active_tags.includes(tag));
      };

      const store_filter = item => item.store_id && this.filter_active_store.includes(item.store_id);

      return  filtered.filter(item => {
        const has_tag_filter = this.filter_active_tags.length > 0;
        const has_store_filter = this.filter_active_store.length > 0;

        if (has_tag_filter && has_store_filter) {
          return tag_filter(item) || store_filter(item);
        }
        if (has_tag_filter)
          return tag_filter(item);

        return store_filter(item);
      });
    },
    storeIds() {
      let data = this.figureTasks.filter((item) => item.status === "success" && item.video_type === 'material');
      let storeIds = data.reduce((acc, cur) => {
        if (cur.store_id) {
          acc.push(cur.store_id);
        }
        return acc;
      }, []);
      return [...new Set(storeIds)];
    },
    tags() {
      let data = this.figureTasks.filter((item) => item.status === "success" && item.video_type === 'material');
      let tagsArray = data.reduce((acc, cur) => {
        return acc.concat(cur.tag ? cur.tag.split(/[,，]/) : [])
      }, [])
      return [...new Set(tagsArray)];
    },
    htmlContent() {
      return marked(this.detail_content);
    }
  },
  mounted() {
    this.classify_type = sessionStorage.getItem('classify_type') || 'character'
    this.queryShops()
    this.queryProducts()
    this.startDotAnimation();
    this.$store.dispatch("generate/pollFigureTasks");
    window.addEventListener('keydown', this.handleKeyDown);
    this.$nextTick(() => {
      const container = this.$refs.materialsRef;
      if (container) {
        this.resizeObserver = new ResizeObserver(() => {
          container.dispatchEvent(new Event('scroll'));
        });
        this.resizeObserver.observe(container);
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    clearInterval(this.dotTimer);
    if (this.resizeObserver && this.$refs.materialsRef) {
      this.resizeObserver.unobserve(this.$refs.materialsRef);
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    handleProgress(file, fileList) {
      this.$refs.figureUpload.clearFiles();
      this.uploadFigureList = [file];
    },
    beforeFigureClose() {
      if (this.loading) {
        this.$alert('请等待上传完成后再关闭窗口！', '上传中')
        return false;
      }
      this.$refs.figureUpload.clearFiles();
      this.uploadFigureVisible = false;
    },
    handleFigureSubmit() {
      let files = this.$refs.figureUpload.uploadFiles || []
      if (files.length === 0) {
        this.$alert('请选择一个视频文件作为数字人形象。','上传形象')
        return;
      }
      this.loading = true;
      this.$refs.figureUpload.submit()
    },
    storeFilter(id) {
      if (this.filter_active_store.includes(id)) {
        this.filter_active_store = this.filter_active_store.filter(item => item !== id)
      } else {
        this.filter_active_store.push(id)
      }
    },
    tagFilter(tag) {
      if (!tag) {
        this.filter_active_tags = []
        this.filter_active_store = []
        return;
      }
      if (this.filter_active_tags.includes(tag)) {
        this.filter_active_tags = this.filter_active_tags.filter(item => item!== tag)
      } else {
        this.filter_active_tags.push(tag)
      }
    },
    openUploadDialog() {
      this.materialList = []
      this.uploadData.store_id = ''
      this.uploadData.tag = ''
      this.activeTags = []
      this.new_tag = ''
      this.show_tags = [...this.tags]
      this.uploadDialogVisible = true
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.new_tag;
      if (inputValue) {
        inputValue.split(/[,，]/).forEach(tag => {
          if (!this.tags.includes(tag) && !this.show_tags.includes(tag)) {
            this.show_tags.push(tag)
          }
          if (!this.activeTags.includes(tag)) {
            this.activeTags.push(tag)
          }
        })
      }
      this.inputVisible = false;
      this.new_tag = '';
    },
    selectTag(tag) {
      if (this.activeTags.includes(tag)) {
        this.activeTags.splice(this.activeTags.indexOf(tag), 1)
        return;
      }
      this.activeTags.push(tag)
    },
    queryShops() {
      getAction('/store/all').then(res => {
        if (res.data.status === 'success') {
          this.shops = res.data.data
        } else {
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
      this.selected_materials = this.filteredMaterials.map(item => item.id)
    },
    selectMaterial(item, event) {
      const isSelected = this.selected_materials.includes(item.id);

      if (event.ctrlKey) {
        this.selected_materials = isSelected
            ? this.selected_materials.filter(selectedId => selectedId !== item.id)
            : [...this.selected_materials, item.id];
      } else {
        this.selected_materials = [item.id];
      }
    },
    beforeUploadClose() {
      if (this.loading) {
        this.$alert('请等待上传完成后再关闭窗口！', '上传中')
        return false;
      }
      this.materialList = []
      this.$refs.materialUpload.clearFiles()
      this.uploadData.store_id = ''
      this.uploadData.tag = ''
      this.uploadDialogVisible = false
    },
    handleMaterialChange(file, fileList) {
      this.materialList = fileList;
    },
    handleMaterialRemove(file, fileList) {
      this.materialList = fileList;
    },
    handleSubmit() {
      if (this.materialList.length === 0) {
        this.$message.warning("请先选择文件！");
        return;
      }
      if (!this.uploadData.store_id) {
        this.$alert('请必须选择一个关联店铺！','上传素材')
        return;
      }
      const formData = new FormData();
      this.materialList.forEach((file) => {
        formData.append("file", file.raw); // 将文件添加到 FormData 中
      });
      if (this.uploadData.tag){
        formData.append('tag', this.uploadData.tag);
      }
      formData.append('store_id', this.uploadData.store_id);
      formData.append('lip_sync', true);
      this.loading = true
      axios.post("http://127.0.0.1:6006/figure/clone_only", formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((res) => {
        if (res.data.status === "success") {
          this.loading = false
          this.$store.dispatch("generate/pollFigureTasks");
          this.$message.success("上传成功");
          this.beforeUploadClose();
        }else {
          this.loading = false
          this.$alert(res.data.message, "上传失败");
        }
      }).catch((err) => {
        this.loading = false
        this.$alert(err, "上传错误");
      })
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
      this.aspectRatio = this.selectedItem.height / this.selectedItem.width;
      this.dialogVisible = true;
    },
    rename() {
      this.figureId = this.selectedItem.id;
      this.form.original = this.selectedItem.name;
      this.form.name = '';
      this.renameDialogVisible = true;
    },
    renameProduct(item) {
      this.productId = item.id
      this.form.original = item.name;
      this.form.name = '';
      this.renameDialogVisible = true;
    },
    sureRename() {
      let url = this.classify_type === 'image' ? '/product/update' : '/figure/update_name'
      let params = {
        product_id: this.productId,
        figure_id: this.figureId,
        name: this.form.name,
      }
      postAction(url, params).then((res) => {
        if (res.data.status === "success") {
          this.$message.success("重命名成功");
          this.$store.dispatch("generate/pollFigureTasks");
          this.queryProducts()
        } else {
          this.$alert(res.data.message,'重命名失败')
        }
        this.renameDialogVisible = false;
      }).catch((err) => {
        this.$alert(err,'重命名错误')
      });
    },
    deleteItem() {
      let ids = this.selected_materials;
      let msg = '此操作将删除该素材/形象, 是否继续?'
      if (ids.length > 1) {
        msg = `确定要删除这${ids.length}个素材吗？ 删除后将无法恢复`
      }
      this.$confirm(msg, '删除素材/形象', {
        type: 'warning'
      }).then(() => {
        delAction("/figure/delete", {ids: ids.join(',')}).then((res) => {
          if (res.data.status === "success") {
            this.$message.success("删除成功");
            this.selected_materials = []

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

            this.$store.dispatch("generate/pollFigureTasks");
          } else {
            this.$alert(res.data.message, "删除失败")
          }
        }).catch((err) => {
          this.$alert(err, "删除错误")
        });
      }).catch(() => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    detail() {
      this.detailDialogVisible = true;
      this.detail_content = this.selectedItem.material_summary;
      this.video_score = this.selectedItem.video_score || {};
    },
    addImage(item) {
      this.readonly = true
      this.productId = item.id
      this.uploadImageData.name = item.name;
      this.uploadImageData.store_id = item.store_id;
      this.uploadImageDialogVisible = true;
    },
    addProduct() {
      this.readonly = false
      this.productId = ''
      this.uploadImageDialogVisible = true
    },
    deleteProduct(index) {
      this.$confirm('确定要删除这个产品吗？', '删除', {
        type: 'warning'
      }).then(() => {
        let ids = [this.product_list[index].id]
        postAction('/product/delete', { product_ids: ids }).then(res => {
          if (res.data.status === "success") {
            this.$message.success("删除成功");
            this.queryProducts()
          } else {
            this.$alert(res.data.message, "删除失败")
          }
        })
      }).catch(() => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    queryProducts() {
      getAction('/product/all/grouped').then(res => {
        if (res.data.status === 'success') {
          this.product_list = res.data.data
        }else {
          this.$message.error('获取产品列表失败')
        }
      }).catch(err => {
        console.log(err)
        this.$message.error('获取产品列表错误')
      })
    },
    operateProductImage(item, img_index) {
      sessionStorage.setItem('operate_product', JSON.stringify(item))
      sessionStorage.setItem('operate_img_index', img_index)
      sessionStorage.setItem('operate_scripts', JSON.stringify([]))
      sessionStorage.removeItem('operate_isAlreadyGenerated')
      sessionStorage.removeItem('is_newChat')
      sessionStorage.removeItem('operate_conversation_id')
      sessionStorage.setItem('chats', JSON.stringify([]))

      sessionStorage.setItem('figure_path', '/imageToScript')
      this.$router.push({path: '/imageToScript'})
    },
    deleteProductImage(img) {
      this.$confirm('确定要删除这张图片吗？', '删除', {
        type: 'warning'
      }).then(() => {
        delAction('/picture/delete', {picture_id: img.id}).then(res => {
          if (res.data.status === "success") {
            this.$message.success("删除成功");
            this.queryProducts()
          } else {
            this.$alert(res.data.message, "删除失败")
          }
        }).catch(err => {
          this.$alert(err, "删除错误")
        })
      }).catch(() => {
        this.$message.info('已取消删除');
      })
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
      if (this.$refs.video) {
        this.$refs.video.pause()
        this.src = ''
      }
      this.dialogVisible = false;
    },
    handleSubmitUpload() {
      if (this.imagesList.length === 0) {
        this.$message.warning("请先选择文件！");
        return;
      }
      if (this.uploadImageData.name === '') {
        this.$message.warning("请输入产品名称！");
        return;
      }
      if (this.uploadImageData.store_id === '') {
        this.$message.warning("请选择关联店铺！");
        return;
      }

      const formData = new FormData();
      this.imagesList.forEach((file) => {
        formData.append("file", file.raw); // 将文件添加到 FormData 中
      });
      formData.append('group_name', this.uploadImageData.name);
      formData.append('store_id', this.uploadImageData.store_id);
      this.loading = true
      axios.post("http://127.0.0.1:6006/picture/upload", formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((res) => {
        if (res.data.status === "success") {
          this.loading = false
          this.$message.success("上传成功");
          this.queryProducts()
          this.handleClear();
        }else {
          this.loading = false
          this.$alert(res.data.message, "上传失败");
        }
      }).catch((err) => {
        this.loading = false
        this.$alert(err, "上传错误");
      })
    },
    handleClear() {
      if (this.loading) {
        return;
      }
      if (this.$refs.imageUpload) {
        this.$refs.imageUpload.clearFiles();
      }
      this.imagesList = [];
      this.uploadImageData.name = ''
      this.uploadImageData.store_id = ''
      this.uploadImageDialogVisible = false
    },
    handleUploadImage({ file }) {
      console.log(file)
    },
    handleImagesChange(file, fileList) {
      this.imagesList = fileList;
    },
    handleImagesRemove(file, fileList) {
      this.imagesList = fileList;
    },

    handleExceed(files, fileList) {
      this.$alert(`当前限制选择 100 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`,'批量上传限制提醒');
    },
    uploadError(file) {
      this.loading = false
      this.uploadFigureVisible = false
      let content = `创建${file.name}形象克隆任务失败`;
      this.$alert(content, "任务创建提醒");
    },
    uploadSuccess(res, file) {
      this.loading = false
      this.uploadFigureVisible = false
      if (res.status === "success") {
        let content = `已创建${file.name}形象克隆任务，形象克隆成功后会自动更新形象列表`;
        this.$alert(content, "任务创建提醒");
        this.$store.dispatch("generate/pollFigureTasks");
      } else {
        let content = `创建${file.name}形象克隆任务失败，${res.message}`;
        this.$alert(content, "任务创建提醒");
      }
    },

    startSelection(event) {
      if (event.button !== 0 || this.classify_type !== 'material') {
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
  min-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.classify-btn-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.classify-btn {
  padding: 12px 24px;
  color: #374151;
  border-radius: 8px;
  line-height: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-sizing: border-box;
  background: #ffffff;
  box-shadow: 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)
}

.classify-btn-active {
  background-color: #3b82f6 !important;
  color: #FFFFFF !important;
}

.selection-box {
  position: absolute;
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 20;
  transition: all 0.1s ease;
}

.classify-content {
  width: 100%;
  height: calc(100% - 135px);
  padding: 10px;
  margin-top: 10px;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.figures-list {
  flex: 1;
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-auto-rows: 160px;
  gap: 20px;
  justify-items: center;
  overflow: auto;
}

.upload-item {
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #64748b;
  border: 2px dashed #d9d9d9;
  cursor: pointer;
  border-radius: 8px;
  box-sizing: border-box;
  font-weight: bold;
}

.source-item {
  width: 120px;
  height: 160px;
  border-radius: 6px;
  position: relative;
}

.source-title {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
  padding: 10px;
  box-sizing: border-box;
  color: #FFFFFF;
  font-size: 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.source-title-active {
  color: #4c8df1 !important;
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
  border-radius: 6px;
}

.figure-img-active {
  border: 2px solid #4c8df1;
  box-sizing: border-box;
}

.product-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-rows: 436px;
  gap: 20px;
  justify-items: center;
  overflow-y: auto;
  overflow-x: hidden;
}

.product-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  box-sizing: border-box;
  margin-bottom: 2px;
}

.product-item:hover {
  transform: translate(0, -4px);
  box-shadow: 0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);;
}

.product-item-name {
  font-weight: bold;
  font-size: 18px;
  line-height: 28px;
  margin-bottom: 12px;
  cursor: pointer;
}

.product-item-img {
  width: 248px;
  height: 328px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  flex-grow: 1;
  gap: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  overflow: hidden;
}

.img-content {
  width: 120px;
  height: 160px;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
}

.product-item-img-item {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.delete-img-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 14px;
  padding: 2px 5px;
  border-radius: 3px;
  z-index: 999;
  opacity: 0;
}

.img-content:hover .delete-img-icon {
  opacity: 1;
}

.extra {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  color: #ffffff;
  font-weight: bold;
  font-size: 24px;
  line-height: 32px;
  background-color: #00000080;
  border-radius: 8px;
}

.product-item-detail {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  font-size: 14px !important;
  line-height: 20px !important;
  color: #6b7280 !important;
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
  text-align: center;
}

.preview-dialog >>> .el-dialog {
  background-color: #79777700 !important;
  box-shadow: none !important;
  margin: 0 auto;
}

.preview-dialog >>> .el-dialog__body {
  padding: 10px 20px;
}

.preview-dialog >>> .el-dialog__headerbtn .el-dialog__close {
  font-size: 24px;
  color: #9a9a9a;
}

.detail-dialog >>> .el-dialog {
  border-radius: 10px !important;
}

.detail-dialog >>> .el-dialog__title {
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.detail-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.detail-dialog >>> .el-dialog__body {
  padding: 0 20px 20px 20px !important;
}

.upload-dialog >>> .el-dialog {
  border-radius: 10px;
}

.upload-dialog-title {
  padding: 20px 20px 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;
  font-weight: 700;
}

.upload-dialog-body {
  padding: 10px 20px;
  max-height: calc(70vh - 120px);
  overflow-y: auto;
}

.upload-dialog-footer {
  padding: 10px 20px 20px;
}

.upload-dialog >>> .el-dialog__header {
  padding: 0;
}

.upload-dialog >>> .el-dialog__close {
  color: #9ca3af;
  font-size: 24px;
}

.upload-dialog >>> .el-dialog__body {
  padding: 0;
}

.upload-dialog >>> .el-dialog__footer {
  padding: 0;
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

.tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 5px;
  margin-top: 5px;
}

.tag {
  background-color: #F5F5F5;
  color: #525252;
  border-radius: 14px;
  border: 1px solid #F5F5F5;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  padding-right: 12px;
}

.tag-active {
  background-color: #3b82f6 !important;
  color: #FFFFFF !important;
}

.button-new-tag {
  padding: 5px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-tag {
  background-color: #F5F5F5;
  color: #525252;
  border-radius: 14px;
  border: 1px solid #F5F5F5;
  cursor: pointer;
  height: 28px;
  line-height: 28px;
  padding-left: 12px;
  padding-right: 12px;
}

.filter-tag-active {
  background-color: #3b82f6 !important;
  color: #FFFFFF !important;
}

.total-score-card {
  border-radius: 12px;
  overflow: hidden;
}
.total-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f9fbfd;
}

.left-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.right-score-box {
  font-weight: bold;
  text-align: right;
}

.detail-score-card {
  border-radius: 12px;
  overflow: hidden;
  padding: 12px;
}

.dimension-collapse-item {
  border-radius: 8px;
  overflow: hidden;
}

.detail-score-card >>> .el-collapse-item__header {
  font-size: 14px;
  font-weight: 600;
  height: 40px;
  line-height: 40px;
}
.detail-score-card >>> .el-collapse-item__content {
  padding: 0 12px;
}

.dimension-reason {
  margin-bottom: 8px;
}
.reason-content {
  margin: 0 !important;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
</style>
