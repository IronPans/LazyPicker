# LazyPicker
LazyPicker是一个简单的移动端时间选择器，支持多种主题。

用手机扫描体验：  
![](http://7s1r1c.com1.z0.glb.clouddn.com/t_1480730967.png)

# 使用方法
引入CSS和JavaScript脚本：
```
<link rel="stylesheet" href="lazyPicker.min.css" />
<script src="lazyPicker.min.js"></script>
```

# 简单的表单（input）
```
<input type="text" class="date-picker" placeholder="选择日期" />
```

# 初始化时间选择器
```
var picker = new LazyPicker('.date-picker');
```
这里的class可自定义，不过要对应你要将其设置为时间选择器的input的class。

# 可选参数
LazyPicker构造函数可设置第二个参数，为配置对象，可设参数说明：
```
theme: ,    // 主题  green（墨绿） | black（纯黑）
initDate: ,  // 设置初始年月日，格式YYYY-MM-DD或YYYY/MM/DD
minDate: ,    // 设置最小年份，默认是1950
maxDate: ,   // 设置最大年份，默认是初始年份 + 20，如果initDate和maxDate同时存在，年份以maxDate为主。
onChange: function(data) {  // 监听选择时间改变
  // data返回一个对象，包含属性year、month、day、date，分别表示年、月、日、日期
}
```
