import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ビルド設定
  build: {
    // 出力先を 'docs' に変更
    // デフォルトは 'dist'
    outDir: 'docs',
  },
  // ベースパスをリポジトリ名に変更
  base: "/PatentXMLViewer/", // ここをGitHubのリポジトリ名に変更
})
