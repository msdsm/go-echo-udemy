import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Task } from '../types'
import { useError } from '../hooks/useError'

export const useQueryTasks = () => {
    const { switchErrorHandling } = useError()
    const getTasks = async () => {
        const { data } = await axios.get<Task[]>(
            `${process.env.REACT_APP_API_URL}/tasks`,
            { withCredentials: true}
        )
        return data
    }

    return useQuery<Task[], Error>({// react queryではclientのキャッシュにfetchしたデータを格納できる
        queryKey: ['tasks'], // キャッシュのキー
        queryFn: getTasks, // クエリーファンクションで上で定義したgetTasksわたす
        staleTime: Infinity, // キャッシュしたデータをどのくらいの期間最新のものとしてみなすかというもの
        onError: (err: any) => {
            if (err.response.data.message) {
                switchErrorHandling(err.response.data.message)
            } else [
                switchErrorHandling(err.response.data)
            ]
        },
    })
}