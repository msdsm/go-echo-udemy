# Udemy(Echo/Go + Reactで始めるモダンWebアプリケーション開発)

## ソース
- https://www.udemy.com/course/echo-go-react-restapi/learn/lecture/36949722?start=0#overview

## 構成

## 自分用メモ

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
### Clean Architecture
- https://www.youtube.com/watch?v=BvzjpAe3d4g&t=7s
#### Dependency Inversion Principle(依存関係逆転の原則)
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

### gormの外部キー制約
- https://gorm.io/ja_JP/docs/constraints.html
```go
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Email     string    `json:"email" gorm:"unique"`
	Password  string    `json:"password"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
type Task struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	User      User      `json:"user" gorm:"foreignKey:UserId; constraint:OnDelete:CASCADE"`
	UserId    uint      `json:"user_id" gorm:"not null"`
}
```
- `gorm:"foreignKey:UserId; constraint:OnDelete:CASCADE"`とすることで、Userが削除されたときにそのUserに紐づくTaskをすべて削除することができる

### マイグレーション
- gormでは`*gorm.DB`に`AutoMigrate`というメソッドが用意されていて引数に構造体のポインタを渡すことでtableを作成できる
```go
dbConn := db.NewDB()
dbConn.AutoMigrate(&model.User{}, &model.Task{}) // user, taskテーブル作成
```
- 今回は`GO_ENV=dev go run migrate/migrate.go`で実行
  - `GO_ENV=dev`はdb.goでGO_ENVがdevなら環境変数をすべて読み込むという実装にしているのでGO_ENVだけは渡してあげる必要がある

### JWT
- JSON Web Tokenの略
- 電子署名により改ざん検知できる
- 認証用のトークンなどで利用される
- ヘッダ、ペイロード、署名の3つから成る
- それぞれはBase64でエンコードされていて、`.`で結合されている
- https://iketechblog.com/go-jwt/

### cookie
- 作成方法は以下の3段階
  - `new(http.Cookie)`で作成
  - attributesに値をassign
  - `c.SetCookie(作成した変数)`でHTTPレスポンスヘッダのSet-Cookieに追加される
```go
// cookie作成
cookie := new(http.Cookie)
cookie.Name = "token"
cookie.Value = tokenString
cookie.Expires = time.Now().Add(24 * time.Hour)
cookie.Path = "/"
cookie.Domain = os.Getenv("API_DOMAIN")
cookie.Secure = true
cookie.HttpOnly = true
cookie.SameSite = http.SameSiteNoneMode
c.SetCookie(cookie)
return c.NoContent(http.StatusOK)
```

### echo jwt
- https://echo.labstack.com/docs/middleware/jwt
```go
// middleware
t.Use(echojwt.WithConfig(echojwt.Config{
	SigningKey:  []byte(os.Getenv("SECRET")),
	TokenLookup: "cookie:token",
}))
```
- `SigningKey`にJWTを生成したときと同じsecret keyを指定
- `TokenLookup`でクライアントから送られてくるJWT tokenがどこにあるかを指定

### バグ一覧
#### interface conversion: interface {} is *jwt.Token, not *jwt.Token (types from different packages)
- `user := c.Get("user").(*jwt.Token)`
- https://github.com/dgrijalva/jwt-go/issues/401
- jwtのversionの問題
- go.modでjwt/v4に変更して、importをすべてjwt/v4に変更
- できた