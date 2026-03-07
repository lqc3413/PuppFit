# 📘 俯卧撑计数机器狗后端 API 文档

## 🚀 基础信息

**后端地址**: `http://192.168.1.13:8000`
**API版本**: v1
**在线文档**: `http://192.168.1.13:8000/docs`

**测试账号**:

- 学生: `student` / `student`
- 教师: `teacher` / `teacher`
- 管理员: `admin` / `admin`

**认证方式**: 在请求头中添加 `Authorization: Bearer {access_token}`

------

## 🔐 认证模块

### 1. 用户登录

http

```
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded
```



**请求体**: `username=student&password=student`

**JavaScript示例**:

javascript

```
const response = await fetch('http://192.168.1.13:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: new URLSearchParams({username: 'student', password: 'student'})
});
const data = await response.json();
const token = data.access_token; // 保存token
```



**响应**:

json

```
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "username": "student",
    "real_name": "测试学生",
    "role": "student",
    "class_name": "测试班",
    "avatar_url": null
  }
}
```



### 2. 获取当前用户信息

http

```
GET /api/v1/auth/me
Authorization: Bearer {access_token}
```



------

## 👨‍🎓 学生端接口

### 1. 获取我的运动记录

http

```
GET /api/v1/student/workouts
Authorization: Bearer {student_token}
```



**参数**: `?skip=0&limit=100`

### 2. 获取单次运动详情

http

```
GET /api/v1/student/workouts/{workout_id}
Authorization: Bearer {student_token}
```



### 3. 获取活跃任务

http

```
GET /api/v1/student/tasks/active
Authorization: Bearer {student_token}
```



### 4. 获取我的统计数据

http

```
GET /api/v1/student/stats
Authorization: Bearer {student_token}
```



**参数**: `?days=30`

------

## 👨‍🏫 教师端接口

### 1. 创建运动任务

http

```
POST /api/v1/teacher/tasks
Authorization: Bearer {teacher_token}
Content-Type: application/json
```



**请求体**:

json

```
{
  "title": "俯卧撑挑战赛",
  "description": "班级俯卧撑比赛",
  "task_type": "pushup",
  "duration": 300,
  "target_count": 50
}
```



### 2. 获取我创建的任务

http

```
GET /api/v1/teacher/tasks
Authorization: Bearer {teacher_token}
```



**参数**: `?active_only=true`

### 3. 获取学生运动记录

http

```
GET /api/v1/teacher/students/workouts
Authorization: Bearer {teacher_token}
```



**参数**: `?class_name=测试班&start_date=2026-01-01&end_date=2026-01-31`

### 4. 审核运动记录

http

```
PUT /api/v1/teacher/workouts/{workout_id}/review
Authorization: Bearer {teacher_token}
Content-Type: application/json
```



**请求体**:

json

```
{
  "new_count": 35,
  "reason": "手动修正"
}
```



### 5. 获取活跃学生监控

http

```
GET /api/v1/teacher/monitor/active
Authorization: Bearer {teacher_token}
```



### 6. 获取班级统计数据

http

```
GET /api/v1/teacher/statistics/class
Authorization: Bearer {teacher_token}
```



**参数**: `?class_name=测试班`

------

## 👨‍💼 管理员接口

### 1. 获取所有用户

http

```
GET /api/v1/admin/users
Authorization: Bearer {admin_token}
```



**参数**: `?role=student&active_only=true&skip=0&limit=100`

### 2. 更新用户状态

http

```
PUT /api/v1/admin/users/{user_id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json
```



**请求体**: `{"is_active": false}`

### 3. 获取系统日志

http

```
GET /api/v1/admin/logs/system
Authorization: Bearer {admin_token}
```



**参数**: `?action=login&user_id=1&start_date=2026-01-01&end_date=2026-01-31`

### 4. 获取审核日志

http

```
GET /api/v1/admin/logs/review
Authorization: Bearer {admin_token}
```



### 5. 误报率分析

http

```
GET /api/v1/admin/analysis/false_positive
Authorization: Bearer {admin_token}
```



**参数**: `?days=30&min_confidence=0.7`

------

## 📁 文件接口

### 1. 获取运动视频

http

```
GET /api/v1/files/video/{workout_id}
```



### 2. 文件列表

http

```
GET /api/v1/files/list
```



**参数**: `?directory=videos&page=1&per_page=20`

------

## 🌐 WebSocket连接

**地址**: `ws://192.168.1.13:8000/ws/{client_id}`

**连接示例**:

javascript

```
const ws = new WebSocket('ws://192.168.1.13:8000/ws/frontend-001');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('实时更新:', data);
};
```



------

## 📊 前端配置

http

```
GET /api/v1/config/frontend
```



------

## 🩺 健康检查

http

```
GET /health
```



------

## 📋 前端配置示例

javascript

```
// .env.development
VUE_APP_API_URL = 'http://192.168.1.13:8000/api/v1'
VUE_APP_WS_URL = 'ws://192.168.1.13:8000/ws'
VUE_APP_BASE_URL = 'http://192.168.1.13:8000'

// axios配置
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 10000
});

// 请求拦截器：自动添加token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理401错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 跳转到登录页
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```