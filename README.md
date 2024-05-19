# Udemy(Echo/Go + Reactで始めるモダンWebアプリケーション開発)

## 目次
- [Udemy(Echo/Go + Reactで始めるモダンWebアプリケーション開発)](#udemyechogo--reactで始めるモダンwebアプリケーション開発)
  - [目次](#目次)
  - [ソース](#ソース)
  - [構成](#構成)
  - [自分用メモ(Go)](#自分用メモgo)
    - [本講座で作成するもの](#本講座で作成するもの)
    - [Clean Architecture](#clean-architecture)
      - [Dependency Inversion Principle(依存関係逆転の原則)](#dependency-inversion-principle依存関係逆転の原則)
      - [Encapsulation(隠蔽)](#encapsulation隠蔽)
    - [SOLID原則](#solid原則)
      - [Single Responsibility Principle(単一責任の原則)](#single-responsibility-principle単一責任の原則)
      - [Open-Closed Principle(オープン・クローズドの原則)](#open-closed-principleオープンクローズドの原則)
      - [Liskov Substitution Principle(リスコフの置換原則)](#liskov-substitution-principleリスコフの置換原則)
      - [Interface Segregation Principle(インターフェース分離の原則)](#interface-segregation-principleインターフェース分離の原則)
      - [(Dependency Inversion Principle)(依存関係逆転の原則)](#dependency-inversion-principle依存関係逆転の原則-1)
    - [gormの外部キー制約](#gormの外部キー制約)
    - [マイグレーション](#マイグレーション)
    - [JWT](#jwt)
    - [cookie](#cookie)
    - [echo jwt](#echo-jwt)
    - [ozzo-validation](#ozzo-validation)
    - [CORS](#cors)
    - [CSRF](#csrf)
    - [バグ一覧](#バグ一覧)
      - [interface conversion: interface {} is \*jwt.Token, not \*jwt.Token (types from different packages)](#interface-conversion-interface--is-jwttoken-not-jwttoken-types-from-different-packages)
  - [自分用メモ(React)](#自分用メモreact)
    - [プロジェクト作成方法](#プロジェクト作成方法)
    - [prettier](#prettier)
    - [.prettierrc](#prettierrc)
    - [tailwind CSS](#tailwind-css)
    - [ローカル実行方法](#ローカル実行方法)
    - [zustand](#zustand)
    - [Omit](#omit)
    - [axios](#axios)
    - [フック](#フック)
      - [useState](#usestate)
      - [useEffect](#useeffect)
    - [useContext](#usecontext)
      - [useRef](#useref)
      - [カスタムフック](#カスタムフック)
    - [TanStack Query](#tanstack-query)
      - [useQuery](#usequery)
      - [useMutation](#usemutation)
    - [React developer tools](#react-developer-tools)

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
- 簡単な例だと以下
```tsx
import { create } from 'zustand'

// stateの定義と更新ロジックを含むストアを作成。
const useStore = create(set => ({
  count: 0,
  increase: () => set(state => ({ count: state.count + 1 })),
  decrease: () => set(state => ({ count: state.count - 1 }))
}))

// ストアをコンポーネントで使用
function Counter() {
  const { count, increase, decrease } = useStore()
  return (
    <div>
      <button onClick={decrease}>-</button>
      <span>{count}</span>
      <button onClick={increase}>+</button>
    </div>
  )
}
```
- 今回はstore/index.tsで使用

### Omit
- `Omit<T,K>`で既に存在するT型の中からKで選択したプロパティを除いた新しい型を構築できる
- 今回の例は以下
```tsx
(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>)
(task: Omit<Task, 'created_at' | 'updated_at'>)
```
- 1つ目はTask型からid,created_at,updated_atを除いたもの、つまりtitleのみ
- 2つ目はidとtitleから成る新しい型

### axios
- `axios.get(...)`や`axios.post(...)`などで簡単にapiたたける

### フック
https://zenn.dev/enumura/books/a882cb41219318/viewer/eb659f
#### useState
- 状態を管理、更新するための機能
- 以下のように宣言する
```tsx
const [状態変数 状態変数を更新するための関数] = useState(状態変数の初期値)
```
- 使用例として、ボタンがクリックされるたびにカウントアップするコードが以下
```tsx
import { useState } from 'react'; // import

function Countup() {
  const [countedNumber, setCount] = useState(0); // 宣言(countedNumberが状態変数、setCountが関数)
  
  // onClickでボタンが押されるたびにsetCountを使ってcounterNumberの値をcounterNumber+1に更新
  return (
    <div>
      <p>Count: {countedNumber}</p>
      <button onClick={() => setCount(countedNumber + 1)}>Increment</button>
    </div>
  );
}

export default Countup;
```
#### useEffect
- コンポーネントが画面に描画された後、またはコンポーネントの更新後に関数を実行するHooks
- コンポーネントのレンダリング後にuseEffectの第一引数に渡した関数の実行をおこなう
- 第二引数で変化を監視する対象の状態変数を配列として複数定義できる
- この配列が空の場合は初回レンダリング時にuseEffectの第一引数の関数が走る
- 使用方法は以下
```tsx
// 第一引数:関数, 第二引数:配列
useEffect(() => {
  // 副作用として実行する処理の中身を記述
}, [副作用関数の実行タイミングを制御する依存配列])
```
- 使用例としてカウンターの値が変化したときにメッセージを表示するものが以下
  - これはcountの値が変わるたび(クリックされるたび)にその値をコンソールに出力するというもの
```tsx
import React, { useState, useEffect } from 'react'; // import

function Counter() {
  const [count, setCount] = useState(0); // useStateを利用して状態変数と更新関数作成

  // useEffect定義
  // 第一引数:countの中身をログ出力するという関数
  // 第二引数:状態変数であるcountだけを格納した配列
  useEffect(() => {
    console.log(`countの値: ${count}`);
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default Counter;
```
- 以下は初回レンダリング後に一度だけ実行する例
```tsx
// 第二引数を空の配列にすることで初回レンダリング後に実行させられる
useEffect(() => {
  console.log(`hoge`);
}, []);
```
### useContext
- コンポーネント間でデータを共有するために使用する
- propsでは親から子コンポーネントにデータを渡すのに対して、useContextでは子のさらにその子などに直接わたすことができる
- propsの場合だと親が子の子にデータを渡すときにpropsを与えるというのが2回発生してしまうため、このような場合にuseContextが便利
- データを構造体の形で定義して`createContext()`の引数に与えることでcontextの作成ができる
- 作成したContextのProviderコンポーネントで対象コンポーネントを囲んで値を渡す
- 値を受け取る側は`useContext()`を用いてデータの取り出しが可能
- 以下例
```tsx
// index.js
import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 共有するデータ
const hogeData = {
  fruits: 'grape',
  drink: 'water'
}

// Contextの作成
const HogeContext = createContext(hogeData); // 引数にデータ渡す

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // プロバイダー ここでデータ渡す
  <HogeContext.Provider value={hogeData}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </HogeContext.Provider>
);

// 外部からアクセスできるようにする
export default HogeContext;
```

```tsx
// App.js
import { useContext } from 'react';

// Contextのインポート
import HogeContext from '.';

function App() {
  const hogeData = useContext(HogeContext); // これでデータ取り出せる

  // 構造体として値を取り出せる
  return (
    <div className="App">
      <h1>{hogeData.fruits}</h1>
      <h1>{hogeData.drink}</h1>
    </div>
  );
}

export default App;
```
#### useRef
- 要素の参照をするためのフック
- 値を保持することができるが、useStateとは異なり再レンダリングをしない
- 宣言方法は以下のように`useRef()`に初期値を与えて状態変数を作成
```tsx
const hoge = useRef(初期値)
```
- 以下、例としてクリックされたときに入力値を出力するもの
  - useRefを使うことで変更した値を常に反映させられているが、再レンダリングはされない
```tsx
import { useRef } from 'react';

function App() {
  const inputRef = useRef(null); // 宣言

  const outPutInputValue = () => {
    console.log(inputRef.current.value);
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={outPutInputValue}>入力値出力ボタン</button>
    </div>
  );
}

export default App;
```
#### カスタムフック
- 名前がuseで始まり次に大文字がくるような命名法によってオリジナルのフックを作成できる
- 今回のコードではhooksディレクトリにあるものが全てカスタムフック
- カスタムフックの利点は複数のReactHooksをまとめられること


### TanStack Query
- 以下の3つで使える
  - データフェッチ
  - 取得データのキャッシュ
  - 効率的な非同期状態の管理
#### useQuery
- 公式ドキュメント
  - https://tanstack.com/query/v5/docs/framework/react/reference/useQuery
- 最低限の使い方としては以下のようにqueryKeyにキャッシュ識別のためのkey, queryFnにデータフェッチのための非同期関数を渡すだけ
  - useQueryではフェッチしたデータをクライアントにキャッシュとして保存できる
```tsx
const { data, isPending } = useQuery({
  queryKey: ["issues"],
  queryFn: () => axios.get("/issues").then(res => res.data)
})
```
- 代表的な引数は以下
  - queryKey : 必須、キャッシュを識別するためのもの
  - queryFn : Promiseを返す関数をわたす
  - enabled : これがfalseの場合はクエリが実行されない
  - staleTime : キャッシュをstale状態にするまでの時間
- 代表的な返り値は以下
  - data : クエリの結果
  - error : クエリ実行時に発生したエラーオブジェクト
  - isLoading : statusがpendingでありかつフェエッチが実行されている状態
#### useMutation
- useQueryがデータ取得のためのAPIだったのに対して、useMutationはデータの更新に使う
  - CRUDのうちCUD
- useQueryが宣言的であるのに対してuseMutationは命令的
  - `useMutation`の返り値である`mutate()`関数で実行させる
```tsx
const mutation = useMutation({
    mutationFn: (newTodo) => {
      return axios.post('/todos', newTodo)
    },
  })
```
- 必須引数はmutationFnのみで、これに非同期関数を渡す
- 他の重要なオプションは以下
  - onSuccess : mutationが成功した際に発火するコールバック関数
  - onError : mutationが失敗した際に発火するコールバック関数
- また、onErrorやonSuccessの引数にmutationFnの引数をvariablesとして渡せる
- 今回のコードの使用例は以下
  - updateMutationのonSuccessでは(res,variables)を渡しているがvariablesはmutationFnの引数であるidとtitleから成る構造体
    - そのためその以降でvariables.idとしてアクセスしている
  - deleteMutationのonSuccessの(res, variables)ではmutationFnの引数がid : numberであるためnumber型の変数
    - そのためその以降で`task.id !== variables`のようにvariablesでidにアクセスできる
```tsx
const createTaskMutation = useMutation(
    (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
        axios.post<Task>(`${process.env.REACT_APP_API_URL}/tasks`, task),
    {
        onSuccess: (res) => {
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
            if (previousTasks) {
                queryClient.setQueryData(['tasks'], [...previousTasks, res.data])
            }
            resetEditedTask()
        },
        onError: (err: any) => {
            if (err.response.data.message) {
                switchErrorHandling(err.response.data.message)
            } else {
                switchErrorHandling(err.response.data)
            }
        },
    }
)
const updateTaskMutation = useMutation(
    (task: Omit<Task, 'created_at' | 'updated_at'>) =>
        axios.put<Task>(`${process.env.REACT_APP_API_URL}/tasks/${task.id}`, {
            title: task.title,
        }),
    {
        onSuccess: (res, variables) => {
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
            if (previousTasks) {
                queryClient.setQueryData<Task[]>(
                    ['tasks'],
                    previousTasks.map((task) =>
                    task.id === variables.id ? res.data : task
                    )   
                )
            }
            resetEditedTask()
        },
        onError: (err: any) => {
            if (err.response.data.message) {
                switchErrorHandling(err.response.data.message)
            } else {
                switchErrorHandling(err.response.data)
            }
        },
    }
)
const deleteTaskMutation = useMutation(
    (id: number) => 
        axios.delete(`${process.env.REACT_APP_API_URL}/tasks/${id}`),
    {
        onSuccess: (_, variables) => {
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])
            if (previousTasks) {
                queryClient.setQueryData<Task[]>(
                    ['tasks'],
                    previousTasks.filter((task) => task.id !== variables)
                )
            }
            resetEditedTask()
        },
        onError: (err: any) => {
            if (err.response.data.message) {
                switchErrorHandling(err.response.data.message)
            } else {
                switchErrorHandling(err.response.data)
            }
        },
    }
)
```
- このようにCRUDのうちのCRDの非同期APIを叩くということと、そのレスポンス時に合わせて実行させるものを1つの関数でかけるので非常に便利
### React developer tools
- 公式のReact用のデバッグツール