<template>
  <div class="login">
    <div class="container">
      <div class="login-logo-text">欢迎使用奇点AI矩阵</div>
      <div class="flex-center">
        <div class="login-type" :class="{'login-type-active': type === 'phone'}" @click="type = 'phone'">短信验证登陆</div>
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
          <el-button type="primary" class="btn" @click="handleLogin">登录</el-button>
        </div>
        <div class="register-area">
          没有账号？
          <span style="color: #409eff;cursor: pointer;" @click="createAccount">立即注册</span>
        </div>
      </el-form>
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
      smsCountDown: 0
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
        this.$alert('请填写手机号','提示');
        return
      }
      if (!checkPhone.test(this.form.phone)) {
        this.$alert('手机号输入错误，请修正后重试','提示');
        return
      }
      let params = {
        phone: this.form.phone,
        usage: 'login',
      }
      postAction('/sms/send', params).then(res => {
        if (res.data.status ==='success') {
          this.smsCountDown = 60;
          this.startSMSTimer();
          this.$alert('短信验证码发送成功','提示');
        }else {
          this.$alert('短信验证码发送失败：' + res.data.message,'提示');
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
    handleLogin() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.type === 'phone') {
            this.handleSMSLogin();
          } else {
            this.handlePwdLogin();
          }
        } else {
          this.$alert('表单校验错误，请修正后重试','提示')
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
        if (res.data.status ==='success') {
          this.message.success('登录成功');
          this.$router.push({path: '/ai'});
          sessionStorage.setItem('token', res.data.data.user_id);
        }else {
          this.$alert('登陆失败：' + res.data.message,'提示');
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
          sessionStorage.setItem('token', res.data.data.user_id);
        }else {
          this.$alert('登陆失败：' + res.data.message,'提示');
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
  padding: 40px 140px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 600px;
  box-sizing: border-box;
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
  width: 250px;
  border-radius: 4px;
  margin-top: 20px;
}

.register-area {
  text-align: center;
  color: #41464f;
  font-size: 14px;
  margin-top: 10px;
}
</style>
