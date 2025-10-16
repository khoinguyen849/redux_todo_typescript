import { configureStore } from '@reduxjs/toolkit'
import todosReducer from './todos/todosSlice'

import createSagaMiddleware from 'redux-saga'
import { todoSaga } from './sagas/todoSaga'
import { all } from 'redux-saga/effects'

function* rootSaga(){
  yield all([todoSaga()])
}

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },

  middleware: (getDefaultMiddleWare) => 
    getDefaultMiddleWare({thunk:false}).concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
