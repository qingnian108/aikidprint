# Google Imagen API 提示词文档

本文档包含各个板块调用 Google Imagen API 时使用的提示词。

---

## 📋 目录

1. [Number Path（点对点连线）](#number-path点对点连线)
2. [Pattern Compare（找不同）](#pattern-compare找不同)

---

## Number Path（点对点连线）

### 说明
生成黑色线稿简笔画，用于儿童涂色书风格的点对点连线游戏。

### 固定模板
```
simple clean black outline illustration, coloring book style, no color, no shading, no gray, no fill, no textures,
smooth bold outline, child-friendly cute proportions, pure white background, no text, no numbers, no symbols,
no extra elements, no background decorations, vertical composition, aspect ratio 3:4
```

### 提示词生成规则
提示词由两部分组成：
- 第一部分：从主题变量库中随机组合的角色描述
- 第二部分：固定万能模板

从所选主题的变量库中依次选择：
- 变量库 1：选择 1 个主要角色（主角级元素）
- 变量库 2：选择 1 个姿势
- 变量库 3：选择 1 个情绪
- 变量库 4：选择 0 或 1 个简单动作（可选）

### 🦕 主题 1：Dinosaur（恐龙主题）
✅ Var1：主要恐龙种类（主角级）

baby T-Rex

baby Triceratops

baby Stegosaurus

baby Brontosaurus

baby Ankylosaurus

baby Pterodactyl

baby Parasaurolophus

（全部是儿童涂色风格、轮廓简单的大恐龙）

✅ Var2：姿势（适合恐龙）

standing

sitting

walking

running

jumping

lying down

waving

pointing

looking left

looking right

✅ Var3：情绪

smiling happily

joyful expression

excited

friendly expression

delighted

cheerful mood

✅ Var4：动作（恐龙可做的“主要动作”）

raising one hand

holding a small leaf

holding a star (outline only)

reading a book

arms open wide

🦄 主题 2：Unicorn（独角兽主题）
✅ Var1：主要角色

cute baby unicorn standing

baby unicorn sitting

baby unicorn flying with tiny wings

unicorn head (side view)

（全部是独角兽主角，不含彩虹、星星等次要物件）

✅ Var2：姿势

standing

sitting

trotting

jumping

flying

prancing（独角兽专用昂首走路）

✅ Var3：情绪

smiling gently

joyful expression

dreamy expression

excited

cheerful mood

✅ Var4：动作

raising one hoof

waving its tail

holding a magic wand (outline only)

touching its mane

eyes closed peacefully

🚗 主题 3：Vehicles（交通工具）
✅ Var1：主要交通工具（主角）

（全部是儿童化Q版，轮廓简单，不能太复杂）

cute small car (side view)

cartoon truck

cartoon bus

cartoon train engine

cartoon airplane

cute helicopter

cute boat

✅ Var2：姿势（交通工具专用）

driving forward (side view)

slightly tilted upward

flying upward

landing pose

taking off pose

✅ Var3：情绪

交通工具不适用表情 → 用“状态感”

cheerful vibe

friendly style

happy playful energy

✅ Var4：动作（交通工具可接受的简单动作）

with simple motion lines

propellers spinning (outline only)

wheels turning

🐳 主题 4：Ocean（海洋主题）
✅ Var1：主要海洋动物（主角）

baby whale

baby dolphin

baby sea turtle

baby seahorse

baby octopus

baby crab

✅ Var2：姿势

swimming forward

happily jumping

waving fin/arm

floating gently

looking upward

turning slightly

✅ Var3：情绪

smiling happily

cheerful mood

excited expression

friendly expression

joyful

✅ Var4：动作

blowing bubbles (outline only)

waving a fin

holding a tiny starfish (outline only)

arms open

👩‍🚀 主题 5：Space（太空主题）
✅ Var1：主要角色（主角）

cute astronaut

cartoon rocket

cartoon UFO

planet with rings

cute robot

（全部为大主体、可涂色、容易识别）

✅ Var2：姿势（对象不同会自动适配）

standing (astronaut)

floating (astronaut)

flying upward (rocket)

hovering (UFO)

orbiting (planet)

waving (astronaut)

✅ Var3：情绪

excited

happy expression

smiling

cheerful

✅ Var4：动作

astronaut holding a small flag

astronaut waving

rocket firing (outline only)

UFO blinking lights (outline only)

🦁 主题 6：Safari（草原动物）
✅ Var1：主要动物

baby lion

baby giraffe

baby elephant

baby zebra

baby hippo

baby monkey

✅ Var2：姿势

sitting

standing

walking

running

waving

looking sideways

✅ Var3：情绪

smiling happily

friendly expression

cheerful

excited

playful mood

✅ Var4：动作

holding a leaf

tail wagging

waving one hand

touching its face

---

## Pattern Compare（找不同）

### 说明
生成"找不同"游戏图片，包含上下两幅几乎相同的场景图，下图有6处细微差异。

### 图片规格
- 比例：3:4 竖版
- 风格：柔和粉彩儿童插画风格
- 内容：上下两幅堆叠的图片
- 差异数量：6处

### 🦕 主题 1：Dinosaur（恐龙）

```
Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same cute dinosaur scene in a soft pastel children's illustration style. Scene: friendly dinosaurs (T-Rex, Triceratops, Stegosaurus, Brachiosaurus) playing in a grassy field with flowers, hills, bushes, and soft clouds. The bottom image must include exactly 6 subtle differences, such as missing spikes, changed dinosaur direction, missing flowers, color changes, or added/removed small objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.
```

### 🦄 主题 2：Unicorn（独角兽）

```
Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same magical unicorn scene in a soft pastel fairytale style. Scene: cute unicorns with flowing rainbow manes standing on clouds, stars, rainbows, sparkles, and gentle sky elements. The bottom image must include exactly 6 subtle differences, such as missing stars, mane color changes, added sparkles, different hoof positions, or missing accessories. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.
```

### 🚀 主题 3：Space（太空）

```
Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same outer-space scene in a cute pastel children's illustration style. Scene: smiling astronauts, rockets, planets, moons, comets, and floating stars. The bottom image must include exactly 6 subtle differences, such as missing stars, different planet colors, changed astronaut gestures, missing rocket fins, or small added objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.
```

### 🦓 主题 4：Safari（野生动物）

```
Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same safari animal scene in a cute pastel children's illustration style. Scene: lions, giraffes, elephants, zebras, hippos, surrounded by grass, trees, and simple savanna elements. The bottom image must include exactly 6 subtle differences, such as missing stripes, ear direction changes, missing leaves, altered tail shape, or added/removed small objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.
```

### 🚗 主题 5：Vehicles（交通工具）

```
Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same cute vehicle scene in a soft pastel children's illustration style. Scene: cars, buses, airplanes, trains, hot-air balloons, roads, clouds, and trees. The bottom image must include exactly 6 subtle differences, such as missing windows, changed wheel details, altered colors, missing clouds, or added/removed accessories. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.
```

### 👑 主题 6：Princess（公主）

```
Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same fairytale princess scene in a cute pastel illustration style. Scene: princess with dress, castle, crown, flowers, sparkles, butterflies, and gentle clouds. The bottom image must include exactly 6 subtle differences, such as missing jewels, changed dress details, missing butterflies, color variations, or small added/removed objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.
```