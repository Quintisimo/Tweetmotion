import React, { useState, FC } from 'react'
import useInterval from '@use-it/interval'
import Graphs, { style } from './Graphs'
import { TweetAnalysed } from '../../interfaces'

const App: FC = () => {
  const [server, setServer] = useState<TweetAnalysed[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
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
        setError(true)
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
      <h1 style={{ ...style, fontSize: '60px', margin: 0 }}>Tweetmotion</h1>
      <p style={{ ...style, fontSize: '20px' }}>
        Twitter&apos;s Emotional Response
      </p>
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
            setError(false)
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
      {error && (
        <h1 style={style}>Error Fetching new data, please try again later</h1>
      )}
      {loading ? (
        <h1 style={style}>Loading</h1>
      ) : (
        server.length > 0 && <Graphs server={server} />
      )}
    </div>
  )
}

export default App
