# セクション2 : Todo REST API with Go/Echo

## 構成

## メモ
### Clean Architecture
- https://www.youtube.com/watch?v=BvzjpAe3d4g&t=7s
#### Dependancy Inversion Principle(依存関係逆転の原則)
- higher layerがlower layerに依存しているとき(clean architectureの図で内側から外側に依存があるとき)にそれを解消する方法
- 外側のモジュールのインターフェースを内側に実装して、内側のモジュールの依存先をインターフェースに変更するというもの

#### Encapsulation(隠蔽)
- lower layerがhiger layerに依存しているとき(外側から内側に依存があるとき)にそれを隠蔽するというもの
- 内側のモジュールのインターフェースを内側に実装して、外側のモジュールの依存先をインターフェースに変更するというもの


### SOLID原則
#### Single Responsibility Principle(単一責任の原則)
- クラスやモジュールが持つべき責任を1つに限定する原則
#### Open-Closed Principle(オープン・クローズドの原則)
- クラスやモジュールは拡張には開かれ修正には閉じているべきであるという原則
#### Liskov Substitution Principle(リスコフの置換原則)
- 派生クラスは基底クラスの代わりに利用できるべきであるという原則
#### Interface Segregation Principle(インターフェース分離の原則)
- クライアントが利用するインターフェースを必要な機能だけに限定する原則
#### (Dependency Inversion Principle)(依存関係逆転の原則)
- 上位モジュールが下位モジュールに依存すべきではなく、抽象化に依存するべきであるという原則