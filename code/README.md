# 业务合同基础审查训练 Harness

这是一个 GitHub Pages 可部署的合同审查训练网页应用。当前版本包含训练前台和后台管理系统：

- 训练前台：案例材料、学员作答、自动评分、复盘报告、记忆沉淀。
- 后台管理：GitHub 仓库配置、版本台账、审计日志、文本资产管理、全量数据导出。
- 工程标准：TypeScript、Vite、GitHub Actions Pages 部署、版本日志、审计日志和文本管理文档。

> 当前后台为 GitHub Pages 兼容的本地管理台，数据保存在浏览器 `localStorage`，可导出 JSON/Markdown 进入仓库审计。多人协作或服务端持久化可在后续版本接入 Supabase、GitHub Contents API 或自建 API。

## 预览

开发预览地址：

```bash
http://127.0.0.1:5173/
```

如果服务没启动，在本目录运行：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## 修改内容

- 训练台页面：`src/app/pages/ContractHarnessPage.tsx`
- 应用入口：`src/app/App.tsx`
- 全站样式：`src/styles/theme.css`
- GitHub Pages workflow：`../.github/workflows/deploy-pages.yml`
- 工程文档：`docs/`

修改源码后，开发预览页面会自动刷新。

## 上线构建

```bash
npm run build
```

构建结果输出到 `dist/`。

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy-pages.yml`。推送到 `main` 后，GitHub Actions 会：

1. 进入 `code/`
2. 使用 Node 22
3. 执行 `npm ci`
4. 执行 `npm run build`
5. 将 `code/dist` 发布到 GitHub Pages

如果是第一次启用，需要在 GitHub 仓库 Settings → Pages 中选择 GitHub Actions 作为部署来源。

## 开发者标准

- 版本记录：`docs/VERSION_LOG.md`
- 审计日志：`docs/AUDIT_LOG.md`
- 文本资产管理：`docs/TEXT_MANAGEMENT.md`
- 发布检查清单：`docs/RELEASE_CHECKLIST.md`
