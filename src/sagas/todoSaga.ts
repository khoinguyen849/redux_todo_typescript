import { call, put, takeLatest } from "redux-saga/effects"

import { fetchTodosRequest, fetchTodosSuccess, fetchTodosFailure } from '../todos/todosSlice'
import type { Todo } from '../todos/todosSlice'

function* fetchTodos() {
    try {
        const response: Response = yield call(fetch, '/todo.json')
        
        const data = (yield call([response, response.json])) as Array<Partial<Todo> & { text?: string }>
        const todos: Todo[] = data.map((d) => ({
            id: String(d.id ?? ''),
            title: String(d.title ?? d.text ?? ''),
            completed: Boolean(d.completed),
        }))
        yield put(fetchTodosSuccess(todos))
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to load todos'
            yield put(fetchTodosFailure(message))
    }
}

export function* todoSaga() {
    yield takeLatest(fetchTodosRequest.type, fetchTodos)
}