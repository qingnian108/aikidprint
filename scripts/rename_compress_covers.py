"""
重命名并压缩 Cover 文件夹中的封面图片
命名格式: {theme}_cover_{number}.png
"""

import os
import re
from PIL import Image

# 封面文件夹路径
COVER_DIR = r"E:\codex\ai-kid-print\backend\public\uploads\Cover"

# 主题映射
THEMES = ['dinosaur', 'ocean', 'safari', 'space', 'unicorn', 'vehicles']

# 压缩质量设置
MAX_WIDTH = 1200  # 最大宽度
MAX_HEIGHT = 1600  # 最大高度
QUALITY = 85  # PNG 压缩质量

def extract_number(filename):
    """从文件名中提取数字"""
    match = re.search(r'_(\d+)_', filename)
    if match:
        return int(match.group(1))
    return 0

def compress_image(input_path, output_path):
    """压缩图片"""
    try:
        with Image.open(input_path) as img:
            # 获取原始尺寸
            original_size = os.path.getsize(input_path)
            width, height = img.size
            
            # 计算缩放比例
            ratio = min(MAX_WIDTH / width, MAX_HEIGHT / height, 1.0)
            
            if ratio < 1.0:
                new_width = int(width * ratio)
                new_height = int(height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # 转换为 RGB 如果是 RGBA（PNG 优化）
            if img.mode == 'RGBA':
                # 保持透明度，使用 PNG 优化
                img.save(output_path, 'PNG', optimize=True)
            else:
                img.save(output_path, 'PNG', optimize=True)
            
            new_size = os.path.getsize(output_path)
            reduction = (1 - new_size / original_size) * 100
            print(f"  压缩: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB ({reduction:.1f}% 减少)")
            
    except Exception as e:
        print(f"  压缩失败: {e}")
        # 如果压缩失败，直接复制原文件
        import shutil
        shutil.copy2(input_path, output_path)

def process_theme(theme):
    """处理单个主题的封面"""
    theme_dir = os.path.join(COVER_DIR, theme)
    
    if not os.path.exists(theme_dir):
        print(f"主题文件夹不存在: {theme_dir}")
        return
    
    print(f"\n处理主题: {theme}")
    print("-" * 40)
    
    # 获取所有 PNG 文件
    files = [f for f in os.listdir(theme_dir) if f.endswith('.png')]
    
    # 按数字排序
    files.sort(key=extract_number)
    
    # 重命名和压缩
    for idx, old_name in enumerate(files, 1):
        old_path = os.path.join(theme_dir, old_name)
        new_name = f"{theme}_cover_{idx:02d}.png"
        new_path = os.path.join(theme_dir, new_name)
        
        print(f"\n{old_name}")
        print(f"  -> {new_name}")
        
        # 先压缩到临时文件
        temp_path = os.path.join(theme_dir, f"_temp_{new_name}")
        compress_image(old_path, temp_path)
        
        # 删除原文件
        if os.path.exists(old_path) and old_path != new_path:
            os.remove(old_path)
        
        # 重命名临时文件
        if os.path.exists(new_path):
            os.remove(new_path)
        os.rename(temp_path, new_path)

def main():
    print("=" * 50)
    print("封面图片重命名和压缩工具")
    print("=" * 50)
    
    for theme in THEMES:
        process_theme(theme)
    
    print("\n" + "=" * 50)
    print("完成!")
    print("=" * 50)

if __name__ == "__main__":
    main()
