---
title: 收藏
titleEn: Collections
eyebrow: WATCHED · PLAYED · READ
headline: 看过、玩过、读过
headlineEn: Stories I have collected
lede: 动画、剧集、电影、游戏、小说、漫画，都是讲故事的载体，不分国度。
ledeEn: Anime, series, films, games, novels and comics — all carriers of stories.
comments: false
收藏:
  - 载体: 动画
    名称: 进击的巨人
    名称En: Attack on Titan
    评分: 9.4
    封面: 进击的巨人.jpg
    短评: 第一季第九集之后我就没再怀疑过这部作品。
  - 载体: 动画
    名称: 星际牛仔
    名称En: Cowboy Bebop
    评分: 9.1
    封面: 星际牛仔.jpg
    短评: 爵士乐、赏金猎人，以及所有人都留不住的过去。
  - 载体: 动画
    名称: 虫师
    名称En: Mushishi
    评分: 9.2
    封面: 虫师.jpg
    短评: 每一集都像一首安静的短诗，看完想走进山里。
  - 载体: 动画
    名称: 攻壳机动队
    名称En: Ghost in the Shell
    评分: 8.8
    封面: 攻壳机动队.jpg
    短评: 二十多年前就在问 AI 和意识的问题，现在看反而更超前。
  - 载体: 动画
    名称: 四叠半神话大系
    名称En: The Tatami Galaxy
    评分: 8.6
    封面: 四叠半神话大系.jpg
    短评: 语速快到劝退，撑过前三集就是另一回事了。
  - 载体: 动画
    名称: 来自新世界
    名称En: From the New World
    评分: 8.3
    封面: 来自新世界.jpg
  - 载体: 动画
    名称: 冰菓
    名称En: Hyouka
    评分: 8.0
    封面: 冰菓.jpg
  - 载体: 动画
    名称: 紫罗兰永恒花园
    名称En: Violet Evergarden
    评分: 7.4
    封面: 紫罗兰永恒花园.jpg
    短评: 画面无敌，故事偏淡，但第十集还是哭了。
---

%% 这一页由 CollectionGrid 组件渲染，内容全部来自上面的 frontmatter。

【怎么加一部】
复制任意一个 `- 载体: 动画` 开头的块，改字段即可。顺序 = 页面上显示的顺序（从前往后）。

【字段】
  载体    必填。只能是：动画 / 剧集 / 电影 / 游戏 / 小说 / 漫画
          填了才会出现对应顶部标签；某一类没有条目时，它的标签不会显示。
  名称    必填。中文名。
  评分    必填。0 ~ 10，可以带小数（如 8.7）。显示成 5 颗星 + 数字。
  名称En  选填。切到英文时显示；不填就沿用中文名。
  封面    选填。只写文件名，不要写路径。图片放 content/attachments/covers/
          不填或找不到文件时，自动用片名首字 + 淡色块占位，不会报错。
  短评    选填。一句话，超过两行自动省略。

【以后想做"看动画感受"文章】
预留字段 `感受: <文章 slug>`，当前不渲染。
等真写了文章，再改组件把它接成卡片上的链接。

【注意】
1. 字段里的冒号要加引号，否则 YAML 会解析失败。
2. 这个文件是 index.md，属于文件夹索引页，不会出现在首页「最新文章」或标签墙里。
%%
