import React, { useState, useEffect, memo, FC, CSSProperties } from 'react'
import ReactWordcloud, { Word } from 'react-wordcloud'
import {
  ContentRenderer,
  PieLabelRenderProps,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Legend,
  Bar
} from 'recharts'
import { TweetAnalysed, Country } from '../../interfaces'

export const style: CSSProperties = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
  fontSize: '20px'
}

interface Props {
  server: TweetAnalysed[]
}

const Graphs: FC<Props> = ({ server }) => {
  const [sentimentData, setSentimentData] = useState([])
  useEffect(() => {
    let totalPositive = 0
    let totalNegative = 0
    let totalNeutral = 0
    server.forEach(tweet => {
      if (tweet.sentiment > 0) totalPositive++
      if (tweet.sentiment < 0) totalNegative++
      if (tweet.sentiment === 0) totalNeutral++
    })
    setSentimentData([
      { name: 'Positive', value: totalPositive },
      { name: 'Negative', value: totalNegative },
      { name: 'Neutral', value: totalNeutral }
    ])
  }, [server])

  const [countriesData, setCountriesData] = useState<Country[]>([])
  useEffect(() => {
    const track = []
    server.forEach(tweet => {
      if (tweet.countries.length > 0) {
        tweet.countries.forEach((country: string) => {
          if (track.find(element => element.name === country)) {
            track.find(element => element.name === country).num++
          } else {
            track.push({
              name: country,
              num: 1
            })
          }
        })
      }
    })
    setCountriesData(track)
  }, [server])

  const [wordsData, setWordsData] = useState<Word[]>([])
  useEffect(() => {
    const track = []
    server.forEach(tweet => {
      if (tweet.sanitizedWords.length > 0) {
        tweet.sanitizedWords.forEach((word: string) => {
          if (track.find(element => element.text === word)) {
            track.find(element => element.text === word).value++
          } else {
            track.push({
              text: word,
              value: 1
            })
          }
        })
      }
    })
    setWordsData(track)
  }, [server])

  /**
   * Pie chart colour
   * Blue : positive
   * Red : negative
   * Green : neutral
   */
  const COLORS = ['blue', 'red', 'lightgreen']

  /**
   * renderCustomizedLabel. Does not work
   */
  const RADIAN = Math.PI / 180
  const renderCustomizedLabel: ContentRenderer<PieLabelRenderProps> = ({
    innerRadius,
    outerRadius,
    cx,
    cy,
    midAngle,
    percent
  }) => {
    const radius =
      Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5
    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN)
    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplate: '40vh 40vh / 50vw 50vw',
        alignItems: 'centre'
      }}
    >
      <div>
        <h2 style={style}>Sentimental Response</h2>
        <LineChart
          width={(window.innerWidth - 20) / 2}
          height={(window.innerHeight - 20) / 3}
          margin={{ left: 20, bottom: 20 }}
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
            label={{
              value: 'Users',
              position: 'insideBottom',
              offset: -10
            }}
          />

          <YAxis
            label={{
              value: 'Sentiment',
              angle: -90,
              position: 'insideLeft'
            }}
          />
          <Tooltip />
          <Line dataKey="sentiment" stroke="#8884d8" />
        </LineChart>
      </div>

      <div>
        <h2 style={style}>Overall Emotion Response</h2>
        <PieChart
          width={(window.innerWidth - 20) / 2}
          height={(window.innerHeight - 20) / 3}
        >
          <Pie
            data={sentimentData}
            fill="#8884d8"
            nameKey="name"
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {sentimentData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
            <Tooltip />
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      <div>
        <h2 style={style}>Country of Origin</h2>
        <BarChart
          width={(window.innerWidth - 20) / 2}
          height={(window.innerHeight - 20) / 3}
          data={countriesData}
          margin={{
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{
              value: 'Country',
              position: 'insideBottom',
              offset: -10
            }}
          />
          <YAxis
            label={{
              value: 'Number of mentions',
              angle: -90,
              position: 'insideLeft'
            }}
          />
          <Tooltip />
          <Legend align="right" />
          <Bar dataKey="num" fill="#8884d8" />
        </BarChart>
      </div>

      <div>
        <h2 style={style}>Most Used Words</h2>
        <ReactWordcloud
          size={[(window.innerWidth - 20) / 2, (window.innerHeight - 20) / 3]}
          words={wordsData}
        />
      </div>
    </div>
  )
}

export default memo(Graphs)
