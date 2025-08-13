import { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='flex justify-center items-center h-screen'>
      <Button
        variant="outline"
        className="bg-blue-500 text-white"
        onClick={() => setCount(count + 1)}
      >Click me</Button>
    </div>
  )
}

export default App
