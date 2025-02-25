<template>
  <div class="register">
    <div class="register-container">
      <span style="font-size: 30px;font-weight: bold;color: #5478FE">奇点</span>
      <el-form :model="form" ref="form" class="login-form" :rules="rules">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="rePassword">
          <el-input v-model="form.rePassword" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="btn" @click="handleLogin">登录</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn" @click="createAccount">创建账户</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {postAction} from "@/api/api";

export default {
  name: 'Register',
  data() {
    return {
      form: {
        phone: '',
        password: '',
        rePassword: '',
      },
      rules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { min: 11, max: 11, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
        ],
        rePassword: [
          { required: true, message: '请确认密码', trigger: ['blur','change'] },
          { validator: this.checkConfirmPassword, trigger: ['blur','change'] }
        ]
      },
    };
  },
  methods: {
    handleLogin() {
      this.$router.push({path: '/'})
    },
    checkConfirmPassword(rule, value, callback) {
      if (value === '') {
        callback(new Error('请确认新密码'));
      } else if (value !== this.form.rePassword) {
        callback(new Error('确认密码与新密码不一致'));
      } else {
        callback();
      }
    },
    createAccount() {
      postAction('/user/register', this.form).then(res => {
        if (res.data.status === 'success') {
          this.$message.success('注册成功，请登录');
          this.$router.push({path: '/'})
        } else {
          this.$message.error(res.data.message);
        }
        this.form = {}
      })
    }
  }
};
</script>

<style scoped>
.register {
  width: 100%;
  height: 100vh;
  min-height: 700px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/src/assets/login_bg_md.png');
  background-size: cover;
}

.register-container {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 700px;
  margin: auto;
}

.login-form {
  margin: 50px auto;
  width: 50%;
}

.btn {
  width: 150px;
  border-radius: 15px;
  margin-top: 20px;
}
</style>
