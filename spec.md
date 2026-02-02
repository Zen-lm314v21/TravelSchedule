# 旅行スケジュール管理Webサイト 要件定義書

**作成日**: 2026年1月24日  
**バージョン**: 1.0  
**ステータス**: 提案中

---

## 1. プロジェクト概要

友人との旅行スケジュール管理を効率的に行うためのWebアプリケーション。複数人でリアルタイムに情報を共有・編集でき、GitHubPagesで公開可能な静的Webサイトとして実装する。

---

## 2. ユーザー要件

### 2.1 対象ユーザー
- **利用人数**: 2～6名の友人グループ
- **利用環境**: PC、タブレット、スマートフォン（iOS/Android）
- **技術レベル**: 一般ユーザー（ITリテラシー中程度）

### 2.2 主な使用場面
- 旅行前の計画・打ち合わせ
- 旅行中のリアルタイム情報確認
- 旅行後の記録・共有

---

## 3. 機能要件

### 3.1 基本機能

#### 3.1.1 旅行（Trip）管理
- **複数旅行対応**: 複数の旅行を追加・切替・削除
- **旅行メタ情報**: 旅行名、開始日、終了日、メモを保持
- **旅行切替UI**: ヘッダーに旅行セレクタと追加/編集/削除ボタンを配置

#### 3.1.2 スケジュール管理
- **リスト表示**: 日時順に並んだイベントリスト表示
- **タイムライン表示**: 時系列で視覚的に表示
- **イベント登録**: 日時、タイトル、詳細情報の入力
- **イベント編集**: 既存イベントの修正・削除
- **イベント検索**: キーワード検索

#### 3.1.3 目的地・場所情報管理
- **場所データベース**: 訪問予定地の情報管理
  - 施設名
  - 住所
  - 緯度経度（地図表示用）
  - 営業時間
  - 関連リンク（URL）
  - 画像（複数）
- **地図連携**: Google Maps埋め込みやリンク表示
- **場所とスケジュールのリンク**: イベントに場所を紐付け

#### 3.1.4 予算・費用管理
- **費用登録**: 項目名、金額、支払者、日時
- **カテゴリ分類**: 食事、移動、宿泊、アクティビティなど
- **費用一覧表示**: 発生順または支払者別に表示
- **合計計算**: 総額自動計算
- **割り勘計算**: 人数分割＆個人負担額の計算
- **支払者追跡**: 誰がいくら支払ったかの記録

#### 3.1.5 やることリスト/チェックリスト
- **タスク登録**: 準備物、確認事項、持ち物チェックリスト
- **チェック機能**: 完了/未完了の状態管理
- **優先度設定**: 重要度の設定表示
- **担当者設定**: 誰が担当するかの明示
- **期限設定**: タスクの期限管理

#### 3.1.6 メモ・備考
- **自由形式メモ**: 個別イベントへのメモ追加
- **グローバルメモ**: 旅行全体に関するメモ
- **コメント機能**: 複数ユーザーによるコメント・議論
- **ユーザー識別**: コメント者の名前を表示

### 3.2 データ共有・同期機能

#### 3.2.1 データ管理方式
- **形式**: JSON形式でのデータ管理
- **保存場所**: GitHub上でリポジトリで管理
- **同期方法**:
  - オプション1（推奨）: ローカルストレージ＋手動エクスポート/インポート機能
  - オプション2: GitHubリポジトリから直接JSONを読み込み（読み取り専用）
  - オプション3: 簡易バックエンドサーバーを利用（将来検討）

#### 3.2.2 共有機能
- **リンク共有**: URLベースでアクセス可能
- **データエクスポート**: JSON形式でダウンロード
- **データインポート**: JSONアップロードで復元
- **バージョン管理**: Git履歴でデータ変更の追跡

### 3.3 ユーザーインターフェース

#### 3.3.1 表示形式
- **メイン表示**: リスト形式（デフォルト）
  - 日時順に整列
  - 各イベントの概要表示
  - カテゴリ別の色分け
  
- **タイムライン表示**: 時系列ビュー（オプション）
  - 視覚的に日程を把握
  - ドラッグ&ドロップでリサイズ可能（オプション）

- **詳細表示**: イベント/タスク選択時に詳細パネルを表示

#### 3.3.2 ナビゲーション
- **タブ表示**: 
  - スケジュール
  - 場所
  - 予算
  - やることリスト
  - メモ
- **検索・フィルター**: 日付範囲、カテゴリ、支払者など

#### 3.3.3 デバイス対応
- **レスポンシブデザイン**:
  - PC: 1200px以上
  - タブレット: 768px～1199px
  - スマートフォン: 767px以下
- **タッチ操作対応**: スマートフォンでの直感的操作
- **オフライン対応**: ローカルストレージ使用でオフラインでも動作

---

## 4. 非機能要件

### 4.1 システム特性
- **開発言語**: HTML5, CSS3, JavaScript (Vanilla JS推奨)
- **フレームワーク**: 外部フレームワーク最小限（低コスト維持）
- **ブラウザ対応**: 
  - Chrome 最新版
  - Firefox 最新版
  - Safari 最新版
  - Edge 最新版
- **公開方式**: GitHub Pages（静的サイト）

### 4.2 パフォーマンス
- **初期ロード時間**: 3秒以内
- **操作応答性**: 500ms以内
- **データサイズ**: JSON 1MB以下が目安

### 4.3 セキュリティ
- **認証**: URLベースアクセス（将来的には認証機能追加を検討）
- **データ暗号化**: 個人情報保護の観点から検討（将来）
- **XSS対策**: ユーザー入力のサニタイズ
- **CSRF対策**: N/A（静的サイト）

### 4.4 保守性
- **コード整理**: モジュール化、コメント記載
- **ドキュメント**: READMEファイルで使用方法記載
- **バージョン管理**: Gitでの履歴管理

---

## 5. データモデル

### 5.1 旅行（Trip）
```json
{
  "id": "trip_id",
  "name": "旅行名",
  "startDate": "2026-02-15",
  "endDate": "2026-02-20",
  "notes": "旅行全体のメモ",
  "globalNotes": "旅行全体の共有メモ",
  "schedules": [],
  "locations": [],
  "expenses": [],
  "tasks": [],
  "users": [],
  "updatedAt": "2026-01-24T10:00:00Z"
}
```

> **格納構造**: `trips` 配列の中に各旅行のデータを保持し、アクティブな旅行は `currentTripId` で指定する。

### 5.2 スケジュール（Schedule）
```json
{
  "id": "unique_id",
  "title": "イベント名",
  "date": "2026-02-15",
  "startTime": "09:00",
  "endTime": "12:00",
  "location": "location_id",
  "description": "詳細説明",
  "category": "sightseeing|meal|transport|accommodation|activity",
  "notes": "メモ",
  "createdBy": "user_id",
  "createdAt": "2026-01-24T10:00:00Z",
  "updatedAt": "2026-01-24T10:00:00Z"
}
```

### 5.3 場所（Location）
```json
{
  "id": "unique_id",
  "name": "施設名",
  "address": "住所",
  "latitude": 35.6762,
  "longitude": 139.6503,
  "businessHours": "09:00-18:00",
  "website": "https://example.com",
  "images": ["url1", "url2"],
  "notes": "備考",
  "createdAt": "2026-01-24T10:00:00Z"
}
```

### 5.4 費用（Expense）
```json
{
  "id": "unique_id",
  "title": "費用項目",
  "amount": 5000,
  "currency": "JPY",
  "category": "food|transport|accommodation|activity|other",
  "paidBy": "user_id",
  "date": "2026-02-15",
  "participants": ["user_id1", "user_id2"],
  "notes": "メモ",
  "createdAt": "2026-01-24T10:00:00Z"
}
```

### 5.5 タスク（Task）
```json
{
  "id": "unique_id",
  "title": "タスク名",
  "description": "説明",
  "completed": false,
  "priority": "high|medium|low",
  "assignedTo": "user_id",
  "dueDate": "2026-02-15",
  "createdAt": "2026-01-24T10:00:00Z"
}
```

### 5.6 ユーザー（User）
```json
{
  "id": "unique_id",
  "name": "ユーザー名",
  "color": "#FF5733",
  "joinedAt": "2026-01-24T10:00:00Z"
}
```

---

## 6. 画面一覧

### 6.1 メイン画面
- 旅行スケジュール一覧（リスト形式）
- タブ切り替え機能
- 検索・フィルター機能

### 6.2 スケジュール詳細画面
- イベント情報表示
- 編集・削除機能
- コメント表示欄

### 6.3 予算管理画面
- 費用一覧表示
- カテゴリ別集計
- 割り勘計算結果

### 6.4 やることリスト画面
- タスク一覧（チェックボックス付き）
- 優先度表示
- 担当者表示

### 6.5 タイムライン表示画面
- 日時軸上でのイベント表示
- ビジュアル的な日程把握

---

## 7. 実装フェーズ

### Phase 1（基本機能）
- [x] スケジュール管理（登録・編集・削除・表示）
- [x] ローカルストレージでのデータ保存
- [x] リスト表示
- [x] レスポンシブデザイン基本実装
- [x] 複数旅行の追加・切替・削除（currentTrip管理）

### Phase 2（拡張機能）
- [ ] 場所情報管理＆地図連携
- [ ] 予算管理＆割り勘計算
- [ ] やることリスト
- [ ] メモ・コメント機能

### Phase 3（最適化・デプロイ）
- [ ] タイムライン表示実装
- [ ] UIの洗練
- [ ] GitHub Pagesデプロイ
- [ ] README作成

### Phase 4（将来計画）
- [ ] 簡易認証機能
- [ ] リアルタイム同期（サーバー連携）
- [ ] 複数旅行管理対応

---

## 8. 使用技術スタック

| 項目 | 技術 | 説明 |
|------|------|------|
| マークアップ | HTML5 | 標準ウェブページ構造 |
| スタイル | CSS3 | レスポンシブデザイン |
| 動作 | JavaScript (Vanilla) | jQuery等は不使用、低コスト維持 |
| データベース | JSON + LocalStorage | サーバー不要 |
| ホスティング | GitHub Pages | 無料公開 |
| バージョン管理 | Git | コード＆データ管理 |
| マップ | Google Maps API | 埋め込み表示（オプション） |

---

## 9. 対外インターフェース

### 9.1 Google Maps API（オプション）
- 場所情報の地図表示
- ルート検索（将来）

### 9.2 GitHub API（オプション）
- JSONデータの直接読み込み（読み取り専用）
- 将来的なデータ同期に向けた準備

---

## 10. 制約条件・制限事項

### 10.1 既知の制限
- **認証機能なし**: URLを知っていれば誰でもアクセス可能
- **リアルタイム同期なし**: ローカルストレージ＆手動エクスポート/インポート
- **複数旅行管理**: Phase 4以降で対応
- **バックエンド不要**: 完全に静的サイト化

### 10.2 セキュリティに関する注意
- 機密性の高い情報（クレジットカード番号等）は保存しないこと
- リンク共有時の対象者を限定すること
- JSONエクスポートデータには個人情報が含まれるため、共有時は注意

---

## 11. テスト計画

### 11.1 機能テスト
- スケジュール登録・編集・削除
- データの保存・読み込み
- フィルター・検索機能
- 予算計算の正確性

### 11.2 互換性テスト
- ブラウザ互換性（Chrome, Firefox, Safari, Edge）
- デバイス互換性（PC, タブレット, スマートフォン）
- OS互換性（Windows, macOS, iOS, Android）

### 11.3 パフォーマンステスト
- 大量データでの動作確認（200件以上のイベント）
- ロード時間測定
- メモリ使用量確認

---

## 12. 今後の展開（将来計画）

- **リアルタイム同期**: Firebase等を利用したクラウド同期
- **プッシュ通知**: 重要なスケジュール変更の通知
- **AI機能**: おすすめスポット提案、予算最適化提案
- **複数旅行対応**: 複数プロジェクト同時管理
- **SNS連携**: 旅行記録のシェア

---

## 13. 成功基準

✓ 2～6名での複数人同時編集が可能  
✓ PC・タブレット・スマートフォンで違和感のない操作性  
✓ スケジュール・場所・予算・タスク・メモの5つの情報が統合管理できる  
✓ GitHub Pagesで正常に公開・動作する  
✓ JSONでのデータエクスポート/インポートが正常に機能する  
✓ 初期ロード時間が3秒以内  

---

## 14. 実装ガイドライン：コード設計とコメント記載規約

メンテナンス性と学習効果を最大化するため、以下のガイドに従ってコード実装を行う。

### 14.1 ファイル構造と役割分担

```
project-root/
├── index.html              # メインページ（コンテナ）
├── css/
│   ├── style.css           # グローバルスタイル（色、フォント、基本レイアウト）
│   ├── responsive.css      # レスポンシブデザイン（メディアクエリ）
│   └── components.css      # 各コンポーネント専用スタイル
├── js/
│   ├── main.js             # アプリケーションのエントリーポイント
│   ├── data.js             # データ管理（CRUD操作、LocalStorage）
│   ├── ui.js               # UI操作（DOM操作、レンダリング）
│   ├── calendar.js         # スケジュール・カレンダー機能
│   ├── budget.js           # 予算管理・割り勘計算
│   ├── tasks.js            # やることリスト・チェックリスト
│   ├── locations.js        # 場所情報・地図連携
│   ├── utils.js            # ユーティリティ関数（日付操作など）
│   └── constants.js        # 定数定義（カテゴリ、通貨など）
├── data/
│   └── sample.json         # サンプルデータ
├── README.md               # 使用方法・セットアップガイド
└── spec.md                 # このファイル
```

**各ファイルの役割説明（実装時の参考）:**

| ファイル | 役割 | 主な関数・処理 |
|---------|------|------------|
| main.js | アプリの初期化・全体制御 | 初期化、イベントリスナー登録、タブ切り替え |
| data.js | データの保存・読み込み・更新 | saveToStorage()、loadFromStorage()、addEvent()、deleteEvent() |
| ui.js | HTML要素の作成・更新・削除 | renderScheduleList()、renderEventDetails()、hideModal() |
| calendar.js | スケジュール表示・編集 | displayCalendar()、addScheduleEvent()、editScheduleEvent() |
| budget.js | 費用管理・計算 | calculateTotal()、calculateDutchPay()、getExpenseByPayer() |
| tasks.js | タスク管理 | addTask()、completeTask()、getTasksByAssignee() |
| locations.js | 場所情報・地図 | addLocation()、displayMap()、searchLocation() |
| utils.js | 共通処理 | formatDate()、generateUniqueId()、sortByDate() |
| constants.js | グローバル定数 | CATEGORIES、PRIORITIES、CURRENCIES |

### 14.2 コメント記載の規約

#### 14.2.1 ファイルヘッダーコメント
**すべてのJavaScriptファイルの先頭に記載:**

```javascript
/**
 * ファイル名: data.js
 * 説明: アプリケーションのデータ管理を統括するモジュール
 * 
 * 主な機能:
 * - ローカルストレージへのデータ保存
 * - JSONデータの読み込み・更新・削除
 * - データのバリデーション
 * 
 * 依存関係: utils.js, constants.js
 * 
 * 使用例:
 *   const allEvents = Data.getAllEvents();
 *   Data.addEvent(newEventObject);
 */
```

#### 14.2.2 関数のコメント（JSDoc形式）
**すべての関数に以下の形式でコメント記載:**

```javascript
/**
 * 指定された日付のイベント一覧を取得する関数
 * 
 * @param {string} date - 対象日付（形式: "YYYY-MM-DD"）
 * @param {string} [category] - オプション: カテゴリでフィルタ（指定なしで全て）
 * @returns {Array<Object>} 該当イベントの配列
 * 
 * @example
 * const events = getEventsByDate("2026-02-15", "sightseeing");
 * // [{id: "1", title: "東京タワー", ...}, ...]
 * 
 * @throws {Error} dateが無効な形式の場合
 */
function getEventsByDate(date, category = null) {
  // 実装
}
```

#### 14.2.3 複雑なロジックのコメント
**アルゴリズムや判断分岐に詳細なコメント:**

```javascript
// 割り勘計算: 各参加者が負担すべき金額を計算
// 例: 10,000円を3人で割り勘 → 3,333円/人 + 残り1円を最初の人が負担
function calculateDutchPay(totalAmount, participantCount) {
  // 基本金額（小数点切り捨て）
  const baseAmount = Math.floor(totalAmount / participantCount);
  
  // 余りの計算（割り切れない場合の端数）
  const remainder = totalAmount % participantCount;
  
  // 各参加者の負担額を配列で返す
  const payments = new Array(participantCount).fill(baseAmount);
  
  // 最初のN名に余りを1円ずつ加算（公平性のため）
  for (let i = 0; i < remainder; i++) {
    payments[i] += 1;
  }
  
  return payments;
}
```

#### 14.2.4 HTML/CSSのコメント
**複雑な構造やスタイルに対してコメント:**

```html
<!-- スケジュールリストコンテナ
     role="list"でアクセシビリティ対応
     data-idはJavaScript操作用の識別子 -->
<ul id="schedule-list" role="list" class="schedule-list">
  <!-- 個別スケジュール項目 -->
  <li class="schedule-item" data-id="event-1">
    <!-- スケジュール内容 -->
  </li>
</ul>
```

```css
/* モバイルレスポンシブ対応
   スマートフォン（767px以下）では1列、
   タブレット以上では2列レイアウト */
.event-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .event-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

### 14.3 命名規則

#### 14.3.1 JavaScript変数・関数
```javascript
// 定数: 大文字アンダースコア区切り
const MAX_EVENTS = 1000;
const DEFAULT_CURRENCY = "JPY";

// 変数: キャメルケース
let currentUser = "Taro";
let selectedEventId = "event-123";

// ブール値: isやhasで始まる
let isLoading = false;
let hasError = false;

// 関数: 動詞で始まるキャメルケース
function addEvent(eventData) {}
function calculateTotal(expenses) {}
function renderScheduleList(events) {}

// クラス: パスカルケース
class ScheduleManager {}
class ExpenseCalculator {}
```

#### 14.3.2 HTML/CSS
```html
<!-- HTML: ケバブケース（ハイフン区切り）-->
<div id="main-container"></div>
<div class="schedule-item"></div>

<!-- Data属性: ケバブケース -->
<div data-event-id="123" data-category="sightseeing"></div>
```

```css
/* CSS: ケバブケース（BEM命名法推奨）*/
.schedule-item {}
.schedule-item__title {}
.schedule-item--active {}
.schedule-item__time--highlight {}
```

### 14.4 エラーハンドリングのコメント

```javascript
/**
 * LocalStorageからデータを取得する
 * ブラウザサポート状況やクォータ超過を考慮
 */
function loadFromStorage(key) {
  try {
    // ブラウザがLocalStorageをサポートしているか確認
    if (!window.localStorage) {
      console.warn("LocalStorageがサポートされていません");
      return null;
    }
    
    // 保存されているデータを取得
    const data = localStorage.getItem(key);
    
    // データが存在しない場合
    if (!data) {
      return null;
    }
    
    // JSON形式で解析
    return JSON.parse(data);
    
  } catch (error) {
    // クォータ超過やJSONパース失敗時の処理
    console.error(`データ読み込みエラー [${key}]:`, error);
    return null;
  }
}
```

### 14.5 学習ポイント別コメント例

#### 14.5.1 日付操作（日時の扱いが複雑なため）
```javascript
// 日付文字列を比較するポイント:
// "2026-02-15" と "2026-2-15" は異なる値として扱われるため、
// 必ず YYYY-MM-DD 形式に統一してから比較する
function compareDates(date1, date2) {
  const normalized1 = formatDateToISO(date1);
  const normalized2 = formatDateToISO(date2);
  return normalized1 === normalized2;
}
```

#### 14.5.2 配列操作（破壊的メソッドの注意）
```javascript
// ⚠️ 注意: splice()は配列を直接変更する（破壊的）
// 元の配列を保持したい場合は filter() を使う
function removeEvent(events, eventId) {
  // ❌ 悪い例: 元の配列が変更される
  // events.splice(events.findIndex(e => e.id === eventId), 1);
  
  // ✅ 良い例: 新しい配列を返す
  return events.filter(event => event.id !== eventId);
}
```

#### 14.5.3 非同期処理（Promise/async-await）
```javascript
// 複数のAPI呼び出しを順序を保証して実行
async function loadInitialData() {
  try {
    // 1. ユーザー情報を取得
    const users = await fetchUsers();
    
    // 2. ユーザー情報をもとにイベントを取得
    const events = await fetchEvents(users[0].id);
    
    // 3. イベント情報をもとに場所情報を取得
    const locations = await fetchLocations(events);
    
    return { users, events, locations };
  } catch (error) {
    console.error("データ読み込み失敗:", error);
  }
}
```

### 14.6 デバッグとログ出力

```javascript
/**
 * ログ出力: 本番環境では無効化して、開発環境でのみ出力
 */
const DEBUG = true; // 本番環境でfalseに変更

function log(message, data = null) {
  if (DEBUG) {
    console.log(`[App] ${message}`, data);
  }
}

function logError(message, error) {
  if (DEBUG) {
    console.error(`[Error] ${message}`, error);
  }
}

// 使用例
log("イベントを追加しました", newEvent);
logError("データ保存に失敗", error);
```

### 14.7 コメント記載チェックリスト

実装時に以下をすべて確認する:

- [ ] ファイルヘッダーコメントが記載されているか
- [ ] すべての関数にJSDocコメントが記載されているか
- [ ] 複雑なロジック（ループ、条件分岐）に説明コメントがあるか
- [ ] 変数名が自明でない場合、役割を説明するコメントがあるか
- [ ] エラーハンドリング部分にコメントがあるか
- [ ] HTMLの重要な要素にコメントがあるか
- [ ] CSSの重要なルールセット（特にレスポンシブ部分）にコメントがあるか
- [ ] 外部ライブラリを使用している場合、使用理由・参考URLがコメントされているか
- [ ] TODO や FIXME がある場合、それが記載されているか
- [ ] 個人的な工夫や最適化について、その理由がコメントされているか

---

## 15. データ操作の実装例

### 15.1 イベント追加時の処理フロー

```javascript
/**
 * イベント追加の完全な流れ（実装参考）
 */
// 1. ユーザー入力を取得
const eventData = {
  title: "スカイツリー訪問",
  date: "2026-02-15",
  startTime: "09:00",
  endTime: "12:00",
  location: "634-1",      // 場所ID
  category: "sightseeing",
  description: "展望台に上る予定",
  notes: "チケットは事前購入",
};

// 2. バリデーション
if (!isValidEvent(eventData)) {
  console.error("無効なイベント形式");
  return;
}

// 3. ユニークIDを生成
eventData.id = generateUniqueId();

// 4. メタデータを追加
eventData.createdBy = "Taro";
eventData.createdAt = new Date().toISOString();
eventData.updatedAt = new Date().toISOString();

// 5. ローカルストレージに保存
Data.addEvent(eventData);

// 6. UI更新
UI.renderScheduleList(Data.getAllEvents());

// 7. ユーザー通知
showNotification("イベントを追加しました: " + eventData.title);
```

### 15.2 割り勘計算の実装例

```javascript
/**
 * 予算管理における割り勘計算の流れ
 */
// サンプルデータ
const expenses = [
  { id: "1", title: "昼食", amount: 10000, paidBy: "Taro", participants: ["Taro", "Hanako", "Jiro"] },
  { id: "2", title: "移動費", amount: 6000, paidBy: "Hanako", participants: ["Taro", "Hanako", "Jiro"] },
];

// 各参加者の負担額を計算
// - Taro: (10000/3) + (6000/3) = 5,334円 + 2,000円 = 7,334円
// - Hanako: (10000/3) + (6000支払) = 3,333円 + 6,000円 = 9,333円
// - Jiro: (10000/3) + (6000/3) = 3,333円 + 2,000円 = 5,333円
const settlementData = calculateSettlement(expenses);

// 結果の利用
console.table(settlementData);
// Taroは9,334円を誰に支払う必要があるか
// → Hanako向けに2,999円、Jiro向けに0円 など複雑になるため、
// → 通常は全員がいったん均等に払った上で
//    最終的に誰から誰へいくら支払うかを計算する
```

---

**承認待ち**
- [ ] 要件定義確認者サイン
- [ ] 実装開始承認
