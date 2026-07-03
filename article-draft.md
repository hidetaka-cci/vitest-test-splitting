# 記事修正メモ（実測反映版）

検証結果の詳細は [VERIFICATION_RESULTS.md](./VERIFICATION_RESULTS.md) を参照。

## 導入部

- **変更**: 「5分 → 12分」は大規模スイートの一般例として維持
- **追加**: 検証リポジトリ（8ファイル・serial 約 8s / CI 約 15s）では、分割しても heavy 1 ファイルがボトルネックとなり wall clock はほぼ横ばい

## 症状1（初回 / タイミング分割の警告）

**実測ログ**:

```
Error autodetecting timing type, falling back to weighting by name. Autodetect ambiguous - both filenames and classnames matched.  Use `--timings-type` to resolve.
```

- `auto-detecting` → **`autodetecting`**
- 1行説明に加え、**ambiguous** の説明と `--timings-type` への誘導を追記

## 症状2（file 属性なし）

- **削除または大幅修正**: `No timing found for [ファイル名]` は今回の実測では **出なかった**
- **代替説明**: `addFileAttribute: false` でも classname が残り autodetect が曖昧になる。タイミング分割を filename ベースで効かせるには **`addFileAttribute: true` と `--timings-type=filename` のセット**が必要

## vitest.config.ts（JUnit）

```ts
reporters: process.env.CI
  ? [
      ['verbose'],
      ['junit', {
        outputFile: `test-results/results-${process.env.CIRCLE_NODE_INDEX ?? '0'}.xml`,
        addFileAttribute: true, // 真偽値。'true' 文字列でも可だが boolean 推奨
      }],
    ]
  : ['verbose'],
```

## CircleCI config（分割コマンド）

```yaml
- run:
    name: Run tests with split
    command: |
      TESTFILES=$(circleci tests glob "src/**/*.test.ts" | \
        circleci tests split --split-by=timings --timings-type=filename)
      echo "Container ${CIRCLE_NODE_INDEX}/${CIRCLE_NODE_TOTAL}"
      echo "Assigned test files:"
      echo "$TESTFILES"
      if [ -z "$TESTFILES" ]; then
        echo "No tests assigned to this container, halting."
        circleci-agent step halt
      fi
      echo "$TESTFILES" | tr ' ' '\n' | xargs npx vitest run
```

## 空振りコンテナの注記

- **実測確認済み**: 割当ゼロ + halt なし → `npx vitest run` が **全テスト実行**
- **実測確認済み**: `circleci-agent step halt` で空コンテナは `"No tests assigned to this container, halting."` と出て停止

## コスト

- medium = 10 クレジット/分/コンテナ（公式どおり）
- 4 並列 × 1 分 = **40 クレジット/分**（wall clock ベース）— 計算式は正しい
- 本検証（約 15s/job）では 4 並列で **約 10 クレジット/実行**

## orb

- `circleci/node@7.2.1` + `node/install-packages` — 問題なし
- `version: 22` 等の廃止パラメータには非依存（`cimg/node:22.14` docker 指定）
