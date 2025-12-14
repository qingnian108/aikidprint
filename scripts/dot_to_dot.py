"""
点对点连线图生成器 v3
参考 Connect-The-Dots-Generator 的角度过滤算法
保留拐角处的点，删除直线部分的点

使用方法:
    python scripts/dot_to_dot.py <输入图片路径> [输出图片路径] [点数量] [角度阈值]

示例:
    python scripts/dot_to_dot.py docs/ki.png output.png 30 20
"""

import cv2
import numpy as np
import sys
import os
import math


def angle_between_points(p1, p2):
    """计算从 p1 到 p2 的角度"""
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    return math.atan2(dy, dx)


def angle_at_point(p1, p2, p3):
    """计算 p1-p2-p3 三点形成的角度（在 p2 处的角度）"""
    angle1 = angle_between_points(p1, p2)
    angle2 = angle_between_points(p3, p2)
    return abs(angle1 - angle2)


def rad_to_deg(rad):
    """弧度转角度"""
    return rad * 180 / math.pi


def filter_points_on_angle(points, angle_threshold=20):
    """
    角度过滤：删除接近直线的点，保留拐角处的点
    
    如果三个连续点形成的角度接近 180°（直线），删除中间的点
    angle_threshold: 角度阈值，越小保留的点越少
    """
    if len(points) < 3:
        return points
    
    excluded_indices = set()
    i = 0
    while i < len(points) - 2:
        p1 = points[i]
        p2 = points[i + 1]
        p3 = points[i + 2]
        
        angle = rad_to_deg(angle_at_point(p1, p2, p3))
        # 如果角度接近 180°（直线），删除中间点
        if abs(180 - angle) < angle_threshold:
            excluded_indices.add(i + 1)
            i += 1  # 跳过被删除的点
        i += 1
    
    return [p for i, p in enumerate(points) if i not in excluded_indices]


def generate_dot_to_dot(input_path: str, output_path: str = None, 
                        num_points: int = 50, angle_threshold: int = 20):
    """
    将黑白线稿转换为点对点连线图
    
    Args:
        input_path: 输入图片路径
        output_path: 输出图片路径
        num_points: 初始采样点数量
        angle_threshold: 角度过滤阈值（越小保留的点越少）
    """
    # 读取图片
    img = cv2.imread(input_path)
    if img is None:
        print(f"[ERROR] Cannot read image: {input_path}")
        return None
    
    # 放大图片到目标尺寸（至少 800x800），保持比例
    target_size = 800
    h, w = img.shape[:2]
    if max(h, w) < target_size:
        scale = target_size / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        print(f"   - 图片放大: {w}x{h} -> {new_w}x{new_h}")
    
    # 转灰度
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 二值化
    _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
    
    # 查找轮廓
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    
    if not contours:
        print("[ERROR] No contours found")
        return None
    
    # 找最大轮廓
    main_contour = max(contours, key=cv2.contourArea)
    contour_points = main_contour.reshape(-1, 2)
    
    # 计算轮廓总长度
    total_length = cv2.arcLength(main_contour, closed=True)
    
    # 步骤1: 沿轮廓均匀采样
    cumulative_length = [0]
    for i in range(1, len(contour_points)):
        dist = np.linalg.norm(contour_points[i] - contour_points[i-1])
        cumulative_length.append(cumulative_length[-1] + dist)
    cumulative_length = np.array(cumulative_length)
    
    # 均匀采样
    step = total_length / num_points
    sampled_points = []
    for i in range(num_points):
        target_length = i * step
        idx = np.searchsorted(cumulative_length, target_length)
        idx = min(idx, len(contour_points) - 1)
        sampled_points.append(contour_points[idx].tolist())
    
    # 步骤2: 角度过滤（重复2次，适度精简）
    filtered_points = sampled_points
    for _ in range(2):
        filtered_points = filter_points_on_angle(filtered_points, angle_threshold)
    
    # 确保至少保留一定数量的点
    min_points = max(10, num_points // 5)
    if len(filtered_points) < min_points:
        # 如果点数太少，使用均匀采样的结果
        step = len(sampled_points) // min_points
        filtered_points = sampled_points[::step][:min_points]
    
    print(f"   - 初始采样: {num_points} 点")
    print(f"   - 角度过滤后: {len(filtered_points)} 点")
    
    # 创建输出图片 - 复制原图保留内部细节
    output = img.copy()
    
    # 创建外轮廓区域的 mask（只包含轮廓线附近的窄带）
    outer_mask = np.zeros(gray.shape, dtype=np.uint8)
    cv2.drawContours(outer_mask, [main_contour], -1, 255, thickness=30)
    
    # 颜色设置：只处理外轮廓，内部线条保持原色
    outer_faint_color = 230  # 外轮廓 - 非常淡
    
    for y in range(output.shape[0]):
        for x in range(output.shape[1]):
            # 只处理外轮廓区域的深色像素
            if outer_mask[y, x] == 255 and gray[y, x] < 200:
                output[y, x] = [outer_faint_color, outer_faint_color, outer_faint_color]
            # 内部线条保持原图颜色不变
    
    # 绘制参数
    dot_radius = max(4, int(min(img.shape[:2]) / 150))  # 缩小圆点
    # 缩小字体
    base_font_scale = max(0.35, min(img.shape[:2]) / 1200)  # 缩小基础字体
    if len(filtered_points) > 10:
        font_scale = base_font_scale * 0.75  # 缩小到75%
    else:
        font_scale = base_font_scale
    font_thickness = max(1, int(font_scale * 2))  # 减小字体粗细
    
    # 数字颜色：深蓝色 (BGR格式)
    number_color = (139, 90, 43)  # 深蓝色 #2B5A8B
    
    # 计算质心（用于标签位置调整）
    cx = int(np.mean([p[0] for p in filtered_points]))
    cy = int(np.mean([p[1] for p in filtered_points]))
    
    # 只绘制编号点和数字（不画连接虚线）
    for i, point in enumerate(filtered_points):
        x, y = int(point[0]), int(point[1])
        
        # 画黑色圆点
        cv2.circle(output, (x, y), dot_radius, (0, 0, 0), -1)
        
        # 数字标签
        label = str(i + 1)
        text_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)[0]
        
        # 标签位置：根据点相对于质心的位置调整
        offset = dot_radius + 5
        if x > cx:
            text_x = x + offset
        else:
            text_x = x - offset - text_size[0]
        
        if y < cy:
            text_y = y - offset
        else:
            text_y = y + offset + text_size[1]
        
        # 边界检查
        text_x = max(5, min(text_x, img.shape[1] - text_size[0] - 5))
        text_y = max(text_size[1] + 5, min(text_y, img.shape[0] - 5))
        
        cv2.putText(output, label, (text_x, text_y),
                    cv2.FONT_HERSHEY_SIMPLEX, font_scale, number_color, font_thickness)
    
    # 生成输出路径
    if output_path is None:
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}_dots{ext}"
    
    cv2.imwrite(output_path, output)
    print(f"[OK] Dot-to-dot image generated: {output_path}")
    
    return output_path


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\n示例: python scripts/dot_to_dot.py docs/ki.png")
        return
    
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    num_points = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    angle_threshold = int(sys.argv[4]) if len(sys.argv) > 4 else 20
    
    generate_dot_to_dot(input_path, output_path, num_points, angle_threshold)


if __name__ == "__main__":
    main()
