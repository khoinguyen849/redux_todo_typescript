import { useState } from 'react'
import type { FormEvent } from 'react'
import './todo.css'
import { useAppDispatch, useAppSelector } from './hooks'
import { addTodo, toggleTodo, removeTodo, clearCompleted, setFilter, fetchTodosRequest } from './todos/todosSlice'

function App() {
  const dispatch = useAppDispatch()
  const { items, filter, status, error } = useAppSelector((s) => s.todos)
  const [title, setTitle] = useState('')

  const filtered = items.filter((t) =>
    filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true,
  )

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    dispatch(addTodo(title))
    setTitle('')
  }

  const activeCount = items.filter((t) => !t.completed).length
  const completedCount = items.length - activeCount

  return (
    <div className="todo-app">
      <h1 className="todo-title">RTK Todo </h1>
      <form onSubmit={onSubmit} className="todo-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="Todo title"
          className="todo-input"
        />
        <button type="submit">Add</button>
      </form>

      <div className="todo-toolbar">
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
