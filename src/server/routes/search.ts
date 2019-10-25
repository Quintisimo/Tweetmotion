import Router from 'koa-router'
import Twitter from 'twitter'
import { WordTokenizer, NounInflector } from 'natural'
import { removeStopwords } from 'stopword'
import checkWord from 'check-word'
import checkName from 'people-names'
import { getCode } from 'country-list'
import worldMapData from 'city-state-country'

const Analyzer = require('natural').SentimentAnalyzer
const stemmer = require('natural').PorterStemmer
const words = checkWord('en')
const tokenizer = new WordTokenizer()
const nounInflector = new NounInflector()
const sentimentAnalyzer = new Analyzer('English', stemmer, 'afinn')

export const router = new Router()

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

/**
 *
 * Get sentiment from a tokenize Tweet
 */
const getSentiment = (tokenizeTweet: string[]): number =>
  //find sentiment of a tweet
  sentimentAnalyzer.getSentiment(tokenizeTweet)

/**
 *
 * Sanitize a tweet
 */
const getSanitizedWords = (tokenizeTweet: string[]): string[] =>
  //Remove stop word (we,I,us,this,that,etc)
  removeStopwords(tokenizeTweet)
    //remove 2 letters word
    .filter((word: string) => word.length > 2)
    //to lower case
    .map((word: string) => {
      return word.toLowerCase()
    })
    //convert every word to singular
    .map((word: string) => nounInflector.singularize(word))
    /*
  Filter based on :
  1. English word OR
  2. Common person name OR
  3. Country name OR
  4. City name
  
  And then mapped to get the city name's country
  */
    .filter(
      (word: string) =>
        words.check(word) ||
        checkName.isPersonName(word) ||
        getCode(word) ||
        worldMapData.searchCity(word).length > 0
    )
    .map((word: string) => {
      if (words.check(word) || checkName.isPersonName(word) || getCode(word)) {
        return word
      } else {
        const city = worldMapData.searchCity(word)
        return city[0].countryName
      }
    })

const getCountries = (words:string[]):string[] => {
  let countries = [];
  words.forEach((word: string) => {
    if (getCode(word)) countries.push(word.toUpperCase());
  });
  return countries;
}

router.get('/:search', async ctx => {
  try {
    const search = ctx.params.search
    const res = await client.get('search/tweets', { q: search })

    ctx.body = res.statuses.map((status: any) => {
      //Separate words in a tweet
      const tokenizeTweet = tokenizer.tokenize(status.text)

      //attach sentiment value to a tweet
      status.sentiment = getSentiment(tokenizeTweet)

      //attach sanitized words to a tweet
      status.sanitizedWords = getSanitizedWords(tokenizeTweet)

      status.countries = getCountries(status.sanitizedWords);
      console.log(status.countries);

      return {
        text: status.text,
        tweetId: status.id,
        userName: status.user.name,
        userScreenName: status.user.screen_name,
        sentiment: status.sentiment,
        sanitizedWords: status.sanitizedWords,
        countries: status.countries,
      }
    })
  } catch (error) {
    if (error.code === 88) {
      ctx.body = 'Rate Limit Exceeded'
    }
  }
})
