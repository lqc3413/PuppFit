import Mock from 'mockjs'

Mock.setup({
    timeout: '300-600'
})

// Login Mock
Mock.mock('/api/auth/login', 'post', (options) => {
    const { username, password, type } = JSON.parse(options.body)

    if (type === 'admin') {
        if (username === 'admin' && password === 'admin123') {
            return {
                code: 200,
                message: 'Login successful',
                data: {
                    token: 'admin-token',
                    user: { name: 'Admin', role: 'admin' }
                }
            }
        }
    } else if (type === 'teacher') {
        if (username === 'teacher' && password === '123456') {
            return {
                code: 200,
                message: 'Login successful',
                data: {
                    token: 'teacher-token',
                    user: { name: 'Teacher Li', role: 'teacher' }
                }
            }
        }
    } else {
        // Parent
        if (username === 'parent' && password === '123456') {
            return {
                code: 200,
                message: 'Login successful',
                data: {
                    token: 'parent-token',
                    user: {
                        name: '张同学',
                        role: 'parent',
                        parentName: '张家长',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                        classNum: '三年级二班',
                        studentId: '20230302'
                    }
                }
            }
        }
    }

    return {
        code: 401,
        message: '登录失败'
    }
})

// --------------------------
// MOCK DATABASE (Memory)
// --------------------------
const MockDB = {
    // 教师发布的任务（包含多项运动）
    tasks: [
        {
            id: 1001,
            title: '第一周体能测试',
            deadline: '2026-01-25',
            createdAt: '2026-01-15',
            semesterId: 1, // 关联学期
            exercises: [
                { type: '仰卧起坐', target: 50, unit: '个', weight: 0.4 },
                { type: '跳绳', target: 100, unit: '个', weight: 0.3 },
                { type: '跑步', target: 1000, unit: '米', weight: 0.3 }
            ]
        },
        {
            id: 1002,
            title: '日常锻炼打卡',
            deadline: '2026-01-20',
            createdAt: '2026-01-10',
            semesterId: 1,
            exercises: [
                { type: '仰卧起坐', target: 30, unit: '个', weight: 0.5 },
                { type: '跳绳', target: 80, unit: '个', weight: 0.5 }
            ]
        },
        {
            id: 1003,
            title: '新年特训 - 耐力挑战',
            deadline: '2026-01-15',
            createdAt: '2026-01-05',
            semesterId: 1,
            exercises: [
                { type: '跑步', target: 2000, unit: '米', weight: 0.6 },
                { type: '跳绳', target: 150, unit: '个', weight: 0.4 }
            ]
        },
        {
            id: 1004,
            title: '寒假体能基础测试',
            deadline: '2026-01-08',
            createdAt: '2025-12-28',
            semesterId: 1,
            exercises: [
                { type: '仰卧起坐', target: 40, unit: '个', weight: 0.5 },
                { type: '跑步', target: 800, unit: '米', weight: 0.5 }
            ]
        },
        {
            id: 1005,
            title: '元旦运动会预热',
            deadline: '2026-01-03',
            createdAt: '2025-12-25',
            semesterId: 1,
            exercises: [
                { type: '跳绳', target: 120, unit: '个', weight: 0.4 },
                { type: '仰卧起坐', target: 35, unit: '个', weight: 0.3 },
                { type: '跑步', target: 600, unit: '米', weight: 0.3 }
            ]
        }
    ],

    // 教师信息
    teachers: [
        { id: 1, name: '李老师', employeeId: 'T2024001', phone: '13800138001', classIds: [1], status: 'active', createdAt: '2024-09-01' },
        { id: 2, name: '王老师', employeeId: 'T2024002', phone: '13800138002', classIds: [2], status: 'active', createdAt: '2024-09-01' },
        { id: 3, name: '张老师', employeeId: 'T2024003', phone: '13800138003', classIds: [], status: 'inactive', createdAt: '2023-09-01' }
    ],

    // 班级信息
    classes: [
        { id: 1, name: '三年级一班', grade: 3, headTeacherId: 1, studentCount: 35, createdAt: '2024-09-01' },
        { id: 2, name: '三年级二班', grade: 3, headTeacherId: 2, studentCount: 38, createdAt: '2024-09-01' },
        { id: 3, name: '四年级一班', grade: 4, headTeacherId: null, studentCount: 0, createdAt: '2024-09-01' }
    ],

    // 学生基础信息（扩展）
    students: [
        { id: 1, name: '张同学', studentId: '20230201', classId: 2, className: '三年级二班', parentName: '张家长', parentPhone: '13900139001', status: 'active', lastActive: '2026-01-17' },
        { id: 2, name: '李同学', studentId: '20230202', classId: 2, className: '三年级二班', parentName: '李家长', parentPhone: '13900139002', status: 'active', lastActive: '2026-01-16' },
        { id: 3, name: '王同学', studentId: '20230203', classId: 2, className: '三年级二班', parentName: '王家长', parentPhone: '13900139003', status: 'active', lastActive: '2026-01-14' },
        { id: 4, name: '赵同学', studentId: '20230101', classId: 1, className: '三年级一班', parentName: '赵家长', parentPhone: '13900139004', status: 'active', lastActive: '2026-01-15' },
        { id: 5, name: '刘同学', studentId: '20230102', classId: 1, className: '三年级一班', parentName: '刘家长', parentPhone: '13900139005', status: 'banned', lastActive: '2026-01-10' }
    ],

    // 学期配置
    semesters: [
        { id: 1, name: '2025-2026学年第一学期', startDate: '2025-09-01', endDate: '2026-01-31', isCurrent: true },
        { id: 2, name: '2024-2025学年第二学期', startDate: '2025-02-15', endDate: '2025-07-15', isCurrent: false },
        { id: 3, name: '2024-2025学年第一学期', startDate: '2024-09-01', endDate: '2025-01-31', isCurrent: false }
    ],

    // 运动项目库
    exerciseTypes: [
        { id: 1, name: '跳绳', unit: '个', description: '单摇跳绳计数', status: 'active' },
        { id: 2, name: '仰卧起坐', unit: '个', description: '标准仰卧起坐', status: 'active' },
        { id: 3, name: '跑步', unit: '米', description: '跑步距离', status: 'active' },
        { id: 4, name: '立定跳远', unit: '厘米', description: '立定跳远距离', status: 'active' },
        { id: 5, name: '50米跑', unit: '秒', description: '50米冲刺计时', status: 'active' },
        { id: 6, name: '引体向上', unit: '个', description: '标准引体向上', status: 'inactive' }
    ],

    // 操作日志
    systemLogs: [
        { id: 1, operator: '管理员', action: '新增教师', target: '李老师', detail: '工号: T2024001', createdAt: '2024-09-01 09:00:00' },
        { id: 2, operator: '管理员', action: '创建班级', target: '三年级一班', detail: '', createdAt: '2024-09-01 09:30:00' },
        { id: 3, operator: '管理员', action: '绑定班主任', target: '三年级一班', detail: '班主任: 李老师', createdAt: '2024-09-01 10:00:00' },
        { id: 4, operator: '管理员', action: '批量导入学生', target: '三年级二班', detail: '导入3名学生', createdAt: '2024-09-02 14:00:00' },
        { id: 5, operator: '管理员', action: '封禁账号', target: '刘同学', detail: '违规操作', createdAt: '2026-01-10 16:30:00' }
    ],

    // 学生任务完成记录
    studentTaskRecords: [
        // 张同学的记录
        {
            id: 1,
            taskId: 1002,
            studentId: 1,
            completedAt: '2026-01-18',
            results: [
                { type: '仰卧起坐', score: 28, target: 30 },
                { type: '跳绳', score: 80, target: 80 }
            ],
            totalScore: 97
        },
        {
            id: 3,
            taskId: 1003,
            studentId: 1,
            completedAt: '2026-01-14',
            results: [
                { type: '跑步', score: 1900, target: 2000 },
                { type: '跳绳', score: 150, target: 150 }
            ],
            totalScore: 97
        },
        {
            id: 4,
            taskId: 1004,
            studentId: 1,
            completedAt: '2026-01-07',
            results: [
                { type: '仰卧起坐', score: 38, target: 40 },
                { type: '跑步', score: 800, target: 800 }
            ],
            totalScore: 98
        },
        {
            id: 5,
            taskId: 1005,
            studentId: 1,
            completedAt: '2026-01-02',
            results: [
                { type: '跳绳', score: 110, target: 120 },
                { type: '仰卧起坐', score: 35, target: 35 },
                { type: '跑步', score: 580, target: 600 }
            ],
            totalScore: 93
        },
        // 李同学的记录
        {
            id: 2,
            taskId: 1002,
            studentId: 2,
            completedAt: '2026-01-19',
            results: [
                { type: '仰卧起坐', score: 25, target: 30 },
                { type: '跳绳', score: 70, target: 80 }
            ],
            totalScore: 85
        },
        {
            id: 6,
            taskId: 1004,
            studentId: 2,
            completedAt: '2026-01-06',
            results: [
                { type: '仰卧起坐', score: 32, target: 40 },
                { type: '跑步', score: 700, target: 800 }
            ],
            totalScore: 84
        }
    ]
}

// 计算加权平均成绩
function calculateTotalScore(results, exercises) {
    let total = 0
    for (const result of results) {
        const exercise = exercises.find(e => e.type === result.type)
        if (exercise) {
            const singleScore = Math.min(100, Math.round((result.score / result.target) * 100))
            total += singleScore * exercise.weight
        }
    }
    return Math.round(total)
}

// --------------------------
// Parent Endpoints
// --------------------------

// 获取任务（待办 & 已完成）- 按当前学期过滤
Mock.mock('/api/parent/tasks', 'get', () => {
    // 假设当前用户是 "张同学" (ID 1)
    const currentStudentId = 1

    console.log('[Debug] Parent tasks - Total tasks in DB:', MockDB.tasks.length)

    // 获取当前学期
    const currentSemester = MockDB.semesters.find(s => s.isCurrent)
    const currentSemesterId = currentSemester ? currentSemester.id : null
    console.log('[Debug] Current semester:', currentSemester?.name, 'ID:', currentSemesterId)

    // 当前学期的任务
    const semesterTasks = currentSemesterId
        ? MockDB.tasks.filter(t => t.semesterId === currentSemesterId)
        : MockDB.tasks
    console.log('[Debug] Semester tasks count:', semesterTasks.length)

    // 已完成的任务ID
    const completedTaskIds = MockDB.studentTaskRecords
        .filter(r => r.studentId === currentStudentId)
        .map(r => r.taskId)

    // 待办任务 = 当前学期未完成的任务
    const pending = semesterTasks.filter(t => !completedTaskIds.includes(t.id))

    // 已完成任务 = 当前学期有完成记录的
    const completed = MockDB.studentTaskRecords
        .filter(r => r.studentId === currentStudentId)
        .filter(r => semesterTasks.some(t => t.id === r.taskId))
        .map(record => {
            const task = MockDB.tasks.find(t => t.id === record.taskId)
            return {
                ...record,
                taskTitle: task ? task.title : '未知任务',
                exercises: task ? task.exercises : []
            }
        })

    return {
        code: 200,
        message: 'Success',
        data: {
            pending,
            completed,
            currentSemester: currentSemester ? currentSemester.name : ''
        }
    }
})

// Mock Voice Upload
Mock.mock('/api/voice/upload', 'post', () => {
    return {
        code: 200,
        message: 'Sent successfully',
        data: {
            reply: '收到，小狗正在复述：你好呀主人！'
        }
    }
})

// Update Profile
Mock.mock('/api/parent/update', 'post', (options) => {
    const body = JSON.parse(options.body)
    return { code: 200, message: 'Updated', data: { ...body } }
})


// --------------------------
// Teacher Endpoints
// --------------------------

// 1. 获取学生列表及成绩（按任务维度）
Mock.mock('/api/teacher/students', 'get', () => {
    const studentsWithGrades = MockDB.students.map(student => {
        // 获取该学生的所有任务完成记录
        const records = MockDB.studentTaskRecords
            .filter(r => r.studentId === student.id)
            .map(record => {
                const task = MockDB.tasks.find(t => t.id === record.taskId)
                return {
                    ...record,
                    taskTitle: task ? task.title : '未知任务'
                }
            })

        // 计算平均总成绩
        const avgScore = records.length > 0
            ? Math.round(records.reduce((acc, r) => acc + r.totalScore, 0) / records.length)
            : 0

        return {
            ...student,
            avgScore,
            taskRecords: records
        }
    })

    return {
        code: 200,
        message: 'Success',
        data: studentsWithGrades
    }
})

// 2. 发布任务（多项运动）- 自动关联当前学期
Mock.mock('/api/teacher/publish_task', 'post', (options) => {
    const body = JSON.parse(options.body)

    // 获取当前学期
    const currentSemester = MockDB.semesters.find(s => s.isCurrent)

    const newTask = {
        id: Date.now(),
        title: body.title,
        deadline: body.deadline,
        createdAt: new Date().toISOString().split('T')[0],
        semesterId: currentSemester ? currentSemester.id : null,
        exercises: body.exercises || []
    }

    MockDB.tasks.unshift(newTask)
    console.log('[Debug] Task published:', newTask)
    console.log('[Debug] Total tasks now:', MockDB.tasks.length)

    return {
        code: 200,
        message: '发布成功',
        data: newTask
    }
})

// 3. 修改学生成绩（修改某次任务的某项运动成绩）
Mock.mock('/api/teacher/update_score', 'post', (options) => {
    const { recordId, exerciseType, newScore } = JSON.parse(options.body)

    const record = MockDB.studentTaskRecords.find(r => r.id === recordId)
    if (!record) {
        return { code: 404, message: '记录未找到' }
    }

    const result = record.results.find(r => r.type === exerciseType)
    if (!result) {
        return { code: 404, message: '运动项目未找到' }
    }

    result.score = newScore

    // 重新计算总成绩
    const task = MockDB.tasks.find(t => t.id === record.taskId)
    if (task) {
        record.totalScore = calculateTotalScore(record.results, task.exercises)
    }

    return { code: 200, message: '成绩修改成功', data: { totalScore: record.totalScore } }
})

// 4. Update Teacher Profile
Mock.mock('/api/teacher/update', 'post', (options) => {
    const body = JSON.parse(options.body)
    return { code: 200, message: 'Updated', data: { ...body } }
})

// 5. 获取学生待办任务列表（教师视角）- 按当前学期过滤
Mock.mock('/api/teacher/pending_tasks', 'get', () => {
    // 获取当前学期
    const currentSemester = MockDB.semesters.find(s => s.isCurrent)
    const currentSemesterId = currentSemester ? currentSemester.id : null

    // 当前学期的任务
    const semesterTasks = currentSemesterId
        ? MockDB.tasks.filter(t => t.semesterId === currentSemesterId)
        : MockDB.tasks

    // 获取每个学生的待办任务
    const studentsPending = MockDB.students.map(student => {
        // 该学生已完成的任务ID
        const completedTaskIds = MockDB.studentTaskRecords
            .filter(r => r.studentId === student.id)
            .map(r => r.taskId)

        // 待办任务 = 当前学期任务 - 已完成的任务
        const pendingTasks = semesterTasks.filter(t => !completedTaskIds.includes(t.id))

        return {
            studentId: student.id,
            studentName: student.name,
            class: student.className || student.class,
            lastActive: student.lastActive,
            pendingCount: pendingTasks.length,
            pendingTasks: pendingTasks.map(t => ({
                id: t.id,
                title: t.title,
                deadline: t.deadline,
                exerciseCount: t.exercises.length
            }))
        }
    })

    return {
        code: 200,
        message: 'Success',
        data: studentsPending
    }
})

// --------------------------
// Admin Endpoints
// --------------------------

// 管理员 Dashboard 统计
Mock.mock('/api/admin/dashboard', 'get', () => {
    const totalStudents = MockDB.students.length
    const activeStudents = MockDB.students.filter(s => s.status === 'active').length
    const totalTeachers = MockDB.teachers.filter(t => t.status === 'active').length
    const totalClasses = MockDB.classes.length
    const todayCheckIns = MockDB.studentTaskRecords.filter(r =>
        r.completedAt === new Date().toISOString().split('T')[0]
    ).length

    // 最近7天打卡趋势
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const count = MockDB.studentTaskRecords.filter(r => r.completedAt === dateStr).length
        last7Days.push({ date: dateStr, count })
    }

    return {
        code: 200,
        data: {
            totalStudents,
            activeStudents,
            totalTeachers,
            totalClasses,
            todayCheckIns,
            checkInTrend: last7Days
        }
    }
})

// 教师列表
Mock.mock('/api/admin/teachers', 'get', () => {
    const teachers = MockDB.teachers.map(t => {
        const classNames = t.classIds.map(cid => {
            const cls = MockDB.classes.find(c => c.id === cid)
            return cls ? cls.name : ''
        }).filter(Boolean).join(', ')
        return { ...t, classNames }
    })
    return { code: 200, data: teachers }
})

// 新增教师
Mock.mock('/api/admin/teacher/add', 'post', (options) => {
    const body = JSON.parse(options.body)
    const newTeacher = {
        id: Date.now(),
        name: body.name,
        employeeId: body.employeeId,
        phone: body.phone,
        classIds: body.classIds || [],
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    }
    MockDB.teachers.push(newTeacher)
    MockDB.systemLogs.unshift({
        id: Date.now(),
        operator: '管理员',
        action: '新增教师',
        target: body.name,
        detail: `工号: ${body.employeeId}`,
        createdAt: new Date().toLocaleString()
    })
    return { code: 200, message: '添加成功', data: newTeacher }
})

// 更新教师
Mock.mock('/api/admin/teacher/update', 'post', (options) => {
    const body = JSON.parse(options.body)
    const teacher = MockDB.teachers.find(t => t.id === body.id)
    if (!teacher) return { code: 404, message: '教师不存在' }
    Object.assign(teacher, body)
    return { code: 200, message: '更新成功', data: teacher }
})

// 重置教师密码
Mock.mock('/api/admin/teacher/reset-password', 'post', (options) => {
    const { id } = JSON.parse(options.body)
    const teacher = MockDB.teachers.find(t => t.id === id)
    if (!teacher) return { code: 404, message: '教师不存在' }
    MockDB.systemLogs.unshift({
        id: Date.now(),
        operator: '管理员',
        action: '重置密码',
        target: teacher.name,
        detail: '',
        createdAt: new Date().toLocaleString()
    })
    return { code: 200, message: '密码已重置为 123456' }
})

// 学生列表
Mock.mock('/api/admin/students', 'get', () => {
    return { code: 200, data: MockDB.students }
})

// 新增学生
Mock.mock('/api/admin/student/add', 'post', (options) => {
    const body = JSON.parse(options.body)
    const cls = MockDB.classes.find(c => c.id === body.classId)
    const newStudent = {
        id: Date.now(),
        name: body.name,
        studentId: body.studentId,
        classId: body.classId,
        className: cls ? cls.name : '',
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        status: 'active',
        lastActive: '-'
    }
    MockDB.students.push(newStudent)
    if (cls) cls.studentCount++
    return { code: 200, message: '添加成功', data: newStudent }
})

// 批量导入学生
Mock.mock('/api/admin/student/import', 'post', (options) => {
    const { students } = JSON.parse(options.body)
    let successCount = 0
    students.forEach(s => {
        const cls = MockDB.classes.find(c => c.id === s.classId)
        MockDB.students.push({
            id: Date.now() + Math.random(),
            name: s.name,
            studentId: s.studentId,
            classId: s.classId,
            className: cls ? cls.name : '',
            parentName: s.parentName || '',
            parentPhone: s.parentPhone || '',
            status: 'active',
            lastActive: '-'
        })
        if (cls) cls.studentCount++
        successCount++
    })
    MockDB.systemLogs.unshift({
        id: Date.now(),
        operator: '管理员',
        action: '批量导入学生',
        target: '',
        detail: `成功导入${successCount}名学生`,
        createdAt: new Date().toLocaleString()
    })
    return { code: 200, message: `成功导入${successCount}名学生` }
})

// 学生调班
Mock.mock('/api/admin/student/transfer', 'post', (options) => {
    const { studentId, newClassId } = JSON.parse(options.body)
    const student = MockDB.students.find(s => s.id === studentId)
    if (!student) return { code: 404, message: '学生不存在' }

    const oldClass = MockDB.classes.find(c => c.id === student.classId)
    const newClass = MockDB.classes.find(c => c.id === newClassId)

    if (oldClass) oldClass.studentCount--
    if (newClass) newClass.studentCount++

    student.classId = newClassId
    student.className = newClass ? newClass.name : ''

    MockDB.systemLogs.unshift({
        id: Date.now(),
        operator: '管理员',
        action: '学生调班',
        target: student.name,
        detail: `从 ${oldClass?.name || '未知'} 调至 ${newClass?.name || '未知'}`,
        createdAt: new Date().toLocaleString()
    })
    return { code: 200, message: '调班成功' }
})

// 封禁/解封学生
Mock.mock('/api/admin/student/toggle-ban', 'post', (options) => {
    const { studentId } = JSON.parse(options.body)
    const student = MockDB.students.find(s => s.id === studentId)
    if (!student) return { code: 404, message: '学生不存在' }

    student.status = student.status === 'banned' ? 'active' : 'banned'
    const action = student.status === 'banned' ? '封禁账号' : '解封账号'

    MockDB.systemLogs.unshift({
        id: Date.now(),
        operator: '管理员',
        action,
        target: student.name,
        detail: '',
        createdAt: new Date().toLocaleString()
    })
    return { code: 200, message: `${action}成功`, data: { status: student.status } }
})

// 班级列表
Mock.mock('/api/admin/classes', 'get', () => {
    const classes = MockDB.classes.map(c => {
        const headTeacher = MockDB.teachers.find(t => t.id === c.headTeacherId)
        return { ...c, headTeacherName: headTeacher ? headTeacher.name : '未分配' }
    })
    return { code: 200, data: classes }
})

// 新增班级
Mock.mock('/api/admin/class/add', 'post', (options) => {
    const body = JSON.parse(options.body)
    const newClass = {
        id: Date.now(),
        name: body.name,
        grade: body.grade,
        headTeacherId: body.headTeacherId || null,
        studentCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
    }
    MockDB.classes.push(newClass)
    MockDB.systemLogs.unshift({
        id: Date.now(),
        operator: '管理员',
        action: '创建班级',
        target: body.name,
        detail: '',
        createdAt: new Date().toLocaleString()
    })
    return { code: 200, message: '创建成功', data: newClass }
})

// 更新班级
Mock.mock('/api/admin/class/update', 'post', (options) => {
    const body = JSON.parse(options.body)
    const cls = MockDB.classes.find(c => c.id === body.id)
    if (!cls) return { code: 404, message: '班级不存在' }
    Object.assign(cls, body)
    return { code: 200, message: '更新成功', data: cls }
})

// 学期列表
Mock.mock('/api/admin/semesters', 'get', () => {
    return { code: 200, data: MockDB.semesters }
})

// 设置当前学期
Mock.mock('/api/admin/semester/set-current', 'post', (options) => {
    const { id } = JSON.parse(options.body)
    MockDB.semesters.forEach(s => s.isCurrent = s.id === id)
    return { code: 200, message: '设置成功' }
})

// 新增学期
Mock.mock('/api/admin/semester/add', 'post', (options) => {
    const body = JSON.parse(options.body)
    const newSemester = {
        id: Date.now(),
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        isCurrent: false
    }
    MockDB.semesters.unshift(newSemester)
    return { code: 200, message: '添加成功', data: newSemester }
})

// 运动项目库
Mock.mock('/api/admin/exercise-types', 'get', () => {
    return { code: 200, data: MockDB.exerciseTypes }
})

// 新增运动项目
Mock.mock('/api/admin/exercise-type/add', 'post', (options) => {
    const body = JSON.parse(options.body)
    const newType = {
        id: Date.now(),
        name: body.name,
        unit: body.unit,
        description: body.description || '',
        status: 'active'
    }
    MockDB.exerciseTypes.push(newType)
    return { code: 200, message: '添加成功', data: newType }
})

// 更新运动项目
Mock.mock('/api/admin/exercise-type/update', 'post', (options) => {
    const body = JSON.parse(options.body)
    const type = MockDB.exerciseTypes.find(t => t.id === body.id)
    if (!type) return { code: 404, message: '项目不存在' }
    Object.assign(type, body)
    return { code: 200, message: '更新成功', data: type }
})

// 操作日志
Mock.mock('/api/admin/logs', 'get', () => {
    return { code: 200, data: MockDB.systemLogs }
})

console.log('Mock Data Initialized with SharedDB - Admin APIs Ready')
