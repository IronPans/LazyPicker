# LazyPicker
LazyPicker是一个简单的移动端时间选择器，支持多种主题。

1.2.0版本体验：  
![](http://7s1r1c.com1.z0.glb.clouddn.com/t_1480918428.png)

# 使用方法
引入CSS和JavaScript脚本：
```
<link rel="stylesheet" href="lazyPicker-1.2.0.min.css" />
<script src="lazyPicker-1.2.0.min.js"></script>
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

#1.2版本新增功能
```
data:  // 自定义选择项，JSON格式
type:  // 风格，暂时支持1,2，默认是1，当设置为2时，风格可扫描二维码查看第五个（也就是orange颜色那个，会有些许差别）
```

`data`的JSON格式说明：
```
var data = {   
  "item": [{  /* 第一项 */  
    "id": 1,   
    "name": "广东",   /* name属性是必须的，id可选 */
    "child": [{   /* 子项 */
      "id": 101,   
      "name": "广州",   
      "child": [{   /* 子子项 */
        "id": 3,   
        "name": "天河区"   
      }]   
    }]   
  }, {   
    "id": 1,   
    "name": "云南",   
    "selected": true,   /* 默认选项，当设置为true时，打开选择器的当前项是这个 */
    "child": [{   
      "id": 1,   
      "name": "昆明"   
    }, {   
      "id": 1,   
      "name": "玉溪",   
      "selected": true   /* 默认选项 */
    }, {   
      "id": 1,   
      "name": "丽江"   
    }]   
  }, {   
    "id": 1,   
    "name": "上海",   
    "child": [{   
      "id": 1,   
      "name": "上海"   
    }]   
  }],   
  "itemName": "省-市-区"   /* 选项头说明提示 */
};
```
#注意：当自定义JSON时，格式一定要严格按照上面的格式。

当是自定义格式时，`onChange`方法返回的值`data`也有所不同：
```
[
  [name,id],[name,id].....,name-name-name
]
```
多个数组表示每个选项的名称（`name`）和`id`，最后一项是用“-”连接的名称值字符串，也就是`input`的值。

#BUG修复  
- 修复了2月份天数不对的问题  
- 修复了在苹果手机上选择年份或月份时，天数消失的问题
- 修复了点击取消Bug

如果你发现Bug或者有更好的建议，强烈恳求在本人[博客](http://ghmagical.com/article/page/id/dkOUFgGiPwcy)下方的评论区评论告知，你们的支持，才是LazyPicker改善之道。

