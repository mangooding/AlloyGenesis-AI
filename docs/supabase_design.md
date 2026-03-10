# Supabase 数据库设计与配置

## 1. 数据库表结构

为了支持用户注册登录和云端配方保存功能，我们将在 Supabase 中创建以下两张表：`profiles` 和 `recipes`。

### 1.1 `profiles` 表

`profiles` 表用于存储用户的个人信息，并与 Supabase Auth 的 `auth.users` 表关联。我们为该表启用了行级安全（Row Level Security, RLS），确保用户只能访问和修改自己的个人资料。

| 字段名       | 类型                     | 描述                                     | 约束                                     |
|--------------|--------------------------|------------------------------------------|------------------------------------------|
| `id`         | `uuid`                   | 用户唯一标识符，与 `auth.users.id` 关联 | 主键，外键关联 `auth.users`，级联删除    |
| `updated_at` | `timestamp with time zone` | 记录更新时间                             |                                          |
| `username`   | `text`                   | 用户名                                   | 唯一，长度至少为 3 个字符                |
| `avatar_url` | `text`                   | 用户头像 URL                             |                                          |
| `website`    | `text`                   | 个人网站 URL                             |                                          |

**行级安全策略 (RLS):**

*   **SELECT:** `Public profiles are viewable by everyone.` (所有人可查看公开资料)
*   **INSERT:** `Users can insert their own profile.` (用户只能创建自己的资料)
*   **UPDATE:** `Users can update own profile.` (用户只能更新自己的资料)

### 1.2 `recipes` 表

`recipes` 表用于存储用户生成的合金配方。该表也启用了行级安全，确保用户只能管理自己的配方数据。

| 字段名                 | 类型                     | 描述                                     | 约束                                     |
|------------------------|--------------------------|------------------------------------------|------------------------------------------|
| `id`                   | `uuid`                   | 配方唯一标识符                           | 主键，默认使用 `uuid_generate_v4()`      |
| `user_id`              | `uuid`                   | 拥有该配方的用户 ID                      | 外键关联 `auth.users`，级联删除          |
| `created_at`           | `timestamp with time zone` | 配方创建时间                             | 默认使用 `now()`                         |
| `alloy_name`           | `text`                   | 合金名称                                 | 非空                                     |
| `code_name`            | `text`                   | 合金代号                                 |                                          |
| `description`          | `text`                   | 配方描述                                 |                                          |
| `composition`          | `jsonb`                  | 元素组成 (JSON 对象)                     |                                          |
| `properties`           | `jsonb`                  | 合金属性 (JSON 对象)                     |                                          |
| `feasibility`          | `jsonb`                  | 可行性分析 (JSON 对象)                   |                                          |
| `manufacturing`        | `jsonb`                  | 制造数据 (JSON 对象)                     |                                          |
| `cost_analysis`        | `jsonb`                  | 成本分析 (JSON 对象)                     |                                          |
| `applications`         | `jsonb`                  | 应用领域 (JSON 数组)                     |                                          |
| `deep_applications`    | `jsonb`                  | 深度应用分析 (JSON 数组)                 |                                          |
| `similar_alloys`       | `jsonb`                  | 相似合金 (JSON 数组)                     |                                          |
| `original_requirements`| `jsonb`                  | 原始用户需求 (JSON 对象)                 |                                          |

**行级安全策略 (RLS):**

*   **SELECT:** `Recipes are viewable by their owners.` (用户只能查看自己的配方)
*   **INSERT:** `Users can insert their own recipes.` (用户只能创建自己的配方)
*   **UPDATE:** `Users can update their own recipes.` (用户只能更新自己的配方)
*   **DELETE:** `Users can delete their own recipes.` (用户只能删除自己的配方)

## 2. Supabase 配置

为了连接到 Supabase 服务，我们需要在项目根目录下创建一个 `.env.local` 文件，并配置以下环境变量：

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
GITHUB_TOKEN=ghp_Qg0CZ7uSLXBBtvyJbIuooQELNLFg5m1UvTx8
```

请将 `YOUR_SUPABASE_URL` 和 `YOUR_SUPABASE_ANON_KEY` 替换为您的 Supabase 项目的实际 URL 和匿名密钥。这些信息可以在您的 Supabase 项目设置中找到。

**重要提示：**

*   `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 将在前端代码中通过 Vite 暴露给浏览器，因此请确保您的 Supabase RLS 策略配置正确，以防止未经授权的数据访问。
*   `GITHUB_TOKEN` 是用于访问 GitHub 仓库的个人访问令牌，请妥善保管。
