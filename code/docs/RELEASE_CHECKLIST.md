# Release Checklist

发布前检查：

- [ ] `npm run build` 通过。
- [ ] 核对 `src/app/pages/ContractHarnessPage.tsx` 的案例、Rubric 和文本资产。
- [ ] 更新 `docs/VERSION_LOG.md`。
- [ ] 更新 `docs/AUDIT_LOG.md`。
- [ ] 确认 GitHub Pages workflow 使用 `npm ci` 和 `npm run build`。
- [ ] 如涉及真实合同或训练数据，确认已经脱敏。
- [ ] 推送到 `main` 或合并 PR 后检查 GitHub Actions 部署结果。
