import { createSlice, nanoid} from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type Todo = {
  id: string
  title: string
  completed: boolean
}

type TodosState = {
  items: Todo[]
  filter: 'all' | 'active' | 'completed'
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  
  // Timer mode state
  timerMode: boolean
  isTyping: boolean
  remainingSeconds: number
  draftResetCounter: number
}

const initialState: TodosState = {
  items: [],
  filter: 'all',
  status: 'idle',
  error: null,
  timerMode: false,
  isTyping: false,
  remainingSeconds: 0,
  draftResetCounter: 0,
}
/*
export const fetchTodos = createAsyncThunk<Todo[]>(
  'todos/fetchTodos',
  async () => {
    // Simulate an API call
    await new Promise((r) => setTimeout(r, 600))
    const sample: Todo[] = [
      { id: nanoid(), title: 'Learn Redux Toolkit', completed: false },
      { id: nanoid(), title: 'Build a Todo App', completed: true },
      { id: nanoid(), title: 'Ship it', completed: false },
    ]
    return sample
  }
)
*/
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      prepare: (title: string) => ({ payload: { id: nanoid(), title } }),
      reducer: (state, action: PayloadAction<{ id: string; title: string }>) => {
        const title = action.payload.title.trim()
        if (!title) return
        state.items.unshift({ id: action.payload.id, title, completed: false })
      },
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const t = state.items.find((x) => x.id === action.payload)
      if (t) t.completed = !t.completed
    },
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((x) => x.id !== action.payload)
    },
    clearCompleted: (state) => {
      state.items = state.items.filter((x) => !x.completed)
    },
    setFilter: (state, action: PayloadAction<TodosState['filter']>) => {
      state.filter = action.payload
    },
    // Timer mode controls
    toggleTimerMode: (state) => {
      state.timerMode = !state.timerMode
      if (!state.timerMode) {
        state.isTyping = false
        state.remainingSeconds = 0
      }
    },
    typingStarted: (state) => {
      state.isTyping = true
    },
    typingStopped: (state) => {
      state.isTyping = false
      state.remainingSeconds = 0
    },
    timerStarted: (state, action: PayloadAction<number>) => {
      state.remainingSeconds = action.payload
    },
    timerTick: (state) => {
      if (state.remainingSeconds > 0) state.remainingSeconds -= 1
    },
    timerStopped: (state) => {
      state.remainingSeconds = 0
    },
    draftResetRequested: (state) => {
      state.draftResetCounter += 1
      state.isTyping = false
      state.remainingSeconds = 0
    },
    fetchTodosRequest: (state) => {
      state.status = "loading";
      state.error = null;
    },
    fetchTodosSuccess: (state, action: PayloadAction<Todo[]>) => {
      state.status = "succeeded";
      state.items = action.payload;
    },
    fetchTodosFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
  /*
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch todos'
      })
  },
  */
})

export const {
  fetchTodosFailure,
  fetchTodosRequest,
  fetchTodosSuccess,
  addTodo,
  toggleTodo,
  removeTodo,
  clearCompleted,
  setFilter,
  toggleTimerMode,
  typingStarted,
  typingStopped,
  timerStarted,
  timerTick,
  timerStopped,
  draftResetRequested,
} = todosSlice.actions
export default todosSlice.reducer
