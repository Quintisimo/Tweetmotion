import React, { useState, FC } from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Tooltip } from 'recharts'
import useInterval from '@use-it/interval'

const App: FC = () => {
  const [server, setServer] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [lastUpdated, setLastUpdate] = useState<Date>(null)

  const fetchTweets = async (): Promise<void> => {
    if (text.length) {
      try {
        const res = await fetch(`/api/${encodeURIComponent(text)}`)
        const json = await res.json()
        setServer(prevTweets =>
          [...json, ...prevTweets].filter(
            (e, i, arr) => i === arr.findIndex(t => t.tweetId === e.tweetId)
          )
        )
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
      fetchTweets()
    }
  }, 3000)

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
          setClicked(true)
          setError(false)
          setLoading(true)
          fetchTweets()
        }}
      />
      {lastUpdated && <h3>Last Updated {lastUpdated.toLocaleTimeString()}</h3>}
      {error ? (
        <h1>Error</h1>
      ) : loading ? (
        <h1>Loading</h1>
      ) : (
        server.length > 0 && (
          <BarChart
            width={1000}
            height={500}
            data={server
              .filter(e => e.sentiment !== 0)
              .map(e => ({
                name: e.userScreenName,
                sentiment: e.sentiment
              }))}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{ value: 'Users', position: 'bottom' }}
            />

            <YAxis
              label={{
                value: 'Sentiment',
                angle: -90,
                position: 'insideLeft'
              }}
            />
            <Tooltip />
            <Bar dataKey="sentiment" fill="#8884d8" />
          </BarChart>
        )
      )}
    </div>
  )
}

export default App
