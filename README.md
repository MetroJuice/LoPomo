# LofiPomo

GitHub Pagesで動作するLofiポモドーロタイマーです。
[👉Pages](https://metrojuice.github.io/LoPomo/)

## 特徴
- **Lofi Music**: フォーカス中はリラックスできるLofi Musicが流れます (Zeno FM)。
- **Break Music**: 休憩中は気分転換のために別の音楽が流れます (Free Music Archive)。
- **自動タイマー**: 休憩時間へ移行する際、タイマーと音楽が自動的に開始されます。
- **フルスクリーンモード**: ヘッダーのボタンから全画面表示に切り替え、没入感を高めることができます。
- **設定**: タイマーの時間（Focus, Short Break, Long Break）や音量を調整できます。
- **レスポンシブ**: スマートフォンからデスクトップまで、あらゆるデバイスで快適に利用できます。

## 使い方
1. 再生ボタンを押して、25分間のフォーカスセッションを開始します。
2. セッションが終了すると、自動的に5分間の休憩モードに切り替わり、音楽も変わります。
3. 4回のセッションごとに15分間の長い休憩に入ります。
4. 設定ボタン（歯車アイコン）から時間をカスタマイズできます。

## クレジット
- **Focus Audio**: [Lofi Hip Hop Radio](https://stream.zeno.fm/0r0xa792kwzuv) via Zeno FM
- **Break Audio**: [Tours - Enthusiast](https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3) via Free Music Archive
- **Font**: Manrope & Kumbh Sans via Google Fonts
- **Icons**: Material Symbols via Google Fonts

## 開発者向け情報
このプロジェクトは単一のHTMLファイルから分割され、以下の構成になっています：
- `index.html`: 構造
- `style.css`: デザイン（Tailwind CSS + カスタム）
- `script.js`: ロジック

## 注意事項
ブラウザの自動再生ポリシーにより、最初のオーディオ再生にはユーザーのインタラクション（クリックなど）が必要です。
