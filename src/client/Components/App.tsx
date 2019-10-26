import React, { useState, FC } from 'react'
import useInterval from '@use-it/interval'
import Graphs, { style } from './Graphs'
import { TweetAnalysed } from '../../interfaces'

const App: FC = () => {
  const [server, setServer] = useState<TweetAnalysed[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clicked, setClicked] = useState(false)
  const [lastUpdated, setLastUpdate] = useState<Date>(null)

  const fetchTweets = async (type: 'initial' | 'update'): Promise<void> => {
    if (text.length) {
      try {
        const res = await fetch(`/api/${type}/${encodeURIComponent(text)}`)
        const json: TweetAnalysed[] = await res.json()
        setServer(json)
        setLastUpdate(new Date())
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }
  }

  useInterval(() => {
    if (clicked && !loading) {
      console.log('Fetching new tweets')
      fetchTweets('update')
    }
  }, 5000)

  return (
    <div>
      <form
        style={{
          height: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onSubmit={(e): void => {
          e.preventDefault()
          e.stopPropagation()
          if (text.length) {
            setClicked(true)
            setError('')
            setLoading(true)
            fetchTweets('initial')
          }
        }}
      >
        <input
          type="text"
          value={text}
          style={{
            outline: 'none',
            border: '1px solid black',
            padding: '5px',
            width: '80%',
            height: '100%',
            fontSize: '20px'
          }}
          onChange={(e): void => setText(e.target.value)}
        />
        <input
          type="submit"
          value="Submit"
          style={{
            outline: 'none',
            border: '1px solid black',
            background: 'lightblue',
            margin: '10px',
            height: '100%',
            ...style
          }}
        />
      </form>
      {lastUpdated && (
        <h3 style={style}>Last Updated {lastUpdated.toLocaleTimeString()}</h3>
      )}
      {loading ? (
        <h1 style={style}>Loading</h1>
      ) : (
        server.length > 0 && <Graphs server={server} />
      )}
      {error.length > 0 && <h1>Error Fetching new data {error}</h1>}
    </div>
  )
}

export default App
