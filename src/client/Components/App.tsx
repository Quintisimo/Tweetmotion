import React, { useState, FC, CSSProperties } from 'react'
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip } from 'recharts'
import useInterval from '@use-it/interval'
import { TweetAnalysed } from '../../interfaces'

const App: FC = () => {
  const [server, setServer] = useState<TweetAnalysed[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clicked, setClicked] = useState(false)
  const [lastUpdated, setLastUpdate] = useState<Date>(null)

  const style: CSSProperties = {
    fontFamily: 'sans-serif',
    textAlign: 'center',
    fontSize: '20px'
  }

  const fetchTweets = async (): Promise<void> => {
    if (text.length) {
      try {
        const res = await fetch(`/api/${encodeURIComponent(text)}`)
        const json: TweetAnalysed[] = await res.json()
        console.log(json)
        setServer(prevTweets =>
          [...json, ...prevTweets].filter(
            (e, i, arr) => i === arr.findIndex(t => t.id === e.id)
          )
        )
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
      fetchTweets()
    }
  }, 60000)

  return (
    <div>
      <div
        style={{
          height: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
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
          onChange={(e): void => {
            e.preventDefault()
            e.stopPropagation()
            setText(e.target.value)
          }}
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
          onClick={(): void => {
            setClicked(true)
            setError('')
            setLoading(true)
            fetchTweets()
          }}
        />
      </div>
      {lastUpdated && (
        <h3 style={style}>Last Updated {lastUpdated.toLocaleTimeString()}</h3>
      )}
      {loading ? (
        <h1 style={style}>Loading</h1>
      ) : (
        server.length > 0 && (
          <LineChart
            width={1000}
            height={500}
            margin={{ left: 20, bottom: 20 }}
            style={{
              margin: 'auto'
            }}
            data={server
              .filter(e => e.sentiment !== 0)
              .map(e => ({
                name: e.userScreenName,
                sentiment: e.sentiment
              }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{ value: 'Users', position: 'insideBottom', offset: -10 }}
            />

            <YAxis
              label={{
                value: 'Sentiment',
                angle: -90,
                position: 'insideLeft',
                offset: -10
              }}
            />
            <Tooltip />
            <Line dataKey="sentiment" stroke="#8884d8" />
          </LineChart>
        )
      )}
      {error.length > 0 && <h1>Error Fetching new data {error}</h1>}
    </div>
  )
}

export default App
