# API 集成指南

本文档说明如何在前端代码中集成新的认证和配方管理 API。

## 前端集成

### 1. 使用 AuthContext

`AuthContext` 提供了用户认证状态管理和相关方法。

#### 在组件中使用

```typescript
import { useAuth } from '../lib/AuthContext';

const MyComponent = () => {
  const { user, session, isLoading, signUp, signIn, signOut, error } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password');
      // 登录成功，用户状态会自动更新
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <button onClick={handleLogin}>Sign In</button>
      )}
    </div>
  );
};
```

### 2. 保存配方到云端

当用户登录时，配方会自动保存到 Supabase。

```typescript
const handleSaveRecipe = async (result: AlloyResult) => {
  if (!user || !session?.access_token) {
    // 用户未登录，仅保存到本地
    setSavedRecipes(prev => [newRecipe, ...prev]);
    return;
  }

  try {
    const response = await fetch('/api/recipes/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        alloyName: result.alloyName,
        codeName: result.codeName,
        description: result.description,
        composition: result.composition,
        properties: result.properties,
        feasibility: result.feasibility,
        manufacturing: result.manufacturing,
        costAnalysis: result.costAnalysis,
        applications: result.applications,
        deepApplications: result.deepApplications,
        similarAlloys: result.similarAlloys,
        originalRequirements: requirements,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save recipe');
    }

    const data = await response.json();
    console.log('Recipe saved:', data);
  } catch (err) {
    console.error('Error saving recipe:', err);
  }
};
```

### 3. 获取用户的配方列表

```typescript
const fetchRecipes = async () => {
  if (!session?.access_token) return;

  try {
    const response = await fetch('/api/recipes/list?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const data = await response.json();
    setRecipes(data.data);
    setPagination(data.pagination);
  } catch (err) {
    console.error('Error fetching recipes:', err);
  }
};
```

### 4. 获取单个配方

```typescript
const fetchRecipe = async (recipeId: string) => {
  if (!session?.access_token) return;

  try {
    const response = await fetch(`/api/recipes/get?id=${recipeId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }

    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error('Error fetching recipe:', err);
  }
};
```

### 5. 删除配方

```typescript
const deleteRecipe = async (recipeId: string) => {
  if (!session?.access_token) return;

  try {
    const response = await fetch(`/api/recipes/delete?id=${recipeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }

    setRecipes(prev => prev.filter(r => r.id !== recipeId));
  } catch (err) {
    console.error('Error deleting recipe:', err);
  }
};
```

## 后端集成

### 1. 认证 API

#### 注册新用户

```bash
curl -X POST https://your-domain.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "username": "username"
  }'
```

#### 用户登录

```bash
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

### 2. 配方 API

所有配方 API 都需要在请求头中包含认证令牌：

```bash
Authorization: Bearer <access_token>
```

#### 保存配方

```bash
curl -X POST https://your-domain.vercel.app/api/recipes/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "alloyName": "TitanFury",
    "codeName": "TF-001",
    "description": "High-strength alloy for aerospace",
    "composition": [...],
    "properties": [...],
    "feasibility": {...},
    "manufacturing": {...},
    "costAnalysis": {...},
    "applications": [...],
    "deepApplications": [...],
    "similarAlloys": [...],
    "originalRequirements": {...}
  }'
```

#### 获取配方列表

```bash
curl -X GET 'https://your-domain.vercel.app/api/recipes/list?page=1&limit=10&sortBy=created_at&sortOrder=desc' \
  -H "Authorization: Bearer <access_token>"
```

#### 获取单个配方

```bash
curl -X GET 'https://your-domain.vercel.app/api/recipes/get?id=<recipe_id>' \
  -H "Authorization: Bearer <access_token>"
```

#### 删除配方

```bash
curl -X DELETE 'https://your-domain.vercel.app/api/recipes/delete?id=<recipe_id>' \
  -H "Authorization: Bearer <access_token>"
```

## 错误处理

所有 API 端点都遵循以下错误响应格式：

```json
{
  "error": "Error message describing what went wrong"
}
```

常见的 HTTP 状态码：

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（缺少或无效的令牌） |
| 404 | 资源不存在 |
| 405 | 方法不允许 |
| 500 | 服务器内部错误 |

## 最佳实践

### 1. 令牌管理

- 始终在请求头中包含有效的认证令牌
- 令牌过期时，使用刷新令牌获取新令牌
- 不要在客户端代码中硬编码令牌

### 2. 错误处理

```typescript
try {
  const response = await fetch('/api/recipes/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(recipeData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Unknown error');
  }

  const data = await response.json();
  return data;
} catch (err) {
  console.error('API error:', err);
  // 向用户显示错误信息
}
```

### 3. 加载状态管理

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/recipes/list', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    // 处理数据
  } catch (err: any) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### 4. 缓存策略

考虑使用本地缓存减少 API 调用：

```typescript
const [recipesCache, setRecipesCache] = useState<any[] | null>(null);
const [cacheTime, setCacheTime] = useState<number>(0);

const fetchRecipes = async (forceRefresh = false) => {
  const now = Date.now();
  const cacheExpiry = 5 * 60 * 1000; // 5 分钟

  if (!forceRefresh && recipesCache && now - cacheTime < cacheExpiry) {
    return recipesCache;
  }

  // 从 API 获取数据
  const response = await fetch('/api/recipes/list', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();
  setRecipesCache(data.data);
  setCacheTime(now);

  return data.data;
};
```

## 常见问题

### Q: 如何处理令牌过期？

A: Supabase 会自动处理令牌刷新。当令牌过期时，`useAuth()` hook 会自动获取新令牌。

### Q: 能否在没有登录的情况下保存配方？

A: 可以。未登录的用户的配方会保存到浏览器本地存储。登录后，用户可以将本地配方同步到云端。

### Q: 如何实现配方搜索功能？

A: 当前 API 支持按创建时间排序。后续版本可以扩展 `/api/recipes/list` 端点以支持搜索和筛选。

### Q: 配方数据的大小限制是多少？

A: Supabase 对 JSONB 字段没有严格的大小限制，但建议保持在 1MB 以下以确保最佳性能。
