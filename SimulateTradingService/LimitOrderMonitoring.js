const WebSocket = require('ws');
const axios = require('axios');
const {
    getAllOrdersByType,
    updateOrderStatus,
    updateOrderTime,
    updateOrderCategory
} = require('./controllers/OrderController');

let coinList = [];
let marketPrice = {};
let time = {};
let orders = [];
let stopLimitOrders = [];
let wss;

const startRealtimeMonitoring = async () => {
    try {
        console.log('Starting Realtime Monitoring...');

        const response = await axios.get('https://raw.githubusercontent.com/IsuruVithanage/TradeX-Web/dev/src/Assets/Images/Coin%20Images.json');
        coinList = JSON.parse(response.data.coinsList);

        wss = new WebSocket.Server({port: 8081});

        wss.on('connection', (ws) => {
            console.log('WebSocket connection established with client');
        });


        setInterval(async () => {
            orders = await getAllOrdersByType('Limit', 'Pending');
            stopLimitOrders = await getAllOrdersByType('Stop Limit', 'Pending');

        }, 3000);

        await connectWebSocket();

        setInterval(() => {
            checkOrders();
            checkStoLimitOrders();
        }, 1000);
    } catch (error) {
        console.log('Realtime monitoring error:', error);
    }
};

const checkOrders = () => {
    try {
        orders.forEach(async (order) => {
            if (marketPrice[order.coin] !== undefined && order.category === 'Limit') {
                console.log('Checking order:', order.price, marketPrice[order.coin]);
                if (order.price <= marketPrice[order.coin]) {
                    console.log('Order matched:', order);

                    const requestBody = {
                        userId: order.userId,
                        title: 'TradeX',
                        body: `Your order for ${order.coin} has been completed at ${marketPrice[order.coin]}.`,
                        onClick: 'http://localhost:3000/simulate'
                    };

                    await updateOrderStatus(order.orderId, 'Completed');
                    await updateOrderTime(order.orderId, time[order.coin]);
                    console.log(`Order ${order.orderId} status updated to 'Completed'`);

                    fetch('http://localhost:8002/notification/send/push', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to send alert');
                            }
                            console.log('Alert sent successfully for user:', order.userId);
                            wss.clients.forEach((client) => {
                                client.send(JSON.stringify({type: 'order_completed', order}));
                            });
                        })
                        .catch(error => {
                            console.error('Error sending alert:', error);
                        });
                }
            }
        });
    } catch (error) {
        console.log('Check orders error:', error);
    }
};

const checkStoLimitOrders = () => {
    try {
        stopLimitOrders.forEach(async (order) => {
            if (marketPrice[order.coin] !== undefined && order.category === 'Stop Limit') {
                if (order.stopLimit <= marketPrice[order.coin]) {
                    

                    const requestBody = {
                        userId: order.userId,
                        title: 'TradeX',
                        body: `Your stop limit order for ${order.coin} has been completed.`,
                        onClick: 'http://localhost:3000/simulate'
                    };

                    await updateOrderCategory(order.orderId, 'Limit');
                    console.log(`Order ${order.orderId} stop limit completed'`);

                    fetch('http://localhost:8002/notification/send/push', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Failed to send alert');
                            }
                            console.log('Alert sent successfully to user:', order.userId);
                            wss.clients.forEach((client) => {
                                client.send(JSON.stringify({type: 'stopLimit_completed', order}));
                            });
                        })
                        .catch(error => {
                            console.error('Error sending alert:', error);
                        });
                }
            }
        });
    } catch (error) {
        console.log('Check orders error:', error);
    }
};

const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
        try {
            const first10Coins = coinList.slice(0, 10);
            const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${first10Coins.map((coinSymbol) => coinSymbol.toLowerCase() + '@miniTicker').join('/')}`);	

            ws.on('open', () => {
                console.log(`WebSocket connection established`);
                resolve();
            });

            ws.on('message', (data) => {
                try {
                    const priceData = JSON.parse(data);

                    if (priceData && priceData.data.s && priceData.data.c) {
                        const coin = priceData.data.s.slice(0, -4);
                        marketPrice[coin] = parseFloat(priceData.data.c);

                        const date = new Date(priceData.data.E);
                        date.setSeconds(0, 0); // Set milliseconds to 0
                        time[coin] = date.getTime();
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for ${coinSymbol}:`, error);
                reject();
            });

            ws.on('close', () => {
                console.log(`WebSocket connection closed for ${coinSymbol}`);
            });
        } catch (error) {
            console.log('WebSocket connection error:', error);
            reject();
        }
    });
};

module.exports = startRealtimeMonitoring;
