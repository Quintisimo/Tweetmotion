import React, { useState, FC, CSSProperties, useEffect } from 'react'
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend, } from 'recharts'

import useInterval from '@use-it/interval'
import ReactWordcloud from 'react-wordcloud';

const App: FC = () => {
  const [server, setServer] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clicked, setClicked] = useState(false)
  const [lastUpdated, setLastUpdate] = useState<Date>(null)

  const [sentimentData, setSentimentData] = useState([]);
  useEffect(() => {
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;
    server.forEach(tweet => {
      if (tweet.sentiment > 0) totalPositive++;
      if (tweet.sentiment < 0) totalNegative++;
      if (tweet.sentiment === 0) totalNeutral++;
    })
    setSentimentData([
      { name: 'Positive', value: totalPositive },
      { name: 'Negative', value: totalNegative },
      { name: 'Neutral', value: totalNeutral },
    ])
  }, [server])

  const [countriesData, setCountriesData] = useState([])
  useEffect(() => {
    const track = []
    server.forEach(tweet => {
      if (tweet.countries.length > 0) {
        tweet.countries.forEach((country:string) => {
          if (track.find(element => element.name === country)) {
            track.find(element => element.name === country).num++
          } else {
            track.push({
              name: country,
              num: 1,
            })
          }
        })
      }
    })
    setCountriesData(track);
  }, [server])

  const [wordsData, setWordsData] = useState([])
  useEffect(() => {
    const track = []
    server.forEach(tweet => {
      if (tweet.sanitizedWords.length > 0) {
        tweet.sanitizedWords.forEach((word:string) => {
          if (track.find(element => element.text === word)) {
            track.find(element => element.text === word).value++
          } else {
            track.push({
              text: word,
              value: 1,
            })
          }
        })
      }
    })
    setWordsData(track);
  }, [server])

  /**
   * Pie chart colour
   * Blue : positive
   * Red : Negative
   * Yellow : Neutral
   */
  const COLORS = ['blue', 'red', 'yellow'];

  /**
   * renderCustomizedLabel. Does not work
   */
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const style: CSSProperties = {
    fontFamily: 'sans-serif',
    textAlign: 'center',
    fontSize: '20px'
  }

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
  }, 3000)

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



      {loading ? (
        <h1 style={style}>Loading</h1>
      ) : (
          server.length > 0 && (
            <PieChart width={800} height={800}>
              <Pie
                data={sentimentData}
                labelLine={false}
                // label={renderCustomizedLabel} does not work
                fill="#8884d8"
                dataKey="value"
              >
                {
                  sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
              </Pie>
            </PieChart>
          )
        )}

      {loading ? (
        <h1 style={style}>Loading</h1>
      ) : (
          server.length > 0 && (
            <BarChart
              width={1200}
              height={800}
              data={countriesData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="num" fill="#8884d8" />

            </BarChart>
          )
        )}


      {loading ? (
        <h1 style={style}>Loading</h1>
      ) : (
          server.length > 0 && (
            <div style={{ height: 400, width: 600 }}>
              <ReactWordcloud words={wordsData} />
            </div>
          )
        )}
      {error.length > 0 && <h1>Error Fetching new data {error}</h1>}

    </div>
  )
}

export default App
