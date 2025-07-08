<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="店铺名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入店铺名称"></el-input>
    </el-form-item>
    <el-form-item label="主推产品" prop="mainProducts">
      <el-input type="textarea" v-model="form.mainProducts" placeholder="例如：高品质男士衬衫、商务休闲裤"></el-input>
    </el-form-item>
    <el-form-item label="优势卖点" prop="sellingPoints">
      <el-input type="textarea" v-model="form.sellingPoints" placeholder="例如：意大利进口面料、大师级剪裁"></el-input>
    </el-form-item>
    <el-form-item label="目标用户" prop="targetAudience">
      <el-input type="textarea" v-model="form.targetAudience" placeholder="例如：25-40岁的都市白领"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'ShopForm',
  props: {
    shopData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: {
        id: null,
        name: '',
        mainProducts: '',
        sellingPoints: '',
        targetAudience: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    shopData: {
      handler(newValue) {
        if (newValue) {
          this.form = { ...newValue }
        } else {
          this.reset()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('11111',this.form)
          this.$emit('submit', this.form)
        } else {
          return false
        }
      })
    },
    reset() {
      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.form = {
          id: null,
          name: '',
          mainProducts: '',
          sellingPoints: '',
          targetAudience: ''
        }
      })
    }
  }
}
</script>