import { useEffect, useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import './todo.css'
import { useAppDispatch, useAppSelector } from './hooks'
import Switch from './components/Switch'
import {
  addTodo,
  toggleTodo,
  removeTodo,
  clearCompleted,
  setFilter,
  fetchTodosRequest,
  toggleTimerMode,
  typingStarted,
  typingStopped,
} from './todos/todosSlice'

function App() {
  const dispatch = useAppDispatch()
  const { items, filter, status, error, timerMode, isTyping, remainingSeconds, draftResetCounter } = useAppSelector((s) => s.todos)
  const [title, setTitle] = useState('')

  // Reset local draft when saga requests it
  useEffect(() => {
    setTitle('')
  }, [draftResetCounter])

  const filtered = items.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
  )

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (timerMode && isTyping && remainingSeconds <= 0) {
      // Guard if user tries to submit after time up
      alert("You're running out of time.")
      return
    }
    dispatch(addTodo(title))
    if (timerMode) dispatch(typingStopped())
    setTitle('')
  }

  function onChangeTitle(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitle(val)
    if (!timerMode) return
    if (!isTyping && val.trim().length > 0) {
      dispatch(typingStarted())
    }
    if (isTyping && val.trim().length === 0) {
      dispatch(typingStopped())
    }
  }

  const activeCount = items.filter((t) => !t.completed).length
  const completedCount = items.length - activeCount

  return (
    <div className="todo-app">
      <h1 className="todo-title">RTK Todo </h1>
      <form onSubmit={onSubmit} className="todo-form">
        <input
          value={title}
          onChange={onChangeTitle}
          placeholder="What needs to be done?"
          aria-label="Todo title"
          className="todo-input"
        />
        <button type="submit">Add</button>
      </form>

      <div className="todo-toolbar">
        <div className="timer-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ display: 'inline-flex', gap: 6 }}>
            <Switch
              checked={timerMode}
              disabled={isTyping}
              onCheckedChange={() => dispatch(toggleTimerMode())}
              aria-label="Toggle timer mode"
            />
            Timer mode
          </label>
          {timerMode && isTyping && (
            <span aria-live="polite">Time left: {remainingSeconds}s</span>
          )}
        </div>
        <div className="filter-group">
          <button
            onClick={() => dispatch(setFilter('all'))}
            aria-pressed={filter === 'all'}
          >
            All
          </button>
          <button
            onClick={() => dispatch(setFilter('active'))}
            aria-pressed={filter === 'active'}
          >
            Active
          </button>
          <button onClick={() => dispatch(setFilter('completed'))} aria-pressed={filter === 'completed'}>
            Completed
          </button>
        </div>
        <button onClick={() => dispatch(clearCompleted())} disabled={completedCount === 0}>
          Clear completed ({completedCount})
        </button>
        <button onClick={() => dispatch(fetchTodosRequest())} disabled={status === 'loading'}>
          {status === 'loading' ? 'Loading…' : 'Load sample'}
        </button>
      </div>

      <ul className="todo-list">
        {status === 'failed' && (
          <li className="todo-error">Error: {error}</li>
        )}
        {filtered.map((t) => (
          <li key={t.id} className={`todo-item ${t.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => dispatch(toggleTodo(t.id))}
              aria-label={`Toggle ${t.title}`}
            />
            <span className="todo-text">
              {t.title}
            </span>
            <button onClick={() => dispatch(removeTodo(t.id))} aria-label={`Delete ${t.title}`}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div className="todo-count">{activeCount} items left</div>
    </div>
  )
}

export default App
