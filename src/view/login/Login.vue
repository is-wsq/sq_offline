<template>
  <div class="login">
    <div class="container">
      <div class="login-logo">
<!--        <div class="login-logo-icon">奇</div>-->
        <span class="login-logo-text">欢迎使用奇点AI矩阵</span>
      </div>
      <el-form :model="form" ref="form" class="login-form" :rules="rules">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="password">
          <div class="flex-center" style="width: 100%">
            <el-input style="flex: 1" v-model="form.password" type="password" placeholder="请输入验证码"></el-input>
            <div class="send-sms-button" @click="onSMSSend">
              {{ getSendBtnText }}
            </div>
          </div>
        </el-form-item>
        <div class="flex-center">
          <el-button style="width: 250px;" type="primary" class="btn" @click="handleLogin">登录/注册</el-button>
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
      form: {
        phone: '',
        password: '',
      },
      rules: {
        phone: [
          {required: true, message: '请输入手机号', trigger: 'blur'},
          {min: 11, max: 11, message: '请输入正确的手机号', trigger: 'change'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur'}
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
    onSMSSend() {
      this.smsCountDown = 60;
      this.startSMSTimer();
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
      setTimeout(() => {
        this.$router.push({path: '/ai'})
        this.$message.success('登录成功')
      }, 1000)
      // postAction('/user/login', this.form).then(response => {
      //   if (response.data.status === 'success') {
      //     this.$message.success('登录成功');
      //   } else {
      //     this.$message.error(response.data.message);
      //   }
      // })
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
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 600px;
  margin: auto;
}

.login-logo {
  display: flex;
  align-items: center;
  height: 60px;
  width: 60%;
  position: relative;
  background: #ffffff;
  margin: 0 auto;
  box-sizing: border-box;
}

.login-logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.login-logo-text {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937, #4b5563);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-form {
  margin: 20px auto;
  width: 60%;
}

.send-sms-button {
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
  width: 150px;
  border-radius: 6px;
  margin-top: 20px;
}
</style>
