# Udemy(Echo/Go + Reactで始めるモダンWebアプリケーション開発)

## ソース
- https://www.udemy.com/course/echo-go-react-restapi/learn/lecture/36949722?start=0#overview

## 構成
- go-rest-api : `GO=ENV=dev go run main.go`で実行
- react-todo : `npm start`で実行

## 自分用メモ(Go)

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

### ozzo-validation
- validationを楽にかける外部module
```go
func (tv *taskValidator) TaskValidate(task model.Task) error {
	return validation.ValidateStruct(&task,
		validation.Field(
			&task.Title,
			validation.Required.Error("title is required"),
			validation.RuneLength(1, 10).Error("limited max 10 char"),
		),
	)
}
```
- 上の例では、task.Titleが存在するかどうか、長さが1以上10以下かどうかをvalidateしている

### CORS
- Cross Origin Resource Sharing
- 異なるオリジンからのアクセスを許可できる仕組み
- echoでの利用例は以下
```go
e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
	AllowOrigins: []string{"http://localhost:3000", os.Getenv("FE_URL")},
	AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept,
		echo.HeaderAccessControlAllowHeaders, echo.HeaderXCSRFToken},
	AllowMethods:     []string{"GET", "PUT", "POST", "DELETE"},
	AllowCredentials: true, // cookieの送受信を可能にする
}))
```
- stringのスライスでOrigin, Header, Methodを複数許可する

### CSRF
- Webアプリケーションが偽装された(本来送信されるべきでない)リクエストを正規のものとして受信してしまう脆弱性、または攻撃手法のこと
- 対策としてはトークンを利用するというものがある
  - CSRFを利用したトークンを持っていないリクエストをブロックするとうこと
- echoでの利用例は以下
```go
e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
	CookiePath:     "/",
	CookieDomain:   os.Getenv("API_DOMAIN"),
	CookieHTTPOnly: true,
	//CookieSameSite: http.SameSiteNoneMode,
	CookieSameSite: http.SameSiteDefaultMode, // secure modeをfalseにしないとpostmanで動作確認できないから
	//CookieMaxAge: 60,
}))
```

### バグ一覧
#### interface conversion: interface {} is *jwt.Token, not *jwt.Token (types from different packages)
- `user := c.Get("user").(*jwt.Token)`
- https://github.com/dgrijalva/jwt-go/issues/401
- jwtのversionの問題
- go.modでjwt/v4に変更して、importをすべてjwt/v4に変更
- できた

## 自分用メモ(React)
### プロジェクト作成方法
- `npx create-react-app react-todo --template typescript --use-npm`
  - `create-react-app`の後に任意のプロジェクト名
  - `template`の後にjavascriptかtypescriptを指定
### prettier
- コードフォーマッターの一種
- `npm install --save-dev prettier`でインストール可能
- vscodeの拡張機能でも利用可能
- JavaScript, TypeScript, HTML, CSSなどの言語をサポート
- コードフォーマットのルール設定は`.prettierrc`に記述
- 指定ファイルやディレクトリを無視する設定は`.prettierignore`に記述
### .prettierrc
- 以下設定例
```json
{
	"singleQuote": true, // シングルクォートを使用するかどうか。false の場合、ダブルクォートを使用
	"semi": true, // 文末にセミコロンを自動挿入するかどうか
}
```
- 他は以下参照
- [qiita](https://qiita.com/kkrtech/items/6416517f04347b980f8e#:~:text=prettierrc%20%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AF%E3%80%81%E3%82%B3%E3%83%BC%E3%83%89%E3%83%95%E3%82%A9%E3%83%BC%E3%83%9E%E3%83%83%E3%83%88,%E8%A1%8C%E3%81%86%E3%81%93%E3%81%A8%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%99%E3%80%82)


### tailwind CSS
- オープンソースのCSSフレームワークの1種
- Bootstrapとの違いとしては、ボタンやテーブルなどの要素に対する一連の定義済みクラスを提供しない点

### ローカル実行方法
- `npm start`
### zustand
- reactの状態管理ライブラリ
- 小さくシンプルに管理できる
- アプリケーション全体にアクセスできるグローバルステートの管理も可能
- `create`メソッドを使うことで状態管理のストアを作成可能
  - `get()`でstoreの値を参照
  - `set()`で状態を更新

### tanstack query
- 以下の3つで使える
  - データフェッチ
  - 取得データのキャッシュ
  - 効率的な非同期状態の管理
- https://zenn.dev/taisei_13046/books/133e9995b6aadf/viewer/2ce93a

### axios
- クライアントからapiたたくのに便利

### todo
- zustand詳しくのせる
- tanstack query, react queryについて詳しくのせる
- use系すべて(useStateから)のせる
- axiosもう少し詳しく
- Omit
- mutationのres, variablesの謎
  - useMutationの第一引数の関数の引数がvariables
  - 第一引数の関数の引数を第二引数で与える各レスポンスに対する処理で使えて便利という話をうまく言語化してまとめる
    - 今回のコードのupdate, deleteを例にかく
    - https://tanstack.com/query/v4/docs/framework/react/reference/useMutation
    - 公式サイトから第二引数の呼び方探す