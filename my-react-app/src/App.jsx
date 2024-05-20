import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  let [count, setCount] = useState(0)

  const add=()=>{
    if(count<20)
    setCount(count+1)
  
  }
  const rem=()=>{
    if(count>0)
    setCount(count-1)
  
  }

  return (
    <>
      <div>
        Number value: {count}
        <br />
        <button onClick={add}>ADD</button>
        <br />
        <button onClick={rem}>REMOVE</button>
      </div>
    </>
  )
}

export default App
