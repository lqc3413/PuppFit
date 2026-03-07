# PuppyFit API 接口文档

本文档汇总了 PuppyFit 前端调用的所有后端接口。

## 1. 基础配置
- **Base URL**: `/api` (根据 `request.js` 配置，当前可能为 Mock 地址)
- **Content-Type**: `application/json` (默认)
- **Authorization**: `Bearer <token>` (登录后需要在 Header 中携带)

---

## 2. 认证模块 (Auth)

### 2.1 用户登录
- **URL**: `/auth/login`
- **Method**: `POST`
- **描述**: 各角色通用登录接口
- **请求参数 (Body)**:
  ```json
  {
    "username": "user123",  // 账号
    "password": "password", // 密码
    "type": "parent"        // 用户类型: 'parent' | 'teacher' | 'admin'
  }
  ```
- **响应数据**:
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "eyJhb...",
      "user": {
        "id": 1,
        "name": "张三",
        "role": "parent"
      }
    }
  }
  ```

---

## 3. 家长端接口 (Parent)

### 3.1 获取任务列表
- **URL**: `/parent/tasks`
- **Method**: `GET`
- **描述**: 获取家长/学生的待办任务及已完成任务列表
- **响应数据**:
  ```json
  {
    "code": 200,
    "data": {
      "pending": [
        {
          "id": 101,
          "title": "晨间慢跑",
          "deadline": "2023-10-01",
          "status": "pending"
        }
      ],
      "completed": []
    }
  }
  ```

### 3.2 更新用户资料
- **URL**: `/parent/update`
- **Method**: `POST`
- **描述**: 更新家长个人信息
- **请求参数**:
  ```json
  {
    "name": "张培根",
    "phone": "13800000000"
    // 其他个人资料字段
  }
  ```

### 3.3 语音上传
- **URL**: `/voice/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **描述**: 上传语音互动录音
- **请求参数**: `FormData` 包含音频文件

---

## 4. 教师端接口 (Teacher)

### 4.1 获取学生列表
- **URL**: `/teacher/students`
- **Method**: `GET`
- **描述**: 获取该教师负责的学生列表及其成绩概况
- **响应数据**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": 1,
        "name": "王小明",
        "studentId": "S2023001",
        "score": 95
      }
      // ...
    ]
  }
  ```

### 4.2 发布任务
- **URL**: `/teacher/publish_task`
- **Method**: `POST`
- **描述**: 给学生发布新的运动任务
- **请求参数**:
  ```json
  {
    "title": "周末跳绳打卡",
    "deadline": "2023-10-15",
    "exercises": [
      {
        "type": "jumping_rope",
        "target": 100,
        "unit": "次"
      }
    ]
  }
  ```

### 4.3 修改成绩
- **URL**: `/teacher/update_score`
- **Method**: `POST`
- **描述**: 修改学生某项任务的成绩
- **请求参数**:
  ```json
  {
    "recordId": 123,      // 任务记录ID
    "exerciseType": "run",
    "newScore": 98
  }
  ```

### 4.4 更新教师资料
- **URL**: `/teacher/update`
- **Method**: `POST`
- **描述**: 更新教师个人信息

---

## 5. 管理员接口 (Admin)

### 5.1 获取教师列表
- **URL**: `/admin/teachers`
- **Method**: `GET`
- **描述**: 获取所有教师列表
- **响应数据**:
  ```json
  {
    "code": 200,
    "data": [
      {
        "id": 1,
        "name": "李老师",
        "employeeId": "T001",
        "phone": "13912345678",
        "status": "active",
        "createdAt": "2023-01-01"
      }
    ]
  }
  ```

### 5.2 添加教师
- **URL**: `/admin/teacher/add`
- **Method**: `POST`
- **请求参数**:
  ```json
  {
    "name": "王刚",
    "employeeId": "T005",
    "phone": "13500000000",
    "status": "active"
  }
  ```

### 5.3 更新教师信息
- **URL**: `/admin/teacher/update`
- **Method**: `POST`
- **请求参数**:
  ```json
  {
    "id": 1,
    "name": "李老师",
    "employeeId": "T001",
    "phone": "13912345678",
    "status": "active"
  }
  ```

### 5.4 重置教师密码
- **URL**: `/admin/teacher/reset-password`
- **Method**: `POST`
- **请求参数**:
  ```json
  {
    "id": 1
  }
  ```

### 5.5 管理员总览数据
- **URL**: `/admin/dashboard`
- **Method**: `GET`
- **描述**: 获取首页统计数据（学生数、教师数、班级数、打卡趋势等）
- **响应数据**:
  ```json
  {
    "code": 200,
    "data": {
      "totalStudents": 100,
      "activeStudents": 80,
      "totalTeachers": 10,
      "totalClasses": 5,
      "todayCheckIns": 25,
      "checkInTrend": [
        { "date": "2023-10-01", "count": 15 },
        { "date": "2023-10-02", "count": 20 }
      ]
    }
  }
  ```

### 5.6 获取当前学期 (通用/Admin)
- **URL**: `/admin/semesters`
- **Method**: `GET`
- **描述**: 获取学期列表，用于确定当前学期
- **响应数据**:
  ```json
  {
    "code": 200,
    "data": [
      { "id": 1, "name": "2023-2024第一学期", "isCurrent": true }
    ]
  }
  ```
