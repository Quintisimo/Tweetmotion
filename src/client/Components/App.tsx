import React, { useState, FC } from 'react'

const App: FC = () => {
  const [server, setServer] = useState({})
  const [text, setText] = useState('')

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e): void => {
          e.preventDefault()
          e.stopPropagation()
          setText(e.target.value)
        }}
      />
      <input
        type="submit"
        value="Submit"
        onClick={(): void => {
          fetch(`/api/${encodeURIComponent(text)}`)
            .then(res => res.json())
            .then(text => setServer(text))
            .catch(err =>
              setServer(`Could not connect to server: ${err.message}`)
            )
        }}
      />
      <pre>{JSON.stringify(server, null, 2)}</pre>
    </div>
  )
}

export default App
