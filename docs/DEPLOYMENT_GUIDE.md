# AlloyGenesis AI 部署指南

## 第一阶段：Supabase 设置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录您的账户
2. 点击 "New Project"
3. 填写项目名称（例如：`alloygenesis-ai`）
4. 设置数据库密码
5. 选择区域（建议选择离用户最近的区域）
6. 点击 "Create new project"

### 2. 获取 API 密钥

项目创建完成后，进入 **Settings** → **API**，您将看到：

- **Project URL**: `https://xxxxx.supabase.co`
- **anon key**: 用于前端
- **service_role key**: 用于后端（需妥善保管）

### 3. 创建数据库表

1. 进入 **SQL Editor**
2. 点击 "New Query"
3. 复制并粘贴 `supabase/schema.sql` 中的所有 SQL 代码
4. 点击 "Run" 执行

这将创建两张表：
- `profiles`: 用户个人资料
- `recipes`: 用户的合金配方

### 4. 启用 Row Level Security (RLS)

RLS 策略已在 `schema.sql` 中定义，执行后会自动启用。您可以在 **Authentication** → **Policies** 中查看和管理这些策略。

## 第二阶段：Vercel 部署

### 1. 连接 GitHub 仓库

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 选择 "Import Git Repository"
4. 输入您的 GitHub 仓库 URL：`https://github.com/mangooding/AlloyGenesis-AI`
5. 点击 "Import"

### 2. 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | 您的 Gemini API 密钥 | 已配置（无需修改） |
| `SUPABASE_URL` | 您的 Supabase Project URL | 从 Supabase 获取 |
| `SUPABASE_SERVICE_KEY` | 您的 Supabase service_role key | 从 Supabase 获取 |

**重要：** `SUPABASE_SERVICE_KEY` 仅用于后端 API 函数，不会暴露给前端。

### 3. 配置前端环境变量

在项目根目录创建 `.env.local` 文件（用于本地开发）：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

对于 Vercel 部署，在项目设置中添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_SUPABASE_URL` | 您的 Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | 您的 Supabase anon key |

### 4. 部署

1. 在 Vercel 中，点击 "Deploy"
2. 等待部署完成
3. 访问您的部署 URL 进行测试

## 第三阶段：本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地环境

创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可开始开发。

### 4. 构建生产版本

```bash
npm run build
```

## API 端点文档

### 认证相关

#### 用户注册

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

#### 用户登录

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "session": { ... },
  "user": { ... }
}
```

### 配方相关

所有配方 API 都需要在请求头中包含认证令牌：

```
Authorization: Bearer <access_token>
```

#### 保存配方

```
POST /api/recipes/save
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "alloyName": "TitanFury",
  "codeName": "TF-001",
  "description": "High-strength alloy",
  "composition": [...],
  "properties": [...],
  "feasibility": {...},
  "manufacturing": {...},
  "costAnalysis": {...},
  "applications": [...],
  "deepApplications": [...],
  "similarAlloys": [...],
  "originalRequirements": {...}
}

Response:
{
  "message": "Recipe saved successfully",
  "data": [...]
}
```

#### 获取配方列表

```
GET /api/recipes/list?page=1&limit=10&sortBy=created_at&sortOrder=desc
Authorization: Bearer <access_token>

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### 获取单个配方

```
GET /api/recipes/get?id=<recipe_id>
Authorization: Bearer <access_token>

Response:
{
  "data": {...}
}
```

#### 删除配方

```
DELETE /api/recipes/delete?id=<recipe_id>
Authorization: Bearer <access_token>

Response:
{
  "message": "Recipe deleted successfully"
}
```

## 故障排除

### 问题：无法连接到 Supabase

**解决方案：**
1. 检查 `.env.local` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
2. 确保 Supabase 项目已创建并处于活跃状态
3. 检查浏览器控制台是否有 CORS 错误

### 问题：认证失败

**解决方案：**
1. 确保在 Supabase 中启用了 Email/Password 认证
2. 检查 API 端点是否正确
3. 查看 Vercel 函数日志中的错误信息

### 问题：配方无法保存

**解决方案：**
1. 确保用户已登录
2. 检查 `SUPABASE_SERVICE_KEY` 是否在 Vercel 环境变量中正确配置
3. 查看 Vercel 函数日志中的数据库错误

## 后续优化

### 性能优化

1. **缓存策略**：使用 Vercel 的缓存功能缓存 API 响应
2. **CDN**：配置 Supabase 存储的 CDN 加速
3. **数据库索引**：为常用查询字段添加索引

### 安全加固

1. **CORS 配置**：在 Supabase 中配置允许的来源
2. **速率限制**：在 API 函数中实现速率限制
3. **输入验证**：增强所有 API 端点的输入验证

### 功能扩展

1. **Google OAuth**：集成 Google 登录
2. **配方版本管理**：实现配方版本控制
3. **团队协作**：支持多用户团队
4. **导出功能**：支持导出为 PDF 或 Excel

## 支持与反馈

如有任何问题或建议，请提交 GitHub Issue 或联系开发团队。
