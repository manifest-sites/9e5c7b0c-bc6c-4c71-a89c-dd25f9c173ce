import { useState, useEffect } from 'react'
import { Button, Input, List, Checkbox, Typography, Card, Space, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { Item } from '../entities/Item'

const { Title } = Typography

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const response = await Item.list()
      if (response.success) {
        setTodos(response.data)
      }
    } catch (error) {
      message.error('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (!newTodo.trim()) {
      message.warning('Please enter a todo item')
      return
    }

    try {
      const response = await Item.create({
        title: newTodo.trim(),
        completed: false,
        userId: 1
      })
      
      if (response.success) {
        setTodos([...todos, response.data])
        setNewTodo('')
        message.success('Todo added successfully')
      }
    } catch (error) {
      message.error('Failed to add todo')
    }
  }

  const toggleTodo = async (todo) => {
    try {
      const response = await Item.update(todo._id, {
        ...todo,
        completed: !todo.completed
      })
      
      if (response.success) {
        setTodos(todos.map(t => 
          t._id === todo._id ? { ...t, completed: !t.completed } : t
        ))
      }
    } catch (error) {
      message.error('Failed to update todo')
    }
  }

  const deleteTodo = async (todoId) => {
    try {
      const response = await Item.delete(todoId)
      if (response.success) {
        setTodos(todos.filter(t => t._id !== todoId))
        message.success('Todo deleted successfully')
      }
    } catch (error) {
      message.error('Failed to delete todo')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 rounded-2xl">
          <div className="text-center mb-8">
            <Title level={1} className="!text-4xl !font-bold !text-gray-800 !mb-2">
              Todo App
            </Title>
            <p className="text-gray-600 text-lg">
              {totalCount === 0 ? 'No todos yet' : `${completedCount} of ${totalCount} completed`}
            </p>
          </div>

          <div className="mb-6">
            <Space.Compact className="w-full">
              <Input
                placeholder="Add a new todo..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={handleKeyPress}
                size="large"
                className="rounded-l-lg"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addTodo}
                size="large"
                className="rounded-r-lg bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                Add
              </Button>
            </Space.Compact>
          </div>

          <List
            loading={loading}
            dataSource={todos}
            locale={{ emptyText: 'No todos yet. Add one above!' }}
            renderItem={(todo) => (
              <List.Item
                className={`rounded-lg mb-3 p-4 border transition-all duration-200 hover:shadow-md ${
                  todo.completed 
                    ? 'bg-green-50 border-green-200 opacity-75' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
                actions={[
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTodo(todo._id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    size="small"
                  />
                ]}
              >
                <div className="flex items-center w-full">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                    className="mr-3"
                  />
                  <span 
                    className={`flex-1 text-lg ${
                      todo.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-800'
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
              </List.Item>
            )}
          />

          {todos.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default TodoApp