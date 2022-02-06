// 这是数据库模型文件
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
try{
  mongoose.connect('mongodb://localhost:27017/admin')
} catch(err) {
  console.log('连接超时')
}
// 创建一个存储用户账号密码的模型，也就是设计一个表
const UserSchema = new mongoose.Schema({
  username: { 
    type: String,
    unique: true
   },
  password: {
    type: String,
    // 这是存储数据的时候进行加密
    set(val) {
      const salt = bcrypt.genSaltSync(10) // 去是个字符
      const hash = bcrypt.hashSync(val,salt) // 加密后的数据
      return hash
    }
  }
})

const User = mongoose.model('User',UserSchema)

module.exports = { User }