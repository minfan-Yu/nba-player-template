# 🏀 NBA Scout — 找出你的籃球定位

輸入身高與 19 項能力自評，系統自動比對 NBA 2K26 球員資料，找出你最像哪位球員。

## 本地開發

```bash
npm install
npm run dev
# 打開 http://localhost:3000
```

## 部署到 Vercel

1. 上傳到 GitHub
2. 在 Vercel 匯入 repo，Framework 選 Next.js，直接 Deploy

### （選填）啟用計數器

1. 在 Vercel 新增 **Storage > KV**
2. Vercel 會自動注入 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`
3. 重新部署即可

## 技術架構

```
前端 (React / Next.js)
  └── /pages/index.js          主頁面
  └── /styles/Home.module.css  樣式

後端 (Next.js API Routes)
  └── /pages/api/report.js     球員比對邏輯
  └── /pages/api/count.js      計數器

資料
  └── /data/nba2k26.json       NBA 2K26 球員資料（26 人）
```
