# 検証結果記録

対象記事: 「生成AIで増えたVitestのテストを、CircleCIのテスト分割で10分以内に抑える」

## Step 0: リポジトリ準備

### テストファイル（8ファイル）

| ファイル | ローカル実行時間（目安） |
|---------|------------------------|
| src/add.test.ts | |
| src/subtract.test.ts | |
| src/multiply.test.ts | |
| src/divide.test.ts | |
| src/sum.test.ts | |
| src/clamp.test.ts | |
| src/format.test.ts | |
| src/heavy.test.ts | |

## Step 1: Before（分割なし）

- パイプライン: 
- ジョブ実行時間: 

## Step 2: addFileAttribute

### addFileAttribute: true

- パイプライン: 
- XMLサンプル: 

### addFileAttribute: false

- パイプライン: 
- XMLサンプル: 

### true vs 'true'（文字列）

- 差分: 

## Step 3: 初回実行（タイミングデータなし）

- ブランチ: 
- パイプライン: 
- 警告メッセージ（原文）: 

## Step 4: 2回目実行（タイミングデータあり）

- パイプライン: 
- コンテナ別実行時間: 
- タイミング分割ログ: 

## Step 5: file属性なし（タイミングデータあり）

- パイプライン: 
- ログメッセージ（原文）: 

## Step 6: 空振りコンテナ

### haltガードなし（parallelism: 8）

- パイプライン: 
- 空コンテナの挙動: 

### haltガードあり（parallelism: 8）

- パイプライン: 
- 空コンテナの挙動: 

## Step 7: orb 7.2.1

- node/install-packages 成功: 
- version パラメータ依存: なし（executor 使用）

## Step 8: クレジット消費

| 実行 | ジョブ時間 | クレジット |
|-----|----------|----------|
| Step 1（分割なし） | | |
| Step 4（parallelism: 4） | | |

## Step 9: 記事反映メモ

- 導入の「5分 → 12分」: 
- 症状1の警告文言: 
- 症状2の因果: 
