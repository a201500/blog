---
title: 莫子剑
titleEn: Zijian Mo
lede: 我是莫子剑，也可以叫我莫工。制冷专业出身，现在做电子硬件，正在啃高速电路板设计。这里放学习笔记和做过的项目。
ledeEn: I'm Zijian Mo. I hold a degree in Refrigeration Engineering, now work in electronic hardware, and am currently working toward high-speed PCB design. This site collects my study notes and hardware projects.
focus:
  - 嵌入式开发
  - 独立产品
  - AI 工具
  - 英语学习
focusEn:
  - Embedded Systems
  - Indie Products
  - AI Tools
  - English
contact:
  GitHub: https://github.com/a201500
  博客园: https://www.cnblogs.com/erased
email: bcd2027@qq.com
---

%% 首页内容由上面的 frontmatter 驱动。
     中文写一份，英文写一份（xxxEn 系列字段），顶栏「中文 / EN」按钮切换。
     只写中文不写英文也可以，英文模式会回落到中文。
     改这里就能改首页，不用动代码。

     双语覆盖范围（记住这条，别踩坑）：
     - 覆盖：首页、项目页、博客/标签列表页的界面文案
     - 不覆盖：文章正文。文章正文一律不翻译，访客用浏览器自带翻译即可。

     哪天某篇文章要正式英文版，按下面做（不要机翻，技术文章机翻必错）：
     1. 在同目录（博客/ 或 项目/）新建一篇，文件名加 -en，例如
          项目/5口千兆交换机项目设计实战.md      ← 中文原文
          项目/5口千兆交换机项目设计实战-en.md   ← 英文版（必须同目录，不能放错文件夹）
     2. 英文版 frontmatter 写 lang: en（这条必须有，否则会被当成新文章重复进列表）
        并写上 titleEn / descriptionEn / stackEn 等，保证卡片也显示英文。
     3. 建好后两端会自动出现互跳链接「English version →」/「中文版 →」，无需手工加。

     改导航英文：quartz.layout.ts 里 Nav links 的 textEn 字段。 %%
