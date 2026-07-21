把 3D 模型文件（.glb 格式）放到这个文件夹，游戏会自动使用它们替换默认的几何体。

已内置 Kenney 模型（会随机出现）：
  汽车   sedan/suv/taxi/hatchback-sports/van/delivery.glb —— 沿马路行驶
  高楼   sky-a~e (摩天楼) + com-a~e (商业楼)
  房子   ind-a~f (工业厂房)
  人物   char-male-a~d + char-female-a~d

仍用几何体兜底、可替换的槽位：
  tree.glb   树（放一个树模型即可自动替换）

想换/加任意类别的模型：把 .glb 丢进本文件夹并告诉我文件名，我接上即可。
所有模型都会自动缩放到合适大小、落在地面上。

不用自己建模，推荐下载免费低多边形模型包（免费可商用）：
  · Kenney.nl        → City Kit / Nature Kit / Car Kit（最推荐，专为这类游戏做）
  · Poly Pizza       → https://poly.pizza （搜 building / tree / car / person，导出 .glb）
  · Quaternius       → https://quaternius.com

要求：
  · 格式必须是 .glb（单文件，含材质）。若下载到的是 .gltf/.obj/.fbx，用免费在线工具或 Blender 导出成 .glb。
  · 尺寸无所谓——游戏会自动把模型缩放到合适大小、并让它站在地面上。
  · 文件名要和上面完全一致（小写）。

放好后刷新页面即可看到效果。想要更多种类（公交、路灯、长椅…）告诉我，我再加对应槽位。
