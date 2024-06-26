import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Auth } from './components/Auth'
import { Todo } from './components/Todo'
import axios from 'axios'
import { CsrfToken } from './types'
 
function App() {
  // get localhost:8080/csrfでcsrfトークン取得してheaderに追加
  useEffect(() => {
    axios.defaults.withCredentials = true
    const getCsrfToken = async () => {
      const {data} = await axios.get<CsrfToken>(
        `${process.env.REACT_APP_API_URL}/csrf`
      )
      axios.defaults.headers.common['X-CSRF-Token'] = data.csrf_token
    }
    getCsrfToken()
  }, []) // 第二引数が[]なので初回レンダリングで呼び出し
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/todo" element={<Todo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;