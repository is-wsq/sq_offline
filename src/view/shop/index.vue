<template>
  <div class="shop-management-container">
    <div class="page-header">
      <h2 class="page-title">品牌店铺管理</h2>
      <el-button type="primary" icon="el-icon-plus" @click="handleAddShop" class="add-shop-btn">创建新店铺</el-button>
    </div>

    <div class="shop-list" v-if="shops.length > 0">
      <div class="shop-card" v-for="shop in shops" :key="shop.id">
        <div class="card-header">
          <h3 class="shop-name">{{ shop.name }}</h3>
          <div class="card-actions">
            <el-button size="mini" circle icon="el-icon-edit" @click="handleEditShop(shop)"></el-button>
            <el-button size="mini" circle icon="el-icon-delete" type="danger" @click="handleDeleteShop(shop.id)"></el-button>
          </div>
        </div>
        <div class="card-body">
          <div class="shop-info-item">
            <strong class="info-label">主推产品:</strong>
            <p class="info-content">{{ shop.mainProducts || '暂未填写' }}</p>
          </div>
          <div class="shop-info-item">
            <strong class="info-label">优势卖点:</strong>
            <p class="info-content">{{ shop.sellingPoints || '暂未填写' }}</p>
          </div>
          <div class="shop-info-item">
            <strong class="info-label">目标用户:</strong>
            <p class="info-content">{{ shop.targetAudience || '暂未填写' }}</p>
          </div>
          <div class="shop-info-item">
            <strong class="info-label">产品套餐:</strong>
            <p class="info-content">{{ shop.productPackage? resolutionName(shop.productPackage) : '暂未填写' }}</p>
          </div>
          <div class="shop-info-item">
            <strong class="info-label">店铺地址:</strong>
            <p class="info-content">{{ shop.shopAddress || '暂未填写' }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <el-empty description="您还没有创建任何店铺，点击右上角开始创建吧！"></el-empty>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" custom-class="shop-dialog">
      <el-form ref="form" :model="currentShop" :rules="rules" label-width="100px">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="currentShop.name" placeholder="请输入店铺名称"></el-input>
        </el-form-item>
        <el-form-item label="主推产品" prop="mainProducts">
          <el-input type="textarea" v-model="currentShop.mainProducts" placeholder="例如：高品质男士衬衫、商务休闲裤"></el-input>
        </el-form-item>
        <el-form-item label="优势卖点" prop="sellingPoints">
          <el-input type="textarea" v-model="currentShop.sellingPoints" placeholder="例如：意大利进口面料、大师级剪裁"></el-input>
        </el-form-item>
        <el-form-item label="目标用户" prop="targetAudience">
          <el-input type="textarea" v-model="currentShop.targetAudience" placeholder="例如：25-40岁的都市白领"></el-input>
        </el-form-item>
        <el-form-item label="产品套餐" prop="productPackage">
          <el-select v-model="currentShop.productPackage" multiple collapse-tags placeholder="请选择">
            <el-option
                v-for="item in productPackages"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺地址" prop="shopAddress">
          <el-input type="textarea" v-model="currentShop.shopAddress" placeholder="例如：xx市xx区xxx路xxxx号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'ShopManagement',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      isEdit: false,
      currentShop: {},
      rules: {
        name: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' }
        ]
      },
      productPackages: [
        { label: '套餐一', value: 'package1' },
        { label: '套餐二', value: 'package2' },
        { label: '套餐三', value: 'package3' },
        { label: '套餐四', value: 'package4' },
      ]
    }
  },
  computed: {
    ...mapGetters('shop', ['shops']),
    dialogTitle() {
      return this.isEdit ? '编辑店铺' : '添加新店铺'
    },
  },
  methods: {
    ...mapActions('shop', ['addShop', 'updateShop', 'deleteShop']),
    resolutionName(packages) {
      let names = packages.map(item => { return this.productPackages.find(p => p.value === item).label });
      return names.join('、');
    },
    handleAddShop() {
      this.isEdit = false
      this.currentShop = {}
      this.dialogVisible = true
    },
    handleEditShop(shop) {
      this.isEdit = true
      this.currentShop = { ...shop }
      this.dialogVisible = true
    },
    handleDeleteShop(shopId) {
      this.$confirm('此操作将永久删除该店铺, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteShop(shopId)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.handleFormSubmit(this.currentShop)
        } else {
          return false
        }
      })
    },
    handleFormSubmit(shopData) {
      if (this.isEdit) {
        this.updateShop(shopData)
        this.$message.success('店铺更新成功！')
      } else {
        const newShop = { id: uuidv4(), ...shopData }
        this.addShop(newShop)
        this.$message.success('店铺添加成功！')
      }
      this.dialogVisible = false
    },
  }
}
</script>

<style scoped>
.shop-management-container {
  padding: 24px 32px;
  background-color: #f8fafc;
  min-height: calc(100vh - 50px); /* Adjust based on your header height */
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.add-shop-btn {
  font-weight: 500;
}

.shop-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.shop-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s ease-in-out;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.shop-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.shop-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-body {
  padding: 16px 20px;
}

.shop-info-item {
  margin-bottom: 12px;
}

.shop-info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;
}

.info-content {
  font-size: 14px;
  color: #374151;
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap; /* Allows wrapping and respects newlines */
  word-wrap: break-word;
}

.empty-state {
  margin-top: 80px;
}

.dialog-footer {
  text-align: right;
}

/* Style for dialog */
::v-deep .shop-dialog {
  border-radius: 12px;
}
::v-deep .el-dialog__header {
  font-weight: 600;
}

</style>