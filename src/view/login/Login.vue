<template>
  <div class="login">
    <div class="container">
      <div style="flex: 1">
        <div class="login-logo-text">欢迎使用奇点AI矩阵！</div>
        <div class="flex-center">
          <div class="login-type" :class="{'login-type-active': type === 'phone'}" @click="type = 'phone'">短信验证登陆
          </div>
          <div class="login-type" :class="{'login-type-active': type === 'pwd'}" @click="type = 'pwd'">密码登陆</div>
          <div style="flex: 1"></div>
        </div>
        <el-form :model="form" ref="form" class="login-form" :rules="rules">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password" v-if="type === 'pwd'">
            <el-input v-model="form.password" show-password placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="sms" v-if="type === 'phone'">
            <div class="flex-center" style="width: 100%">
              <el-input style="flex: 1" v-model="form.sms" placeholder="请输入验证码"></el-input>
              <div class="send-sms-button" @click="onSMSSend">
                {{ getSendBtnText }}
              </div>
            </div>
          </el-form-item>
          <div class="flex-center">
            <el-button type="primary" class="btn" @click="handleLogin">登录{{
                type === 'phone' ? '/注册' : ''
              }}
            </el-button>
          </div>
        </el-form>
      </div>
      <el-divider>其他登录方式</el-divider>
      <div class="flex-center">
        <div class="cursor-pointer" @click="onThirdLogin('wx')">
          <svg t="1761015613423" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
               width="32" height="32">
            <path
                d="M0 0m213.333333 0l597.333334 0q213.333333 0 213.333333 213.333333l0 597.333334q0 213.333333-213.333333 213.333333l-597.333334 0q-213.333333 0-213.333333-213.333333l0-597.333334q0-213.333333 213.333333-213.333333Z"
                fill="#23d86f" data-spm-anchor-id="a313x.search_index.0.i0.59253a81JwaQUO"
                class="selected"></path>
            <path
                d="M832.938667 587.306667c0-89.6-82.581333-161.898667-184.341334-161.898667s-184.341333 72.533333-184.341333 161.898667 82.581333 161.898667 184.341333 161.898666a204.053333 204.053333 0 0 0 58.176-8.277333l65.578667 33.130667-15.253333-56a155.285333 155.285333 0 0 0 75.84-130.752z m-243.84-28.117334a21.781333 21.781333 0 1 1 21.781333-21.781333 21.845333 21.845333 0 0 1-21.781333 21.802667z m119.466666 0a21.781333 21.781333 0 1 1 21.781334-21.781333 21.845333 21.845333 0 0 1-21.845334 21.802667z"
                fill="#FFFFFF"></path>
            <path
                d="M438.976 256.106667c-120.064 0-217.258667 85.333333-217.258667 191.104a183.082667 183.082667 0 0 0 82.368 149.696l-26.154666 66.24 84.586666-37.034667a244.522667 244.522667 0 0 0 76.48 12.202667c3.712 0 7.402667 0 11.114667-0.213334a162.624 162.624 0 0 1-8.064-50.56c0-100.458667 92.608-181.952 206.784-181.952h2.389333c-21.802667-85.482667-108.522667-149.482667-212.245333-149.482666z m-77.802667 154.709333a28.330667 28.330667 0 1 1 28.330667-28.330667 28.266667 28.266667 0 0 1-28.330667 28.330667z m155.584 0a28.330667 28.330667 0 1 1 28.330667-28.330667 28.266667 28.266667 0 0 1-28.330667 28.330667z"
                fill="#FFFFFF"></path>
          </svg>
        </div>
      </div>
      <div class="register-area" v-if="type !== 'phone'">
        没有账号？
        <span style="color: #409eff;cursor: pointer;" @click="createAccount">立即注册</span>
      </div>
    </div>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  data() {
    return {
      type: 'phone',
      form: {
        phone: '',
        password: '',
        sms: ''
      },
      rules: {
        phone: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {validator: this.validatePhone, trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur'}
        ],
        sms: [
          {required: true, message: '请输入验证码', trigger: 'blur'},
        ]
      },
      smsCountDown: 0,
      thirdLogins: [
        {code: 'wx', name: "微信", icon: 'wx'}
      ],
    };
  },
  computed: {
    isSendSMSEnable() {
      return this.smsCountDown <= 0
    },
    getSendBtnText() {
      if (this.smsCountDown > 0) {
        return this.smsCountDown + '秒后发送';
      } else {
        return '发送验证码';
      }
    },
  },
  methods: {
    validatePhone(rule, value, callback) {
      let checkPhone = new RegExp(/^[1]([3-9])[0-9]{9}$/);

      if (value === '') {
        callback(new Error('请填写手机号'));
      } else if (!checkPhone.test(this.form.phone)) {
        callback(new Error('手机号格式不正确'));
      } else {
        callback();
      }
    },
    onSMSSend() {
      if (!this.isSendSMSEnable) {
        return;
      }
      let checkPhone = new RegExp(/^[1]([3-9])[0-9]{9}$/);
      if (!this.form.phone || this.form.phone.length === 0) {
        this.$alert('请填写手机号', '提示');
        return
      }
      if (!checkPhone.test(this.form.phone)) {
        this.$alert('手机号输入错误，请修正后重试', '提示');
        return
      }
      let params = {
        phone: this.form.phone,
        usage: 'login',
      }
      postAction('/sms/send', params).then(res => {
        if (res.data.status === 'success') {
          this.smsCountDown = 60;
          this.startSMSTimer();
          this.$alert('短信验证码发送成功', '提示');
        } else {
          this.$alert('短信验证码发送失败：' + res.data.message, '提示');
        }
      }).catch(err => {
        console.log('短信验证码发送错误：' + err);
      })
    },
    startSMSTimer() {
      this.smsCountInterval = setInterval(() => {
        this.smsCountDown--;
        if (this.smsCountDown <= 0) {
          clearInterval(this.smsCountInterval);
        }
      }, 1000);
    },
    onThirdLogin(code) {
      const appId = 'wx48d2e02bf10f849c'
      const redirectUri = encodeURIComponent('https://tellai.tech/#/pages/login/login')
      // const redirectUri = encodeURIComponent('https://tellai.tech/#/pages/login/login')
      // const redirectUri = encodeURIComponent(`${this.getCurrentUrl()}#/pages/login/auth-callback`)
      const scope = 'snsapi_login'
      const state = 'xyz123'
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&forcePopup=true#wechat_redirect`;
      window.location.replace(authUrl)
    },
    handleLogin() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.type === 'phone') {
            this.handleSMSLogin();
          } else {
            this.handlePwdLogin();
          }
        } else {
          this.$alert('表单校验错误，请修正后重试', '提示')
        }
      });
    },
    handleSMSLogin() {
      let params = {
        phone: this.form.phone,
        code: this.form.sms,
        usage: 'login',
      }
      postAction('/sms/verify', params).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('登录成功');
          this.$router.push({path: '/ai'});
          sessionStorage.setItem('token', res.data.data.id);
          sessionStorage.setItem("userInfo", JSON.stringify(res.data.data))
        } else {
          this.$alert('登陆失败：' + res.data.message, '提示');
        }
      }).catch(err => {
        console.log('登陆错误：' + err);
      })
    },
    handlePwdLogin() {
      let params = {
        phone: this.form.phone,
        password: this.form.password,
        usage: 'login',
      }
      postAction('/user/login', params).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('登录成功');
          this.$router.push({path: '/ai'});
          sessionStorage.setItem('token', res.data.data.id);
          sessionStorage.setItem("userInfo", JSON.stringify(res.data.data))
        } else {
          this.$alert('登陆失败：' + res.data.message, '提示');
        }
      }).catch(err => {
        console.log('登陆错误：' + err);
      })
    },
    createAccount() {
      this.$router.push({path: '/register'})
    }
  }
};
</script>

<style scoped>
.login {
  width: 100%;
  height: 100%;
  min-height: 700px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
}

.container {
  background-color: white;
  padding: 20px 24px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  height: 520px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.login-logo-text {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1f2937, #4b5563);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-type {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  line-height: 35px;
  margin-right: 20px;
  margin-bottom: 10px;
  cursor: pointer;
  border-bottom: 2px solid #fff;
}

.login-type-active {
  font-weight: 700;
  color: #409eff !important;
  border-bottom: 2px solid #409eff;
}

.login-form {
  margin-top: 10px;
  width: 100%;
}

.login-form >>> .el-form-item {
  margin-bottom: 15px !important;
}

.login-form >>> .el-form-item__label {
  line-height: 32px;
}

.send-sms-button {
  text-align: center;
  width: 100px;
  height: 40px;
  line-height: 40px;
  color: #606266;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
}

.btn {
  width: 100%;
  border-radius: 4px;
  margin-top: 20px;
}

.register-area {
  text-align: center;
  color: #41464f;
  font-size: 14px;
  margin-top: 10px;
}

.login >>> .el-divider__text {
  font-size: 12px;
  color: #80838A;
}
</style>
