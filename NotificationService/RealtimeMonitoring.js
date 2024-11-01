const WebSocket = require('ws');
const axios = require('axios');
const { getAllRunningAlerts, editAlert } = require('./controllers/AlertController');
const { sendNotification } = require('./controllers/NotificationController');


let coinList = [];
let marketPrice = {};
let ws = { readyState: WebSocket.CLOSED };
let alerts = [];



const startRealtimeMonitoring = async() => {
    try{
        console.log('Starting Realtime Monitoring...');
        
        await connectWebSocket();

        await axios.get('https://raw.githubusercontent.com/IsuruVithanage/TradeX-Web/dev/src/Assets/Images/Coin%20Images.json')
        .then((response) => {
            coinList = response.data;
        })
        .catch(() => {
            console.log('Coin list fetching error')
        });


        setInterval( async() => {
            if(ws.readyState === 3){
                await connectWebSocket();
            }
        }, 10000);

        let count = 0;

        while (true) {
            const startAt = new Date().getTime();

            if (ws.readyState === 1) {
                await checkAlerts(count);
            }

            if (count % 3 === 0) {
                alerts = await getAllRunningAlerts();
                updateStreams();
            }

            const endAt = new Date().getTime();

            if (endAt - startAt < 1000) {
                await new Promise(resolve => setTimeout(resolve, 1000 - (endAt - startAt)));
            }

            count++;
        }
    }

    catch (error) {
        console.log('Realtime monitoring error:', error);
    }
}





const updateStreams = () => {
    try{
        const prevStreams = Object.keys(marketPrice).map(coin => coin.toLowerCase() + 'usdt@miniTicker');
        const newStreams = [...new Set(alerts.map(alert => alert.coin))].map(coin => coin.toLowerCase() + 'usdt@miniTicker');


        if( JSON.stringify(prevStreams.sort()) !== JSON.stringify(newStreams.sort())){
            if(ws.readyState === 1){
                if(prevStreams.length > 0){
                    ws.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: prevStreams, id: 1 }));
                }
                if(newStreams.length > 0){
                    ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: newStreams, id: 1 }));
                }
            }

            prevStreams
            .filter(coin => !newStreams.includes(coin))
            .forEach(coin => delete marketPrice[coin.slice(0, -15).toUpperCase()]);
        }
    }
    
    catch (error) {
        console.log('Update streams error:', error);
    }
}





const checkAlerts = (count) => new Promise(async (resolve) => {
    try {
        const alertPromises = alerts.map(async (alert) => {
            const { deviceToken, alertId, userId, coin, condition, price, emailActiveStatus, runningStatus } = alert;
            const currentPrice = marketPrice[coin];

            if (currentPrice !== undefined && runningStatus) {
                if (
                    (condition === 'Above' && currentPrice > price) ||
                    (condition === 'Below' && currentPrice < price) ||
                    (condition === 'Equals' && currentPrice === price)
                ) {
                    const coinName = coinList[coin].name;
                    const localPrice = "$ " + currentPrice.toLocaleString();
                    alert.runningStatus = false;

                    try {
                        await editAlert({ body: { alertId, runningStatus: false } });
                        await sendNotification({
                            params: { type: emailActiveStatus ? 'push,email' : 'push' },
                            body: {
                                userId: userId,
                                deviceToken: deviceToken,
                                title: coinName + "  -  " + localPrice,
                                body: "Hello there! " + coinName + " is now at " + localPrice,
                                onClick: 'http://localhost:3000/alert',
                                emailHeader: `
                                    <img width="5%" height="5%" style="margin: auto 1% auto 0;"
                                    src="${coinList[coin].img}" alt="${coinName}"/>
                                    ${coinName} is now at ${localPrice}
                                `,
                                emailBody: `
                                    <p style="margin-top: 7%;">Hello Trader,</p>
                                    <p>
                                        We wanted to inform you that <span  style="font-weight: bold;">${coinName} (${coin})</span>
                                        has now reached a price of <span  style="font-weight: bold;">${localPrice}</span>. 
                                        Stay updated on market prices and make your best decisions.
                                    </p>
                                    <p>Good luck and happy trading!</p><br>
                                    <p style="margin: 0;">Best regards,</p>
                                    <p style="margin-top: 0;">TradeX Team.</p>
                                `,
                            }
                        });
                        console.log('\x1b[32mAlert sent\x1b[0m for alertID:', alertId);
                    } catch (error) {
                        console.log('\x1b[31mNotification sending failed\x1b[0m for alertID:', alertId);
                    }
                }
            }
        });

        await Promise.all(alertPromises);
        resolve();
    } 
    
    catch (error) {
        console.log('Check alerts error:', error);
        resolve();
    }
});








const connectWebSocket = () => {
    return new Promise((resolve) => {
        try{
            ws = new WebSocket('wss://stream.binance.com:9443/ws');

            ws.on('open', () => {
                console.log('Binance WebSocket connection established.');
                resolve();
            });

            ws.on('message', (data) => {
                const priceData = JSON.parse(data);
                if(priceData.s){
                    marketPrice[priceData.s.slice(0, -4)] = parseFloat(priceData.c)
                };   
            });
            
            ws.on('error', () => {
                console.error('Binance WebSocket connection error:');
                resolve();
            });
            
            ws.on('close', () => {
                console.log('Binance WebSocket connection closed.');
                resolve();
            });
        }

        catch (error) {
            console.log('Binance WebSocket connection error:', error);
            resolve();
        }
    });
}





module.exports = startRealtimeMonitoring;
