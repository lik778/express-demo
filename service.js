const express = require('express')
const path = require('path')
const cors = require('cors')
const url = require('url')
const { User } = require('./module')
const { users } = require('./mock/index')
const jwt = require('jsonwebtoken') // 这是生成token


const SERCET = 'fdfhfjdfdjfdjerwrereresaassa2dd@ddds'// 这是验证token的钥匙
const app = express()
app.use(cors())// 处理跨域字段
app.set('views',path.join(__dirname,'views')) // 开放view下面的模板文件
app.set('view engine','pug') // 定义模板引擎
app.all('*',function(req,res,next) {
  // 设置允许跨域的域名，代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin","*")
  // 设置允许的header
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // 设置允许的跨域的方法
  res.header("Access-Control-Allow-Methods","DELETE,PUT,GET,POST,OPTIONS")
  // 如果需要支持cookie，就要加入   
  res.header('Access-Control-Allow-Credentials', true)

  // Content-type 如果设置默认会动态匹配
  // res.header('Content-Type', 'text/html');
  // res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
app.use(express.json()) // 解析post请求参数JSON格式
app.use(express.urlencoded({ extended: false })) // 解析文本格式

// 访问home.pug文件
app.get('/home',(req,res) => {
  res.render('index',{users})
})






app.get('/api', (req, res) => res.send('Hello World!'))


// 注册
app.post('/api/register',(req,res) => {
  console.log('发起请求')
  // 将数据存储到数据库
  const admin = new User({
    username: req.body.username,
    password: req.body.password
  })
  admin.save((err,reject) => {
    if(err) {
      console.log('保存失败')
    } else {
      console.log('保存成功')
    }
  })
  res.send({
    success: '成功',
    code: 200,
    data: admin
  }) // 返回数据
})

// 登录-分发Token
app.post('/api/login',async (req,res) => {
  const Uname = req.body.username
  // 到数据库查询
  const current = await User.findOne({
    username: req.body.username
  })
  if(!current) return res.send({
    success: '请先注册',
    code: 201
  })
  // 验证密码
  const isPassWordValid = require('bcryptjs').compareSync(req.body.password,current.password)
  if(!isPassWordValid) return res.send({
    success: '密码错误',
    code: 201
  })
  // 验证通过，分发token
  const token = jwt.sign({
    id: String(current._id),
  },SERCET)
  res.send({
    success: '成功',
    code: 200,
    data: {
      token
    }
  })
})
// 请求数据的时验证token
app.get('/api/getAll', async (req,res) => {
  const tokens = String(req.headers.authorization.trim())
  try{
    req.tokens = jwt.verify(tokens,SERCET)
  } catch(err) {
    if(err) {
      return res.send('无效的token')
    }
  }
  // const id = tokenData.id
  // // 可以拿到当前用户在数据库的id
  const user_id = await User.findById(req.tokens.id)
  res.send({
    success: '成功',
    code: 200,
    data: {
      id: user_id,
      list: []
    }
  })
})




// 更新密码
app.put('/api/update', async (req,res) => {
  const user = await User.findOne({
    username: req.body.username
  })
  if(!user) return res.send({
    success: '该用户未注册',
    code: 201
  })
  const user_id = user.id
  try{
    const update = await User.findByIdAndUpdate(user_id,{
      password: req.body.password
    })
    if(!update) return res.send({
      success: '更新失败',
      code: 201
    })
    res.send({
      success: '更新成功',
      code: 200,
      data: {
        update
      }
    })
  } catch(err) {
    console.log(err)
  }
})

// 删除账户
app.delete('/api/delete', async (req,res) => {

  try {
    const user = await User.findOne({
      username: req.body.username
    })
    if(!user) return res.send({
      success: '不存在当前用户',
      code: 201
    })
    const removeUser = await User.removeOne({
      username: req.body.username
    })
    return res.send({
      success: '删除成功',
      code: 201,
      data: {
        removeUser
      }
    })
  } catch(err) {
    console.log(err)
  }
})


// 测试url模块
app.get('/login',(req,res) => {

  // 解析url方法一，调用url.parse。还原url采用url.format
  // const urls = url.parse(req.url,true)
  // 解析url方法二，采用URL类
  const myUrl = new URL('http://localhost:3002'+req.url)
  // URL {
  //   href: 'http://localhost:3002/login?a=1&b=5',
  //   origin: 'http://localhost:3002',
  //   protocol: 'http:',
  //   username: '',
  //   password: '',
  //   host: 'localhost:3002',
  //   hostname: 'localhost',
  //   port: '3002',
  //   pathname: '/login',
  //   search: '?a=1&b=5',
  //   searchParams: URLSearchParams { 'a' => '1',
  //  'b' => '5' },
  //   hash: ''
  // }
  res.send(myUrl)
})








app.listen(3002,() => {
  console.log('http://localhost:3002')
})