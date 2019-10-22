import Router from 'koa-router'
import Twitter from 'twitter'

const natural = require('natural')
const Analyzer = require('natural').SentimentAnalyzer
const stemmer = require('natural').PorterStemmer

const stopword = require('stopword')
const checkWord = require('check-word')
const words = checkWord('en')
const checkName = require('people-names')
const { getCode } = require('country-list')
const worldMapData = require('city-state-country')

const tokenizer = new natural.WordTokenizer()
const nounInflector = new natural.NounInflector()
const sentimentAnalyzer = new Analyzer('English', stemmer, 'afinn')

const router = new Router()

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})



router.get('/:search', async ctx => {
  const search = ctx.params.search
  const res = await client.get('search/tweets', { q: search })

  res.statuses.forEach((status: any) => {
    //Separate words in a tweet
    const tokenizeTweet = tokenizer.tokenize(status.text)
    
    //attach sentiment value to a tweet
    status.sentiment = getSentiment(tokenizeTweet);
    
    //attach sanitized words to a tweet
    status.sanitizedWords = getSanitizedWords(tokenizeTweet);

  })

  const statusDisplay = res.statuses.map((status: any) => {
    return {
      text: status.text,
      tweetId: status.id,
      userName: status.user.name,
      userScreenName: status.user.screen_name,
      sentiment: status.sentiment,
      sanitizedWords: status.sanitizedWords,
    }
  })

  ctx.body = statusDisplay
})

/**
 * 
 * Get sentiment from a tokenize Tweet
 */
const getSentiment = (tokenizeTweet: any) => {
  //find sentiment of a tweet
  const sentiment = sentimentAnalyzer.getSentiment(tokenizeTweet);
  return sentiment;
}

/**
 * 
 * Sanitize a tweet
 */
const getSanitizedWords = (tokenizeTweet: any) => {
  //Remove stop word (we,I,us,this,that,etc)
  const removeStopWord = stopword.removeStopwords(tokenizeTweet)

  //remove 2 letters word
  const removeTwoLetter = removeStopWord.filter(
    (word: string) => word.length > 2
  )

  //to lower case
  const lowerCases = removeTwoLetter.map((word: string) => {
    return word.toLowerCase()
  })

  //convert every word to singular
  const singulars = lowerCases.map((word: string) =>
    nounInflector.singularize(word)
  )

  /*
  Filter based on :
  1. English word OR
  2. Common person name OR
  3. Country name OR
  4. City name
  
  And then mapped to get the city name's country
  */
  const sanitizedWords = singulars
    .filter(
      (word: string) =>
        words.check(word) ||
        checkName.isPersonName(word) ||
        getCode(word) ||
        worldMapData.searchCity(word).length > 0
    )
    .map((word: string) => {
      if (
        words.check(word) ||
        checkName.isPersonName(word) ||
        getCode(word)
      ) {
        return word
      } else {
        const city = worldMapData.searchCity(word)
        return city[0].countryName
      }
    })

    return sanitizedWords;
}


module.exports = router
