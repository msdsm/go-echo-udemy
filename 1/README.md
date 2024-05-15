# セクション1 : Overview

## メモ

### 本講座で作成するもの
- 以下の4つから構成される
  - router
    - middlewareの実行
    - requestに応じたcontroller呼び出し
  - controller
    - 入力値をusecase用に変換
    - usecase呼び出し
    - JSONレスポンス生成
  - usecase
    - JWT生成
    - CRUD操作
    - repository呼び出し
    - responseの加工
  - repository
    - dbへの読み書き
- ソースコードの依存関係は以下
  - router -> controller -> usecase <- repository -> (DB)
- 制御処理の流れは以下
  - router -> controller -> usecase -> repository -> (DB)