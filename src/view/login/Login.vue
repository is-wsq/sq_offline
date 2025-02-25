<template>
  <div class="login">
    <div class="container">
      <span style="font-size: 30px;font-weight: bold;color: #5478FE">奇点</span>
      <el-form :model="form" ref="form" class="login-form" :rules="rules">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn margin-bottom-20" @click="handleLogin">登录</el-button>
        </el-form-item>
        <el-form-item>
          <el-button class="btn" @click="createAccount">创建账户</el-button>
        </el-form-item>
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
    };
  },
  methods: {
    handleLogin() {
      postAction('/user/login', this.form).then(response => {
        if (response.data.status === 'success') {
          this.$message.success('登录成功');
        } else {
          this.$message.error(response.data.message);
        }
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
  height: 100vh;
  min-height: 700px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/src/assets/login_bg.png');
  background-size: cover;
}

.container {
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
