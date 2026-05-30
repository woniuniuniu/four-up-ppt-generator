# 饱和式 PPT 生成器

四宫格 PPT 生成器：输入一个 PPT 想法后，同时生成 A/B/C/D 四份差异化 HTML PPT。

线上地址：

- https://guizang-four-up-generator.vercel.app/
- https://4ppt.vercel.app/

本项目源码：

- https://github.com/woniuniuniu/four-up-ppt-generator

开源来源：

- 基于歸藏老师开源的 PPT Skill 构建
- 原始仓库：https://github.com/op7418/guizang-ppt-skill
- 原项目当前许可证为 AGPL-3.0
- 本项目保留了公开致谢和仓库链接，正式开源时也应使用 AGPL-3.0 并公开完整对应源码

## 开源与密钥说明

本项目分为两种使用方式：

- 托管演示版：站长可以在自己的 Vercel 项目里配置模型 API Key，让访问者打开网页即可体验。
- 开源/自部署版：仓库不包含任何真实 API Key；没有服务端密钥时，页面会要求使用者填写模型名称、Base URL 和 API Key。

不要把 `.env`、`.vercel`、API Key、账号密码或任何私密部署配置提交到公开仓库。

## 当前项目状态

- Vercel 项目名：`guizang-four-up-generator`
- 本地端口：`5177`
- 默认模型：`step-3.7-flash`
- 默认输入：`做一份介绍 Step 3.7 Flash 的产品`
- 托管演示版：Vercel 环境变量里可以配置 `STEPFUN_API_KEY`，用户打开网页即可生成
- 开源/自部署版：没有服务端密钥时，页面会要求用户填写模型名称、Base URL 和 API Key
- 用户自填的 API Key 只随单次生成请求转发，不写入文件、数据库或仓库
- 本地 `.env` 不要提交，尤其不能包含真实 API Key
- `.vercel/project.json` 里保留了 Vercel 绑定信息；不要公开分享 `.vercel`

## 本地运行

```bash
npm install
npm run dev
```

然后打开：

```text
http://localhost:5177/
```

接口检查：

```bash
curl http://localhost:5177/api/config
```

## 关键文件

- `public/index.html`：页面结构、中文标题、开源致谢、左侧控制台和右侧四宫格
- `public/styles.css`：潮牌/控制台方向的视觉样式
- `public/app.js`：前端状态、流式生成、四宫格预览、打开和下载逻辑
- `server.mjs`：本地 Node 服务
- `api/config.mjs`：Vercel 配置接口
- `api/generate-stream.mjs`：Vercel 流式生成接口
- `lib/llm.mjs`：模型请求、提示词、多样化种子、超时和重试
- `lib/streamRunner.mjs`：四路并行生成、逐页同步预览、HTML 流式回传
- `lib/deckRenderer.mjs`：A/B/C/D 四种 deck 渲染模板和主题差异
- `upstream-guizang-ppt-skill/`：歸藏老师 PPT Skill 的本地来源副本

## 聊天记录里恢复出的产品要求

- 不是“一份内容方案 + 四套皮肤”，而是 A/B/C/D 四路独立请求模型。
- A/B/C/D 的提示词需要有不同内容视角和差异化种子。
- A：高端商务版，瑞士风，克莱因蓝，产业拐点/资本配置/决策窗口。
- B：产品展示版，杂志风，墨水经典，用户场景/发布会节奏/展示卖点。
- C：内部汇报版，瑞士风，柠檬绿，里程碑/风险依赖/内部决策。
- D：叙事演讲版，杂志风，牛皮纸，人物/冲突/转折/演讲记忆点。
- 界面左上角叫“饱和式 PPT 生成器”。
- 页面必须声明基于歸藏老师开源的 PPT Skill 构建，并带原仓库链接。
- 电脑端布局为左侧输入和选择项，右侧固定四宫格，点击后四份 PPT 并行跑。
- 模型输出到哪一页，页面就同步展示到哪一页，不能退回“只显示第一页或最终结果”的模式。
- 单次模型请求有超时和补跑机制。
- 线上托管版可以用站长配置的默认模型；开源/自部署版不带密钥，使用者需要填写自己的兼容接口 Base URL 和 API Key。

## 部署提示

已存在 Vercel 绑定信息，后续若要重新发布，可在项目根目录使用 Vercel CLI：

```bash
npx vercel
npx vercel --prod
```

部署托管演示版时，可以在 Vercel 项目环境变量里配置：

- `STEPFUN_PROVIDER`
- `STEPFUN_MODEL`
- `STEPFUN_BASE_URL`
- `STEPFUN_API_KEY`
- `STEPFUN_REASONING_EFFORT`

如果不配置 `STEPFUN_API_KEY`，页面会进入开源/自部署模式，要求使用者填写自己的模型名称、Base URL 和 API Key。

不要把 `.env`、`.vercel`、`node_modules`、`generated` 提交到公开仓库。
