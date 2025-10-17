import { call, put, take, race, delay, select, fork, cancel, cancelled, takeLatest } from "redux-saga/effects"
import type { Task } from 'redux-saga'

import {
    fetchTodosRequest,
    fetchTodosSuccess,
    fetchTodosFailure,
        addTodo,
    typingStarted,
    typingStopped,
    toggleTimerMode,
    timerStarted,
    timerTick,
    timerStopped,
    draftResetRequested,
} from '../todos/todosSlice'
import type { Todo } from '../todos/todosSlice'
import type { RootState } from '../store'

type ApiTodo = { id: string | number; title?: string; text?: string; completed?: boolean }

function* fetchTodos(): Generator<unknown, void, unknown> {
    try {
        const response = (yield call(fetch, '/todo.json')) as Response
        const data = (yield call([response, response.json])) as ApiTodo[]
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

export function* todoSaga(): Generator<unknown, void, unknown> {
    yield takeLatest(fetchTodosRequest.type, fetchTodos)
}

// Timer logic
function* countdown(seconds: number): Generator<unknown, void, unknown> {
    try {
        yield put(timerStarted(seconds))
        for (let i = seconds; i > 0; i--) {
            yield delay(1000)
            yield put(timerTick())
        }
    } finally {
        if ((yield cancelled()) as boolean) {
            yield put(timerStopped())
        }
    }
}

function* timerFlow(): Generator<unknown, void, unknown> {
    while (true) {
        // Wait until typing begins while timer mode is on
        yield take([typingStarted.type, toggleTimerMode.type])
            const timerMode = (yield select((s: RootState) => s.todos.timerMode)) as boolean
            const isTyping = (yield select((s: RootState) => s.todos.isTyping)) as boolean
        if (!timerMode || !isTyping) continue

            const task = (yield fork(countdown, 60)) as Task
            const result = (yield race({
            stopped: take([typingStopped.type, toggleTimerMode.type, fetchTodosRequest.type, addTodo.type]),
            timedOut: delay(60000),
            })) as { stopped?: unknown; timedOut?: unknown }

            if (result.stopped) {
                yield cancel(task as Task)
            continue
        }

        // timed out
            yield cancel(task as Task)
        // Show prompt via window.confirm
            const confirmed = (yield call(() => window.confirm("You're running out of time."))) as boolean
        if (confirmed) {
            yield put(draftResetRequested())
        } else {
            // If they cancel, leave typing state but stop timer
            yield put(timerStopped())
        }
    }
}

export function* timerSagaRoot(): Generator<unknown, void, unknown> {
    // Start the timer watcher
    yield fork(timerFlow)
}