<template>
  <div class="system">
    <div class="page-title">设置</div>
    <div class="page-content">
      <div class="section-title">账户信息</div>
      <div class="section-card" style="margin-bottom: 24px;">
        <div class="flex-center margin-b-8">
          <div style="flex: 1">
            <div class="token-label">剩余Tokens</div>
            <div style="display: flex">
              <div class="token-value">{{ info.remaining_tokens || 0 }}</div>
              <div class="token-history" @click="billVisible = true">账单详情</div>
            </div>
          </div>
          <div class="top_up_btn">
            <el-button @click="topUp">充值</el-button>
          </div>
        </div>
        <el-progress :show-text="false" :stroke-width="10" :percentage="percentage" color="#3b82f6"
                     define-back-color="#e5e7eb"></el-progress>
      </div>
      <div class="section-title">应用设置</div>
      <div class="section-card" style="margin-bottom: 24px;">
        <div class="flex-center">
          <div style="flex: 1">
            <div class="path-label">视频缓存路径</div>
            <div class="path-value">{{ downloadPath }}</div>
          </div>
          <div class="select_btn">
            <el-button @click="chooseFolder">选择</el-button>
          </div>
        </div>
      </div>
      <div class="section-title">关于产品</div>
      <div class="section-card">
        <div class="about-section">
          <div class="about-title">产品说明</div>
          <div class="about-text">
            "奇点"是一款集成了前沿AI技术的智能内容创作工具。我们致力于通过AI大模型、声音克隆、视频生成等功能，为您打破创意边界，赋能您的数字化内容生产。无论您是内容创作者、营销人员还是技术爱好者，奇点都将是您强大的创意伙伴。
          </div>
        </div>
        <div class="about-section">
          <div class="about-title">联系我们</div>
          <div class="about-text">
            遇到问题或有任何建议？请通过以下方式联系我们：
          </div>
          <a href="#" class="link" @click="dialogVisible = true">support@qidian-ai.com</a>
        </div>
        <div class="about-title">法律条款</div>
        <div class="links-list">
          <a href="#" class="link" @click="goto('/agreement')">用户协议</a>
          <a href="#" class="link">隐私政策</a>
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div class="footer-text">奇点 v2.1.0 - © 2025 奇点AI团队</div>
    </div>
    <el-dialog class="contact-us-dialog" title="联系我们" :visible.sync="dialogVisible" width="500px">
      <div class="contact-us">
        <div style="font-size: 15px; font-weight: bold;color: #000000;margin: 10px 0;">广东省奇点未来软件研发</div>
        <el-image style="width: 200px; height: 200px;" :src="require('/public/images/qrcode.png')" fit="cover">
        </el-image>
        <div style="margin-top: 20px;font-size: 14px;color: #000000;">使用手机微信扫一扫，添加客服微信</div>
      </div>
    </el-dialog>
    <el-dialog class="bill-dialog" title="账单详情" :visible.sync="billVisible" width="50%">
      <el-table :data="gridData" stripe height="400">
        <el-table-column property="model" label="model"></el-table-column>
        <el-table-column property="expend" label="消耗Token" width="200" align="right"></el-table-column>
        <el-table-column property="residue" label="剩余Token" width="200" align="right"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import {getAction} from "@/api/api";
import axios from "axios";

export default {
  name: 'system',
  data() {
    return {
      dialogVisible: false,
      downloadPath: '',
      info: {},
      percentage: 0,
      bill: [],
      billVisible: false,
      gridData: [{
        model: '生成数字人口播视频',
        expend: '154',
        residue: '1846'
      }, {
        model: '克隆形象',
        expend: '56',
        residue: '1790'
      }, {
        model: 'AI生成文案',
        expend: '80',
        residue: '1710'
      }, {
        model: '克隆音色',
        expend: '42',
        residue: '1668'
      }],
    }
  },
  mounted() {
    this.downloadPath = localStorage.getItem('downloadPath') || 'C:\\offline'
    this.getInfo()
  },
  methods: {
    getInfo() {
      axios.get("http://127.0.0.1:9669/get_remaining_tokens").then((res) => {
        if (res.data.status === 'success') {
          this.info = res.data.data
          this.percentage = (this.info.remaining_tokens / this.info.total_tokens) * 100
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    topUp() {
      this.$alert('充值功能暂未开放，充值请通过下方联系客服充值。', '提示')
    },
    chooseFolder() {
      window.electronAPI.selectFolder().then((path) => {
        if (path) {
          this.downloadPath = path
          localStorage.setItem('downloadPath', path)
        }
      })
    },
    goto(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.system {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.page-title {
  font-size: 32px;
  line-height: 1.5;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 24px;
}

.page-content {
  margin: 0 auto;
  max-width: 1024px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 16px;
}

.section-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.token-label {
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 4px;
}

.token-value {
  color: #111827;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
}

.token-history {
  font-size: 14px;
  color: #b3b5b4;
  line-height: 32px;
  margin-left: 16px;
  cursor: pointer;
}

.token-history:hover {
  text-decoration: underline;
}

.path-label {
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 4px;
}

.path-value {
  color: #111827;
  line-height: 32px;
}

.top_up_btn >>> .el-button {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 8px 24px;
  background-color: #3b82f6;
  border-radius: 6px;
}

.top_up_btn >>> .el-button:hover {
  background-color: #2563eb;
}

.select_btn >>> .el-button {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: 8px 24px;
  background-color: transparent;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.select_btn >>> .el-button:hover {
  background-color: #f3f4f6;
}

.about-section {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.about-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.about-text {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  line-height: 1.6;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.links-list {
  display: flex;
  gap: 8px;
}

.page-footer {
  margin-top: 24px;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #94a3b8;
}

.contact-us-dialog >>> .el-dialog__body {
  padding-top: 0 !important;
}

.contact-us {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bill-dialog >>> .el-dialog {
  border-radius: 8px;
}

.bill-dialog >>> .el-dialog__header {
  font-weight: 600;
}

.bill-dialog >>> .el-dialog__body {
  padding-top: 0 !important;
}
</style>