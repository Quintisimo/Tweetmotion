const natural = require('natural');
const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;

const stopword = require('stopword');
const checkWord = require('check-word');
const words = checkWord('en');
const checkName = require('people-names');
const { getCode } = require('country-list');
const worldMapData = require('city-state-country');

const tokenizer = new natural.WordTokenizer();
const nounInflector = new natural.NounInflector();
const sentimentAnalyzer = new Analyzer('English', stemmer, 'afinn');

const tweet = "Until I do, we're I'm thinking that hoping you will know what I mean beers Jason indonesia australia jakarta sleman ngrasani"
const tokenizeTweet = tokenizer.tokenize(tweet)

//Remove stop word
const removeStopWord = stopword.removeStopwords(tokenizeTweet);

//remove 2 letters word
const removeTwoLetter = removeStopWord.filter((word:string) => word.length > 2)

//to lower case
const lowerCases = removeTwoLetter.map((word:string) => {
  return word.toLowerCase();
})

//make every word singular
const singulars = lowerCases.map((word:string) => nounInflector.singularize(word));

/*
Filter based on :
1. English word OR
2. Commong name OR
3. Country name OR
4. City name

And then mapped to get the city name's country
*/
const result = singulars.filter((word:string) =>
  words.check(word) ||
  checkName.isPersonName(word) ||
  getCode(word) ||
  worldMapData.searchCity(word).length > 0

).map((word:string) => {
  if (words.check(word) || checkName.isPersonName(word) || getCode(word)) {
    return word;
  } else {
    const city = worldMapData.searchCity(word);
    return city[0].countryName;
  }
});
console.log(result);










