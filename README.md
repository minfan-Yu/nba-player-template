# 🏀 NBA Scout — 找出你的籃球定位

AI 驅動的籃球定位分析工具，輸入身高與 19 項能力自評，由 Claude AI 生成真實球探報告。

## 部署到 Vercel（5分鐘搞定）

### 1. 上傳到 GitHub

```bash
# 在這個資料夾執行
git init
git add .
git commit -m "init nba scout"
git remote add origin https://github.com/你的帳號/nba-scout.git
git push -u origin main
```

### 2. 連結 Vercel

1. 前往 [vercel.com](https://vercel.com)，登入後點 **Add New Project**
2. 選擇剛剛的 GitHub repo
3. Framework 選 **Next.js**（通常會自動偵測）
4. 點 **Deploy**（先不填環境變數，確認能成功 build）

### 3. 設定環境變數

部署成功後，到 **Settings > Environment Variables** 新增：

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | 你的 API Key（從 [console.anthropic.com](https://console.anthropic.com) 取得） |

設定完後點 **Redeploy**，APP 就可以正常生成報告了。

### 4. （選填）啟用計數器

如果想要真實的計數器：
1. 在 Vercel 新增 **Storage > KV**
2. Vercel 會自動注入 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 環境變數
3. 不需要額外設定，重新部署即可

## 本地開發

```bash
npm install
cp .env.example .env.local
# 編輯 .env.local，填入你的 ANTHROPIC_API_KEY
npm run dev
# 打開 http://localhost:3000
```

## 技術架構

```
前端 (React / Next.js)
  └── /pages/index.js          主頁面
  └── /styles/Home.module.css  樣式

後端 (Next.js API Routes)
  └── /pages/api/report.js     AI 生成球探報告
  └── /pages/api/count.js      計數器

外部服務
  └── Anthropic API            claude-sonnet-4 生成報告
  └── Vercel KV (選填)         儲存計數器
```

## 自訂修改

- **修改球員模板**：在 `pages/index.js` 的 `SKILLS` 陣列新增/修改項目
- **調整 AI 風格**：在 `pages/api/report.js` 修改 `prompt` 變數
- **改變配色**：在 `styles/globals.css` 和 `Home.module.css` 修改 `#FF8C00`（主色）
