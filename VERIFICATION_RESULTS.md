# 検証結果（実測）

対象記事: 「生成AIで増えたVitestのテストを、CircleCIのテスト分割で10分以内に抑える」

検証リポジトリ: https://github.com/hidetaka-cci/vitest-test-splitting  
CircleCI: https://app.circleci.com/pipelines/gh/hidetaka-cci/vitest-test-splitting

> **運用上のメモ**: パイプラインは OAuth 定義 ID `1e4c40a1-698f-5178-991d-0753dae07670` を指定してトリガーする必要があった（`scripts/trigger-pipeline.sh`）。誤った pipeline definition だと config が解釈されず `build` ジョブエラーになる。

---

## Step 0: リポジトリ準備

### テストファイル（8ファイル）

| ファイル | ローカル実行時間（serial） |
|---------|--------------------------|
| src/add.test.ts | 0.58s |
| src/subtract.test.ts | 0.59s |
| src/multiply.test.ts | 0.57s |
| src/divide.test.ts | 0.55s |
| src/sum.test.ts | 0.75s |
| src/clamp.test.ts | 0.56s |
| src/format.test.ts | 0.55s |
| src/heavy.test.ts | **8.80s**（sleep 8s + 計算） |
| **合計（serial）** | **約 8.3s**（vitest 本体計測） |

`vitest.config.ts` の JUnit 設定:

```ts
['junit', {
  outputFile: `test-results/results-${process.env.CIRCLE_NODE_INDEX ?? '0'}.xml`,
  addFileAttribute: true, // 真偽値
}]
```

---

## Step 1: Before（分割なし）

- **パイプライン**: #4（main, job #5）
- **ジョブ実行時間**: **14.8s**（`duration: 14784` ms）
- **URL**: https://circleci.com/gh/hidetaka-cci/vitest-test-splitting/5

**記事導入の判断**: 本検証スイートは serial でも約 15s。記事の「5分 → 12分」は一般論・想定規模の例として残し、実測例は「約 15s → 並列 4 でも wall clock 約 14〜16s（重い 1 ファイルがボトルネック）」と注記する。

---

## Step 2: `addFileAttribute` の XML 確認

### addFileAttribute: `true`（デフォルト）

ローカル生成 XML（`CI=true npx vitest run src/add.test.ts`）:

```xml
<testcase classname="src/add.test.ts" file="src/add.test.ts" name="add &gt; adds two numbers" time="0.000507416">
```

- `<testcase>` に **`file="src/add.test.ts"`** が付く ✅
- 設定値は **真偽値 `true`**（文字列 `'true'` でも env 経由では同じ挙動）

### addFileAttribute: `false`

```xml
<testcase classname="src/add.test.ts" name="add &gt; adds two numbers" time="0.000488625">
```

- **`file` 属性なし** ✅

### `true` vs `'true'`（文字列）

`VITEST_JUNIT_ADD_FILE_ATTRIBUTE='true'` でも `file` 属性は出力される。差なし → 記事は **真偽値 `true` のままでよい**。

---

## Step 3: 初回実行（タイミング分割）の警告 — 実測

**パイプライン**: #6 / job #7（verify/step2-split, 1回目）

**実出力（原文コピー）**:

```
Error autodetecting timing type, falling back to weighting by name. Autodetect ambiguous - both filenames and classnames matched.  Use `--timings-type` to resolve.
```

### 記事修正ポイント

| 項目 | 修正前（ドキュメント表記） | 実測 |
|------|--------------------------|------|
| 動詞 | `auto-detecting`（ハイフンあり） | **`autodetecting`**（ハイフンなし） |
| 文言 | 1行のみ | **追加**: `Autodetect ambiguous - both filenames and classnames matched.  Use \`--timings-type\` to resolve.` |

`addFileAttribute: true` により JUnit に **filename と classname の両方** が載るため、autodetect が曖昧になる。記事では `--timings-type=filename` の明示を推奨する。

---

## Step 4: 2回目実行（タイミングデータあり）

- **パイプライン**: #7 / job #8
- **wall clock**: **14.3s**（`duration: 14332` ms）
- **parallelism**: 4

### コンテナ別の割当（2回目も同じ — タイミング分割が効いていない）

| Container | 割当ファイル | テスト実行時間 |
|-----------|-------------|--------------|
| 0 | add.test.ts, **heavy.test.ts** | **約 8.4s** |
| 1 | clamp.test.ts, multiply.test.ts | 約 0.4s |
| 2 | divide.test.ts, subtract.test.ts | 約 0.35s |
| 3 | format.test.ts, sum.test.ts | 約 0.3s |

2回目も Step 3 と **同じ警告** が出て、分割は **名前ベースのまま**。原因は `--timings-type` 未指定による autodetect 失敗。

**記事への追記**: 「2回目から最適化」は **`--timings-type=filename` を付けたうえで** `store_test_results` が蓄積された後に成立する、と条件付きで書く。

---

## Step 5: `file` 属性なし（タイミングデータあり）

- **パイプライン**: #9 / job #10（`VITEST_JUNIT_ADD_FILE_ATTRIBUTE: "false"`）

**実出力**:

```
Error autodetecting timing type, falling back to weighting by name. Autodetect ambiguous - both filenames and classnames matched.  Use `--timings-type` to resolve.
```

- **`No timing found for [ファイル名]` は出なかった** ❌（記事「症状2」の想定と不一致）
- Step 3/4 と **同一メッセージ**

### 症状1 / 症状2 の確定

| 症状 | 記事ドラフト想定 | 実測 |
|------|----------------|------|
| 症状1 | 初回タイミングなし | 上記 autodetect 警告（タイミングデータがあっても出うる） |
| 症状2 | `addFileAttribute` なし → `No timing found for ...` | **該当せず**。同じ autodetect ambiguous 警告 |

**因果の修正**: `addFileAttribute: false` 単体では「No timing found」にはならず、classname/filename 両方が残って autodetect が曖昧になる。タイミング分割を確実に効かせるには **`addFileAttribute: true` + `--timings-type=filename`** の組み合わせを記事で明示する。

---

## Step 6: 空振りコンテナ（parallelism: 10, テスト 8 ファイル）

### halt ガードなし（verify/step6-empty-no-halt, job #14）

Container 8/10, 9/10:

```
Assigned test files:

No tests assigned — running full suite (no halt guard).
```

→ **`npx vitest run` で全 8 ファイルが再実行された** ✅（記事注記どおり）

### halt ガードあり（verify/step6-empty-with-halt, job #16）

Container 8/10, 9/10:

```
No tests assigned to this container, halting.
```

→ **空コンテナは即 halt で停止** ✅

---

## Step 7: orb 7.2.1

- `orbs: node: circleci/node@7.2.1` — ローカル `circleci config process` で **`circleci/node@7.2.1` に解決** ✅
- `node/install-packages`（pkg-manager: npm）— job #7 以降すべて成功 ✅
- **`version` パラメータは未使用**（`docker` + `node/install-packages` パターン）✅

---

## Step 8: クレジット消費（概算）

medium = **10 クレジット/分/コンテナ**。概算: `10 × (duration秒 / 60) × parallelism`

| 実行 | Job | duration | parallelism | 概算クレジット |
|-----|-----|----------|-------------|--------------|
| Step 1 分割なし | #5 | 14.8s | 1 | **≈ 2.5** |
| Step 4 分割あり | #8 | 14.3s | 4 | **≈ 9.6** |
| Step 2 分割 1回目 | #7 | 16.0s | 4 | **≈ 10.7** |

記事の「1分のジョブでも 40 クレジット」= `10 × 1分 × 4並列` という **計算式として正しい**。本検証スイートは 1 ジョブあたり 15s 程度のため、実測は **約 10 クレジット前後**（4 並列時）。

---

## Step 9: 記事への反映サマリー

1. **警告文言**を実出力に合わせる（`autodetecting`、ambiguous メッセージ追記）
2. **`--timings-type=filename`** を config 例に追加
3. **症状2**の「No timing found」記述を削除または条件付きに修正
4. **空振りコンテナ**の実ログを引用
5. **導入の 5分→12分**は一般例として残し、実測は別箱で記載
6. **クレジット**は公式単価 + 本リポの概算で裏付け

### 推奨 config 修正（split コマンド）

```bash
TESTFILES=$(circleci tests glob "src/**/*.test.ts" | \
  circleci tests split --split-by=timings --timings-type=filename)
```
