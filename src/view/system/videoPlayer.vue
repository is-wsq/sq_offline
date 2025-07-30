<template>
  <div class="sync-cv">
    <div class="flex-center">
      <el-button type="text" class="back-btn" @click="back">
        <i class="el-icon-arrow-left" style="font-size: 20px;"></i>
      </el-button>
      <div class="sync-title">一键混剪 · 音画同步</div>
      <div style="width: 36px"></div>
    </div>
    <div class="sync-cv-container">
      <div class="left-panel" v-if="show_left_panel">
        <el-tooltip class="item" effect="dark" content="收起设置" placement="right">
          <div class="setting-close" @click="show_left_panel = false">
            <i class="el-icon-arrow-left" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
        <div class="left-content-area">
          <div class="panel-title">分镜设置</div>
          <div class="panel-label">自定义要求（选填）</div>
          <div style="position: relative;">
            <div class="highlight-content"
                 v-html="highlightedText"
                 :style="{height: replaceDivHeight + 'px'}"
                 ref="highlightDiv">
            </div>
            <el-input type="textarea"
                      :rows="4"
                      placeholder="例如：素材拼接要紧凑，色调统一偏暖"
                      v-model="requirement"
                      @input="onInput"
                      @compositionstart="onCompositionStart"
                      @compositionupdate="onCompositionUpdate"
                      @compositionend="onCompositionEnd"
                      ref="inputRef"
                      class="input-layer"
                      @change="saveSetting"
                      @scroll="handleScroll">
            </el-input>
            <div v-if="showDropdown" class="dropdown" :style="dropdownStyle">
              <ul>
                <li v-for="(item, index) in mention_list" :key="index" @click="selectMention(item)"
                    @mouseleave="liLeave(item)" @mouseenter="liEnter(item)">
                  {{ item.name }}
                </li>
              </ul>
              <div class="li-video" v-if="hover_li">
                <video :src="hover_li.filepath" style="width: 100%; height: 100%;border-radius: 4px;"
                       loop muted autoplay></video>
              </div>
            </div>
          </div>
          <div class="without_at" style=";height: calc(100% - 150px)">
            <div class="panel-title margin-t-8">文案设置</div>
            <div style="max-height:calc(100% - 190px);overflow-y: auto" ref="scriptForm">
              <div class="panel-label">文案要求</div>
              <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="例如：写一个关于猫咪的搞笑段子"
                        class="margin-b-12" v-model="copy_require" resize="none" @click="saveSetting"></el-input>
              <div class="panel-label">示例文案（选填）</div>
              <div class="flex-center margin-b-12 example_textarea" v-for="(text, index) in exampleTexts" :key="index">
                <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" placeholder="提供一个你喜欢的风格的例子"
                          v-model="exampleTexts[index]" resize="none" @change="saveSetting"></el-input>
                <!--                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeText(index)"></el-button>-->
                <i class="el-icon-close example-close-icon" @click="removeText(index)" v-if="index !== 0"></i>
              </div>
            </div>
            <div class="margin-b-12 add_example_btn">
              <el-button @click="addExampleText"><i class="el-icon-plus add_example_icon"></i>
                添加示例文案</el-button>
            </div>
            <div style="display: flex;gap: 12px" class="margin-b-12">
              <div style="flex: 1">
                <div class="panel-label">视频时长 (秒)</div>
                <el-input type="number" v-model="video_time" @change="saveSetting"></el-input>
              </div>
              <div style="flex: 1">
                <div class="panel-label">文案数量</div>
                <el-input type="number" v-model="script_num" min="1" max="10" @blur="validateNum" @change="saveSetting"></el-input>
              </div>
            </div>
            <div class="panel-label">模型选择</div>
            <el-select v-model="ai_model" style="width: 100%" class="margin-b-12" @change="saveSetting">
              <el-option label="本地大模型" value="local_model"></el-option>
              <el-option label="deepseek v3" value="deepseek_v3"></el-option>
            </el-select>
          </div>
        </div>
        <div class="settings-button-section">
          <el-button @click="generate"><i class="el-icon-bianjiqi btn-icon"></i>
            {{ already_generated? '重新生成' : '一键混剪并同步' }}</el-button>
        </div>
      </div>

      <div class="left-panel-close" v-if="!show_left_panel">
        <el-tooltip class="item" effect="dark" content="展开设置 " placement="right-end">
          <div class="setting-open" @click="show_left_panel = true">
            <i class="el-icon-arrow-right" style="font-size: 16px;font-weight: bold;color: #ffffff"></i>
          </div>
        </el-tooltip>
      </div>

      <div class="center-panel" :style="{ width: show_left_panel? 'calc(100% - 648px)' : activeIndex !== -1? 'calc(100% - 733px)' : 'calc(100% - 370px)' }">
        <div class="script-selection-area">
          <div class="panel-title">AI选用文案</div>
          <div class="copy-list" v-if="copy_list.length > 0">
            <div class="copy-item" v-for="(item, index) in copy_list" :key="index"
                 :class="{'active-item': index === activeIndex}" @click="collapseChange(index, item.isReady)"
                 @mouseleave="item.isHover = false" @mouseenter="item.isHover = true">
              <div style="padding: 0 12px">
                <div class="flex-center">
                  <div class="copy-item-title">{{ item.title }}</div>
                  <div style="width: 16px">
                    <i class="el-icon-close close-icon" v-if="item.isHover" @click="removeCopy(index)"></i>
                  </div>
                </div>
                <div class="copy-item-desc">{{ item.content }}</div>
              </div>
              <div class="copy-item-materials">
                <template v-if="item.isReady">
                  <div class="copy-item-material" v-for="(material, index) in item.materials" :key="index">
                    <el-image class="copy-item-material-img" :src="material.picture"></el-image>
                    <div class="copy-item-material-name">{{ material.name }}</div>
                  </div>
                </template>
                <div class="copy-item-material" style="width: 100%" v-else>
                  <div style="height: 120px;width: 100%;display: flex;align-items: center;justify-content: center;color: #999999">
                    <i class="el-icon-loading" style="margin-right: 10px;font-size: 24px;"></i>分镜生成中
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="copy-list-none" v-if="copy_list.length === 0">
            <i class="el-icon-document-list copy-list-none-icon"></i>
            <div class="copy-list-none-title">暂无文案</div>
            <div class="copy-list-none-desc">请使用左侧工具生成您的第一条文案</div>
          </div>
          <div class="export-section" v-if="already_generated">
            <el-button @click="export_video"><i class="el-icon-fa-download" style="margin-right: 10px;"></i>导出视频</el-button>
          </div>
        </div>
      </div>

      <div class="storyboard-panel" v-if="!show_left_panel && activeIndex !== -1">
        <div class="panel-title margin-b-16">分镜文案详情</div>
        <div class="storyboard-content">
          <div class="storyboard-item" v-for="(item, index) in selectedCopy.materials" :key="index">
            <el-image class="storyboard-item-img" :src="item.picture"></el-image>
<!--            <div class="storyboard-item-detail">{{ selectedCopy.script[index].copy }}</div>-->
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="video-placeholder" v-if="activeIndex === -1">
          <i class="el-icon-film-c" style="font-size: 48px"></i>
          <div>视频预览区</div>
        </div>
        <div class="video-placeholder-preview" v-if="activeIndex !== -1">
          <video
              ref="videoRef"
              preload="metadata"
              controls
              controlsList="noplaybackrate nodownload"
              @play="mediaPlay"
              @pause="mediaPause"
              @ended="playNextVideo"
              @volumechange="mediaVolumeChange"
              style="width: 280px; aspect-ratio: 9 / 16;border-radius: 12px"
          >
            您的浏览器不支持HTML5视频播放。
          </video>
<!--          <audio ref="audioRef" controls class="audio-element" v-show="false">-->
<!--            <source type="audio/mpeg">-->
<!--            您的浏览器不支持音频播放-->
<!--          </audio>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  data() {
    return {
      show_left_panel: true,
      requirement: '',

      /* initData 前面素材选择、样式设置所选参数 */
      material_list: [],
      mute_materials: [],
      mention_list: [],
      hover_li: null,
      sound: {},
      bgm: {},
      bg_volume: 0.5,
      top_offset_ratio: 0.25,
      bottom_offset_ratio: 0.75,
      withSubtitle: false,
      withTitle: false,
      use_background: false,
      name_use_background: false,
      subtitleParams: {},
      subtitleNameParams: {},
      /* --end-- */

      lastInput: '',
      replaceDivHeight: 102,
      showDropdown: false,
      dropdownStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px'
      },
      mentionRanges: [],

      already_generated: false,
      copy_require: '',
      exampleTexts: [''],
      video_time: 10,
      script_num: 1,
      ai_model: 'deepseek_v3',
      copy_list: [],
      text_copy_list: [
        { isHover: false,
          isReady: true,
          title: '文案一',
          content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
          materials: [
            { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-6",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
              id: "342dfbe9-38c3-480a-b033-34823fe133fb",
              name: "套餐十-5",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-4",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-3",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-2",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-1",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
            },
          ]
        },
        { isHover: false,
          isReady: false,
          title: '文案一',
          content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
          materials: [
            { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-6",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
              id: "342dfbe9-38c3-480a-b033-34823fe133fb",
              name: "套餐十-5",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-4",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-3",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-2",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-1",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
            },
          ]
        },
        { isHover: false,
          isReady: false,
          title: '文案一',
          content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
          materials: [
            { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-6",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
              id: "342dfbe9-38c3-480a-b033-34823fe133fb",
              name: "套餐十-5",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-4",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-3",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-2",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-1",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
            },
          ]
        },
      ],
      openIndex: null,
      activeIndex: -1,
      selectedCopy: null,

      currentIndex: 0,
      isPlaying: false,

      loading: null,

      displayText: '',
      isComposing: false,
      composingText: '',
      compositionStart: 0,
      highlightedText: '',
      show_model: '',
      preview_video: []
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    inputEl.removeEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.initData()
    document.addEventListener('click', this.handleClickOutside);
    const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
    this.replaceDivHeight = inputEl.clientHeight
    inputEl.addEventListener('scroll', this.handleScroll);
  },
  watch: {
    requirement(newVal) {
      if (!this.isComposing) {
        this.updateDisplayText();
      }
    }
  },
  methods: {
    saveSetting() {
      this.validateNum()
      let sync_setting = {
        requirement: this.requirement,
        copy_require: this.copy_require,
        exampleTexts: this.exampleTexts,
        video_time: this.video_time,
        script_num: this.script_num,
        ai_model: this.ai_model,
      }
      sessionStorage.setItem('sync_setting', JSON.stringify(sync_setting))
    },
    onCompositionStart(e) {
      this.isComposing = true;
      this.compositionStart = e.target.selectionStart;
    },

    onCompositionUpdate(e) {
      this.composingText = e.data;
      this.updateDisplayText();
    },

    onCompositionEnd(e) {
      this.isComposing = false;
      this.composingText = '';
      this.requirement = e.target.value;
      this.updateDisplayText();
    },
    updateDisplayText() {
      let isDel = this.lastInput.length > this.requirement.length;
      this.lastInput = this.requirement;
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const cursorPos = inputEl.selectionStart;
      if (isDel) { // 删除@内容
        for (let mention of this.mentionRanges) {
          const {start, end, name} = mention;
          if (cursorPos >= start && cursorPos < end) { //删除@内容
            this.requirement =
                this.requirement.slice(0, start - 1) + this.requirement.slice(end - 1);
          }
        }
      }

      // 更新提及范围数组
      this.updateMentionRanges()

      let result = this.requirement;
      if (this.isComposing && this.composingText) {
        const before = result.substring(0, this.compositionStart);
        const after = result.substring(this.compositionStart + this.composingText.length);
        result = before + this.composingText + after;
      }
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach(item => {
        const regex = new RegExp(`${item}`, 'g'); // 使用全局标志
        result = result.replace(regex, (match) => {
          return `<span style="color: #4c8df1">${match}</span>`
        });
      });
      result = result.replace(/\n/g, '<br>'); // 支持换行
      this.highlightedText = result; // 返回最终结果

      const textBeforeCursorUpdated = this.requirement.slice(0, cursorPos);
      const validMention = textBeforeCursorUpdated.charAt(textBeforeCursorUpdated.length - 1) === '@';
      if (validMention) {
        this.showDropdown = true;

        this.$nextTick(() => {
          const paddingLeft = parseFloat(getComputedStyle(inputEl).paddingLeft) || 0;

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const computedStyle = getComputedStyle(inputEl);
          context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

          const textWidth = context.measureText(textBeforeCursorUpdated).width;
          const inputWidth = inputEl.clientWidth - 30;

          const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);

          let offsetTop = Math.floor((paddingLeft + textWidth + 10) / inputWidth) + 1;
          offsetTop = Math.min(offsetTop, 4); // 限制最大显示数量
          let remainder = (paddingLeft + textWidth + 5) % inputWidth;

          this.dropdownStyle.top = `${window.scrollY + offsetTop * lineHeight}px`;
          this.dropdownStyle.left = `${remainder}px`;
        });
      } else {
        this.showDropdown = false;
      }
    },
    validateNum() {
      let val = this.script_num
      if (val < 1) {
        this.script_num = 1
      } else if (val > 10) {
        this.script_num = 10
      } else {
        this.script_num = val
      }
    },
    liLeave(item) {
      item.isHover = false
      this.hover_li = null
    },
    liEnter(item) {
      item.isHover = true
      this.hover_li = item
    },
    handleScroll(event) {
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const highlightEl = this.$refs.highlightDiv;

      // 同步滚动位置
      highlightEl.scrollTop = inputEl.scrollTop;
      highlightEl.scrollLeft = inputEl.scrollLeft;
    },
    updateMentionRanges() {
      let result = []
      let names = this.mention_list.map(item => '@' + item.name);
      names.forEach(name => {
        let startIndex = 0;
        while ((startIndex = this.requirement.indexOf(name, startIndex)) !== -1) {
          result.push({
            start: startIndex + 1,
            end: startIndex + name.length,
            name: name
          });
          startIndex += name.length; // 移动索引避免死循环
        }
      });
      this.mentionRanges = result;
    },
    onInput() {
      if (this.isComposing) {
        return
      }
      this.updateDisplayText();
    },
    selectMention(item) {  //选择@
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const cursorPos = inputEl.selectionStart;
      const atIndex = this.requirement.lastIndexOf('@', cursorPos - 1);
      if (atIndex !== -1) {
        this.requirement =
            this.requirement.slice(0, atIndex) + '@' + item.name + this.requirement.slice(cursorPos);
        this.showDropdown = false;
        this.lastInput = this.requirement;

        // 记录提及的范围
        this.updateMentionRanges()

        // 设置光标位置到提及内容的末尾
        inputEl.selectionStart = this.mentionRanges[this.mentionRanges.length - 1].end;
        inputEl.selectionEnd = this.mentionRanges[this.mentionRanges.length - 1].end;
      }
    },
    handleClickOutside(event) {
      if (!this.$refs.inputRef)
        return;
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea');
      const dropdownEl = this.$refs.dropdownRef; // 假设选择框有一个引用

      // 检查点击是否发生在输入框或选择框内
      if (!inputEl.contains(event.target) && (!dropdownEl || !dropdownEl.contains(event.target))) {
        this.showDropdown = false;
      }
    },
    addExampleText() {
      this.exampleTexts.push('');
      this.$nextTick(() => { //自动滚到到底部
        const scriptForm = this.$refs.scriptForm;
        scriptForm.scrollTop = scriptForm.scrollHeight;
      });
      this.saveSetting()
    },
    removeText(index) {
      this.exampleTexts.splice(index, 1);
      this.saveSetting()
    },
    initData() {
      let sync_setting = JSON.parse(sessionStorage.getItem("sync_setting")) || {}
      this.requirement = sync_setting.copy_require || ''
      this.copy_require = sync_setting.copy_require || ''
      this.exampleTexts = sync_setting.exampleTexts || ['']
      this.video_time = parseInt(sync_setting.video_time) || 100
      this.script_num = parseInt(sync_setting.script_num) || 1
      this.ai_model = sync_setting.ai_model || 'deepseek_v3'

      // 选择的素材id列表、素材列表、静音素材列表
      this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mute_materials = JSON.parse(sessionStorage.getItem('mute_materials')) || []
      let mention_list = JSON.parse(sessionStorage.getItem('mention_list')) || []
      this.mention_list = mention_list.map(item => ({...item, isHover: false}))
      // 视频音色、背景音乐、背景音乐音量
      this.sound = JSON.parse(sessionStorage.getItem("setting_voice")) || {}
      this.bgm = JSON.parse(sessionStorage.getItem('setting_bgm')) || {}
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.5
      // 字幕标题、内容位置
      this.top_offset_ratio = Number(sessionStorage.getItem('top_offset_ratio')) || 0.25
      this.bottom_offset_ratio = Number(sessionStorage.getItem('bottom_offset_ratio')) || 0.75
      // 是否开启字幕标题、内容
      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("with_title") === 'true'
      // 字幕标题、内容是否使用背景
      this.use_background = sessionStorage.getItem("use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("name_use_background") === 'true'
      // 字幕内容样式设置
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || '#404040'
      this.subtitleParams.background_opacity = Number(sessionStorage.getItem("background_opacity")) || 0.6
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'
      // 字幕标题样式设置
      this.show_model = sessionStorage.getItem('show_model') || 'begin'
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("name_background_color") || '#404040'
      this.subtitleNameParams.name_background_opacity = Number(sessionStorage.getItem("name_background_opacity")) || 0.6
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("name_stroke_color") || '#000000'
    },
    generate() {
      this.show_left_panel = false;
      this.already_generated = true;
      this.copy_list = [
        { isHover: false,
          isReady: true,
          title: '文案一',
          content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
          materials: [
            { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-6",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
              id: "342dfbe9-38c3-480a-b033-34823fe133fb",
              name: "套餐十-5",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-4",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-3",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-2",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-1",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
            },
          ]
        },
        { isHover: false,
          isReady: false,
          title: '文案一',
          content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
          materials: [
            { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-6",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
              id: "342dfbe9-38c3-480a-b033-34823fe133fb",
              name: "套餐十-5",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-4",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-3",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-2",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-1",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
            },
          ]
        },
        { isHover: false,
          isReady: false,
          title: '文案一',
          content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
          materials: [
            { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-6",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
              id: "342dfbe9-38c3-480a-b033-34823fe133fb",
              name: "套餐十-5",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-4",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-3",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-2",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
            },
            { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
              id: "529744ed-a842-41ff-9a91-d14a97498648",
              name: "套餐十-1",
              picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
            },
          ]
        },
      ]
      setTimeout(() => {
        this.copy_list = [
          { isHover: false,
            isReady: true,
            title: '文案一',
            content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
            materials: [
              { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-6",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
                id: "342dfbe9-38c3-480a-b033-34823fe133fb",
                name: "套餐十-5",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-4",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-3",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-2",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-1",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
              },
            ]
          },
          { isHover: false,
            isReady: true,
            title: '文案一',
            content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
            materials: [
              { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-6",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
                id: "342dfbe9-38c3-480a-b033-34823fe133fb",
                name: "套餐十-5",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-4",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-3",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-2",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-1",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
              },
            ]
          },
          { isHover: false,
            isReady: false,
            title: '文案一',
            content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
            materials: [
              { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-6",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
                id: "342dfbe9-38c3-480a-b033-34823fe133fb",
                name: "套餐十-5",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-4",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-3",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-2",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-1",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
              },
            ]
          },
        ]
      }, 10000)
      setTimeout(() => {
        this.copy_list = [
          { isHover: false,
            isReady: true,
            title: '文案一',
            content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
            materials: [
              { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-6",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
                id: "342dfbe9-38c3-480a-b033-34823fe133fb",
                name: "套餐十-5",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-4",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-3",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-2",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-1",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
              },
            ]
          },
          { isHover: false,
            isReady: true,
            title: '文案一',
            content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
            materials: [
              { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-6",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
                id: "342dfbe9-38c3-480a-b033-34823fe133fb",
                name: "套餐十-5",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-4",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-3",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-2",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-1",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
              },
            ]
          },
          { isHover: false,
            isReady: true,
            title: '文案一',
            content: '走进这家店，仿佛穿越到了潮汕的街头。古色古香的招牌，热气腾腾的景象，让人瞬间就有了食欲。看这鲜红的色泽，这就是新鲜的保证。师傅手起刀落，每一片都薄得透光。这不仅是技术，更是艺术。三上三下，仅需八秒，肉质达到巅峰。蘸上秘制沙茶酱，一口下去，鲜甜的肉汁在口中爆发，太满足了！',
            materials: [
              { filepath: "http://192.168.1.25:6006/uploads/939a3b80-bd1e-416a-99a8-d85d1858690f.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-6",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/979117b1-aebc-4d62-bc24-946854340f9e.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/afe2e301-390a-47a0-940c-c5fc0c1c0323.mp4",
                id: "342dfbe9-38c3-480a-b033-34823fe133fb",
                name: "套餐十-5",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/c244adbf-5d9b-4c1e-b4ac-94c400674c57.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/130624cc-5bda-4f83-beb0-b71c9c10a160.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-4",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/f1495b8a-ac06-4b73-8a05-6012d2ee3bf8.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/0040be11-4799-4e16-8efa-9c6b17a94630.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-3",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/45369198-e32e-4410-a0de-ee8d69e5dd97.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/acdc7071-8e6f-4573-ba71-5d4e04b2267d.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-2",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/3009b2bc-4cbf-4980-80a3-aed41a2ebad5.jpg"
              },
              { filepath: "http://192.168.1.25:6006/uploads/5ec03f29-8203-48fa-8442-642aa2fb43f0.mp4",
                id: "529744ed-a842-41ff-9a91-d14a97498648",
                name: "套餐十-1",
                picture: "http://192.168.1.25:6006/static/digital_human_image/1/68e7da4b-86d2-408a-999e-21b0c3926015.jpg"
              },
            ]
          },
        ]
      }, 20000)
    },
    collapseChange(index, isReady) {
      if (!isReady) {
        this.$alert('分镜正在生成中，暂无法预览', '提示')
        return
      }
      this.activeIndex = index
      this.selectedCopy = this.copy_list[index]
      this.preview_video = this.copy_list[index].materials
      this.currentIndex = 0
      this.$forceUpdate()
      if (this.isPlaying) {
        this.$refs.videoRef.pause()
        this.isPlaying = false
      }
      this.$nextTick(() => {
        this.loadVideo(0);
      })
    },
    removeCopy(index) {
      this.$confirm('确认删除该文案吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.copy_list.splice(index, 1)
      }).catch((err) => {
        this.$message({type: 'info', message: '已取消删除'});
      });
    },
    export_video() {
      if (this.copy_list.length === 0) {
        this.$alert('文案列表为空，请先使用左侧工具生成', '提示')
        return
      }
      let bool_list = this.material_list.map(item => this.mute_materials.includes(item))

      let name = this.setName()
      let params = {
        data: this.copy_list,
        filename_list: name, //视频文件名
        bgm_id: this.bgm.id || '',
        bg_volume: this.bg_volume,// bgm的音量大小，不传默认是0.5
        with_subtitle: this.withSubtitle, // 是否要字幕
        with_title: this.withTitle,// 是否要字幕标题
        bool_list: bool_list,// 需要静音的素材id列表
        subtitle_params: {
          y_offset: this.bottom_offset_ratio,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: this.subtitleParams.background_color,
          background_opacity: this.subtitleParams.background_opacity
        },
        title_params: {
          y_offset: this.top_offset_ratio,
          show_model: this.show_model,
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: this.subtitleNameParams.name_background_color,
          background_opacity: this.subtitleNameParams.name_background_opacity
        }
      }
      postAction('/figure/export_video_sync',params).then(res => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          sessionStorage.clear()
          setTimeout(() => {
            this.$router.push({path: '/videoList'})
          }, 500)
        } else {
          this.$notify({
            title: "创建失败",
            message: `创建视频生成任务失败，${res.data.message}`,
            duration: 0,
            type: "error",
          });
        }
      }).catch((error) => {
        this.$notify({
          title: "创建失败",
          message: `创建视频生成任务失败，${error}`,
          duration: 0,
          type: "error",
        });
      });
    },
    loadAudio() {
      // this.$refs.audioRef.src = this.copy_list[this.activeIndex].audio_file_path
      // this.$refs.audioRef.play()
    },
    loadVideo(index) {
      if (index >= 0 && index < this.preview_video.length) {
        this.currentIndex = index;
        if (this.$refs.videoRef) {
          this.$refs.videoRef.src = this.preview_video[index].filepath
          if (this.mute_materials.includes(this.preview_video[index].id)) {
            this.$refs.videoRef.muted = true
          }
          this.$refs.videoRef.load();
          this.playVideo();
        }
      }
    },
    playVideo() {
      this.$refs.videoRef.play().then(() => {
        this.isPlaying = true;
      }).catch(error => {
        console.error('播放失败:', error);
        // 这里可以添加错误处理逻辑，如显示错误消息
      });
    },
    playNextVideo() {
      if (this.currentIndex === this.preview_video.length - 1) {
        this.$refs.videoRef.src = this.preview_video[0].filepath
        this.isPlaying = false;
        return
      }
      const nextIndex = this.currentIndex + 1;
      this.loadVideo(nextIndex);
    },
    mediaPlay() {
      // this.$refs.audioRef.play()
    },
    mediaPause() {
      // this.$refs.audioRef.pause()
    },
    mediaVolumeChange() {
      // this.$refs.audioRef.volume = this.$refs.videoRef.volume
      // this.$refs.audioRef.muted = this.$refs.videoRef.muted
    },
    back() {
      sessionStorage.setItem('video_path', '/material')
      this.$router.push({path: '/material'})
    }
  }
}
</script>

<style scoped>
.sync-cv {
  min-height: 700px;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.sync-title {
  flex: 1;
  margin: 0 0 8px;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.sync-cv-container {
  display: flex;
  gap: 24px;
  height: calc(100% - 50px);
}

.left-panel {
  width: 280px;
  padding: 19px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
}

.left-panel-close {
  width: 1px;
  height: 100%;
}

.setting-close, .setting-open {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  z-index: 10;
  backdrop-filter: blur(10px);
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  border-radius: 0 12px 12px 0;
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.setting-close {
  box-shadow: rgba(102, 126, 234, 0.3) 0 4px 20px;
  background: linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%);
  left: calc(500px);
}

.setting-close:hover {
  left: calc(504px);
}

.setting-open {
  box-shadow: rgba(16, 185, 129, 0.3) 0 4px 20px;
  background: linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%);
  left: calc(200px);
}

.setting-open:hover {
  left: calc(204px);
}

.left-content-area {
  height: calc(100% - 60px);
}

.without_at >>> .el-textarea__inner {
  padding: 8px;
  color: #1f2937;
  background-color: #f9f9f9;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-size: 13px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.without_at >>> .el-textarea__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.example_textarea {
  position: relative;
}

.example-close-icon {
  position: absolute;
  right: 8px;
  top: 8px;
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.example-close-icon:hover {
  color: #ef4444;
}

.example_textarea >>> .el-textarea__inner {
  padding-right: 30px !important;
}

.add_example_btn >>> .el-button {
  width: 100%;
  background-color: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #c7d2fe;
}

.add_example_icon {
  font-size: 10px;
  font-weight: bold;
  line-height: 16px;
}

.without_at >>> .el-input__inner {
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  height: 30px;
  line-height: 30px;
  padding: 0 5px 0 15px;
}

.without_at >>> .el-input__icon{
  line-height: 30px;
}


.settings-button-section, .export-section {
  margin-top: 16px;
}

.settings-button-section >>> .el-button,
.export-section >>> .el-button {
  cursor: pointer;
  border: 1px solid #DCDFE6;
  color: white;
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 8px;
  font-weight: 600;
  width: 100%;
  line-height: 18px;
  background-color: #6366fe;
}

.btn-icon {
  font-size: 18px;
  margin-right: 12px;
}

.center-panel {
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.script-selection-area {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.copy-list-none {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.copy-list-none-icon {
  font-size: 54px;
  color: #9ca3af;
}

.copy-list-none-title {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
}

.copy-list-none-desc {
  font-size: 12px;
  color: #9ca3af;
}

.copy-list {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.copy-list >>> .el-collapse {
  border: none;
}

.copy-list >>> .el-collapse-item__wrap {
  background-color: transparent;
}

.copy-list >>> .el-collapse-item__header {
  height: auto;
  align-items: start;
  line-height: 24px;
  background-color: transparent;
  border: none;
}

.copy-list >>> .el-collapse-item__arrow {
  line-height: 24px;
  height: 24px;
  color: #9ca3b2;
  font-size: 14px;
  font-weight: bold;
}

.copy-item {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 12px 0;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
}

.copy-item-title {
  font-weight: 500;
  font-size: 13px;
  color: #1f2937;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-item-desc {
  font-size: 15px;
  color: #1f2937;
  max-height: 100px;
  overflow-y: auto;
}

.copy-item-materials {
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
  padding: 12px 12px 0 12px;
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.copy-item-material-img {
  background-color: #e5e7eb;
  width: 54px;
  height: 96px;
  border-radius: 6px;
}

.copy-item-material-name {
  margin-top: 4px;
  font-size: 12px;
  width: 54px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-item {
  border-color: #4338ca;
  background-color: #eef2ff;
}

.close-icon {
  color: #b3b5b4;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}

.close-icon:hover {
  color: #fc5633;
}

.panel-title {
  font-size: 15px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.panel-label {
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
  margin-bottom: 4px;
}

.storyboard-panel {
  width: 340px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
}

.storyboard-content {
  height: calc(100% - 30px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.storyboard-item {
  display: flex;
  gap: 12px;
}

.storyboard-item-img {
  background-color: #e5e7eb;
  width: 54px;
  height: 96px;
  border-radius: 6px;
}

.storyboard-item-detail {
  flex: 1;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  height: 96px;
  overflow-y: auto;
}

.right-panel {
  width: 320px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  background-color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.video-placeholder {
  width: 100%;
  margin: 0 auto;
  aspect-ratio: 9 / 16;
  color: #6b7280;
  background-color: #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-placeholder-preview {
  background-color: #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder-preview video::-webkit-media-controls-timeline {
  display: none !important;
}

.video-placeholder-preview video::-moz-controls-progressbar {
  display: none !important;
}

.video-placeholder-preview video::-ms-media-controls-timeline {
  display: none !important;
}

.li-video {
  height: 200px;
  background-color: #ffffff;
  padding: 3px;
  aspect-ratio: 9 / 16;
  border: 2px solid #DBEAFE;
  border-radius: 8px;
}

.dropdown {
  position: absolute;
  z-index: 999;
  display: flex;
  gap: 10px;
}

.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 180px;
  height: 200px;
  overflow: auto;
}

.dropdown ul::-webkit-scrollbar {
  width: 5px !important;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown li:hover {
  background-color: #DBEAFE;
}

.highlight-content {
  padding: 8px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #f9f9f9;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  top: 0;
  left: 0;
  right: 0;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
  z-index: 1;
  word-wrap: break-word;
}

.input-layer {
  position: relative;
  z-index: 2;
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  caret-color: black;
}

.input-layer >>> .el-textarea__inner {
  padding: 8px;
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  border-radius: 4px;
  box-shadow: none;
  resize: none;
  border: 1px solid #d1d5db;
  transition: border-color 0.2s ease-in-out;
}

.input-layer >>> .el-textarea__inner:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.volume-control {
  margin-top: 20px;
  display: flex;
  align-items: center;
  width: 100%;
}

.volume-control >>> .el-button {
  padding: 7px 10px;
}

.volume-label {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
  margin-left: 15px;
}

.volume-slider {
  flex: 1;
  margin: 0 20px;
}

.volume-slider >>> .el-slider__button {
  height: 10px;
  width: 10px;
}

.volume-slider >>> .el-slider__runway {
  height: 4px;
}
</style>