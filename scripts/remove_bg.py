"""
去除主题图标的白色背景
使用 Pillow 将白色/接近白色的像素变为透明
"""
import os
from PIL import Image

def remove_white_background(input_path, output_path=None, threshold=240):
    """
    去除图片的白色背景
    threshold: 白色阈值，RGB 值大于此值的像素将被视为白色
    """
    if output_path is None:
        output_path = input_path
    
    # 打开图片并转换为 RGBA
    img = Image.open(input_path).convert('RGBA')
    data = img.getdata()
    
    new_data = []
    for item in data:
        # 如果 RGB 都接近白色，设为透明
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0))  # 透明
        else:
            new_data.append(item)
    
    img.putdata(new_data)
    img.save(output_path, 'PNG')
    print(f'✅ 处理完成: {output_path}')

def process_theme_icons():
    """处理主题图标"""
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'public', 'uploads', 'assets', 'B_character_ip')
    
    # 实际文件名映射
    icon_files = {
        'dinosaur': 'dinosaur_icon.png',
        'ocean': 'ocean_whale_icon.png',
        'safari': 'safari_lion_icon.png',
        'space': 'space_astronaut_icon.png',
        'unicorn': 'unicorn_icon.png',
        'vehicles': 'vehicles_car_icon.png'
    }
    
    for theme, filename in icon_files.items():
        icon_path = os.path.join(base_dir, theme, 'icon', filename)
        if os.path.exists(icon_path):
            print(f'处理: {icon_path}')
            remove_white_background(icon_path, threshold=245)
        else:
            print(f'⚠️ 文件不存在: {icon_path}')

def process_bigpng_folder(folder_name):
    """处理 bigpng 文件夹中的图片"""
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'public', 'uploads', 'bigpng', folder_name)
    
    if not os.path.exists(base_dir):
        print(f'⚠️ 文件夹不存在: {base_dir}')
        return
    
    png_files = [f for f in os.listdir(base_dir) if f.endswith('.png')]
    print(f'找到 {len(png_files)} 个 PNG 文件')
    
    for filename in png_files:
        filepath = os.path.join(base_dir, filename)
        print(f'处理: {filename}')
        remove_white_background(filepath, threshold=245)

def main():
    import sys
    if len(sys.argv) > 1:
        # 如果有参数，处理指定的 bigpng 子文件夹
        folder = sys.argv[1]
        process_bigpng_folder(folder)
    else:
        # 默认处理主题图标
        process_theme_icons()

if __name__ == '__main__':
    main()
