# 🐦 鸟类识别 Web 应用

一个基于 Python Flask + 阿里云百炼的本地鸟类识别 Web 应用。上传鸟类照片，AI 帮你识别是什么鸟。

## 功能特性

- 📷 支持点击上传或拖拽上传照片
- 🤖 使用阿里云百炼 qwen-vl 多模态模型识别鸟类
- 📊 展示识别结果及置信度
- 📝 显示鸟类特征描述
- 🎯 显示最可能匹配的鸟类品种
- 🌐 本地运行，无需部署

## 项目结构

```
bird-identifier-web/
├── app.py                 # Flask 后端主程序
├── requirements.txt       # Python 依赖
├── README.md              # 项目说明
├── .gitignore             # Git 忽略文件
├── config/
│   ├── config.template.json  # 配置文件模板
│   └── config.json           # 本地配置文件（不提交到 Git）
├── static/
│   ├── css/
│   │   └── style.css      # 样式文件
│   ├── js/
│   │   └── app.js         # 前端脚本
│   └── uploads/           # 上传的图片目录
└── templates/
    └── index.html         # 主页面
```

## 快速开始

### 1. 安装依赖

确保你已经安装了 Python 3.7+，然后安装依赖：

```bash
pip install -r requirements.txt
```

### 2. 配置 API Key

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/) 申请 API Key

2. 复制配置文件模板：
   ```bash
   # Windows
   copy config\config.template.json config\config.json
   
   # Mac/Linux
   cp config/config.template.json config/config.json
   ```

3. 编辑 `config/config.json`，填入你的 API Key：
   ```json
   {
     "ALI_API_KEY": "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
     "MODEL": "qwen-vl-max"
   }
   ```

### 3. 运行应用

```bash
python app.py
```

然后在浏览器中打开：http://127.0.0.1:5001

## 使用说明

1. 打开网页后，点击上传区域或拖拽图片到上传区域
2. 选择一张鸟类照片（支持 JPG、PNG 格式）
3. 点击「开始识别」按钮
4. 等待识别结果

## 可选模型

在 `config/config.json` 中可以切换模型：

| 模型 | 特点 | 适用场景 |
|------|------|----------|
| qwen-vl-max | 视觉理解能力最强 | 追求最高识别准确度 |
| qwen-vl-plus | 性价比高，速度快 | 日常使用 |
| qwen3-vl-plus | 最新一代模型 | 需要最新技术 |

## ⚠️ 安全提示

**千万不要将 API Key 提交到 GitHub！**

- `config/config.json` 已添加到 `.gitignore`，不会被提交
- 代码中使用的是 `config.template.json` 模板，不包含真实密钥

**如果不小心泄漏了 API Key：**
1. 立即到阿里云百炼平台删除该 API Key
2. 创建新的 API Key
3. 更新本地 `config/config.json` 文件

## 费用说明

阿里云百炼按 Token 计费：
- 输入（图像 + 文本）：按图像尺寸和复杂度计算 Token
- 输出（识别结果）：按生成文本长度计算 Token
- 新用户有免费额度，具体请参考 [阿里云百炼定价](https://help.aliyun.com/zh/model-studio/billing-and-pricing)

## 未配置 API Key 时

如果没有配置 API Key，应用会返回模拟数据，方便你测试界面功能。

## 技术栈

- **后端**: Python + Flask
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **AI 服务**: 阿里云百炼多模态大模型 API (qwen-vl)

## 开发计划

- [x] 基础 Web 应用
- [x] 照片上传功能
- [x] 阿里云百炼识别集成
- [x] 结果展示页面
- [x] 拖拽上传
- [x] 安全的 API Key 管理
- [ ] 识别历史记录
- [ ] 批量识别
- [ ] 更多鸟类信息展示

## License

MIT
