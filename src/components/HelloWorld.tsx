import { useState } from 'react'

interface HelloWorldProps {
  name?: string
}

function HelloWorld({ name = 'World' }: HelloWorldProps) {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Welcome to Long Weekend Optimizer</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default HelloWorld