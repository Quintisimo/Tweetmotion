import React, { useState, FC } from 'react'

const App: FC = () => {
  const [server, setServer] = useState([])
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
              setServer([])
            )
        }}
      />
      {/* <pre>{JSON.stringify(server, null, 2)}</pre> */}
      {server.length >0 ? server.map((tweet: any) => {
        return(
          <div key = {tweet.tweetId}>
            Tweet : {tweet.text} <br />
            Sentiment {tweet.sentiment}<br />
            Words : {tweet.sanitizedWords.toString()}<br />
            <hr/>
          </div>

        )
      }) : null}
    </div>
  )
}

export default App
