# PuppyFit 前后端接口文档 (API Reference)

> **Base URL**: `/api`
> **通用响应格式**: `{ code: number, message: string, data: any }`
> **认证方式**: 请求头 `Authorization: Bearer <token>`（登录后获取）

---

## 一、认证模块 (Auth)

### 1. 用户登录

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/auth/login` |
| **调用端** | 家长端 `Login.vue`、管理端 `admin/Login.vue` |
| **描述** | 统一登录入口，通过 `type` 区分角色 |

**请求参数 (Body JSON)**:
```json
{
  "username": "string",
  "password": "string",
  "type": "parent | teacher | admin"
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "string",
    "user": {
      "name": "string",
      "role": "parent | teacher | admin",
      "parentName": "string (仅 parent)",
      "avatar": "string (仅 parent)",
      "classNum": "string (仅 parent)",
      "studentId": "string (仅 parent)"
    }
  }
}
```

**失败响应**: `{ "code": 401, "message": "登录失败" }`

---

## 二、家长端模块 (Parent)

### 2. 获取任务列表（待办 & 已完成）

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/parent/tasks` |
| **调用端** | `parent/Dashboard.vue` |
| **描述** | 获取当前学期下该学生的待办任务和已完成任务 |

**请求参数**: 无（通过 Token 识别学生身份）

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "currentSemester": "2025-2026学年第一学期",
    "pending": [
      {
        "id": 1001,
        "title": "第一周体能测试",
        "deadline": "2026-01-25",
        "exercises": [
          { "type": "仰卧起坐", "target": 50, "unit": "个", "weight": 0.4 }
        ]
      }
    ],
    "completed": [
      {
        "id": 1,
        "taskId": 1002,
        "taskTitle": "日常锻炼打卡",
        "completedAt": "2026-01-18",
        "totalScore": 97,
        "exercises": [...],
        "results": [
          { "type": "仰卧起坐", "score": 28, "target": 30 }
        ]
      }
    ]
  }
}
```

---

### 3. 更新家长个人信息

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/parent/update` |
| **调用端** | `parent/Profile.vue` |
| **描述** | 修改家长端个人信息 |

**请求参数 (Body JSON)**:
```json
{
  "name": "string",
  "parentName": "string",
  "parentPhone": "string"
}
```

**成功响应**: `{ "code": 200, "message": "Updated", "data": { ...更新后的字段 } }`

---

### 4. 语音上传

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/voice/upload` |
| **调用端** | `parent/Voice.vue` |
| **描述** | 上传语音数据并获取 AI 回复 |

**请求参数**: FormData / Binary Audio

**成功响应**:
```json
{
  "code": 200,
  "message": "Sent successfully",
  "data": {
    "reply": "收到，小狗正在复述：你好呀主人！"
  }
}
```

---

## 三、教师端模块 (Teacher)

### 5. 获取学生列表及成绩

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/teacher/students` |
| **调用端** | `teacher/StudentGrades.vue` |
| **描述** | 获取该教师管理的班级所有学生及其任务完成记录 |

**请求参数**: 无（通过 Token 识别教师身份）

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "张同学",
      "studentId": "20230201",
      "classId": 2,
      "className": "三年级二班",
      "parentName": "张家长",
      "parentPhone": "13900139001",
      "status": "active",
      "lastActive": "2026-01-17",
      "avgScore": 96,
      "taskRecords": [
        {
          "id": 1,
          "taskId": 1002,
          "taskTitle": "日常锻炼打卡",
          "completedAt": "2026-01-18",
          "totalScore": 97,
          "results": [
            { "type": "仰卧起坐", "score": 28, "target": 30 }
          ]
        }
      ]
    }
  ]
}
```

---

### 6. 获取学生待办任务（教师视角）

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/teacher/pending_tasks` |
| **调用端** | `teacher/TaskAssign.vue` |
| **描述** | 获取每个学生在当前学期的未完成任务列表 |

**请求参数**: 无

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "studentId": 1,
      "studentName": "张同学",
      "class": "三年级二班",
      "lastActive": "2026-01-17",
      "pendingCount": 2,
      "pendingTasks": [
        {
          "id": 1001,
          "title": "第一周体能测试",
          "deadline": "2026-01-25",
          "exerciseCount": 3
        }
      ]
    }
  ]
}
```

---

### 7. 发布任务

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/teacher/publish_task` |
| **调用端** | `teacher/TaskAssign.vue` |
| **描述** | 教师发布包含多项运动的任务，自动关联当前学期 |

**请求参数 (Body JSON)**:
```json
{
  "title": "第二周体能测试",
  "deadline": "2026-02-01",
  "exercises": [
    { "type": "跳绳", "target": 100, "unit": "个", "weight": 0.5 },
    { "type": "跑步", "target": 800, "unit": "米", "weight": 0.5 }
  ]
}
```

**成功响应**:
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 1234567890,
    "title": "第二周体能测试",
    "deadline": "2026-02-01",
    "createdAt": "2026-01-20",
    "semesterId": 1,
    "exercises": [...]
  }
}
```

---

### 8. 修改学生成绩

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/teacher/update_score` |
| **调用端** | `teacher/StudentGrades.vue` |
| **描述** | 修改某学生某次任务的某项运动成绩 |

**请求参数 (Body JSON)**:
```json
{
  "recordId": 1,
  "exerciseType": "仰卧起坐",
  "newScore": 35
}
```

**成功响应**: `{ "code": 200, "message": "成绩修改成功", "data": { "totalScore": 98 } }`

---

### 9. 更新教师个人信息

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/teacher/update` |
| **调用端** | `teacher/Profile.vue` |
| **描述** | 修改教师端个人信息 |

**请求参数 (Body JSON)**:
```json
{
  "name": "string",
  "phone": "string"
}
```

**成功响应**: `{ "code": 200, "message": "Updated", "data": { ...更新后的字段 } }`

---

## 四、管理后台模块 (Admin)

### 10. 管理后台仪表盘统计

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/admin/dashboard` |
| **调用端** | `admin/Overview.vue` |
| **描述** | 获取系统总体统计数据 |

**成功响应**:
```json
{
  "code": 200,
  "data": {
    "totalStudents": 5,
    "activeStudents": 4,
    "totalTeachers": 2,
    "totalClasses": 3,
    "todayCheckIns": 0,
    "checkInTrend": [
      { "date": "2026-01-14", "count": 1 },
      { "date": "2026-01-15", "count": 0 }
    ]
  }
}
```

---

### 11. 获取学期列表

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/admin/semesters` |
| **调用端** | `admin/SemesterConfig.vue`、`admin/Dashboard.vue`、`teacher/Dashboard.vue` |
| **描述** | 获取所有学期配置，含当前学期标记 |

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "2025-2026学年第一学期",
      "startDate": "2025-09-01",
      "endDate": "2026-01-31",
      "isCurrent": true
    }
  ]
}
```

---

### 12. 新增学期

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/semester/add` |
| **调用端** | `admin/SemesterConfig.vue` |

**请求参数**: `{ "name": "string", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }`

**成功响应**: `{ "code": 200, "message": "添加成功", "data": { ...新学期对象 } }`

---

### 13. 设置当前学期

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/semester/set-current` |
| **调用端** | `admin/SemesterConfig.vue` |

**请求参数**: `{ "id": number }`

**成功响应**: `{ "code": 200, "message": "设置成功" }`

---

### 14. 获取教师列表

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/admin/teachers` |
| **调用端** | `admin/TeacherList.vue`、`admin/ClassList.vue` |

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "李老师",
      "employeeId": "T2024001",
      "phone": "13800138001",
      "classIds": [1],
      "classNames": "三年级一班",
      "status": "active",
      "createdAt": "2024-09-01"
    }
  ]
}
```

---

### 15. 新增教师

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/teacher/add` |
| **调用端** | `admin/TeacherList.vue` |

**请求参数**: `{ "name": "string", "employeeId": "string", "phone": "string", "classIds": [number] }`

**成功响应**: `{ "code": 200, "message": "添加成功", "data": { ...新教师对象 } }`

---

### 16. 更新教师信息

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/teacher/update` |
| **调用端** | `admin/TeacherList.vue` |

**请求参数**: `{ "id": number, "name": "string", "phone": "string", ... }`

**成功响应**: `{ "code": 200, "message": "更新成功", "data": { ...更新后教师对象 } }`

---

### 17. 重置教师密码

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/teacher/reset-password` |
| **调用端** | `admin/TeacherList.vue` |

**请求参数**: `{ "id": number }`

**成功响应**: `{ "code": 200, "message": "密码已重置为 123456" }`

---

### 18. 获取学生列表

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/admin/students` |
| **调用端** | `admin/StudentList.vue` |

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "张同学",
      "studentId": "20230201",
      "classId": 2,
      "className": "三年级二班",
      "parentName": "张家长",
      "parentPhone": "13900139001",
      "status": "active",
      "lastActive": "2026-01-17"
    }
  ]
}
```

---

### 19. 新增学生

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/student/add` |
| **调用端** | `admin/StudentList.vue` |

**请求参数**: `{ "name": "string", "studentId": "string", "classId": number, "parentName": "string", "parentPhone": "string" }`

**成功响应**: `{ "code": 200, "message": "添加成功", "data": { ...新学生对象 } }`

---

### 20. 批量导入学生

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/student/import` |
| **调用端** | `admin/StudentList.vue` |

**请求参数**:
```json
{
  "students": [
    { "name": "string", "studentId": "string", "classId": number, "parentName": "string", "parentPhone": "string" }
  ]
}
```

**成功响应**: `{ "code": 200, "message": "成功导入N名学生" }`

---

### 21. 学生调班

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/student/transfer` |
| **调用端** | `admin/StudentList.vue` |

**请求参数**: `{ "studentId": number, "newClassId": number }`

**成功响应**: `{ "code": 200, "message": "调班成功" }`

---

### 22. 封禁/解封学生

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/student/toggle-ban` |
| **调用端** | `admin/StudentList.vue` |

**请求参数**: `{ "studentId": number }`

**成功响应**: `{ "code": 200, "message": "封禁/解封成功", "data": { "status": "banned | active" } }`

---

### 23. 获取班级列表

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/admin/classes` |
| **调用端** | `admin/ClassList.vue`、`admin/StudentList.vue` |

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "三年级一班",
      "grade": 3,
      "headTeacherId": 1,
      "headTeacherName": "李老师",
      "studentCount": 35,
      "createdAt": "2024-09-01"
    }
  ]
}
```

---

### 24. 新增班级

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/class/add` |
| **调用端** | `admin/ClassList.vue` |

**请求参数**: `{ "name": "string", "grade": number, "headTeacherId": number | null }`

**成功响应**: `{ "code": 200, "message": "创建成功", "data": { ...新班级对象 } }`

---

### 25. 更新班级信息

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/class/update` |
| **调用端** | `admin/ClassList.vue` |

**请求参数**: `{ "id": number, "name": "string", "grade": number, "headTeacherId": number | null }`

**成功响应**: `{ "code": 200, "message": "更新成功", "data": { ...更新后班级对象 } }`

---

### 26. 获取运动项目库

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/admin/exercise-types` |
| **调用端** | `admin/ExerciseDict.vue`、`teacher/TaskAssign.vue` |

**成功响应**:
```json
{
  "code": 200,
  "data": [
    { "id": 1, "name": "跳绳", "unit": "个", "description": "单摇跳绳计数", "status": "active" }
  ]
}
```

---

### 27. 新增运动项目

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/exercise-type/add` |
| **调用端** | `admin/ExerciseDict.vue` |

**请求参数**: `{ "name": "string", "unit": "string", "description": "string" }`

**成功响应**: `{ "code": 200, "message": "添加成功", "data": { ...新运动项目对象 } }`

---

### 28. 更新运动项目（含启用/禁用）

| 项目 | 内容 |
|------|------|
| **URL** | `POST /api/admin/exercise-type/update` |
| **调用端** | `admin/ExerciseDict.vue` |

**请求参数**: `{ "id": number, "name": "string", "unit": "string", "status": "active | inactive", ... }`

**成功响应**: `{ "code": 200, "message": "更新成功", "data": { ...更新后对象 } }`

---

### 29. 获取操作日志

| 项目 | 内容 |
|------|------|
| **URL** | `GET /api/admin/logs` |
| **调用端** | `admin/SystemLog.vue` |

**成功响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "operator": "管理员",
      "action": "新增教师",
      "target": "李老师",
      "detail": "工号: T2024001",
      "createdAt": "2024-09-01 09:00:00"
    }
  ]
}
```

---

## 五、接口汇总表

| 序号 | 方法 | 路径 | 模块 | 说明 |
|:----:|:----:|------|:----:|------|
| 1 | POST | `/api/auth/login` | 认证 | 统一登录 |
| 2 | GET | `/api/parent/tasks` | 家长 | 获取待办/已完成任务 |
| 3 | POST | `/api/parent/update` | 家长 | 更新个人信息 |
| 4 | POST | `/api/voice/upload` | 家长 | 语音上传 |
| 5 | GET | `/api/teacher/students` | 教师 | 获取学生列表及成绩 |
| 6 | GET | `/api/teacher/pending_tasks` | 教师 | 获取学生待办任务 |
| 7 | POST | `/api/teacher/publish_task` | 教师 | 发布任务 |
| 8 | POST | `/api/teacher/update_score` | 教师 | 修改学生成绩 |
| 9 | POST | `/api/teacher/update` | 教师 | 更新教师个人信息 |
| 10 | GET | `/api/admin/dashboard` | 管理 | 后台仪表盘统计 |
| 11 | GET | `/api/admin/semesters` | 管理 | 学期列表 |
| 12 | POST | `/api/admin/semester/add` | 管理 | 新增学期 |
| 13 | POST | `/api/admin/semester/set-current` | 管理 | 设置当前学期 |
| 14 | GET | `/api/admin/teachers` | 管理 | 教师列表 |
| 15 | POST | `/api/admin/teacher/add` | 管理 | 新增教师 |
| 16 | POST | `/api/admin/teacher/update` | 管理 | 更新教师信息 |
| 17 | POST | `/api/admin/teacher/reset-password` | 管理 | 重置教师密码 |
| 18 | GET | `/api/admin/students` | 管理 | 学生列表 |
| 19 | POST | `/api/admin/student/add` | 管理 | 新增学生 |
| 20 | POST | `/api/admin/student/import` | 管理 | 批量导入学生 |
| 21 | POST | `/api/admin/student/transfer` | 管理 | 学生调班 |
| 22 | POST | `/api/admin/student/toggle-ban` | 管理 | 封禁/解封学生 |
| 23 | GET | `/api/admin/classes` | 管理 | 班级列表 |
| 24 | POST | `/api/admin/class/add` | 管理 | 新增班级 |
| 25 | POST | `/api/admin/class/update` | 管理 | 更新班级信息 |
| 26 | GET | `/api/admin/exercise-types` | 管理 | 运动项目库 |
| 27 | POST | `/api/admin/exercise-type/add` | 管理 | 新增运动项目 |
| 28 | POST | `/api/admin/exercise-type/update` | 管理 | 更新运动项目 |
| 29 | GET | `/api/admin/logs` | 管理 | 操作日志 |
