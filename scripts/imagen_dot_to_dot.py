"""
Google Imagen + 点对点连线图生成器
1. 调用 Google Gemini 2.5 Flash Image API 生成简笔画
2. 使用 dot_to_dot.py 处理成点对点图
3. 将结果居中放入 Number Path 的黑色方框中

使用方法:
    python scripts/imagen_dot_to_dot.py [prompt] [--api-key KEY]

示例:
    python scripts/imagen_dot_to_dot.py "cute dinosaur"
    python scripts/imagen_dot_to_dot.py "cute cat" --api-key YOUR_API_KEY
"""

import os
import sys
import json
import base64
import argparse
import requests
from datetime import datetime

# 添加 scripts 目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dot_to_dot import generate_dot_to_dot

# 默认配置
DEFAULT_PROMPT = "Generate a simple line drawing of a cute baby dinosaur, black outline only, white background, coloring book style, no shading, minimal details"
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

# Number Path canvas 尺寸（根据 imageGenerator.ts）
CANVAS_WIDTH = 678
CANVAS_HEIGHT = 900


def call_imagen_api(prompt: str, api_key: str) -> bytes:
    """
    调用 Google Gemini 2.0 Flash API 生成图片
    返回图片的二进制数据
    """
    url = f"{API_ENDPOINT}?key={api_key}"
    
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"]
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"🎨 正在调用 Google Gemini API...")
    print(f"   Prompt: {prompt[:60]}...")
    
    response = requests.post(url, json=payload, headers=headers, timeout=120)
    
    if response.status_code != 200:
        raise Exception(f"API 调用失败: {response.status_code} - {response.text[:500]}")
    
    data = response.json()
    
    # 检查响应
    if not data.get("candidates"):
        raise Exception("API 返回空结果")
    
    candidate = data["candidates"][0]
    
    # 检查安全拦截
    if candidate.get("finishReason") == "SAFETY":
        raise Exception("图片被安全策略拦截")
    
    # 提取 Base64 图片数据（可能在多个 parts 中）
    parts = candidate["content"]["parts"]
    for part in parts:
        if "inlineData" in part:
            image_base64 = part["inlineData"]["data"]
            mime_type = part["inlineData"].get("mimeType", "image/png")
            print(f"   ✅ 图片生成成功 (格式: {mime_type})")
            return base64.b64decode(image_base64)
    
    raise Exception("响应中未找到图片数据")


def resize_and_center_image(input_path: str, output_path: str, 
                            target_width: int = CANVAS_WIDTH, 
                            target_height: int = CANVAS_HEIGHT):
    """
    将图片等比缩放并居中放入目标尺寸的白色画布中
    """
    import cv2
    import numpy as np
    
    img = cv2.imread(input_path)
    if img is None:
        raise Exception(f"无法读取图片: {input_path}")
    
    h, w = img.shape[:2]
    
    # 计算缩放比例（保持宽高比，留一些边距）
    padding = 40  # 内边距
    available_width = target_width - padding * 2
    available_height = target_height - padding * 2
    
    scale = min(available_width / w, available_height / h)
    
    new_w = int(w * scale)
    new_h = int(h * scale)
    
    # 缩放图片
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    
    # 创建白色画布
    canvas = np.ones((target_height, target_width, 3), dtype=np.uint8) * 255
    
    # 计算居中位置
    x_offset = (target_width - new_w) // 2
    y_offset = (target_height - new_h) // 2
    
    # 将图片放入画布中心
    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
    
    cv2.imwrite(output_path, canvas)
    print(f"   ✅ 图片已居中: {output_path}")
    return output_path


def main():
    # 获取脚本所在目录的父目录（项目根目录）
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    parser = argparse.ArgumentParser(description='Google Imagen + 点对点连线图生成器')
    parser.add_argument('prompt', nargs='?', default=DEFAULT_PROMPT,
                       help='图片生成提示词')
    parser.add_argument('--api-key', default=None,
                       help='Google API Key (也可通过环境变量 GOOGLE_API_KEY 设置)')
    parser.add_argument('--output-dir', default='backend/public/generated',
                       help='输出目录')
    parser.add_argument('--num-points', type=int, default=50,
                       help='点对点采样点数')
    parser.add_argument('--angle-threshold', type=int, default=20,
                       help='角度过滤阈值')
    parser.add_argument('--skip-api', action='store_true',
                       help='跳过 API 调用，使用已有图片测试')
    parser.add_argument('--input-image', default=None,
                       help='使用已有图片（跳过 API 调用）')
    
    args = parser.parse_args()
    
    # 获取 API Key
    api_key = args.api_key or os.environ.get('GOOGLE_API_KEY')
    
    if not api_key and not args.skip_api and not args.input_image:
        print("❌ 请提供 API Key (--api-key 或环境变量 GOOGLE_API_KEY)")
        return
    
    # 转换为绝对路径
    output_dir = os.path.join(project_root, args.output_dir) if not os.path.isabs(args.output_dir) else args.output_dir
    
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    
    # 生成时间戳文件名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    try:
        if args.input_image:
            # 使用已有图片，转换为绝对路径
            original_path = os.path.join(project_root, args.input_image) if not os.path.isabs(args.input_image) else args.input_image
            print(f"📷 使用已有图片: {original_path}")
        elif args.skip_api:
            print("⚠️ 跳过 API 调用模式，请提供 --input-image")
            return
        else:
            # 步骤1: 调用 API 生成图片
            image_bytes = call_imagen_api(args.prompt, api_key)
            
            # 保存原图
            original_path = os.path.join(output_dir, f"imagen_original_{timestamp}.png")
            with open(original_path, 'wb') as f:
                f.write(image_bytes)
            print(f"   💾 原图已保存: {original_path}")
        
        # 步骤2: 使用 dot_to_dot.py 处理
        print(f"\n🔵 正在生成点对点图...")
        dots_path = os.path.join(output_dir, f"imagen_dots_{timestamp}.png")
        generate_dot_to_dot(original_path, dots_path, args.num_points, args.angle_threshold)
        
        # 步骤3: 居中放入 canvas 尺寸
        print(f"\n📐 正在调整尺寸并居中...")
        final_path = os.path.join(output_dir, f"number_path_{timestamp}.png")
        resize_and_center_image(dots_path, final_path, CANVAS_WIDTH, CANVAS_HEIGHT)
        
        print(f"\n✅ 完成！")
        print(f"   原图: {original_path}")
        print(f"   点对点: {dots_path}")
        print(f"   最终图: {final_path}")
        
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
