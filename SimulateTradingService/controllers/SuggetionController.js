const {GoogleGenerativeAI} = require("@google/generative-ai");
//require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({model: "gemini-pro"});
const buyOrderSuggestion = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const {coinName, tradePrice, tradingData, quantity, orderCategory, boughtPrice, orderType} = req.body;

        if (!coinName || !tradePrice || !tradingData) {
            return res.status(400).json({error: 'Bad Request: Missing required fields'});
        }

        const tradingDataString = JSON.stringify(tradingData);

        const promptBuy = `Consider the scenario where you recently made a trade involving ${coinName}. You purchased ${quantity} units of ${coinName} at a price of $${tradePrice}. Throughout this trade, the price of ${coinName} fluctuated as follows:
${tradingDataString}. And consider the order type is a ${orderCategory} order.
Now, based on this trade, I'd like your suggestions on how to optimize future buy orders and some advice for improving trading strategies.
And also add some resources(article links and youtube links) to learn more about mentioned suggestions.
Please format your response in JSON like this:
{
  "coin": "Bitcoin",
  "bestPrice": 1000,
  "time":1716257160,
  "profitFromBestPrice": 100,
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "resources": [
        {
          "title": "The Ultimate Guide to Limit Orders",
          "url": "https://www.binance.com/en/support/faq/560002190722"
        },
        {
          "title": "Dollar-Cost Averaging vs. Lump Sum Investing",
          "url": "https://www.investopedia.com/articles/basics/03/dollarcostaveraging.asp"
        },
    ]
}.
Ensure the bestPrice should be lower than the tradePrice.`;

        const promptSell = `Consider the scenario where you recently made a trade involving ${coinName}. You sold ${quantity} units of ${coinName} at a price of $${tradePrice}. You bought ${coinName} unit for $${boughtPrice}. Throughout this trade, the price of ${coinName} fluctuated as follows:
${tradingDataString}. And consider the order type is a ${orderCategory} order.
Now, based on this trade, I'd like your suggestions on how to optimize future buy orders and some advice for improving trading strategies.
And also add some resources(article links and youtube links) to learn more about mentioned suggestions.
Please format your response in JSON like this:
{
  "coin": "Bitcoin",
  "bestPrice": 1000,
  "time":1716257160,
  "profitFromBestPrice": 100,
  "suggestions": [""],
  "resources": [
        {
          "title": "The Ultimate Guide to Limit Orders",
          "url": "https://www.binance.com/en/support/faq/560002190722"
        },
        {
          "title": "Dollar-Cost Averaging vs. Lump Sum Investing",
          "url": "https://www.investopedia.com/articles/basics/03/dollarcostaveraging.asp"
        },
    ]
}.
Ensure the bestPrice should be greater than the tradePrice. Make sure to calculate profit using boughtPrice`;

        console.log(orderType === "Buy" ? promptBuy : promptSell);

        const result = await model.generateContent(orderType === "Buy" ? promptBuy : promptSell);
        const response = await result.response;
        console.log('Response Text:', response.text());
        const suggestions = JSON.parse(response.text());

        if (suggestions.bestPrice !== null && suggestions.profitFromBestPrice !== null) {
            console.log('Suggestions:', suggestions);
            res.json(suggestions);
        } else {
            await buyOrderSuggestion(req, res);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


module.exports = {
    buyOrderSuggestion
};

