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
              <div class="token-history" @click="billDetail">账单详情</div>
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
      <div class="footer-text">奇点 v0.2.0 - © 2025 奇点AI团队</div>
    </div>
    <el-dialog class="contact-us-dialog" title="联系我们" :visible.sync="dialogVisible" width="500px">
      <div class="contact-us">
        <div style="font-size: 15px; font-weight: bold;color: #000000;margin: 10px 0;">广东省奇点未来软件研发</div>
        <el-image style="width: 200px; height: 200px;" :src="require('/public/images/qrcode.png')" fit="cover">
        </el-image>
        <div style="margin-top: 20px;font-size: 14px;color: #000000;">使用手机微信扫一扫，添加客服微信</div>
      </div>
    </el-dialog>
    <el-dialog class="bill-dialog" title="账单详情" :visible.sync="billVisible" width="800px">
      <el-table :data="bills" stripe height="336">
        <el-table-column property="function_name" label="function_name" align="center"></el-table-column>
        <el-table-column property="cost" label="token变动" align="right" width="150px">
          <template slot-scope="scope">
            {{ scope.row.function_name === '充值'? '+ ' : '- ' }}{{ scope.row.cost }}
          </template>
        </el-table-column>
        <el-table-column property="balance" label="剩余token" align="right" width="150px"></el-table-column>
        <el-table-column property="created_at" label="创建时间" align="center" width="250px"></el-table-column>
      </el-table>
      <div style="text-align: right;">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="iPagination.currentPage"
            :page-sizes="iPagination.pageSizes"
            :page-size="iPagination.pageSize"
            :total="iPagination.total"
            :pager-count="iPagination.pagerCount"
            layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </el-dialog>
    <el-dialog class="top-up-dialog" title="账户充值" :visible.sync="topUpVisible" width="800px" :before-close="beforeClosePay">
      <el-form :model="rechargeForm" :rules="rules" ref="rechargeFormRef" label-width="100px">
        <el-form-item label="充值金额" prop="amount">
          <el-input v-model.number="rechargeForm.amount" placeholder="请输入充值金额" prefix-icon="el-icon-money"
          @input="loadQrCode"></el-input>
          <div class="quick-amounts">
            <div v-for="amount in quickAmounts" :key="amount"
                 class="amount-item" :class="{'amount-item-active' : amount === rechargeForm.amount}"
                 @click="setAmount(amount)">{{ amount }}元
            </div>
          </div>
        </el-form-item>

        <el-form-item label="支付方式" prop="paymentMethod">
          <el-radio-group v-model="rechargeForm.paymentMethod" @change="loadQrCode">
            <el-radio label="wechatPay">
              <i class="el-icon-wechat"></i> 微信支付
            </el-radio>
<!--            <el-radio label="aliPay">-->
<!--              <i class="el-icon-alipay"></i> 支付宝-->
<!--            </el-radio>-->
<!--            <el-radio label="unionpay">-->
<!--              <i class="el-icon-credit-card"></i> 银联支付-->
<!--            </el-radio>-->
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <div style="width: calc(100% - 100px);text-align: center">
            <div class="qrcode" v-loading="qr_loading" element-loading-spinner="el-icon-loading">
              <el-image :src="codeInfo.code_url" fit="cover" v-if="!qr_loading"></el-image>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import {IPaginationMixin} from "@/mixins/IPaginationMixin";

export default {
  name: 'system',
  mixins: [IPaginationMixin],
  data() {
    return {
      dialogVisible: false,
      downloadPath: '',
      info: {},
      percentage: 0,
      bills: [],
      billVisible: false,
      filterBillForm: {
        function_name: '',
      },
      topUpVisible: false,
      qr_loading: true,
      rechargeForm: {
        amount: 0,
        paymentMethod: 'wechatPay',
      },
      codeInfo: {},
      rules: {
        amount: [
          { required: true, message: '请输入充值金额', trigger: 'blur' },
          { type: 'number', message: '充值金额必须为数字', trigger: 'blur' },
        ],
        paymentMethod: [
          { required: true, message: '请选择支付方式', trigger: 'change' }
        ]
      },
      quickAmounts: [10, 50, 100, 200, 500, 1000],
      timer: null
    }
  },
  mounted() {
    this.downloadPath = localStorage.getItem('downloadPath') || 'C:\\offline'
    this.getInfo()
  },
  methods: {
    getInfo(payer_total) {
      let params = {
        add_total: payer_total? payer_total * 10 : 0
      }
      axios.get("http://127.0.0.1:9669/get_remaining_tokens", {params: params}).then((res) => {
        if (res.data.status === 'success') {
          this.info = res.data.data
          this.percentage = (this.info.remaining_tokens / this.info.total_tokens) * 100
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(() => {
        this.$message.error('获取信息失败，请稍后再试')
      })
    },
    billDetail() {
      this.billVisible = true
      this.iPagination.currentPage = 1
      this.iPagination.pageSize = 10
      this.getBill()
    },
    getBill() {
      let params = {
        pageSize: this.iPagination.pageSize,
        currentPage: this.iPagination.currentPage
      }
      axios.get('http://127.0.0.1:9669/get_api_call_log',{ params: params }).then(res => {
        if (res.data.status === 'success') {
          this.bills = res.data.data.api_call_log_list || []
          this.iPagination.total = res.data.data.total || 0
        }else {
          this.$message.error(res.data.message)
        }
      }).catch(() => {
        this.$message.error('获取账单失败，请稍后再试')
      })
    },
    handleSizeChange(val) {
      this.iPagination.currentPage = 1
      this.iPagination.pageSize = val
      this.getBill()
    },
    handleCurrentChange(val) {
      this.iPagination.currentPage = val
      this.getBill()
    },
    setAmount(amount) {
      this.rechargeForm.amount = amount;
      this.loadQrCode()
    },
    loadQrCode() {
      this.qr_loading = true
      let params = {
        amount: this.rechargeForm.amount,
        type: this.rechargeForm.paymentMethod,
      }
      axios.post('http://127.0.0.1:9669/recharge_balance',params).then(res => {
        if (res.data.status === 'success') {
          this.codeInfo = res.data.data
          this.qr_loading = false
          this.timer = setInterval(() => {
            this.queryQrCodeStatus()
          },1000)
        } else {
          this.$message.error(res.data.message)
        }
      }).catch(() => {
        this.$message.error('支付二维码失败，请稍后再试')
      })
    },
    queryQrCodeStatus() {
      let params = {
        payment_id: this.codeInfo.payment_id
      }
      axios.get('https://live.tellai.tech/api/pay/wx/payment',{params: params}).then(res => {
        if (res.data.status === 'success') {
          let status = res.data.data.trade_state
          switch (status) {
            case 'SUCCESS':  //支付成功
              this.getInfo(res.data.data.payer_total || 0)
              this.beforeClosePay()
              break
            case 'REFUND':   //转入退款
              this.beforeClosePay()
              break
            case 'CLOSED':   //关闭订单
              this.beforeClosePay()
              this.$alert('已关闭订单','充值提示')
              break
          }
        } else {
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
          this.$message.error(res.data.message)
        }
      }).catch(() => {
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
        this.$message.error('获取二维码状态失败，请稍后再试')
      })
    },
    beforeClosePay() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.topUpVisible = false
    },
    resetForm() {
      this.$refs.rechargeFormRef.resetFields();
      this.rechargeForm.amount = 0;
      this.rechargeForm.paymentMethod = 'wechatPay';
      this.qr_loading = true
    },
    topUp() {
      this.topUpVisible = true
      this.$nextTick(() => {
        this.resetForm()
      })
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

::v-deep .el-alert {
  align-items: start;
}

::v-deep .el-alert__icon {
  font-size: 20px !important;
  width: 16px !important;
  line-height: 40px;
}

.quick-amounts {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.amount-item {
  padding: 9px 15px;
  font-size: 12px;
  border-radius: 3px;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #FFF;
  border: 1px solid #DCDFE6;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  transition: .1s;
  font-weight: 500;
}

.amount-item-active {
  color: #409EFF;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.qrcode {
  height: 200px;
  width: 200px;
  margin: 0 auto;
  border: 1px solid #DCDFE6;
  border-radius: 5px;
}

::v-deep .el-icon-loading {
  font-size: 30px;
  color: #8e8f93;
}
</style>