<template>
  <div class="video">
    <div class="video-left">
      <div class="video-header">
        <div class="video-card-list">
          <el-switch :width="50" v-model="isMaterial" active-text="素材" inactive-text="数字人"></el-switch>
          <div class="video-template">
            <div v-for="item in isMaterial? materials : figures" :key="item.id" style="border-radius: 10px; width: 130px"
                 @click="selectResource(item)"
                 :style="{ 'background-color': item.id === figure.id || material_list.includes(item.id) ? '#e0e7fb' : '#FFFFFF' }">
              <el-image class="template-img" :src="item.picture" fit="cover"></el-image>
              <div class="template-name" :title="item.name">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex;gap: 10px;margin-top: 10px">
        <div style="flex: 1">
          <div class="voice-card">
            <div class="video-title" style="margin-bottom: 10px">声音选择</div>
            <div style="display: flex;align-items: center;">
              <div class="play-btn" @click="previewAudio(sound, -1)" v-if="audioIndex !== -1">
                <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
              </div>
              <div class="play-btn" @click="stopAudio" v-else>
                <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
              </div>
              <el-popover placement="right" trigger="click" @hide="stopAudio">
                <div class="popover-content">
                  <el-row>
                    <el-col :span="12" v-for="(voice, index) in voices" :key="voice.id">
                      <div class="voice-item" :class="{ active: voice.id === sound.id }" @click="selectVoice(voice)">
                        <div class="voice-icon" @click="previewAudio(voice, index)" v-if="audioIndex !== index">
                          <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-icon" @click="stopAudio" v-else>
                          <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-name" :title="voice.name">{{ voice.name }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div class="sound" slot="reference">
                  <div class="sound-name">{{ sound.name }}</div>
                  <i class="el-icon-a-ze-bars1" style="font-size: 20px; color: #9a9a9a"></i>
                </div>
              </el-popover>
            </div>
          </div>
        </div>
        <div style="flex: 1">
          <div class="voice-card">
            <div class="video-title" style="margin-bottom: 10px">背景音乐</div>
            <div style="display: flex;align-items: center;">
              <div class="play-btn" @click="previewAudio(bgm, -2)" v-if="audioIndex !== -2">
                <i class="el-icon-play" style="font-size: 13px; color: #6286ed"></i>
              </div>
              <div class="play-btn" @click="stopAudio" v-else>
                <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
              </div>
              <el-popover placement="bottom" trigger="click" @hide="stopAudio">
                <div class="popover-content">
                  <el-row>
                    <el-col :span="12">
                      <div class="voice-item">
                        <el-upload
                            action="http://127.0.0.1:6006/bgm/upload"
                            :show-file-list="false"
                            accept=".mp3, .wav"
                            :on-success="bgmUploadSuccess"
                        >
                          <div style="display: flex;align-items: center;height: 80px;">
                            <div class="voice-icon" style="background-color: pink !important">
                              <i class="el-icon-plus" style="font-size: 15px; color: red"></i>
                            </div>
                            <div class="voice-name" style="text-align: left">上传背景音乐</div>
                          </div>
                        </el-upload>
                      </div>
                    </el-col>
                    <el-col :span="12" v-for="(item, index) in bgmList" :key="item.id">
                      <div class="voice-item" :class="{ active: item.id === bgm.id }" @click="selectBgm(item)">
                        <div class="voice-icon" @click="previewAudio(item, 10000 + index)"
                             v-if="audioIndex !== (10000 + index)">
                          <i :class="item.isPlay ? 'el-icon-pause' : 'el-icon-play'"
                             style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-icon" @click="stopAudio" v-else>
                          <i class="el-icon-pause" style="font-size: 13px; color: #6286ed"></i>
                        </div>
                        <div class="voice-name" :title="item.name">{{ item.name }}</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div class="sound" slot="reference">
                  <div class="sound-name">{{ bgm.name }}</div>
                  <i class="el-icon-a-ze-bars1" style="font-size: 20px; color: #9a9a9a"></i>
                </div>
              </el-popover>
              <div style="margin: 0 10px;font-size: 13px;color: #303133">音量</div>
              <el-slider v-model="bg_volume" :step="0.1" style="width: 90px" :min="0.1" :max="1"
                         @change="saveBgmVolume('bg_volume')"></el-slider>
            </div>
          </div>
        </div>
      </div>
      <div class="voice-card" ref="myBox" style="margin-top: 10px;position: relative">
        <div style="display: flex;align-items: center;position: absolute;top: 15px;left: 85px">
          <el-switch :width="50" v-model="withTitle" @change="switchTitle"></el-switch>
          <div style="margin-left: 20px;font-size: 13px;color: #9a9a9a">需开启添加字幕标题后，以下设置才会生效</div>
        </div>
        <el-collapse v-model="activeTitleNames">
          <el-collapse-item title="字幕标题" name="1">
            <div class="preset">
              <span style="margin-right: 20px">预设样式</span>
              <div class="preset-style" v-for="item in titlePresets" :key="item.id" @click="selectTitlePreset(item)" :style="{
                backgroundColor: item.backgroundColor,
                color: item.color,
                '-webkit-text-stroke': '0.5px' + item.stroke,
                border: activeTitlePresetId === item.id ? '2px solid #6286ed' : 'none'
              }">T</div>
            </div>
            <div style="display: flex;gap: 30px;align-items: center;height: 80px">
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">字体颜色</div>
                <el-color-picker v-model="subtitleNameParams.name_color" size="small"
                                 @change="saveSubtitleNameParams('name_color')"></el-color-picker>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">字体样式</div>
                <el-select v-model="subtitleNameParams.name_font" placeholder="请选择" style="height: 35px;width: 180px"
                           @change="saveSubtitleNameParams('name_font')">
                  <el-option
                      v-for="item in fontFamily"
                      :key="item.font_id"
                      :label="item.name"
                      :value="item.font_id"
                  >
                    <div style="display: flex; align-items: center">
                      <img :src="item.img_path" style="width: 150px; height: 50px; margin-right: 8px;"/>
                      <span>{{ item.name }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
              <div>
                <div style="font-size: 13px;height: 35px">字体大小</div>
                <div style="display: flex">
                  <el-slider v-model="subtitleNameParams.name_fontsize" style="width: 170px" :min="5" :max="50"
                             @change="saveSubtitleNameParams('name_fontsize')"></el-slider>
                  <el-input-number class="text-input" v-model="subtitleNameParams.name_fontsize" controls-position="right"
                                   :min="5" :max="50"
                                   style="margin-left: 10px;width: 80px !important;"
                                   @change="saveSubtitleNameParams('name_fontsize')"></el-input-number>
                </div>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">描边颜色</div>
                <el-color-picker v-model="subtitleNameParams.name_stroke_color" size="small"
                                 @change="saveSubtitleNameParams('name_stroke_color')"></el-color-picker>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">开启字幕背景</div>
                <div style="height: 35px;">
                  <el-switch :width="50" v-model="name_use_background" @change="switchNameUseBackground"
                             style="margin-top: 5px"></el-switch>
                </div>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">背景颜色</div>
                <el-color-picker v-model="subtitleNameParams.name_background_color" show-alpha size="small"
                                 @change="saveSubtitleNameParams('name_background_color')"></el-color-picker>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="voice-card" style="margin-top: 10px;position: relative">
        <div style="margin-bottom: 20px;display: flex;align-items: center;position: absolute;top: 15px;left: 85px">
          <el-switch :width="50" v-model="withSubtitle" @change="switchSubtitle"></el-switch>
          <div style="margin-left: 20px;font-size: 13px;color: #9a9a9a">需开启添加字幕后，以下设置才会生效</div>
        </div>
        <el-collapse v-model="activeNames">
          <el-collapse-item title="字幕设置" name="1">
            <div class="preset">
              <span style="margin-right: 20px">预设样式</span>
              <div class="preset-style" v-for="item in titlePresets" :key="item.id" @click="selectPreset(item)" :style="{
                backgroundColor: item.backgroundColor,
                color: item.color,
                '-webkit-text-stroke': '0.5px' + item.stroke,
                border: activePresetId === item.id ? '2px solid #6286ed' : 'none'
              }">T</div>
            </div>
            <div style="display: flex;gap: 30px;align-items: center;height: 80px">
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">字体颜色</div>
                <el-color-picker v-model="subtitleParams.color" size="small"
                                 @change="saveSubtitleParams('color')"></el-color-picker>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">字体样式</div>
                <el-select v-model="subtitleParams.font" placeholder="请选择" style="height: 35px;width: 180px"
                           @change="saveSubtitleParams('font')">
                  <el-option
                      v-for="item in fontFamily"
                      :key="item.font_id"
                      :label="item.name"
                      :value="item.font_id"
                  >
                    <div style="display: flex; align-items: center">
                      <img :src="item.img_path" style="width: 150px; height: 50px; margin-right: 8px;"/>
                      <span>{{ item.name }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
              <div>
                <div style="font-size: 13px;height: 35px">字体大小</div>
                <div style="display: flex">
                  <el-slider v-model="subtitleParams.fontsize" style="width: 170px" :min="5" :max="50"
                             @change="saveSubtitleParams('fontsize')"></el-slider>
                  <el-input-number class="text-input" v-model="subtitleParams.fontsize" controls-position="right" :min="5"
                                   :max="50"
                                   style="margin-left: 10px;width: 80px !important;"
                                   @change="saveSubtitleParams('fontsize')"></el-input-number>
                </div>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">描边颜色</div>
                <el-color-picker v-model="subtitleParams.stroke_color" size="small"
                                 @change="saveSubtitleParams('stroke_color')"></el-color-picker>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">开启字幕背景</div>
                <div style="height: 35px;">
                  <el-switch :width="50" v-model="use_background" @change="switchUseBackground"
                             style="margin-top: 5px"></el-switch>
                </div>
              </div>
              <div style="text-align: center">
                <div style="font-size: 13px;height: 40px">背景颜色</div>
                <el-color-picker v-model="subtitleParams.background_color" show-alpha size="small"
                                 @change="saveSubtitleParams('background_color')"></el-color-picker>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="text-card">
        <div style="display: flex;margin-bottom: 10px;align-items: center">
          <div class="video-title" style="flex: 1">口播文案</div>
          <div class="ai-generate-btn" @click="openSetting">AI生成文案</div>
        </div>
        <div style="height: calc(100% - 65px)">
          <el-table :data="tableData" empty-text="暂未设置" stripe style="width: 100%;" height="100%" ref="table">
            <el-table-column type="index" label="#" width="70" align="center">
              <template slot-scope="scope">
                <div style="position: relative;width: 100%">
                  <div>{{ scope.$index + 1 }}</div>
                  <div class="warning" title="已开启字幕标题设置，口播标题不能为空" v-if="withTitle && !scope.row.title">!</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="口播标题">
              <template slot-scope="scope">
                <div class="table-column" :title="scope.row.title">{{ scope.row.title }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="text" label="口播内容">
              <template slot-scope="scope">
                <div class="table-column" :title="scope.row.text">{{ scope.row.text }}</div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template slot-scope="scope">
                <el-button size="mini" @click="editRow(scope.$index)">编辑</el-button>
                <el-button size="mini" type="danger" @click="deleteRow(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-button type="primary" size="small" @click="addTable" class="add-button">添加口播文案</el-button>
      </div>
      <div style="height: 50px;display: flex;align-items: center;">
        <div style="margin-right: 20px;margin-left: 10px;font-size: 15px">视频倒序循环</div>
        <el-switch :width="50" v-model="reverse" @change="switchReverse"></el-switch>
        <div style="margin-right: 20px;margin-left: 50px;font-size: 15px">AI混剪</div>
        <el-switch :width="50" v-model="montage" @change="switchMontage"></el-switch>
        <div style="margin-left: 20px;font-size: 14px;color: #409EFF;cursor: pointer"
             @click="openMontageDialog" v-if="montage">混剪配置
        </div>
      </div>
      <el-button type="primary" class="generate-btn" @click="verify">生成视频</el-button>
      <el-dialog title="AI生成文案配置" :visible.sync="dialogVisible" width="70%" :show-close="false">
        <div style="height: 50vh;overflow-y: auto">
          <el-form :model="form" label-width="80px" label-position="top">
            <el-form-item label="模型选择">
              <el-select v-model="ai_model" @change="modelChange">
                <el-option
                    v-for="item in AIOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.value === 'local_model' && serverIsRunning">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="示例文案">
              <div class="input-row" v-for="(text, index) in exampleTexts" :key="index">
                <el-input class="input-with-button" type="textarea" rows="3" placeholder="请输入示例文案"
                          v-model="exampleTexts[index]"></el-input>
                <el-button type="danger" icon="el-icon-delete" @click="removeText(index)"></el-button>
              </div>
              <el-button type="primary" @click="addExampleText" class="add-button">
                添加示例文案
              </el-button>
            </el-form-item>
            <el-form-item label="文案要求">
              <el-input type="textarea" rows="3" placeholder="请输入文案要求" v-model="requirements"></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item label="文案字数">
                  <el-select v-model="num_of_words">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="文案数量">
                  <el-input class="text_setting" type="number" v-model="script_count" style="width: 200px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
      <el-button @click="dialogClose">取 消</el-button>
      <el-button type="primary" @click="generateText" :disabled="disableBtn">生 成</el-button>
    </span>
      </el-dialog>
      <el-dialog title="编辑文案" :visible.sync="editDialogVisible" width="70%" :show-close="false"
                 :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form ref="editForm" :model="selectedRow" :rules="rules" label-width="80px" label-position="top">
          <el-form-item label="口播标题" prop="title">
            <el-input type="textarea" rows="3" placeholder="输入口播标题" v-model="selectedRow.title"></el-input>
          </el-form-item>
          <el-form-item label="口播内容" prop="text">
            <el-input type="textarea" rows="3" placeholder="输入口播内容" v-model="selectedRow.text"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancelEdit">取 消</el-button>
      <el-button type="primary" size="small" @click="saveEditRow">保 存</el-button>
    </span>
      </el-dialog>
      <el-dialog title="AI混剪配置" :visible.sync="montageDialogVisible" width="70%" :show-close="false"
                 :close-on-click-modal="false" :close-on-press-escape="false">
        <el-form ref="montageForm" :model="montageForm" label-width="80px" label-position="top">
          <el-form-item label="混剪要求" prop="title">
            <div style="position: relative;">
              <div class="highlight-content"
                   :style="{height: replaceDivHeight + 'px',overflowY: 'auto',overflowX: 'hidden'}"
                   v-html="highlightedText" ref="highlightDiv"></div>
              <el-input type="textarea" rows="4" placeholder="输入混剪要求" v-model="montageForm.request"
                        @input="onInput" ref="inputRef" class="input-layer" @scroll="handleScroll"></el-input>
              <div v-if="showDropdown" class="dropdown" :style="dropdownStyle">
                <ul>
                  <li v-for="(item, index) in mentionList" :key="index" @click="selectMention(item)">
                    {{ item.name }}
                  </li>
                </ul>
              </div>
            </div>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
<!--        <el-button size="small" @click="closeMontageDialog">关 闭</el-button>-->
      <el-button type="primary" size="small" @click="closeMontageDialog">确 定</el-button>
    </span>
      </el-dialog>
    </div>
    <div class="video-right">
      <div class="preview-setting" :style="{ backgroundImage: 'url(' + figure.picture || materials[0].picture || '' + ')' }"
           ref="container" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp">
        <div class="preview-title" ref="titleContainer" :class="{ noneBackground: !name_use_background }"
             :style="titleTextStyle" v-if="withTitle" @mousedown="onMouseDown('top', $event)">示例标题</div>
        <div class="preview-content" ref="contentContainer" :class="{ noneBackground: !use_background }"
             :style="textStyle" v-if="withSubtitle" @mousedown="onMouseDown('bottom', $event)">示例字幕</div>
      </div>
    </div>
  </div>
</template>

<script>
import {getAction, postAction} from "@/api/api";
import axios from "axios";

export default {
  name: "Video",
  data() {
    return {
      isPlay: false,
      templates: [],
      isMaterial: false,
      materials: [],
      figures: [],
      figure: {},
      material_list: [],
      voices: [],
      sound: {},
      bgmList: [],
      bgm: {},
      bg_volume: 0.5,
      text: "",
      audio: null,
      audioIndex: null,
      isFocus: false,
      reverse: false,
      withSubtitle: false,
      use_background: false,
      subtitleParams: {},
      withTitle: false,
      name_use_background: false,
      subtitleNameParams: {},
      titleTextStyle: {},
      textStyle: {},
      fontFamily: [],
      activeTitleNames: [],
      activeNames: [],
      subtitle: '',
      tableData: [],
      dialogVisible: false,
      form: {},
      editDialogVisible: false,
      selectedRow: {},
      selectedIndex: 0,
      rules: {
        title: [
          {required: false, message: '请输入口播文案', trigger: 'blur'},
        ],
        text: [
          {required: true, message: '请输入口播文案', trigger: 'blur'},
        ],
      },
      dialogType: 'edit',
      ai_model: 'deepseek_v3',
      serverIsRunning: false,
      AIOptions: [
        {label: '本地大模型', value: 'local_model'},
        {label: 'deepseek v3', value: 'deepseek_v3'},
      ],
      exampleTexts: [],
      requirements: '',
      num_of_words: 100,
      options: [
        {label: '100', value: 100},
        {label: '200', value: 200},
        {label: '300', value: 300},
        {label: '400', value: 400},
        {label: '500', value: 500},
        {label: '600', value: 600}
      ],
      script_count: 1,
      disableBtn: false,
      montage: false,
      montageDialogVisible: false,
      montageForm: {
        request: '' // 显示给用户看的
      },
      actualRequest: '', // 实际发送给服务端的
      replaceName: [],
      replaceId: [],
      mentionList: [],
      showDropdown: false,
      dropdownStyle: {
        position: 'absolute',
        top: '0px',
        left: '0px'
      },
      replaceDivHeight: 40,
      titleWidth: 0,
      titlePresets: [
        {
          id: '1',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: 'rgba(64,64,64,0.6)',
          stroke: '#000000',
          color: '#ffffff'
        },
        {
          id: '2',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: 'rgba(64,64,64,0.6)',
          stroke: '#ffffff',
          color: '#000000'
        },
        {
          id: '3',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: 'rgba(64,64,64,0.6)',
          stroke: '#FC0202',
          color: '#FDFF00'
        },
        {
          id: '4',
          fontFamily: 'SJxingkai-C-Regular',
          backgroundColor: 'rgba(64,64,64,0.6)',
          stroke: '#FDFF00',
          color: '#FC0202'
        },
        {
          id: '5',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: 'rgba(200, 200, 200, 0.6)',
          stroke: '#000000',
          color: '#ffffff'
        },
        {
          id: '6',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: 'rgba(200, 200, 200, 0.6)',
          stroke: '#ffffff',
          color: '#000000'
        },
        {
          id: '7',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: 'rgba(200, 200, 200, 0.6)',
          stroke: '#FC0202',
          color: '#FDFF00'
        },
        {
          id: '8',
          fontFamily: 'LXGW-ZhenKai',
          backgroundColor: 'rgba(200, 200, 200, 0.6)',
          stroke: '#FDFF00',
          color: '#FC0202'
        },
      ],
      activeTitlePresetId: '1',
      activePresetId: '1',
      dragging: false,
      draggingType: '',
      startY: 0,
      topOffset: 0,
      bottomOffset: 320,
    };
  },
  computed: {
    highlightedText() {
      // 使用正则替换所有 @人名 为高亮样式
      let result = this.montageForm.request;
      this.replaceName.forEach(item => {
        const regex = new RegExp(`@${item}`, 'g'); // 使用全局标志
        result = result.replace(regex, (match) => {
          return `<span style="color: #4c8df1">${match}</span>`
        });
      });
      result = result.replace(/\n/g, '<br>'); // 支持换行
      return result; // 返回最终结果
    },
  },
  mounted() {
    this.querySounds();
    this.queryFigures();
    this.queryFontFamily()
    this.queryBgm()
    document.addEventListener('click', this.handleClickOutside);
    this.$nextTick(() => {
      this.titleWidth = this.$refs.myBox.getBoundingClientRect().width - 50
      this.initParams()
    })
  },
  beforeDestroy() {
    this.stopAudio();
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    onMouseDown(type,event) {
      this.dragging = true;
      this.draggingType = type;
      this.startY = event.clientY;
    },
    onMouseMove(event) {
      if (!this.dragging) return;
      const deltaY = event.clientY - this.startY;
      this.startY = event.clientY;

      const containerHeight = this.$refs.container.clientHeight;
      const titleHeight = this.$refs.titleContainer.clientHeight;
      const contentHeight = this.$refs.contentContainer.clientHeight;

      if (this.draggingType === 'top') {
        let newTop = this.topOffset + deltaY;
        newTop = Math.max(0, Math.min(this.bottomOffset - titleHeight, newTop));
        this.topOffset = newTop;
        sessionStorage.setItem('top_offset', this.topOffset)
        this.updateTitleTextStyle()
      }

      if (this.draggingType === 'bottom') {
        let newBottom = this.bottomOffset + deltaY;
        newBottom = Math.max(this.topOffset + titleHeight,
            Math.min(containerHeight - contentHeight, newBottom));
        this.bottomOffset = newBottom;
        sessionStorage.setItem('bottom_offset', this.bottomOffset)
        this.updateTextStyle()
      }
    },
    onMouseUp() {
      this.dragging = false;
    },
    handleScroll(event) {
      const textareaScrollTop = event.target.scrollTop;
      const highlightDiv = this.$refs.highlightDiv;
      if (highlightDiv) {
        highlightDiv.scrollTop = textareaScrollTop;
      }
    },
    onInput() {
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
      const cursorPos = inputEl.selectionStart
      const textBeforeCursor = this.montageForm.request.slice(0, cursorPos)
      const validMention = textBeforeCursor.charAt(textBeforeCursor.length - 1) === '@'

      if (validMention) {
        this.showDropdown = true

        this.$nextTick(() => {
          const rect = inputEl.getBoundingClientRect()
          const paddingLeft = parseFloat(getComputedStyle(inputEl).paddingLeft) || 0

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          const computedStyle = getComputedStyle(inputEl)
          context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`

          const textWidth = context.measureText(textBeforeCursor).width
          const inputWidth = inputEl.clientWidth - 30

          const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize);
          const scrollTop = inputEl.scrollTop;

          let offsetTop = Math.floor((paddingLeft + textWidth + 10) / inputWidth) + 1
          offsetTop = Math.min(offsetTop, 4) // 限制最大显示数量
          let remainder = (paddingLeft + textWidth + 5) % inputWidth

          this.dropdownStyle.top = `${window.scrollY + offsetTop * lineHeight}px`
          this.dropdownStyle.left = `${remainder}px`
        })
      } else {
        this.showDropdown = false
      }
    },
    selectMention(item) {
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
      const cursorPos = inputEl.selectionStart
      const atIndex = this.montageForm.request.lastIndexOf('@', cursorPos - 1)
      if (atIndex !== -1) {
        this.montageForm.request =
            this.montageForm.request.slice(0, atIndex + 1) + item.name + this.montageForm.request.slice(cursorPos)
        this.replaceName.push(item.name)
        this.replaceId.push(item.id)
        this.showDropdown = false
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
    generateText() {
      let url = ''
      switch (this.ai_model) {
        case 'local_model':
          url = 'http://127.0.0.1:9669/generate_script'
          break
        case 'deepseek_v3':
          url = 'http://127.0.0.1:9669/api/generate_script'
          break
      }
      const cleanTexts = this.exampleTexts.map(text => text.trim()).filter(text => text !== '');
      let params = {
        examples: cleanTexts,
        requirements: this.requirements,
        num_of_words: parseInt(this.num_of_words),
        script_count: parseInt(this.script_count)
      }
      this.loading = this.$loading({
        lock: true,
        text: '文案生成中，请耐心等待...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      axios.post(url, params).then(res => {
        if (res.data.status === "success") {
          this.tableData = this.tableData.concat(res.data.data.map(item => ({title: '', text: item})))
          sessionStorage.setItem("tableData", JSON.stringify(this.tableData))
        } else {
          this.$notify({
            title: "文案生成失败",
            message: `${res.data.message}`,
            type: "error",
            duration: 0
          });
        }
        this.dialogClose()
      }).catch(err => {
        this.$notify({
          title: "文案生成失败",
          message: `${err}`,
          type: "error",
          duration: 0
        });
        this.dialogClose()
      })
    },
    addExampleText() {
      this.exampleTexts.push('');
    },
    removeText(index) {
      this.exampleTexts.splice(index, 1);
    },
    dialogClose() {
      this.exampleTexts = [];
      this.requirements = '';
      this.num_of_words = 100;
      this.script_count = 1;
      if (this.loading) {
        this.loading.close();
        this.loading = null;
      }
      this.dialogVisible = false;
    },
    async openSetting() {
      this.serverIsRunning = await this.judgeServeStatus()
      this.dialogVisible = true
    },
    modelChange() {
      if (this.ai_model === 'local_model') {
        this.disableBtn = true
        postAction("stop_docker_service").then((res) => {
          if (res.data.status === "success") {
            this.disableBtn = false;
          }
        })
      } else {
        this.disableBtn = false
      }
    },
    async judgeServeStatus() {
      return !!(await this.figureRun() || await this.timbreRun() || await this.videoRun());
    },
    async figureRun() {
      return getAction('/figure/query_success').then(res => {
        let data = res.data.data.filter(item => item.status === "ready");
        return data.length > 0;
      })
    },
    async timbreRun() {
      return getAction('/timbres/query_success').then(res => {
        let data = res.data.data.filter(item => item.status === "pending");
        return data.length > 0
      })
    },
    async videoRun() {
      return getAction('/video_record/query').then(res => {
        let data = res.data.data.filter(item => item.status === "pending");
        return data.length > 0
      })
    },
    addTable() {
      this.tableData.push({title: '', text: ''})
      this.$nextTick(() => { //自动滚到到底部
        const tableBodyWrapper = this.$refs.table.bodyWrapper;
        tableBodyWrapper.scrollTop = tableBodyWrapper.scrollHeight;
      });
      this.editRow(this.tableData.length - 1, 'add')
    },
    deleteRow(index) {
      this.tableData.splice(index, 1);
      sessionStorage.setItem("tableData", JSON.stringify(this.tableData))
    },
    editRow(index, type = 'edit') {
      this.selectedRow = {...this.tableData[index]};
      this.selectedIndex = index
      this.rules.title[0].required = this.withTitle;
      this.editDialogVisible = true;
      this.dialogType = type
    },
    cancelEdit() {
      if (this.dialogType === 'add') {
        this.tableData.pop();
        sessionStorage.setItem("tableData", JSON.stringify(this.tableData))
      }
      this.$refs.editForm.clearValidate();
      this.editDialogVisible = false;
    },
    saveEditRow() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$set(this.tableData, this.selectedIndex, this.selectedRow);
          this.$forceUpdate()
          this.editDialogVisible = false;
          sessionStorage.setItem("tableData", JSON.stringify(this.tableData))
        } else {
          return false;
        }
      });
    },
    initParams() {
      this.figure = JSON.parse(sessionStorage.getItem('figure')) || {}
      this.material_list = JSON.parse(sessionStorage.getItem('material_list')) || []
      this.mentionList = JSON.parse(sessionStorage.getItem('mention_list')) || []
      this.isMaterial = this.material_list.length > 0;

      this.topOffset = Number(sessionStorage.getItem('top_offset')) || 0
      this.bottomOffset = Number(sessionStorage.getItem('bottom_offset')) || 320

      this.withSubtitle = sessionStorage.getItem("with_subtitle") === 'true'
      this.withTitle = sessionStorage.getItem("with_title") === 'true'
      this.reverse = sessionStorage.getItem("reverse") === 'true'
      this.bg_volume = Number(sessionStorage.getItem("bg_volume")) || 0.5
      this.use_background = sessionStorage.getItem("use_background") === 'true'
      this.name_use_background = sessionStorage.getItem("name_use_background") === 'true'

      this.activePresetId = sessionStorage.getItem("preset_id") || '1'
      this.subtitleParams.fontsize = parseInt(sessionStorage.getItem("fontsize")) || 5
      this.subtitleParams.color = sessionStorage.getItem("color") || '#ffffff'
      this.subtitleParams.font = sessionStorage.getItem("font") || 'SJxingkai-C-Regular'
      this.subtitleParams.background_color = sessionStorage.getItem("background_color") || 'rgba(64,64,64,0.6)'
      this.subtitleParams.stroke_color = sessionStorage.getItem("stroke_color") || '#000000'
      this.textStyle = {
        backgroundColor: this.subtitleParams.background_color,
        color: this.subtitleParams.color,
        fontFamily: this.subtitleParams.font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleParams.stroke_color}`,
        fontSize: (410 * this.subtitleParams['fontsize'] / 100) + 'px',
        top: this.bottomOffset + 'px'
      }

      this.activeTitlePresetId = sessionStorage.getItem("title_preset_id") || '1'
      this.subtitleNameParams.name_fontsize = parseInt(sessionStorage.getItem("name_fontsize")) || 10
      this.subtitleNameParams.name_color = sessionStorage.getItem("name_color") || '#ffffff'
      this.subtitleNameParams.name_font = sessionStorage.getItem("name_font") || 'SJxingkai-C-Regular'
      this.subtitleNameParams.name_background_color = sessionStorage.getItem("name_background_color") || 'rgba(64,64,64,0.6)'
      this.subtitleNameParams.name_stroke_color = sessionStorage.getItem("name_stroke_color") || '#000000'
      this.titleTextStyle = {
        backgroundColor: this.subtitleNameParams.name_background_color,
        color: this.subtitleNameParams.name_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (410 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topOffset + 'px'
      }

      this.tableData = sessionStorage.getItem("tableData") ? JSON.parse(sessionStorage.getItem("tableData")) : []
    },
    queryFontFamily() {
      getAction('/get_fonts').then(res => {
        if (res.data.status === 'success') {
          this.fontFamily = res.data.data
          // this.fontFamily.forEach(item => {
          //   item.img_path = item.img_path.replace('127.0.0.1', '192.168.0.106')
          // })
        }
      }).catch((error) => {
        console.error("获取字体样式列表失败:", error);
      });
    },
    queryFigures() {
      getAction("/figure/query_success").then((res) => {
        if (res.data.status === "success") {
          let data = res.data.data.filter(item => item.status === "success");
          // data.forEach(item => {
          //   item.picture = item.picture.replace('127.0.0.1', '192.168.0.106')
          // })
          if (data.length > 0) {
            this.materials = data.filter(item => !item.lip_sync && item.status === "success");
            this.figures = data.filter(item => item.lip_sync && item.status === "success");
          }
        }
      }).catch((error) => {
        console.error("获取角色列表失败:", error);
      });
    },
    querySounds() {
      getAction("/timbres/query_success").then((res) => {
        if (res.data.status === "success") {
          this.voices = res.data.data.filter(item => item.status === "success");
          if (this.voices.length > 0) {
            let sound = JSON.parse(sessionStorage.getItem("setting_voice"))
            if (sound && this.voices.some(item => item.id === sound.id)) {
              this.sound = sound
            } else {
              this.sound = this.voices[0];
            }
          }
        } else {
          this.$message.error("获取声音列表失败。");
        }
      }).catch((error) => {
        console.error("获取声音列表失败:", error);
      });
    },
    queryBgm() {
      let bgmList = [{id: '', name: '无'}]
      getAction('/bgm/all').then(res => {
        if (res.data.status === 'success') {
          this.bgmList = bgmList.concat(res.data.data)
          let bgm = JSON.parse(sessionStorage.getItem("setting_bgm"))
          if (bgm && this.bgmList.some(item => item.id === bgm.id)) {
            this.bgm = bgm
          } else {
            this.bgm = this.bgmList[0]
          }
        } else {
          this.$message.error("获取背景音乐列表失败。");
        }
      }).catch((error) => {
        console.error("获取背景音乐列表失败:", error);
      })
    },
    previewAudio(voice, index) {
      if (voice.id === '') {
        this.$message.warning("无音频预览");
        return;
      }
      this.stopAudio();

      setTimeout(() => {
        this.audio = new Audio(voice.filepath);
        this.audio.play();
        this.audioIndex = index;
        this.audio.onended = () => {
          this.audio = null;
          this.audioIndex = null;
        };
      }, 100);
    },
    stopAudio() {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
        this.audioIndex = null;
      }
    },
    setName() {
      let data = new Date();
      let year = data.getFullYear();
      let month = String(data.getMonth() + 1).padStart(2, "0");
      let day = String(data.getDate()).padStart(2, "0");
      let hours = String(data.getHours()).padStart(2, "0");
      let minutes = String(data.getMinutes()).padStart(2, "0");
      let seconds = String(data.getSeconds()).padStart(2, "0");
      let base = year + '-' + month + '-' + day + '_' + hours + '-' + minutes + '-' + seconds

      let result = [];
      for (let i = 1; i <= this.tableData.length; i++) {
        result.push(base + '_' + i);
      }

      return result;
    },
    verify() {
      getAction('/verify/activation').then(res => {
        if (res.data.status === 'success') {
          this.generateVideo()
        } else {
          this.$alert(res.data.message, "验证失败");
        }
      }).catch(err => {
        console.log(err)
      })
    },
    generateVideo() {
      if (!this.figure.video_id && this.material_list.length === 0) {
        this.$alert('请先选择角色或素材', "提示")
        return;
      }
      if (this.tableData.length === 0) {
        this.$alert('请先添加口播文案', "提示")
        return;
      }
      if (this.withTitle && this.tableData.some(item => item.title === "")) {
        this.$alert('开启字幕标题设置后，所有标题不能为空', "提示");
        return
      }
      this.actualRequest = this.montageForm.request
      this.replaceName.forEach((item, index) => {
        this.actualRequest = this.actualRequest.replace(item, `{${this.replaceId[index]}}`)
      })
      let name = this.setName()
      let background_colors = this.subtitleParams.background_color.replace(/rgba|\(|\)|\s/g, '').split(',');
      let name_background_colors = this.subtitleNameParams.name_background_color.replace(/rgba|\(|\)|\s/g, '').split(',');
      let params = {
        video_id: this.figure.video_id,
        material_list: this.material_list,
        voice_id: this.sound.voice_id,
        bgm_id: this.bgm.id,
        bg_volume: this.bg_volume,
        filename_list: name,
        user_request: this.actualRequest,
        reverse: this.reverse,
        text_list: this.tableData.map(item => item.text),
        with_subtitle: this.withSubtitle,
        with_title: this.withTitle,
        subtitle_params: {
          y_offset: this.bottomOffset,
          font: this.subtitleParams.font,
          fontsize: this.subtitleParams['fontsize'],
          color: this.subtitleParams.color,
          stroke_color: this.subtitleParams.stroke_color,
          use_background: this.use_background,
          background_color: background_colors.slice(0, 3).map(Number),
          background_opacity: Number(background_colors[3])
        },
        title_params: {
          y_offset: this.topOffset,
          title_text_list: this.tableData.map(item => item.title),
          font: this.subtitleNameParams.name_font,
          fontsize: this.subtitleNameParams.name_fontsize,
          color: this.subtitleNameParams.name_color,
          stroke_color: this.subtitleNameParams.name_stroke_color,
          use_background: this.name_use_background,
          background_color: name_background_colors.slice(0, 3).map(Number),
          background_opacity: Number(name_background_colors[3])
        },
      };
      postAction("/figure/generate_video_v2", params).then((res) => {
        if (res.data.status === "success") {
          this.$alert('已创建视频生成任务，视频生成成功后会自动下载到本地', "任务创建提醒");
          sessionStorage.removeItem('tableData')
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
    bgmUploadSuccess(res, file) {
      if (res.status === "success") {
        this.$notify({
          title: "上传提示",
          message: `${file.name}背景音乐上传成功`,
          duration: 20000,
          type: "success",
        });
        this.queryBgm()
      } else {
        this.$notify({
          title: "上传提示",
          message: `${file.name}背景音乐上传失败，${res.data}`,
          duration: 0,
          type: "error",
        });
      }
    },
    selectResource(item) {
      if (this.isMaterial) {
        this.figure = {}
        if (!this.material_list.includes(item.id)) {
          this.material_list.push(item.id)
          this.mentionList.push(item)
        } else {
          this.material_list.splice(this.material_list.indexOf(item.id), 1)
          this.mentionList.splice(this.mentionList.indexOf(item), 1)
        }
      }else {
        this.material_list = []
        this.mentionList = []
        this.figure = this.figure.id === item.id? {} : item
      }
      sessionStorage.setItem('figure', JSON.stringify(this.figure))
      sessionStorage.setItem('material_list',JSON.stringify(this.material_list))
      sessionStorage.setItem('mention_list',JSON.stringify(this.mentionList))
    },
    selectVoice(voice) {
      this.sound = voice
      sessionStorage.setItem("setting_voice", JSON.stringify(voice))
    },
    selectBgm(item) {
      this.bgm = item
      sessionStorage.setItem("setting_bgm", JSON.stringify(item))
    },
    switchSubtitle() {
      sessionStorage.setItem("with_subtitle", this.withSubtitle)
      this.activeNames = this.withSubtitle ? ['1'] : []
    },
    switchTitle() {
      sessionStorage.setItem("with_title", this.withTitle)
      this.activeTitleNames = this.withTitle ? ['1'] : []
    },
    saveBgmVolume() {
      sessionStorage.setItem("bg_volume", this.bg_volume)
    },
    switchUseBackground() {
      sessionStorage.setItem("use_background", this.use_background)
    },
    switchNameUseBackground() {
      sessionStorage.setItem("name_use_background", this.name_use_background)
    },
    selectTitlePreset(item) {
      this.activeTitlePresetId = item.id
      sessionStorage.setItem('title_preset_id', item.id)
      this.subtitleNameParams.name_background_color = item.backgroundColor
      sessionStorage.setItem('name_background_color', item.backgroundColor)
      this.subtitleNameParams.name_color = item.color
      sessionStorage.setItem('name_color', item.color)
      this.subtitleNameParams.name_font = item.fontFamily
      sessionStorage.setItem('name_font', item.fontFamily)
      this.subtitleNameParams.name_fontsize = 10
      sessionStorage.setItem('name_fontsize', '10')
      this.subtitleNameParams.name_stroke_color = item.stroke
      sessionStorage.setItem('name_stroke_color', item.stroke)
      this.updateTitleTextStyle()
    },
    updateTitleTextStyle() {
      this.titleTextStyle = {
        backgroundColor: this.subtitleNameParams.name_background_color,
        color: this.subtitleNameParams.name_color,
        fontFamily: this.subtitleNameParams.name_font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleNameParams.name_stroke_color}`,
        fontSize: (410 * this.subtitleNameParams.name_fontsize / 100) + 'px',
        top: this.topOffset + 'px'
      }
    },
    saveSubtitleNameParams(key) {
      let value = this.subtitleNameParams[key]
      this.updateTitleTextStyle()
      sessionStorage.setItem(key, value)
      this.activeTitlePresetId = '0'
      sessionStorage.setItem('title_preset_id', '0')
      this.$forceUpdate()
    },
    selectPreset(item) {
      this.activePresetId = item.id
      sessionStorage.setItem('preset_id', item.id)
      this.subtitleParams.background_color = item.backgroundColor
      sessionStorage.setItem('background_color', item.backgroundColor)
      this.subtitleParams.color = item.color
      sessionStorage.setItem('color', item.color)
      this.subtitleParams.font = item.fontFamily
      sessionStorage.setItem('font', item.fontFamily)
      this.subtitleParams['fontsize'] = 5
      sessionStorage.setItem('fontsize', '5')
      this.subtitleParams.stroke_color = item.stroke
      sessionStorage.setItem('stroke_color', item.stroke)
      this.updateTextStyle()
    },
    updateTextStyle() {
      this.textStyle = {
        backgroundColor: this.subtitleParams.background_color,
        color: this.subtitleParams.color,
        fontFamily: this.subtitleParams.font,
        lineHeight: 1,
        '-webkit-text-stroke': `0.5px ${this.subtitleParams.stroke_color}`,
        fontSize: (410 * this.subtitleParams['fontsize'] / 100) + 'px',
        top: this.bottomOffset + 'px'
      }
    },
    saveSubtitleParams(key) {
      let value = this.subtitleParams[key]
      this.updateTextStyle()
      sessionStorage.setItem(key, value)
      this.activePresetId = '0'
      sessionStorage.setItem('preset_id', '0')
      this.$forceUpdate()
    },
    switchReverse() {
      sessionStorage.setItem("reverse", this.reverse)
    },
    switchMontage() {
      if (this.montage) {
        this.openMontageDialog()
      } else {
        this.montageForm.request = ''
        this.replaceName = []
        this.replaceId = []
      }
    },
    openMontageDialog() {
      this.montageDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.inputRef) {
          const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
          this.replaceDivHeight = inputEl.clientHeight
          inputEl.addEventListener('scroll', this.handleScroll);
        }
      })
    },
    closeMontageDialog() {
      const inputEl = this.$refs.inputRef.$el.querySelector('textarea')
      inputEl.removeEventListener('scroll', this.handleScroll);
      this.montageDialogVisible = false
    }
  },
};
</script>

<style scoped>
.video {
  width: 100%;
  height: 100%;
  min-height: 800px;
  min-width: 1280px;
  padding: 5px 0;
  box-sizing: border-box;
  overflow: auto;
  display: flex;
}

.video-left {
  width: calc(100% - 420px);
}

.video-right {
  max-width: 420px;
  display: flex;
}

.preview-setting {
  max-width: 412px;
  margin-left: 8px;
  border-radius: 20px;
  border: 1px solid #bbbbbb;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.preview-title {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 20px 0;
  cursor: move;
  user-select: none;
}

.preview-content {
  position: absolute;
  width: 100%;
  text-align: center;
  padding: 20px 0;
  cursor: move;
  user-select: none;
}

.noneBackground {
  background: none !important;
}

.video-title {
  color: #1e1f20;
  font-size: 15px;
}

.ai-generate-btn {
  color: #4c8df1;
  font-size: 14px;
  flex: 1;
  cursor: pointer;
  margin-right: 65px;
}

.table-column {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.video-card-list {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 5px 15px 15px 15px;
  box-sizing: border-box;
}

.video-template {
  width: 100%;
  height: 195px;
  margin-top: 7px;
  display: grid;
  overflow-y: auto;
  overflow-x: hidden;;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-template-rows: 195px;
  gap: 15px;
  position: relative;
}

.template-img {
  width: 120px;
  height: 160px;
  margin: 5px;
  border-radius: 10px;
}

.template-name {
  font-size: 15px;
  color: #1e1f20;
  width: 120px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 auto;
}

.voice-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
}

.preset {
  height: 40px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px
}

.preset-style {
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 3px;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
}

.play-btn {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid #f3f3f3;
  background-color: rgb(247, 247, 247, 0.8);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.popover-content {
  width: 350px;
  height: 250px;
  border-radius: 10px;
  overflow: auto;
}

.voice-item {
  height: 80px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.active {
  background-color: #e0e7fb;
}

.voice-icon {
  width: 42px;
  height: 37px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #c7d4f8;
  border-radius: 10px;
}

.voice-name {
  width: 100px;
  margin-left: 10px;
  font-size: 14px;
  color: #101010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sound {
  width: 200px;
  height: 35px;
  border-radius: 5px;
  margin-left: 10px;
  background-color: rgb(247, 247, 247, 0.8);
  border: 1px solid #f3f3f3;
  display: flex;
  align-items: center;
}

.sound-name {
  width: calc(100% - 60px);
  height: 40px;
  color: #1e1f20;
  font-size: 14px;
  margin-left: 20px;
  line-height: 40px;
}

.text-card {
  width: 100%;
  height: calc(100vh - 630px);
  margin-top: 10px;
  min-height: 227px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
}

.video-input {
  width: calc(100% - 70px);
}

.video >>> .el-textarea__inner {
  resize: none;
  background-color: #f9f9f9;
  height: 100%;
  border: none;
  border-radius: 7px;
  padding: 10px 15px;
}

.text-tips {
  position: absolute;
  bottom: 50%;
  left: 50%;
  color: #9a9a9a;
  transform: translate(-50%, 50%);
}

.generate-btn {
  width: 126px;
  border-radius: 4px;
  margin-left: calc(50% - 63px);
}

.video >>> .el-slider__button {
  height: 18px;
  width: 4px;
  border-radius: 2px;
  border: none;
  background-color: #E4E7ED;
}

.video >>> .el-slider__button-wrapper {
  height: 33px;
}

.video >>> .el-slider__runway {
  height: 3px;
}

.video >>> .el-slider__bar {
  height: 3px;
}

.el-select >>> .el-input__inner {
  height: 30px;
  line-height: 30px;
  padding-right: 35px !important;
}

.el-select >>> .el-input__icon {
  line-height: 30px;
}

.text-input >>> .el-input__inner {
  height: 30px;
  line-height: 30px;
  padding-right: 35px !important;
}

.text-input >>> .el-input-number {
  width: 80px
}

.text-input >>> .el-input-number__decrease {
  width: 20px;
  height: 15px !important;
  line-height: 15px !important;
  bottom: 5px !important;
}

.text-input >>> .el-input-number__increase {
  width: 20px;
  height: 14px !important;
  line-height: 14px !important;
  top: 5px !important;
}

.text-input >>> .el-input__icon {
  line-height: 30px;
}

.el-select-dropdown__item {
  height: 52px;
  line-height: 52px;
}

.video >>> .el-collapse {
  border: none !important;
  margin-top: 0 !important;
}

.video >>> .el-collapse-item__header {
  height: 21px;
  line-height: 21px;
  border: none;
  font-size: 15px;
  color: #1e1f20;
}

.video >>> .el-collapse-item__content {
  padding-bottom: 0;
  margin-top: 15px;
}

.video >>> .el-collapse-item__wrap {
  border: none !important;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.input-with-button {
  flex: 1;
  margin-right: 10px;
}

.video >>> .el-form-item {
  margin-bottom: 15px !important;
}

.video >>> .el-form-item__label {
  padding: 0 !important;
}

.dropdown {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  position: absolute;
  z-index: 999;
  width: 180px;
  height: 200px;
  overflow: auto;
}

.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown li {
  padding: 6px 10px;
  cursor: pointer;
}

.dropdown li:hover {
  background-color: #f0f0f0;
}

.highlight-content {
  padding: 10px 15px;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: #f9f9f9;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
  z-index: 1;
}

.input-layer {
  position: relative;
  z-index: 2;
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  caret-color: black;
}

.input-layer >>> .el-textarea__inner {
  background-color: transparent;
  color: transparent; /* 让文字看不见 */
  font-size: 14px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  border-radius: 4px;
  box-shadow: none;
  resize: none;
  transition: border-color 0.2s ease-in-out;
}

.video >>> .el-table__cell {
  padding: 0;
}

.video >>> .cell {
  line-height: 50px;
}

.warning {
  background-color: red;
  color: #ffffff;
  height: 14px;
  line-height: 14px;
  font-size: 10px;
  width: 14px;
  border-radius: 50%;
  position: absolute;
  top: 12px;
  right: -5px;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
</style>
