interface Tweet {
  id: number
  text: string
  userName: string
  userScreenName: string
  sentiment: number
  sanitizedWords: string[]
}

export interface TweetAPI extends Tweet {
  user: {
    name: string
    screen_name: string
  }
}

export interface TweetAnalysed extends Tweet {
  userName: string
  userScreenName: string
}
