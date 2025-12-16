先说结论：Nano Banana Pro 现在是 Google 的 Gemini 3 Pro Image 模型的一个对外名字，模型本身跑在 Google 的服务器上，你只能通过 Gemini API / Google AI Studio / Google Cloud 去调用，不能下载到本机离线跑。
你说的“本地调用”，通常就是：代码在你自己的电脑 / 服务器上，本地写代码，通过 HTTP 请求去调 Google 的云模型。

下面我给你一套从 0 到能在本地写代码调 Nano Banana Pro 的完整流程，你照着做就行。

一、先搞清楚你要用的东西

模型名字（官方 ID）：gemini-3-pro-image-preview
对外品牌名字叫 Nano Banana Pro，本质是 Gemini 3 Pro 的图像生成 / 编辑模型。
Google DeepMind
+2
Google AI for Developers
+2

调用方式：

最简单：用 Gemini API + API Key（推荐）

重型方案：通过 Google Cloud Vertex AI（适合已经在用 GCP 的项目）

下面我优先讲 Gemini API + AI Studio 的流程，这是对个人开发者最友好的。

二、申请账号 & 开启 Gemini API
1. 准备 Google 账号

需要一个普通的 Google 帐号（Gmail 即可）。

注意：Gemini API 在部分地区可能不可用，要以 Google 实际政策为准。

2. 进入 Google AI Studio

打开：Google AI Studio（浏览器访问即可）。
Google AI Studio

用你的 Google 账号登录，按提示同意相关条款。

3. 创建 Gemini API Key

在 AI Studio 里：

找到 “API keys” 页面。
Google AI for Developers

点击 “Create API key”，选择环境（一般选 “for server” 即可）。

复制生成的 API Key（很重要，只在第一次完整展示一次）。

安全提醒：

不要把 API Key 放在前端代码或任何公开仓库里

放在本地环境变量 / 后端配置文件中

三、本地代码里调用 Nano Banana Pro（Gemini 3 Pro Image）

下面给你两种最常用方式：Python SDK 和 cURL（任何语言都能照着改）。

1. Python 调用示例

先安装官方库（在你的项目目录里）：

pip install google-genai


然后写一个示例脚本 nano_banana_demo.py：

import os
from google import genai
from google.genai import types

# 1. 把你的 API Key 放在环境变量里，或者直接在这里写（不推荐明文）
os.environ["GEMINI_API_KEY"] = "YOUR_API_KEY_HERE"

# 2. 创建客户端（官方 SDK 会自动从环境变量读 API key）
client = genai.Client()

# 3. 调用 Nano Banana Pro（Gemini 3 Pro Image）
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",  # Nano Banana Pro 对应的模型 ID :contentReference[oaicite:3]{index=3}
    contents="Generate a cinematic cyberpunk city at night with neon lights.",
    config=types.GenerateContentConfig(
        image_config=types.ImageConfig(
            aspect_ratio="16:9",
            image_size="4K"  # 支持 2K / 4K 等分辨率
        )
    ),
)

# 4. 从返回里拿到图片数据并保存
image_parts = [part for part in response.parts if part.inline_data]
if not image_parts:
    raise RuntimeError("No image data returned")

img = image_parts[0].as_image()
img.save("nano_banana_result.png")
print("saved to nano_banana_result.png")


运行：

python nano_banana_demo.py


如果一切正常，你会在当前目录得到一张 nano_banana_result.png，就是 Nano Banana Pro 生成的图。

说明：官方文档就是用这种方式调用 gemini-3-pro-image-preview 做图片生成 / 编辑的。
Google AI for Developers

2. cURL / 任意后端调用示例

如果你用 Node.js、Go、Java 等，都可以参考这个 REST 调用：

export GEMINI_API_KEY="YOUR_API_KEY_HERE"

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          { "text": "Generate a 4K illustration of a cute robot working in a futuristic office." }
        ]
      }
    ],
    "generationConfig": {
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "4K"
      }
    }
  }'


返回会是一段 JSON，其中图片数据在 inlineData.data 里，是 base64 编码；你在后端把它解码后写成 xxx.png 或 xxx.webp 即可。
Google AI for Developers

四、在“本地网页项目”里接入的大致架构

如果你要做自己的 Web 服务（比如你那个利润系统或图片网站），推荐这样设计：

1. 后端（Node / Python / Go 任意）

提供一个接口，例如：POST /api/generate-image

接受前端传来的：

prompt（文字描述）

可选参数：分辨率、风格、种子等

在后端里：

使用服务器上的环境变量 GEMINI_API_KEY

调用 gemini-3-pro-image-preview

得到图片 base64 → 存文件 / 上传对象存储（如 Cloud Storage、S3）→ 返回图片 URL 或 base64 给前端

千万不要在前端直接用 API Key 调 Google，否则 Key 会泄露。

2. 前端（你的网页）

一个简单的表单：

输入框：Prompt

下拉：画面比例、分辨率

按钮：Generate

点击按钮 → 调你自己的 /api/generate-image → 拿到图片 URL → <img> 展示

这样你的整个系统对用户来说是“本地网站”，对模型来说由你的后端去调 Google 云。

五、账号 / 费用 / 限制 需要注意的点

免费额度 & 限制

Nano Banana Pro 属于高级图像模型，对免费用户有较严格的调用次数限制（几张图/天），说明 Google 已经对这个模型做了限流。
The Verge
+1

如果你要做正式产品，基本上要走 付费套餐（Gemini Advanced / 企业计划）。

计费方式

图像模型按 每次生成 / 分辨率 / 是否使用搜索等 计费，具体单价需要看 Google 的最新价格页面（随时间会变）。
Google AI for Developers
+1

建议在后端加一个简单的调用日志表，记录每次调用时间、prompt、耗时、是否成功，方便以后算成本。

安全与合规

注意不要把用户敏感隐私数据直接写到 prompt 里。

关注 Google 的内容政策和使用条款，特别是商用相关部分。