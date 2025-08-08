<template>
  <div style="display: flex;gap: 30px;width: 100%">
    <div class="color-picker-container">
      <div class="color-picker-header">
        颜色
      </div>
      <div class="tab-line">
        <div class="header-text">
<!--          <div class="header-icon" data-value="0">-->
<!--            <span class="styled__StyledToolTipSpan-sc-h6ge1t-0 sFjTR Tooltip">-->
<!--              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">-->
<!--                <circle cx="8" cy="8" r="7.5" fill="#266FFF" stroke="#266FFF" stroke-width="1px" fill-rule="evenodd" fill-opacity=".54">-->
<!--                </circle>-->
<!--              </svg>-->
<!--            </span>-->
<!--          </div>-->
        </div>
        <div class="jFPZAG">
          <div class="draw-tab" :class="{selected: colorPickerType === 'svPlane'}" @click="colorPickerType = 'svPlane'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none">
              <path fill="#555557" fill-rule="evenodd" d="M4.136 11a6.864 6.864 0 1 1 13.728 0c0 .634-.362 1.048-.806 1.305-.416.241-.95.377-1.443.483q-.228.05-.448.093c-.355.073-.69.141-1.002.232-.447.13-.731.277-.881.446l-.358-.317.357.317c-.205.232-.328.553-.406.963a9 9 0 0 0-.11.891q-.018.209-.041.43c-.047.431-.123.931-.367 1.323-.129.208-.307.39-.548.517-.24.125-.512.18-.81.18A6.864 6.864 0 0 1 4.135 11M11 5.136a5.864 5.864 0 0 0 0 11.728.74.74 0 0 0 .347-.067.4.4 0 0 0 .163-.158c.11-.178.174-.466.222-.904q.017-.165.034-.358c.03-.328.063-.7.129-1.042.092-.488.262-1.013.64-1.44.347-.391.868-.602 1.35-.742.355-.103.753-.184 1.123-.26l.396-.082c.497-.108.889-.218 1.153-.37.236-.137.307-.266.307-.441A5.864 5.864 0 0 0 11 5.136M14.5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-7 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2M11 7.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-2.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2" clip-rule="evenodd">
              </path>
            </svg>
          </div>
          <div class="color-tab" :class="{selected: colorPickerType === 'preview'}" @click="colorPickerType = 'preview'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none">
              <rect width="3.55" height="3.55" x="4.583" y="4.583" fill="#B7B9BD" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="4.583" y="9.133" fill="#555557" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="4.583" y="13.683" fill="#8B8C8F" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="9.225" y="4.583" fill="#8B8C8F" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="9.225" y="9.133" fill="#B7B9BD" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="9.225" y="13.683" fill="#555557" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="13.867" y="4.583" fill="#555557" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="13.867" y="9.133" fill="#8B8C8F" rx=".5"></rect>
              <rect width="3.55" height="3.55" x="13.867" y="13.683" fill="#B7B9BD" rx=".5"></rect>
            </svg>
          </div>
        </div>
      </div>
      <div class="hiDQJY">
        <div class="divider"></div>
        <div class="colors-container" v-if="colorPickerType === 'preview'">
          <div v-for="(color, index) in preview_colors" :key="index" @click="selectColor(color)"
               class="preview-item" :style="{backgroundColor: color}">
          </div>
        </div>
        <div class="plane-container" v-if="colorPickerType === 'svPlane'">
          <div class="s-v-plane" ref="svPlane" @mousedown.prevent="handleSVPlaneMouseDown">
            <div class="styles__StyledLayer-sc-i7fbzf-1 ikQVeN">
              <div class="base-hue-layer" :style="{ background: hueBackground }"></div>
              <div class="s-layer"></div>
              <div class="v-layer"></div>
            </div>
            <i class="pointer" :style="{ top: pointerTop, left: pointerLeft, background: finalColorHex }"></i>
          </div>
        </div>
        <div class="hue-slider-container" v-if="colorPickerType === 'svPlane'">
          <div class="hue-slider" ref="hueSlider" @mousedown.prevent="handleHueMouseDown">
            <div class="hue-handle" :style="{ left: hueHandleLeft }"></div>
          </div>
        </div>
        <div class="divider"></div>
      </div>
      <div class="input-section">
        <div class="input-section-left">
          <div class="btn-wp">
            <div>HEX</div>
            <div class="caret">
              <svg width="7" height="4" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M.171.168a.564.564 0 000 .809l2.916 2.855a.593.593 0 00.826 0L6.83.977a.564.564 0 000-.81.593.593 0 00-.826 0L3.5 2.62.997.168a.593.593 0 00-.826 0z" fill="#8B8C8F"></path></svg>
            </div>
          </div>
        </div>
        <div class="input-section-center">
          <div style="display: flex;width: 100%;">
            <div style="width: 30px;text-align: center;line-height: 28px">#</div>
            <div style="flex: 1;line-height: 28px">{{ color_value }}</div>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="label">最近使用</div>
      <div class="self-container margin-b-12">
        <div v-for="(color, index) in recently_used" :key="index" @click="selectColor(color)"
             class="preview-item" :style="{backgroundColor: color}">
        </div>
      </div>
      <div class="divider"></div>
      <div class="label flex-center">
        <div style="flex: 1">我的收藏</div>
        <i class="el-icon-plus" style="font-weight: bold;cursor: pointer" @click="addFavorite"></i>
      </div>
      <div class="self-container margin-b-12">
        <div v-for="(color, index) in my_favorite" :key="index" @click="selectColor(color)"
             class="preview-item" :style="{backgroundColor: color}">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomColorPicker',
  props: {
    color: {
      type: String,
      default: 'FF9100',
    },
  },
  data() {
    return {
      colorPickerType: 'preview',   // 颜色选择类型，preview: 预览面板，svPlane: 调色板
      preview_colors: [
        '#000000','#333333','#4F4F4F','#6c6c6c','#9a9a9a',
        '#bebebe','#cecece','#efefef','#ffffff','#de868f',
        '#fcca00','#f4ce98','#fefa83','#ccf783','#B4FDFF',
        '#93D2F3','#7F83F7','#B886F8','#BD3124','#E99D42',
        '#FFBF6B','#FFF81D','#A2EF4D','#75F9FD','#4095E5',
        '#0F40F5','#7728F5','#951D1D','#A16222','#CBA43F',
        '#BFBF3D','#81B337','#54BCBD','#347CAF','#0014B7',
        '#591BB7','#641013','#744E20','#9B7D31','#817F26',
        '#567722','#377F7F','#215476','#000A7B','#3B0E7B',
      ],
      color_value: this.color.replace('#',''), // 初始值
      recently_used: [],
      my_favorite: [],

      // HSV 颜色模型
      hue: this.hexToHsv(this.color).h,        // 色相 (0-360)
      saturation: 1,    // 饱和度 (0-1)
      value: 1,         // 明度 (0-1)
    };
  },
  computed: {
    // 最终选定颜色的HEX值
    finalColorHex() {
      return this.hsvToHex(this.hue, this.saturation, this.value);
    },
    // SV面板的纯色相背景
    hueBackground() {
      // 纯色相背景是饱和度和明度都为100%的颜色
      return this.hsvToHex(this.hue, 1, 1);
    },
    // SV面板指示器的左边距
    pointerLeft() {
      return `${this.saturation * 100}%`;
    },
    // SV面板指示器的上边距
    pointerTop() {
      return `${(1 - this.value) * 100}%`;
    },
    // 色相滑块手柄的左边距
    hueHandleLeft() {
      return `${this.hue / 360 * 100}%`;
    }
  },
  watch: {
    // 监听最终颜色变化，更新color_value
    finalColorHex(newHex) {
      this.color_value = newHex.substring(1).toUpperCase();
      this.$emit('color-updated', '#'+this.color_value);
    }
  },
  mounted() {
    this.recently_used = JSON.parse(localStorage.getItem('recently')) || []
  },
  beforeDestroy() {
    // 移除所有可能存在的全局事件监听器，防止内存泄漏
    this.unbindDocumentEvents();
  },
  methods: {
    // --- 颜色选择逻辑 ---
    selectColor(color) {
      this.updateRecentlyUsed(color);
      this.color_value = color.substring(1);
      this.$emit('color-updated', '#'+this.color_value);

      // 当选择预设颜色时，也更新HSV值，以便自定义面板同步
      const { h, s, v } = this.hexToHsv(color);
      this.hue = h;
      this.saturation = s;
      this.value = v;
    },
    addFavorite() {
      this.my_favorite.unshift('#'+this.color_value);
    },
    updateRecentlyUsed(color) {
      let recently = JSON.parse(localStorage.getItem('recently')) || [];
      // 避免重复添加
      recently = recently.filter(c => c !== color);
      recently.unshift(color);
      if (recently.length > 9) {
        recently.pop();
      }
      localStorage.setItem('recently', JSON.stringify(recently));
      this.recently_used = recently;
    },

    // --- 拖动事件处理 ---
    // SV面板
    handleSVPlaneMouseDown(e) {
      this.updateSVPlane(e); // 立即响应点击
      document.addEventListener('mousemove', this.updateSVPlane);
      document.addEventListener('mouseup', this.unbindDocumentEvents);
    },
    updateSVPlane(e) {
      const plane = this.$refs.svPlane;
      const rect = plane.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      // 边界限制
      x = Math.max(0, Math.min(x, rect.width));
      y = Math.max(0, Math.min(y, rect.height));

      this.saturation = x / rect.width;
      this.value = 1 - (y / rect.height);
    },
    // 色相滑块
    handleHueMouseDown(e) {
      this.updateHueSlider(e); // 立即响应点击
      document.addEventListener('mousemove', this.updateHueSlider);
      document.addEventListener('mouseup', this.unbindDocumentEvents);
    },
    updateHueSlider(e) {
      const slider = this.$refs.hueSlider;
      const rect = slider.getBoundingClientRect();
      let x = e.clientX - rect.left;

      // 边界限制
      x = Math.max(0, Math.min(x, rect.width));

      this.hue = Math.round((x / rect.width) * 360);
    },
    // 解绑事件
    unbindDocumentEvents() {
      document.removeEventListener('mousemove', this.updateSVPlane);
      document.removeEventListener('mousemove', this.updateHueSlider);
      document.removeEventListener('mouseup', this.unbindDocumentEvents);
    },

    // --- 颜色转换辅助函数 ---
    hsvToHex(h, s, v) {
      let r, g, b;
      let i = Math.floor(h / 60);
      let f = h / 60 - i;
      let p = v * (1 - s);
      let q = v * (1 - f * s);
      let t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
      }
      const toHex = (c) => ('0' + Math.round(c * 255).toString(16)).slice(-2);
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    },
    hexToHsv(hex) {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      }
      r /= 255; g /= 255; b /= 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, v = max;
      let d = max - min;
      s = max === 0 ? 0 : d / max;
      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h = h / 6 * 360;
      }
      return { h, s, v };
    }
  }
};
</script>

<style scoped>
.color-picker-container {
  box-sizing: content-box;
  width: 240px;
  color: rgb(65, 80, 88);
  background: rgb(255, 255, 255);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 10px 0px;
  font-size: 12px;
  text-align: left;
  border: 1px solid rgba(18, 17, 42, 0.07);
}

.color-picker-header {
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  padding-left: 10px;
  height: 30px;
  cursor: move;
  border-bottom: 1px solid rgba(18, 17, 42, 0.07);
}

.tab-line {
  color: rgb(25, 25, 26);
  height: 36px;
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  justify-content: space-between;
  border-bottom: 1px solid #12112a12;
}

.header-text {
  display: flex;
  font-size: 12px;
  line-height: 1;
  font-weight: normal;
  cursor: pointer;
  padding-left: 10px;
}

.header-icon {
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  margin-right: 12px;
}

.jFPZAG {
  width: 54px;
  height: 26px;
  border-radius: 4px;
  display: flex;
  background: rgb(242, 242, 242);
  overflow: hidden;
  margin-right: 10px;
}

.draw-tab {
  color: #8b8c8f
}

.selected {
  background: rgb(255, 255, 255);
  filter: drop-shadow(rgba(0, 0, 0, 0.2) 0px 0px 4px);
}

.jFPZAG div {
  width: 27px;
  height: 22px;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  margin: 2px;
  border-radius: 4px;
}

.colors-container {
  margin: 16px 0 8px;
  display: grid;
  gap: 7px;
  grid-template-columns: repeat(auto-fit, 18px);
  padding: 0 10px;
  box-sizing: border-box;
}

.preview-item {
  width: 18px;
  height: 18px;
  border-radius: 2px;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  position: relative;
}

.divider {
  padding: 0 8px;
  width: 100%;
  height: 1px;
  background-color: rgba(18, 17, 42, 0.07);
  box-sizing: border-box;
}

.row {
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  height: 52px;
  padding: 0 10px;
  box-sizing: border-box;
}

.h-a-bands {
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  flex: 1 1 0%;
}

.outside-color-picker-btn {
  width: 24px;
  height: 24px;
  margin-left: -5px;
  margin-right: 8px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  background: transparent;
  color: rgb(25, 25, 26);
}

.a-band {
  position: relative;
  height: 10px;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  cursor: pointer;
  background-clip: padding-box;
  width: 180px;
  background-image: linear-gradient(45deg, rgb(204, 204, 204) 25%, transparent 25%),
  linear-gradient(-45deg, rgb(204, 204, 204) 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, rgb(204, 204, 204) 75%),
  linear-gradient(-45deg, transparent 75%, rgb(204, 204, 204) 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0;
}

.slider {
  position: absolute;
  top: -5.5px;
  width: 14px;
  height: 14px;
  margin-left: calc(-7px);
  background: transparent;
  border: 2px solid rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.2) 0 1px 4px 0;
  border-radius: 50%;
  z-index: 2;
  pointer-events: none;
}

.input-section {
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  padding-right: 1px;
  margin-bottom: 4px;
  margin-top: 8px;
  padding-left: 10px;
}

.input-section-left {
  position: relative;
  display: inline-flex;
  -webkit-box-align: center;
  align-items: center;
  width: 60px;
  height: 28px;
  font-size: 12px;
  color: rgb(25, 25, 26);
  cursor: pointer;
  margin-top: 1px;
}

.btn-wp {
  display: inline-flex;
  -webkit-box-pack: start;
  justify-content: flex-start;
  width: auto;
  -webkit-box-align: center;
  align-items: center;
  border-radius: 6px;
  cursor: inherit;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 28px;
  line-height: 28px;
  padding: 0 7px;
  text-align: center;
  border: 1px solid transparent;
}

.btn-wp:hover {
  border: 1px solid rgb(219, 219, 219);
}

.caret {
  margin-left: 8px;
  display: inline-flex;
  -webkit-box-align: center;
  align-items: center;
}

.input-section-center {
  display: flex;
  flex: 1;
  position: relative;
  -webkit-box-align: center;
  align-items: center;
  border-radius: 6px;
  margin-left: 2px;
  margin-right: 10px;
  height: 28px;
  border: 1px solid transparent;
}

.input-section-center:hover {
  border: 1px solid rgb(219, 219, 219);
}

.input-section-center:hover .ratio {
  border-left: 1px solid rgb(219, 219, 219);
}

.label {
  line-height: 40px;
  padding: 0 10px;
  box-sizing: border-box;
}

.self-container {
  display: grid;
  gap: 7px;
  grid-template-columns: repeat(auto-fit, 18px);
  padding: 0 10px;
  box-sizing: border-box;
}

.plane-container {
  width: 100%;
  height: 188px;
  padding: 0 10px;
  margin: 16px 0 8px;
  box-sizing: border-box;
}

.s-v-plane {
  position: relative;
  width: 100%;
  height: 100%;
  background-clip: content-box;
  cursor: pointer;
}

.ikQVeN {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 6px;
  overflow: hidden;
}

.base-hue-layer {
  width: 100%;
  height: 100%;
  left: 2px;
  top: 2px;
  border-radius: 6px;
  overflow: hidden;
}

.s-layer {
  background: linear-gradient(to right, white 0%, rgba(255, 255, 255, 0) 100%);
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  bottom: 0;
}

.v-layer {
  background: linear-gradient(transparent 0%, black 100%);
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  bottom: 0;
}

.pointer {
  position: absolute;
  width: 16px;
  height: 16px;
  margin: calc(-7px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 4px 0px;
  border: 3px solid rgb(255, 255, 255);
  border-radius: 50%;
  background-color: transparent;
  box-sizing: border-box;
  cursor: pointer;
}

/* 新增样式 */
.hue-slider-container {
  padding: 0 10px;
  margin-top: 12px;
}
.hue-slider {
  position: relative;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  cursor: pointer;
  background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
}
.hue-handle {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
  box-sizing: border-box;
  transform: translate(-50%, -50%); /* 使手柄中心对准颜色值 */
}
</style>