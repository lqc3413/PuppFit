# 📘 PuppyFit 前端 API 接口文档

> **项目名称**：PuppyFit（俯卧撑计数机器狗）  
> **文档版本**：v2.0  
> **更新日期**：2026-03-03  
> **Base URL**：待后端部署后填写（如 `http://your-server:8000`）  
> **认证方式**：请求头携带 `Authorization: Bearer <token>`  

---

## 全局约定

### 统一响应格式

```json
{
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| `200` | 成功 |
| `400` | 请求参数错误 |
| `401` | 未授权 / Token 过期 / 登录失败 |
| `403` | 权限不足 |
| `404` | 资源不存在 |
| `500` | 服务器内部错误 |

### 鉴权说明

- 除登录接口外，**所有接口均需携带 Token**
- Token 通过请求头 `Authorization: Bearer <token>` 传递
- Token 方案建议使用 **JWT**（JSON Web Token）
- Token 有效期建议**24小时**，过期后返回 `401`，前端自动跳转登录页
- 暂不需要 `refresh_token` 刷新机制
- **后端需从 Token 中解析出用户身份**（`userId`、`role`），用于确定当前用户

### 分页约定

列表类接口**统一支持分页参数**（当前前端暂未使用分页，但后端应预留支持）：

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | number | ❌ | 1 | 页码，从 1 开始 |
| pageSize | number | ❌ | 50 | 每页数量 |

分页响应格式：

```json
{
  "code": 200,
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 50
  }
}
```

> **注意**：当前前端请求不传分页参数时，后端可默认返回全部数据（设置较大的 pageSize），以保持向后兼容。

### 账号与密码策略

| 角色 | 登录账号 | 初始密码 | 密码重置 |
|------|----------|----------|----------|
| **管理员** | 固定账号 `admin` | 手动配置（如 `admin123`） | — |
| **教师** | 工号（`employeeId`），如 `T2024001` | `123456` | 管理员可通过接口重置为 `123456` |
| **家长/学生** | 学号（`studentId`），如 `20230201` | `123456` | 暂无重置接口（后续可扩展） |

> 新增教师和学生时，后端需**自动创建对应的登录账号**，用户名为工号/学号，初始密码为 `123456`。

### 删除策略说明

| 实体 | 删除方式 | 说明 |
|------|----------|------|
| 运动项目 | **软删除** | 通过 `status` 字段设为 `inactive`，不物理删除 |
| 教师 | **暂不支持删除** | 仅支持状态管理 |
| 学生 | **暂不支持删除** | 通过封禁（`banned`）代替删除 |
| 班级 | **暂不支持删除** | — |

---

## 目录

- [一、认证模块](#一认证模块)
- [二、家长端接口](#二家长端接口)
- [三、教师端接口](#三教师端接口)
- [四、管理员端接口](#四管理员端接口)
  - [4.1 Dashboard / 概览](#41-dashboard--概览)
  - [4.2 教师管理](#42-教师管理)
  - [4.3 学生管理](#43-学生管理)
  - [4.4 班级管理](#44-班级管理)
  - [4.5 运动项目管理](#45-运动项目管理)
  - [4.6 系统日志](#46-系统日志)
- [附录](#附录)

---

## 一、认证模块

### 1.1 用户登录

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/auth/login` |
| **说明** | 统一登录接口，支持家长、教师、管理员三种角色 |
| **是否鉴权** | ❌ 不需要 Token |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | ✅ | 用户名（管理员用 `admin`，教师用工号，家长用学号） |
| password | string | ✅ | 密码 |
| type | string | ✅ | 用户类型：`parent` / `teacher` / `admin` |

**成功响应**：

```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...(JWT Token)",
    "user": {
      "id": 1,
      "name": "张同学",
      "role": "parent",
      "parentName": "张家长",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      "classNum": "三年级二班",
      "studentId": "20230302"
    }
  }
}
```

> **不同角色返回的 `user` 字段差异**：
>
> | 角色 | 返回字段 |
> |------|----------|
> | `admin` | `id`, `name`, `role` |
> | `teacher` | `id`, `name`, `role`, `employeeId` |
> | `parent` | `id`, `name`, `role`, `parentName`, `avatar`, `classNum`, `studentId` |

**失败响应**：

```json
{ "code": 401, "message": "用户名或密码错误" }
```

**后端实现要点**：
- 后端生成 JWT Token，Payload 中应包含 `userId`、`role`，用于后续接口鉴权
- Token 建议有效期 24 小时
- 密码应使用 bcrypt 等算法加密存储

---

## 二、家长端接口

> **鉴权说明**：以下接口均需要 Token，后端通过 Token 解析出 `studentId` 来确定当前学生用户。

### 2.1 获取任务列表

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/parent/tasks` |
| **说明** | 获取当前待办任务和已完成任务记录 |
| **鉴权方式** | Token 中解析出 `studentId`，返回该学生的任务 |

**请求参数**：无（通过 Token 确定用户身份）

**成功响应**：

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "pending": [
      {
        "id": 1001,
        "title": "第一周体能测试",
        "deadline": "2026-01-25",
        "createdAt": "2026-01-15",
        "exercises": [
          { "type": "仰卧起坐", "target": 50, "unit": "个", "weight": 0.4 },
          { "type": "跳绳", "target": 100, "unit": "个", "weight": 0.3 },
          { "type": "跑步", "target": 1000, "unit": "米", "weight": 0.3 }
        ]
      }
    ],
    "completed": [
      {
        "id": 1,
        "taskId": 1002,
        "studentId": 1,
        "completedAt": "2026-01-18",
        "results": [
          { "type": "仰卧起坐", "score": 28, "target": 30 },
          { "type": "跳绳", "score": 80, "target": 80 }
        ],
        "totalScore": 97,
        "taskTitle": "日常锻炼打卡",
        "exercises": [
          { "type": "仰卧起坐", "target": 30, "unit": "个", "weight": 0.5 },
          { "type": "跳绳", "target": 80, "unit": "个", "weight": 0.5 }
        ]
      }
    ]
  }
}
```

**后端实现要点**：
- `pending`：该学生**尚未完成**的任务列表
- `completed`：该学生**已完成**的任务记录，需关联任务信息返回 `taskTitle` 和 `exercises`
- `totalScore` 计算规则：每项运动得分 = `min(100, round(score / target × 100))`，总分 = Σ(单项得分 × weight)
- 响应中 `exercises` 的 `type` 和 `unit` 返回运动项目名称和单位的**字符串**（从 `exercise_types` 表 JOIN 获取）

---

### 2.2 更新个人资料

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/parent/update` |
| **说明** | 更新家长端个人资料 |
| **鉴权方式** | Token 中解析出用户 ID |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ❌ | 学生姓名 |
| parentName | string | ❌ | 家长姓名 |
| avatar | string | ❌ | 头像 URL |
| phone | string | ❌ | 家长联系电话 |
| email | string | ❌ | 家长邮箱 |

> 只传需要更新的字段，未传的字段保持不变。

**成功响应**：

```json
{
  "code": 200,
  "message": "Updated",
  "data": {
    "name": "张同学",
    "parentName": "张家长",
    "avatar": "https://...",
    "phone": "13900139001",
    "email": "zhang@example.com"
  }
}
```

---

## 三、教师端接口

> **鉴权说明**：以下接口均需要 Token，后端通过 Token 解析出教师 ID。当前设计中教师能看到**所有学生**的数据（不按班级过滤），后续可根据需要扩展为只看自己班级的学生。

### 3.1 获取学生列表及成绩

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/teacher/students` |
| **说明** | 获取所有学生信息，包含任务完成记录和平均成绩 |
| **鉴权方式** | Token 中解析出教师 ID |

**请求参数**：无

**成功响应**：

```json
{
  "code": 200,
  "message": "Success",
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
          "studentId": 1,
          "completedAt": "2026-01-18",
          "results": [
            { "type": "仰卧起坐", "score": 28, "target": 30 },
            { "type": "跳绳", "score": 80, "target": 80 }
          ],
          "totalScore": 97,
          "taskTitle": "日常锻炼打卡"
        }
      ]
    }
  ]
}
```

**后端实现要点**：
- `avgScore`：该学生所有已完成任务的 `totalScore` 的**算术平均值**，无记录时为 `0`
- `taskRecords`：该学生的所有任务完成记录，需关联任务表返回 `taskTitle`
- `status` 枚举值：`active`（正常）/ `banned`（已封禁）

---

### 3.2 发布新任务

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/teacher/publish_task` |
| **说明** | 发布包含多项运动的新任务 |
| **鉴权方式** | Token 中解析出教师 ID |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | ✅ | 任务标题 |
| deadline | string | ✅ | 截止日期（格式：`YYYY-MM-DD`） |
| exercises | array | ✅ | 运动项目列表（至少 1 项） |

`exercises` 数组元素结构：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | ✅ | 运动项目类型（如"仰卧起坐"，需与运动项目库中的 `name` 匹配） |
| target | number | ✅ | 目标数值 |
| unit | string | ✅ | 单位（"个"/"米"等） |
| weight | number | ✅ | 权重（0-1，所有权重之和**必须为 1**） |

**成功响应**：

```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 1738000000000,
    "title": "新任务",
    "deadline": "2026-02-01",
    "createdAt": "2026-01-20",
    "exercises": [...]
  }
}
```

**后端实现要点**：
- `createdAt` 由后端自动生成
- 任务面向**所有学生**（当前设计不区分班级），所有学生都能看到教师发布的任务
- 后端需根据 `exercises` 中的 `type`（运动名称）查找对应的 `exercise_type_id` 存入 `task_exercises` 表
- 建议后端校验 `exercises` 的 `weight` 之和是否为 1

---

### 3.3 修改学生成绩

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/teacher/update_score` |
| **说明** | 修改某次任务的某项运动成绩，自动重新计算加权总成绩 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| recordId | number | ✅ | 任务记录 ID（`studentTaskRecords` 的 `id`） |
| exerciseType | string | ✅ | 运动项目类型（如"仰卧起坐"） |
| newScore | number | ✅ | 新成绩数值 |

**成功响应**：

```json
{ "code": 200, "message": "成绩修改成功", "data": { "totalScore": 95 } }
```

**失败响应**：

```json
{ "code": 404, "message": "记录未找到" }
{ "code": 404, "message": "运动项目未找到" }
```

**后端实现要点**：
- 修改对应 `results` 中匹配 `exerciseType` 的 `score` 值
- 重新计算 `totalScore`：每项得分 = `min(100, round(score / target × 100)) × weight`，总分取整
- 返回重新计算后的 `totalScore`

---

### 3.4 更新教师个人资料

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/teacher/update` |
| **说明** | 更新教师端个人资料 |
| **鉴权方式** | Token 中解析出教师 ID |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ❌ | 教师姓名 |
| phone | string | ❌ | 联系电话 |
| email | string | ❌ | 邮箱 |

> 只传需要更新的字段，未传的字段保持不变。

**成功响应**：

```json
{ "code": 200, "message": "Updated", "data": { "name": "李老师", "phone": "13800138001" } }
```

---

### 3.5 获取学生待办任务列表（教师视角）

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/teacher/pending_tasks` |
| **说明** | 获取每个学生的待办任务情况 |

**请求参数**：无

**成功响应**：

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "studentId": 1,
      "studentName": "张同学",
      "class": "三年级二班",
      "lastActive": "2026-01-17",
      "pendingCount": 1,
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

**后端实现要点**：
- 遍历所有学生，计算每个学生**未完成**的任务
- `pendingCount` = 该学生的待办任务数量

---

## 四、管理员端接口

> **鉴权说明**：以下接口均需要 Token，且 Token 中的 `role` 必须为 `admin`，否则返回 `403`。

### 4.1 Dashboard / 概览

#### 4.1.1 获取 Dashboard 统计数据

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/admin/dashboard` |
| **说明** | 获取系统概览统计：学生数、教师数、班级数、打卡趋势等 |

**请求参数**：无

**成功响应**：

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
      { "date": "2026-01-15", "count": 0 },
      { "date": "2026-01-16", "count": 0 },
      { "date": "2026-01-17", "count": 0 },
      { "date": "2026-01-18", "count": 1 },
      { "date": "2026-01-19", "count": 1 },
      { "date": "2026-01-20", "count": 0 }
    ]
  }
}
```

**字段说明**：

| 字段 | 说明 |
|------|------|
| totalStudents | 所有学生总数（含已封禁） |
| activeStudents | 状态为 `active` 的学生数 |
| totalTeachers | 状态为 `active` 的教师数 |
| totalClasses | 班级总数 |
| todayCheckIns | 今日完成任务的记录数 |
| checkInTrend | **最近 7 天**的每日打卡数量趋势（固定 7 天） |

---

### 4.2 教师管理

#### 4.2.1 获取教师列表

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/admin/teachers` |
| **说明** | 获取所有教师信息（含所管班级名称） |

**请求参数**：无

**成功响应**：

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
      "status": "active",
      "createdAt": "2024-09-01",
      "classNames": "三年级一班"
    }
  ]
}
```

**字段说明**：
- `classIds`：关联的班级 ID 数组
- `classNames`：关联的班级名称，多个用逗号分隔（如 `"三年级一班, 三年级二班"`）
- `status`：`active`（在职）/ `inactive`（离职/停用）

---

#### 4.2.2 新增教师

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/teacher/add` |
| **说明** | 新增一名教师，同时自动创建登录账号 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ✅ | 教师姓名 |
| employeeId | string | ✅ | 工号（同时作为**登录用户名**） |
| phone | string | ✅ | 联系电话 |
| classIds | number[] | ❌ | 关联班级 ID 列表 |

**成功响应**：

```json
{ "code": 200, "message": "添加成功", "data": { /* 新教师对象 */ } }
```

**后端实现要点**：
- 自动创建登录账号：用户名 = `employeeId`，初始密码 = `123456`
- 需校验 `employeeId` 唯一性，重复则返回 `400`
- `status` 默认设为 `active`
- 写入操作日志

---

#### 4.2.3 更新教师

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/teacher/update` |
| **说明** | 更新教师信息 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | ✅ | 教师 ID |
| name | string | ❌ | 教师姓名 |
| employeeId | string | ❌ | 工号 |
| phone | string | ❌ | 联系电话 |
| classIds | number[] | ❌ | 关联班级 ID 列表 |
| status | string | ❌ | 状态：`active` / `inactive` |

**成功响应**：

```json
{ "code": 200, "message": "更新成功", "data": { /* 更新后的教师对象 */ } }
```

**失败响应**：

```json
{ "code": 404, "message": "教师不存在" }
```

---

#### 4.2.4 重置教师密码

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/teacher/reset-password` |
| **说明** | 将教师密码重置为默认密码 `123456` |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | ✅ | 教师 ID |

**成功响应**：

```json
{ "code": 200, "message": "密码已重置为 123456" }
```

**失败响应**：

```json
{ "code": 404, "message": "教师不存在" }
```

**后端实现要点**：
- 将该教师的密码更新为 `123456` 的加密值
- 写入操作日志

---

### 4.3 学生管理

#### 4.3.1 获取学生列表

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/admin/students` |
| **说明** | 获取所有学生信息 |

**请求参数**：无

**成功响应**：

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

**字段说明**：
- `status`：`active`（正常）/ `banned`（已封禁）
- `lastActive`：最后活跃日期，新建学生无活跃记录时返回 `"-"` 或 `null`

---

#### 4.3.2 新增学生

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/student/add` |
| **说明** | 添加单个学生，同时自动创建家长登录账号 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ✅ | 学生姓名 |
| studentId | string | ✅ | 学号（同时作为**家长登录用户名**） |
| classId | number | ✅ | 班级 ID |
| parentName | string | ❌ | 家长姓名 |
| parentPhone | string | ❌ | 家长电话 |

**成功响应**：

```json
{ "code": 200, "message": "添加成功", "data": { /* 新学生对象，含 className */ } }
```

**后端实现要点**：
- 自动创建登录账号：用户名 = `studentId`（学号），初始密码 = `123456`，角色 = `parent`
- 需校验 `studentId` 唯一性，重复则返回 `400`
- 自动关联 `className`（根据 `classId` 查询班级名称）
- 如果班级表保留了 `studentCount` 冗余字段，需 +1
- `status` 默认设为 `active`

---

#### 4.3.3 批量导入学生

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/student/import` |
| **说明** | 批量导入多名学生 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| students | array | ✅ | 学生数组 |

`students` 数组元素结构：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ✅ | 学生姓名 |
| studentId | string | ✅ | 学号 |
| classId | number | ✅ | 班级 ID |
| parentName | string | ❌ | 家长姓名 |
| parentPhone | string | ❌ | 家长电话 |

**成功响应**：

```json
{ "code": 200, "message": "成功导入3名学生" }
```

**后端实现要点**：
- 逐个处理，每个学生需创建登录账号（同 4.3.2）
- 跳过 `studentId` 重复的记录，或返回部分失败信息
- 如果班级表保留了 `studentCount` 冗余字段，需累加
- 写入操作日志，记录导入数量

---

#### 4.3.4 学生调班

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/student/transfer` |
| **说明** | 将学生从当前班级调至新班级 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | number | ✅ | 学生 ID（注意：是数据库 `id`，不是学号） |
| newClassId | number | ✅ | 目标班级 ID |

**成功响应**：

```json
{ "code": 200, "message": "调班成功" }
```

**失败响应**：

```json
{ "code": 404, "message": "学生不存在" }
```

**后端实现要点**：
- 如果班级表保留了 `studentCount` 冗余字段，旧班级 -1，新班级 +1
- 更新学生的 `classId` 和 `className`
- 写入操作日志，记录从哪个班调到哪个班

---

#### 4.3.5 封禁/解封学生

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/student/toggle-ban` |
| **说明** | 切换学生的封禁状态（active ↔ banned） |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| studentId | number | ✅ | 学生 ID |

**成功响应**：

```json
{ "code": 200, "message": "封禁账号成功", "data": { "status": "banned" } }
```

或

```json
{ "code": 200, "message": "解封账号成功", "data": { "status": "active" } }
```

**失败响应**：

```json
{ "code": 404, "message": "学生不存在" }
```

**后端实现要点**：
- 切换 `status`：如果当前是 `active` 则改为 `banned`，反之亦然
- 被封禁的学生应**无法登录**（登录接口需校验 status）
- 写入操作日志

---

### 4.4 班级管理

#### 4.4.1 获取班级列表

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/admin/classes` |
| **说明** | 获取所有班级信息（含班主任名称） |

**请求参数**：无

**成功响应**：

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "三年级一班",
      "grade": 3,
      "headTeacherId": 1,
      "studentCount": 35,
      "createdAt": "2024-09-01",
      "headTeacherName": "李老师"
    }
  ]
}
```

**字段说明**：
- `headTeacherId`：班主任教师 ID，可以为 `null`（未分配）
- `headTeacherName`：班主任名称，未分配时返回 `"未分配"`
- `studentCount`：该班级的学生人数

---

#### 4.4.2 新增班级

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/class/add` |
| **说明** | 创建新班级 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ✅ | 班级名称（如"三年级一班"） |
| grade | number | ✅ | 年级（如 3） |
| headTeacherId | number | ❌ | 班主任教师 ID |

**成功响应**：

```json
{ "code": 200, "message": "创建成功", "data": { /* 新班级对象，studentCount 为 0 */ } }
```

**后端实现要点**：
- `studentCount` 初始为 `0`
- `createdAt` 由后端自动生成
- 写入操作日志

---

#### 4.4.3 更新班级

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/class/update` |
| **说明** | 更新班级信息（含班主任分配） |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | ✅ | 班级 ID |
| name | string | ❌ | 班级名称 |
| grade | number | ❌ | 年级 |
| headTeacherId | number | ❌ | 班主任教师 ID |

**成功响应**：

```json
{ "code": 200, "message": "更新成功", "data": { /* 更新后的班级对象 */ } }
```

**失败响应**：

```json
{ "code": 404, "message": "班级不存在" }
```

---

### 4.5 运动项目管理

#### 4.5.1 获取运动项目列表

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/admin/exercise-types` |
| **说明** | 获取所有运动项目（含已停用） |
| **调用位置** | 管理员运动项目管理页 + 教师发布任务时选择运动项目 |

**请求参数**：无

**成功响应**：

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "跳绳",
      "unit": "个",
      "description": "单摇跳绳计数",
      "status": "active"
    },
    {
      "id": 6,
      "name": "引体向上",
      "unit": "个",
      "description": "标准引体向上",
      "status": "inactive"
    }
  ]
}
```

**字段说明**：
- `status`：`active`（启用）/ `inactive`（停用）
- 教师端发布任务时，应**只展示 `active` 状态**的运动项目

---

#### 4.5.2 新增运动项目

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/exercise-type/add` |
| **说明** | 添加新运动项目 |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | ✅ | 项目名称 |
| unit | string | ✅ | 单位（如"个"、"米"、"秒"、"厘米"） |
| description | string | ❌ | 描述说明 |

**成功响应**：

```json
{ "code": 200, "message": "添加成功", "data": { /* 新运动项目对象，status 默认 active */ } }
```

**后端实现要点**：
- `status` 默认为 `active`
- 建议校验 `name` 唯一性

---

#### 4.5.3 更新运动项目

| 项目 | 说明 |
|------|------|
| **接口路径** | `POST /api/admin/exercise-type/update` |
| **说明** | 更新运动项目信息（含启用/停用状态切换） |

**请求参数** (JSON Body)：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | ✅ | 运动项目 ID |
| name | string | ❌ | 项目名称 |
| unit | string | ❌ | 单位 |
| description | string | ❌ | 描述说明 |
| status | string | ❌ | 状态：`active` / `inactive` |

**成功响应**：

```json
{ "code": 200, "message": "更新成功", "data": { /* 更新后的运动项目对象 */ } }
```

**失败响应**：

```json
{ "code": 404, "message": "项目不存在" }
```

---

### 4.6 系统日志

#### 4.6.1 获取操作日志

| 项目 | 说明 |
|------|------|
| **接口路径** | `GET /api/admin/logs` |
| **说明** | 获取系统操作日志记录 |

**请求参数**：无

**成功响应**：

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "operatorName": "管理员",
      "action": "新增教师",
      "target": "李老师",
      "detail": "工号: T2024001",
      "createdAt": "2024-09-01 09:00:00"
    }
  ]
}
```

**字段说明**：

| 字段 | 说明 |
|------|------|
| operatorName | 操作人名称（后端通过 `operator_id` JOIN `users` 表获取） |
| action | 操作类型（如：新增教师、创建班级、批量导入学生、封禁账号、解封账号、学生调班、重置密码） |
| target | 操作目标（人名或班级名） |
| detail | 操作详情（可为空） |
| createdAt | 操作时间，格式 `YYYY-MM-DD HH:mm:ss` |

**后端实现要点**：
- 以下操作需**自动写入**操作日志：
  - 新增/更新教师
  - 重置教师密码
  - 批量导入学生
  - 学生调班
  - 封禁/解封学生
  - 创建班级
- 按时间倒序返回（最新的在前）

---

## 附录

### 附录一：接口汇总表

| 序号 | 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|------|
| 1 | 认证 | POST | `/api/auth/login` | 用户登录 |
| 2 | 家长 | GET | `/api/parent/tasks` | 获取任务列表 |
| 3 | 家长 | POST | `/api/parent/update` | 更新个人资料 |
| 4 | 教师 | GET | `/api/teacher/students` | 获取学生列表及成绩 |
| 5 | 教师 | POST | `/api/teacher/publish_task` | 发布新任务 |
| 6 | 教师 | POST | `/api/teacher/update_score` | 修改学生成绩 |
| 7 | 教师 | POST | `/api/teacher/update` | 更新教师资料 |
| 8 | 教师 | GET | `/api/teacher/pending_tasks` | 获取学生待办列表 |
| 9 | 管理员 | GET | `/api/admin/dashboard` | Dashboard 统计 |
| 10 | 管理员 | GET | `/api/admin/teachers` | 教师列表 |
| 11 | 管理员 | POST | `/api/admin/teacher/add` | 新增教师 |
| 12 | 管理员 | POST | `/api/admin/teacher/update` | 更新教师 |
| 13 | 管理员 | POST | `/api/admin/teacher/reset-password` | 重置教师密码 |
| 14 | 管理员 | GET | `/api/admin/students` | 学生列表 |
| 15 | 管理员 | POST | `/api/admin/student/add` | 新增学生 |
| 16 | 管理员 | POST | `/api/admin/student/import` | 批量导入学生 |
| 17 | 管理员 | POST | `/api/admin/student/transfer` | 学生调班 |
| 18 | 管理员 | POST | `/api/admin/student/toggle-ban` | 封禁/解封学生 |
| 19 | 管理员 | GET | `/api/admin/classes` | 班级列表 |
| 20 | 管理员 | POST | `/api/admin/class/add` | 新增班级 |
| 21 | 管理员 | POST | `/api/admin/class/update` | 更新班级 |
| 22 | 管理员 | GET | `/api/admin/exercise-types` | 运动项目列表 |
| 23 | 管理员 | POST | `/api/admin/exercise-type/add` | 新增运动项目 |
| 24 | 管理员 | POST | `/api/admin/exercise-type/update` | 更新运动项目 |
| 25 | 管理员 | GET | `/api/admin/logs` | 操作日志 |

### 附录二：HTTP 请求配置

| 配置项 | 值 |
|--------|------|
| 超时时间 | 10000ms (10秒) |
| Content-Type | `application/json` |
| Token 位置 | `Authorization: Bearer <token>` |
| Token 存储（前端） | `localStorage.getItem('token')` |

### 附录三：全局错误处理（前端）

| 场景 | 前端处理方式 |
|------|-------------|
| `401` | 清除 token & user 数据，跳转登录页 |
| `403` | 提示"权限不足" |
| `404` | 提示"资源不存在" |
| `500` | 提示"服务器错误" |
| 网络超时 | 提示"请求超时" |
| 离线 | 提示"网络连接已断开" |

### 附录四：数据库表设计建议

> **通用字段**：以下所有业务表建议都包含 `created_at`（创建时间）和 `updated_at`（更新时间）字段，表中不再重复列出。

#### 核心用户表

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 用户表（统一管理登录账号） | id, username, password_hash, role(`admin`/`teacher`/`parent`), status(`active`/`banned`) |
| `teachers` | 教师信息表 | id, user_id(→users.id), name, employee_id, phone, status(`active`/`inactive`) |
| `students` | 学生信息表 | id, user_id(→users.id), name, student_no, class_id(→classes.id), parent_name, parent_phone, status(`active`/`banned`), last_active |

#### 班级与教师关联

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `classes` | 班级表 | id, name, grade, head_teacher_id(→teachers.id, 可为NULL) |
| `teacher_classes` | 教师-班级关联表（多对多） | id, teacher_id(→teachers.id), class_id(→classes.id) |

> **说明**：`classes` 表不再存 `studentCount`，通过 `SELECT COUNT(*) FROM students WHERE class_id = ?` 动态计算，避免数据不一致。如果对查询性能有要求，可以保留为冗余字段但需在学生增删/调班时同步更新。

#### 任务与成绩

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `tasks` | 任务表 | id, title, deadline, teacher_id(→teachers.id) |
| `task_exercises` | 任务包含的运动项目 | id, task_id(→tasks.id), exercise_type_id(→exercise_types.id), target, weight |
| `student_task_records` | 学生任务完成记录 | id, task_id(→tasks.id), student_id(→students.id), completed_at, total_score |
| `record_results` | 单项运动成绩明细 | id, record_id(→student_task_records.id), exercise_type_id(→exercise_types.id), score, target |

> **说明**：`task_exercises` 和 `record_results` 中的运动项目使用外键 `exercise_type_id` 关联 `exercise_types` 表，不再用字符串存储运动名称。`unit`（单位）从 `exercise_types` 表获取，无需冗余存储。

#### 字典与日志

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `exercise_types` | 运动项目字典表 | id, name, unit, description, status(`active`/`inactive`) |
| `system_logs` | 操作日志表 | id, operator_id(→users.id), action, target, detail |

#### 表关系总览

```
users 1──1 teachers
users 1──1 students
teachers 1──N teacher_classes N──1 classes
classes 1──N students
teachers 1──N tasks
tasks 1──N task_exercises N──1 exercise_types
tasks 1──N student_task_records N──1 students
student_task_records 1──N record_results N──1 exercise_types
```
