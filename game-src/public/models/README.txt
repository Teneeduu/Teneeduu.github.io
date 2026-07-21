3D 模型目录说明

已内置 Kenney 模型（按包分子目录，各自带 Textures/colormap.png 贴图）：
  car/    汽车  sedan/suv/taxi/hatchback-sports/van/delivery —— 沿马路行驶
  char/   人物  char-male-a~d + char-female-a~d
  com/    高楼  sky-a~e(摩天楼) + com-a~e(商业楼)
  ind/    房子  ind-a~f(工业厂房)

重要：Kenney 的 GLB 贴图是外链 Textures/colormap.png，且各包 colormap 内容不同、
      不能混用，所以每个包必须放在自己的子目录里、连同它的 Textures 文件夹一起。

仍用几何体兜底、可替换的槽位：
  树：目前是代码画的几何体。想换真模型，放一个 tree.glb（若带贴图，就建
     public/models/tree/tree.glb + public/models/tree/Textures/xxx，并告诉我）。

想加/换任意类别：把某个 Kenney 包的子目录(含 Textures)整个丢进来，告诉我文件名，我接上。
所有模型都会自动缩放到合适大小、落在地面上；带骨架的角色会自动转成静态网格。
