这是一份经过修正的、**专门针对 API Key 调用方式**（Google AI Studio/Generative Language 协议）的接口文档。

你可以直接把下面这段内容复制，扔给 Cursor、Windsurf 或 Copilot，它们就能一次性写对代码，不会再报 401 错误了。

-----

````markdown
# Integration Guide: Google Gemini Image Generation API (API Key Auth)

**Critical Context:** We are using the **Google AI Studio (Generative Language)** endpoint, NOT the Vertex AI (aiplatform) endpoint. This allows us to use a standard API Key (`AIza...`) without complex OAuth2 authentication.

## 1. API Configuration

- **Target Model**: `gemini-2.5-flash-image`
- **Base Endpoint**: 
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
- **Authentication Method**: API Key passed via Query Parameter (`?key=...`)
- **HTTP Method**: `POST`
- **Headers**: 
  - `Content-Type`: `application/json`

## 2. Request Payload (JSON)

The API uses the standard Gemini `generateContent` schema. To trigger image generation, we must strictly define `responseModalities`.

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Generate a simple continuous line drawing of a cute dinosaur, black and white, minimalist style, for children coloring book."
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE"],
    "temperature": 0.4
  }
}
````

## 3\. Response Handling (Base64 Extraction)

The API returns the raw image data as a **Base64 string** within the JSON response. It does **NOT** return a URL.

**Response Schema:**

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inlineData": {
              "mimeType": "image/png",
              "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0l..." // Base64 String
            }
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ]
}
```

## 4\. Implementation Logic (For AI Agent)

1.  **Endpoint**: Ensure the URL is `generativelanguage.googleapis.com`, NOT `aiplatform.googleapis.com`.
2.  **API Key**: Load from environment variable (e.g., `process.env.GOOGLE_API_KEY`).
3.  **Parsing**:
      - Check if `candidates[0].finishReason` is `STOP`.
      - Extract `candidates[0].content.parts[0].inlineData.data`.
4.  **Conversion**:
      - Convert the Base64 string to a Buffer (Node.js) or Bytes (Python).
      - Save as a `.png` file or pass to the next function.

## 5\. cURL Test Command

```bash
curl "[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$){GOOGLE_API_KEY}" \
-X POST \
-H "Content-Type: application/json" \
-d '{
  "contents": [{"parts": [{"text": "Simple line art of a cat"}]}],
  "generationConfig": {"responseModalities": ["IMAGE"]}
}'
```

```

---

## 6. 项目中的调用方式

本项目中有多个板块使用 Google Imagen API 生成图片，以下是各板块的调用方式：

### 6.1 Number Path（点对点连线）

**服务文件**: `backend/src/services/generators/dotToDotService.ts`

**调用流程**:
1. 根据主题从变量库随机组合提示词
2. 调用 Gemini API 生成简笔画
3. 保存到 `public/generated/sketches/` 目录
4. 调用 Python 脚本处理成点对点图
5. 最终图片保存到 `public/generated/dots/` 目录

**代码示例**:
```typescript
import { processPatternCompareFromTheme } from './generators/dotToDotService.js';

// 调用方式
const result = await processDotToDotFromTheme('dinosaur', 20);
// 返回: { dotsImageUrl: '/generated/dots/dots_xxx.png', characterName: 'T-Rex' }
```

**环境变量**:
- `GOOGLE_API_KEY`: API 密钥
- `DOTS_USE_API`: 是否启用 API 调用（'true' 启用）
- `DOTS_POINT_COUNT`: 点的数量（默认 20）

### 6.2 Pattern Compare（找不同）

**服务文件**: `backend/src/services/generators/patternCompareService.ts`

**调用流程**:
1. 根据主题获取对应的找不同提示词
2. 调用 Gemini API 生成找不同图片（上下两幅图，6处差异）
3. 保存到 `public/generated/pattern-compare/` 目录

**代码示例**:
```typescript
import { processPatternCompareFromTheme } from './generators/patternCompareService.js';

// 调用方式
const result = await processPatternCompareFromTheme('dinosaur');
// 返回: { imageUrl: '/generated/pattern-compare/pattern_dinosaur_xxx.png', theme: 'dinosaur' }
```

**支持的主题**:
- `dinosaur` - 恐龙
- `unicorn` - 独角兽
- `space` - 太空
- `safari` - 野生动物
- `vehicles` - 交通工具
- `princess` - 公主

**环境变量**:
- `GOOGLE_API_KEY`: API 密钥（必需）

### 6.3 通用调用模板

如果需要添加新的板块调用 API，可以参考以下模板：

```typescript
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const API_KEY = process.env.GOOGLE_API_KEY || '';

async function generateImage(prompt: string): Promise<string | null> {
    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    const payload = {
        contents: [
            {
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 0.4
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json() as any;
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (inlineData?.data) {
        // 保存图片
        const imageBuffer = Buffer.from(inlineData.data, 'base64');
        const outputPath = `public/generated/your-feature/image_${Date.now()}.png`;
        fs.writeFileSync(outputPath, imageBuffer);
        return `/generated/your-feature/image_${Date.now()}.png`;
    }
    
    return null;
}
```

---

## 7. 提示词文档

所有板块的提示词都记录在 `docs/prompt.md` 文件中，包括：
- Number Path 的变量库和组合规则
- Pattern Compare 的6个主题提示词
- 后续其他板块的提示词

---

### 💡 核心修正点（供你参考）

1.  **域名更换**：从 `aiplatform.googleapis.com` 换成了 **`generativelanguage.googleapis.com`**。这是唯一支持直接用 `AIza...` 密钥调用的入口。
2.  **路径简化**：去掉了 `publishers/google/` 这一层复杂的企业级路径，直接使用 `models/{model_id}`。
3.  **强制模态**：保留了 `responseModalities: ["IMAGE"]`，这是让聊天模型乖乖画图的关键参数。