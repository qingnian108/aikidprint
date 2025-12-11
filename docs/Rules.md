✅ Number Tracing（数字描红）模板 — AI 生成要求文档

（可直接给 AI 作为指令）

🎯 模板目的

生成数字描红练习页，让孩子练习数字书写，支持不同数字范围（1–5 / 1–10 / 1–20）和不同主题（恐龙、海洋、太空等）。

🧩 页面结构

页面由 多行组成，每行对应一个数字。

每一行包括：

① 左侧：大号数字（黑色）

字体粗而圆润

大小清晰易读

居左垂直居中

使用黑色实心数字（非描红）

② 中间：浅灰色描红数字（多个）

5 个重复的浅灰色数字

用于描红练习

颜色：#CCCCCC 或透明描红样式

布局：自动排成水平一行

与左侧数字保持适中间距

③ 右侧：主题图标（数量 = 数字本身）

例如：

数字	图标数量（恐龙主题）	图标例子
1	1 个	恐龙蛋
2	2 个	恐龙蛋
5	5 个	恐龙蛋

图标统一来自当前主题的 counting icon 集合

图标尺寸略小，不可喧宾夺主

自动整齐排列成 1 列或 2 列（视页面宽度）

④ 行背景色（可选）

每一行有浅色背景块：

两种颜色交替（浅绿 / 浅蓝）

圆角矩形容器

高度与行内容适配

🧭 顶部标题区域
标题

Number Tracing 1–5
自动根据用户选择的范围生成：

用户选 1–10 → Number Tracing 1–10

用户选 1–20 → Number Tracing 1–20

右上角小图标

放置与主题有关的单个图标，例如：

恐龙主题 → 恐龙蛋

海洋主题 → 贝壳

太空主题 → 星球

🟩 主题规则（自动适配）

当选择主题时：

Theme	左侧色块	图标类型	行背景色
Dinosaur	绿色系	恐龙蛋 / 脚印	浅绿 / 浅蓝
Ocean	蓝色系	贝壳 / 水泡	浅蓝 / 浅青
Space	紫色系	星球 / 火箭碎片	浅紫 / 深蓝
Unicorn	粉色系	星星 / 心心	粉白系
Vehicles	黄色系	轮子 / 小车	黄蓝
Safari	土黄色系	狮子爪印	土色系
🔧 AI 生成逻辑（编程工具用）
输入选项
range = [1–5] 或 [1–10] 或 [1–20]
theme = dinosaur | ocean | space | unicorn | vehicles | safari
showIcons = true / false

输出结构（伪代码描述）
for number in range:
    drawLeftNumber(number, black)
    drawTracingNumbers(number, count=5, color=lightGray)
    if showIcons:
        drawThemeIcons(themeIcon, repeat=number)

📄 最终渲染要求（非常重要）

布局必须保持和参考图一致，每行 3 块内容：Left / Middle / Right

元素不要漂移

间距统一

图标大小统一

行高一致

数字描红大小与字体统一

色彩风格温柔、小孩友好