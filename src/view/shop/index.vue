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
            <el-button size="mini" circle icon="el-icon-edit" @click="handleEditShop(shop)"
                       title="编辑店铺信息"></el-button>
            <el-button size="mini" circle icon="el-icon-delete" type="danger" @click="handleDeleteShop(shop.id)"
                       title="删除店铺"></el-button>
            <!--            <el-button size="mini" circle icon="el-icon-folder-add" type="info" @click="handleAddPackage(shop)" title="添加产品套餐"></el-button>-->
          </div>
        </div>
        <div class="card-body">
          <div class="shop-info-item">
            <strong class="info-label">主推产品:</strong>
            <strong class="info-content">{{ shop.mainProducts || '暂未填写' }}</strong>
          </div>
          <div class="shop-info-item">
            <strong class="info-label">优势卖点:</strong>
            <strong class="info-content">{{ shop.sellingPoints || '暂未填写' }}</strong>
          </div>
          <div class="shop-info-item">
            <strong class="info-label">目标用户:</strong>
            <strong class="info-content">{{ shop.targetAudience || '暂未填写' }}</strong>
          </div>
          <!--          <div class="shop-info-item">-->
          <!--            <strong class="info-label">产品套餐:</strong>-->
          <!--            <template v-if="shop.productPackages && shop.productPackages.length > 0">-->
          <!--              <strong class="info-content" style="color: #3b82f6;cursor: pointer;padding-right: 10px;position: relative"-->
          <!--                      v-for="(item, index) in shop.productPackages"-->
          <!--                      :key='index' @click="handleEditPackage(shop, index)">-->
          <!--                {{ item.name }}-->
          <!--                <i class="el-icon-close close-btn" @click.stop="handleDeletePackage(shop, index)"></i>-->
          <!--              </strong>-->
          <!--            </template>-->
          <!--            <strong class="info-content" v-else>暂未添加</strong>-->
          <!--          </div>-->
          <div class="shop-info-item">
            <strong class="info-label">店铺地址:</strong>
            <strong class="info-content">{{ shop.shopAddress || '暂未填写' }}</strong>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <el-empty description="您还没有创建任何店铺，点击右上角开始创建吧！"></el-empty>
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="650px" custom-class="shop-dialog">
      <el-form ref="form" :model="currentShop" :rules="rules" label-width="80px">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="currentShop.name" placeholder="请输入店铺名称"></el-input>
        </el-form-item>
        <el-form-item label="主推产品" prop="mainProducts">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="例如：高品质男士衬衫、商务休闲裤"
                    v-model="currentShop.mainProducts" resize="none"></el-input>
        </el-form-item>
        <el-form-item label="优势卖点" prop="sellingPoints">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="例如：意大利进口面料、大师级剪裁"
                    v-model="currentShop.sellingPoints" resize="none"></el-input>
        </el-form-item>
        <el-form-item label="目标用户" prop="targetAudience">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="例如：25-40岁的都市白领"
                    v-model="currentShop.targetAudience" resize="none"></el-input>
        </el-form-item>
        <el-form-item label="店铺地址" prop="shopAddress">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="例如：xx市xx区xxx路xxxx号"
                    v-model="currentShop.shopAddress" resize="none"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submitForm" size="small">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="packageTitle" :visible.sync="packageDialogVisible" width="650px" @close="beforeClose">
      <el-form ref="packageForm" :model="currentPackage" label-width="80px" :rules="packageRules">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="currentPackage.name" placeholder="请输入套餐名称"></el-input>
        </el-form-item>
        <el-form-item label="套餐详情" prop="desc">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" placeholder="请输入套餐详情"
                    v-model="currentPackage.desc" resize="none"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="packageDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="submitPackageForm" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {delAction, getAction, postAction} from "@/api/api";

export default {
  name: 'ShopManagement',
  data() {
    return {
      shops: [],
      dialogVisible: false,
      packageDialogVisible: false,
      isEdit: false,
      currentShop: {
        name: '',
        mainProducts: '',
        sellingPoints: '',
        targetAudience: '',
        shopAddress: '',
        productPackages: []
      },
      rules: {
        name: [
          {required: true, message: '请输入店铺名称', trigger: 'blur'}
        ]
      },
      currentPackage: {
        name: '',
        desc: ''
      },
      selectedShop: {},
      packageIndex: null,
      packageRules: {
        name: [
          {required: true, message: '请输入套餐名称', trigger: 'blur'}
        ],
        desc: [
          {required: true, message: '请输入套餐详情', trigger: 'blur'}
        ],
      },
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑店铺' : '添加新店铺'
    },
    packageTitle() {
      return this.packageIndex ? '编辑套餐' : '添加新套餐'
    }
  },
  mounted() {
    this.queryShops()
  },
  methods: {
    queryShops() {
      getAction('/store/all').then(res => {
        if (res.data.status === 'success') {
          let store_data = res.data.data
          store_data.forEach(item => {
            let list = item.store_message.split('\n')
            let obj = {}
            for (let i = 0; i < list.length; i++) {
              let arr = list[i].split(':')
              obj[arr[0]] = arr[1]
            }
            item.mainProducts = obj['主推产品'] || ''
            item.sellingPoints = obj['优势卖点'] || ''
            item.targetAudience = obj['目标用户'] || ''
            item.shopAddress = obj['店铺地址'] || ''
          })
          this.shops = store_data
        } else {
          this.$message.error('获取店铺列表失败')
        }
      }).catch(err => {
        this.$message.error('获取店铺列表失败')
      })
    },
    handleAddShop() {
      this.isEdit = false
      this.currentShop = {}
      this.dialogVisible = true
    },
    handleEditShop(shop) {
      this.isEdit = true
      this.currentShop = {...shop}
      this.dialogVisible = true
    },
    handleDeleteShop(shopId) {
      this.$confirm('此操作将永久删除该店铺, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delAction('/store/delete', {store_id: shopId}).then(res => {
          if (res.data.status === 'success') {
            this.queryShops()
            this.$message.success('删除成功!')
          } else {
            this.$message.error('删除失败!')
          }
        }).catch(err => {
          this.$message.error('删除失败!')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
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
    handleFormSubmit(shop) {
      this.isEdit ? this.editShop(shop) : this.addShop(shop)
      this.dialogVisible = false
    },
    addShop(shop) {
      let store_message = `主推产品:${shop.mainProducts || ''}\n优势卖点:${shop.sellingPoints || ''}\n目标用户:${shop.targetAudience || ''}\n店铺地址:${shop.shopAddress || ''}`
      let params = {
        name: shop.name,
        store_message: store_message
      }
      postAction('/store/create', params).then(res => {
        if (res.data.status === 'success') {
          this.queryShops()
          this.$message.success('新店铺创建成功！')
        } else {
          this.$message.error('新店铺创建失败！')
        }
      }).catch(err => {
        this.$message.error('新店铺创建失败！')
      })
    },
    editShop(shop, msg = '修改店铺信息') {
      let store_message = `主推产品:${shop.mainProducts || ''}\n优势卖点:${shop.sellingPoints || ''}\n目标用户:${shop.targetAudience || ''}\n店铺地址:${shop.shopAddress || ''}`
      let params = {
        store_id: shop.id,
        name: shop.name,
        store_message: store_message
      }
      postAction('/store/update', params).then(res => {
        if (res.data.status === 'success') {
          this.queryShops()
          this.$message.success(msg + '成功！')
        } else {
          this.$message.error(msg + '失败！')
        }
      }).catch(err => {
        this.$message.error(msg + '失败！')
      })
    },
    handleAddPackage(shop) {
      this.selectedShop = shop
      this.packageIndex = null
      this.currentPackage = {name: '', desc: ''}
      this.packageDialogVisible = true
    },
    handleEditPackage(shop, index) {
      this.selectedShop = shop
      this.packageIndex = index
      this.currentPackage = {...this.selectedShop.productPackages[index]}
      this.packageDialogVisible = true
    },
    handleDeletePackage(shop, index) {
      this.selectedShop = shop
      this.$confirm('此操作将永久删除该套餐, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let packages = this.selectedShop.productPackages || []
        packages.splice(index, 1)
        let shopData = {...this.selectedShop, productPackages: packages}
        this.editShop(shopData, '删除店铺套餐')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    beforeClose() {
      this.$refs.packageForm.clearValidate()
    },
    submitPackageForm() {
      this.$refs.packageForm.validate(valid => {
        if (valid) {
          let packages = this.selectedShop.productPackages || []
          if (this.packageIndex === null) {
            packages.push(this.currentPackage)
          } else {
            packages[this.packageIndex] = this.currentPackage
          }
          let shop = {...this.selectedShop, productPackages: packages}
              `套餐${!this.packageIndex ? '添加' : '编辑'}成功！`
          let msg = `套餐${!this.packageIndex ? '添加' : '编辑'}`
          this.editShop(shop, msg)
          this.packageDialogVisible = false
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.shop-management-container {
  padding: 0 32px;
  background-color: #f8fafc;
  box-sizing: border-box;
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
  grid-template-columns: repeat(auto-fill, minmax(385px, 1fr));
  gap: 24px;
  max-height: calc(100vh - 135px); /* Adjust based on your header height */
  overflow: auto;
}

.shop-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.shop-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  font-size: 13px;
  color: #6b7280;
  display: block;
  margin-bottom: 4px;
}

.info-content {
  font-size: 14px;
  color: #4f545b;
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap; /* Allows wrapping and respects newlines */
  word-wrap: break-word;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.close-btn {
  position: absolute;
  top: -4px;
  right: 0;
  opacity: 0;
}

.close-btn:hover {
  color: red;
}

.info-content:hover .close-btn {
  opacity: 1;
}

.empty-state {
  margin-top: 80px;
}

.dialog-footer {
  text-align: right;
}

/* Style for dialog */
::v-deep .el-dialog {
  border-radius: 8px;
}

::v-deep .el-dialog__header {
  font-weight: 600;
}

::v-deep .el-dialog__body {
  padding: 20px 30px 0 30px !important;
}

::v-deep .el-textarea__inner,
::v-deep .el-input__inner {
  padding: 8px;
  font-size: 13px;
  color: #4f5153;
  background-color: #fdfdfd;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

::v-deep .el-textarea__inner:focus,
::v-deep .el-input__inner:focus {
  outline: none;
  background: white;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
</style>