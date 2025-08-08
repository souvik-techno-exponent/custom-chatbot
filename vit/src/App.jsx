import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatWidget from './ChatWidget'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ChatWidget />
    </>
  )
}

export default App
