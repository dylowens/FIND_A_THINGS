import axios from 'axios';

const fetchTweets = async () => {
  const BEARER_TOKEN = 'YOUR_BEARER_TOKEN'; // Replace with your actual Bearer Token
  const endpoint = 'https://api.twitter.com/2/tweets/search/recent';
  const query = 'geocode:37.8715,-122.2730,15km -is:retweet has:geo';
  const startTime = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
  const maxResults = 10; // Fetch only 10 tweets for initial test

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      params: {
        query,
        'tweet.fields': 'created_at,public_metrics,geo',
        max_results: maxResults,
        start_time: startTime,
      },
    });

    const tweets = response.data.data;
    console.log(`Fetched ${tweets.length} tweets:`);
    tweets.forEach((tweet, index) => {
      console.log(`${index + 1}. ${tweet.text}`);
    });

    return tweets;

  } catch (error) {
    console.error('Error fetching tweets:', error);
  }
};

fetchTweets();
