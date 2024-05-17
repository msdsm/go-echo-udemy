// 状態管理
import {create} from 'zustand'

type EditedTask = {
    id: number
    title: string
}

type State = {
    editedTask: EditedTask // 状態管理したい対象としてEditedTask型の変数宣言
    updateEditedTask: (payload: EditedTask) => void // updateEditedTaskという関数の型宣言(入力:EditedTask型, 返り値:なし)
    resetEditedTask: () => void // 関数型宣言
}

// stateと関数の具体的な処理を追加
const useStore = create<State>((set) => ({
    editedTask: {id: 0, title: ''},
    updateEditedTask: (payload) =>
        set({
            editedTask: payload,
        }),
    resetEditedTask: () => set({ editedTask: {id: 0, title: ''} }),
}))

export default useStore