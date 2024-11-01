const getPortfolioValueData = require("../services/PortfolioValueService").getPortfolioValueData;
const updateTransactionHistory = require("./TransactionHistoryController").updateTransactionHistory;
const dataSource = require("../config/config");
const assetService = require("../services/AssetService");
const WalletAddressService = require("../services/WalletAddressService");
const axios = require("axios");


const getPortfolioData = async (req, res) => {
    try {
        const userId = req.query.userId;	
        const wallet = req.params.wallet;
        let usdBalance = 0;
        let portfolioValue = 0;
        let percentages = [];


        if ( wallet !== 'overview' && wallet !== 'trading' && wallet !== 'funding') {
            return res.status(400).json({ message: 'Invalid request' });
        }

        if (!userId) {
            return res.status(404).json({ message: 'User Id not found' });
        } 

        const assets = await assetService.getAssetsWithMarketPrice(userId);

        
        if (!assets) {
            return res.status(404).json({ message: 'Assets not found' });
        }



        let updatedAssets = assets.map(asset => {
            let updatedAsset = {};
            let totalBalance = 0;

            switch(wallet){
                case 'overview':
                    totalBalance = asset.tradingBalance + asset.holdingBalance + asset.fundingBalance;
                    asset.tradingBalance += asset.holdingBalance;
                    break;
                case 'trading':
                    totalBalance = asset.tradingBalance + asset.holdingBalance;
                    break;
                case 'funding':
                    totalBalance = asset.fundingBalance;
                    break;
            }

            if (asset.symbol === 'USD') {
                usdBalance = totalBalance;
                portfolioValue += totalBalance;
            }
            else{
                const assetValue = (asset.marketPrice || 1) *  totalBalance;
                portfolioValue += assetValue;
                updatedAsset.value = "$ " + assetValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2,});
                updatedAsset.marketPrice = "$ " + asset.marketPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2,});
            }

            if(wallet !== 'overview'){
                if(asset.symbol === 'USD'){
                    updatedAsset.marketPrice = "- - -";
                    updatedAsset.value = "$ " + totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2,});;
                    updatedAsset.ROI = "- - -";
                    updatedAsset.RoiColor = '#FFFFFF';
                } else {
                    const currentMarketPrice = asset.marketPrice || asset.AvgPurchasePrice
                    const ROI = ( currentMarketPrice - asset.AvgPurchasePrice ) * ( 100 / asset.AvgPurchasePrice );
                    updatedAsset.ROI = `${ROI.toFixed(2)} %`;
                    updatedAsset.RoiColor = ( ROI > 0 ) ? '#21DB9A' : ( ROI < 0 ) ? '#FF0000' : '#FFFFFF';
                } 
            }

            if(wallet !== 'overview' || asset.symbol !== 'USD'){
                updatedAsset.symbol = asset.symbol;
                updatedAsset.tradingBalance = asset.tradingBalance.toLocaleString("en-US");
                updatedAsset.holdingBalance = asset.holdingBalance.toLocaleString("en-US");
                updatedAsset.fundingBalance = asset.fundingBalance.toLocaleString("en-US");
                updatedAsset.totalBalance = totalBalance.toLocaleString("en-US");
            }

            return updatedAsset;
        })
        .filter(asset => Object.keys(asset).length > 0)
        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));


        if(wallet !== 'overview'){
            const usdAsset = updatedAssets.find(asset => asset.symbol === 'USD');

            if(usdAsset){
                updatedAssets = [ usdAsset, ...updatedAssets.filter(asset => asset.symbol !== 'USD') ];
            }

            else if(!usdAsset && wallet === 'funding'){
                updatedAssets = [ {}, ...updatedAssets];
            }
        }
        else{
            percentages = updatedAssets
                .map(asset => ({
                    coinName: asset.symbol,
                    percentage: (!portfolioValue) ? 0 : (parseFloat(asset.value.replace(/[^0-9.]/g, '')) / portfolioValue) * 100
                }))

                .concat({ 
                    coinName: 'USD', 
                    percentage: (!portfolioValue) ? 0 : (usdBalance / portfolioValue) * 100   
                })

                .sort((a, b) => b.percentage - a.percentage);
        }

        res.status(200).json({
            usdBalance: usdBalance,
            portfolioValue: portfolioValue,
            assets: updatedAssets,
            ...(wallet === 'overview' ? 
            { 
                percentages: percentages, 
                historyData: await getPortfolioValueData(userId) 
            } : {
                walletAddress: await WalletAddressService.getWalletAddress(userId)
            })
        }); 
    }
    catch (error) {
        console.log("\nError getting PortfolioData:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const getBalance = async (req, res) => {
    try {
        const { userId, coin } = req.params;
        if(!userId || !coin){
            return res.status(400).json({message: 'Invalid Request'}); 
        }

        const assets = await assetService.getAssets(userId, coin);


        if (!assets) {
            return !res? [] : res.status(404).json({message: 'Asset not found'}); 
        } 
        else {
            const data = assets.map(asset => ({
                symbol: asset.symbol,
                balance: asset.tradingBalance,
                avgPurchasePrice: asset.AvgPurchasePrice
            }))

            return !res? data : res.status(200).json(data);
        }
    } 
    catch (error) {
        console.log("\nError getting Asset balance:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const transferAsset = async (req, res) => {
    const queryRunner = dataSource.createQueryRunner();

    try {
        const { userId, coin, quantity, sendingWallet, receivingWallet } = req.body;

        if( 
            !userId || 
            !coin || 
            !quantity || 
            !sendingWallet || 
            !receivingWallet
        ){ return res.status(400).json({message: 'Incomplete Request Body'}); }

        if(sendingWallet === receivingWallet){
            return res.status(400).json({message: 'Invalid Wallet Address'}); 
        }


        const assetToTransfer = ( await assetService.getAssets(userId, coin))[0];


        if (!assetToTransfer) {
            return res.status(404).json({message: 'Asset not found'});
        } 

        else {
            const senderBalance = sendingWallet === "tradingWallet" ? "tradingBalance" : "fundingBalance";
            const receiverBalance = receivingWallet === "tradingWallet" ? "tradingBalance" : "fundingBalance";

            if(quantity <= 0){
                return res.status(400).json({message: "Invalid quantity"});
            }

            else if(quantity > assetToTransfer[senderBalance]){
                return res.status(400).json({message: "Insufficient balance in sending wallet"});
            }

            else{
                assetToTransfer[senderBalance] -= quantity;
                
                if(receivingWallet === 'tradingWallet' || receivingWallet === 'fundingWallet'){
                    assetToTransfer[receiverBalance]  += quantity;
                }

                try{
                    await queryRunner.connect();
                    await queryRunner.startTransaction();

                    await assetService.saveAsset(queryRunner, assetToTransfer);
                    await updateTransactionHistory(queryRunner, {
                        userId: userId,
                        coin: coin,
                        quantity: quantity,
                        sendingWallet: sendingWallet === 'tradingWallet' ? 'tradingWallet' : 'fundingWallet',
                        receivingWallet: receivingWallet,
                    });
                } 

                catch (error) {
                    await queryRunner.rollbackTransaction();
                    console.log("\nError in internal operations:", error.message);
                    return res.status(500).json({ message: "Transaction failed" });
                }


                if(receivingWallet !== 'tradingWallet' && receivingWallet !== 'fundingWallet'){
                    await axios.post(
                        "http://localhost:8006/wallet",
                        {
                            coin: assetToTransfer.symbol ,
                            quantity: quantity ,
                            purchasePrice: assetToTransfer.AvgPurchasePrice ,
                            sendingWallet: sendingWallet,
                            receivingWallet: receivingWallet,
                        }
                    )
                    .then(async() => {
                        await queryRunner.commitTransaction();
                        const wallet = sendingWallet === 'tradingWallet' ? 'trading' : 'funding';
                        await getPortfolioData({ ...req, params: { wallet } }, res);
                    })
                    .catch(async(error) => {
                        await queryRunner.rollbackTransaction();
                        console.log("\nError in External operations:", error.message);

                        return error.response ? 
                        res.status(400).json({ message: error.response.data.message }) : 
                        res.status(500).json({ message: "Transaction failed" });
                    });
                } 
                
                else {
                    await queryRunner.commitTransaction();

                    const wallet = sendingWallet === 'tradingWallet' ? 'trading' : 'funding';
                    await getPortfolioData({ ...req, params: { wallet } }, res);
                }
            }
        }
    } 
    
    catch (error) {
        console.log("\nError updating asset:", error);
        res.status(error.status || 500).json({message: error.message});
    }

    finally {
        await queryRunner.release();
    }
};





const receiveFromEx = async (req, res) => {
    const queryRunner = dataSource.createQueryRunner();

    try {
        console.log("nng",req.body)
        let { coin, quantity, AvgPurchasePrice, receivingWallet, sendingWallet } = req.body;
        if( 
            !receivingWallet || 
            !sendingWallet || 
            !coin || 
            !quantity ||
            quantity <= 0 ||
            !AvgPurchasePrice ||
            AvgPurchasePrice <= 0
        ){  return res.status(400).json({ message:"invalid request body"}); }

        AvgPurchasePrice = (coin === 'USD') ? 1 : AvgPurchasePrice;

        const userId = await WalletAddressService.getUserId(receivingWallet);
        const sender = await WalletAddressService.getUserName(sendingWallet);

        if(!userId){ return res.status(400).json({message: 'Invalid Wallet Address'}); }

        let assetToUpdate = ( await assetService.getAssets(userId, coin))[0];

        if (!assetToUpdate){
            assetToUpdate = {
                userId: userId,
                symbol: coin,
                fundingBalance: quantity,
                AvgPurchasePrice: AvgPurchasePrice
            }
        }

        else{
            const oldTotalBalance = ( assetToUpdate.tradingBalance + assetToUpdate.holdingBalance + assetToUpdate.fundingBalance );
            const newTotalBalance = ( oldTotalBalance + quantity );
            const newPurchasePrice = ( assetToUpdate.AvgPurchasePrice * oldTotalBalance ) + ( AvgPurchasePrice * quantity);
            const newAvgPurchasePrice = ( newPurchasePrice / newTotalBalance );

            assetToUpdate.AvgPurchasePrice = newAvgPurchasePrice;
            assetToUpdate.fundingBalance += quantity;
        }


        try{
            queryRunner.connect();
            queryRunner.startTransaction();

            await assetService.saveAsset(queryRunner, assetToUpdate);
            await updateTransactionHistory(queryRunner, {
                userId: userId,
                coin: coin,
                quantity: quantity,
                sendingWallet: sendingWallet,
                receivingWallet: 'fundingWallet',
            });
        }

        catch (error) {
            await queryRunner.rollbackTransaction();
            console.log("\nError in internal operations:", error.message);
            return res.status(500).json({ message: "Transaction failed" });
        }
        
        await queryRunner.commitTransaction();


        await axios.post("http://localhost:8002/notification/send/app", {
            userId: userId,
            title: "Asset Received",
            body: `You have received ${req.body.quantity} ${req.body.coin} from ${sender}`,
            onClick: "http://localhost:3000/portfolio/fundingWallet"
        }).then(() => {
            console.log("\nNotification sent");
        }).catch((error) => {
            console.log("\nError sending notification:", error.message);
        });


        res.status(200).json({message: "Asset Updated"}); 
    } 
    
    catch (error) {
        console.log("\nError adding asset:", error);
        res.status(500).json({message: "Transaction failed"});
    }

    finally {
        await queryRunner.release();
    }
};





const releaseAsset = async (req, res) => {
    try{
        const { userId, coin, quantity } = req.body;

        if( !userId || !coin || !quantity || quantity <= 0){
            return res.status(400).json({message: 'Invalid Request Body'}); 
        }

        const assetToRelease = ( await assetService.getAssets(req.body.userId, req.body.coin))[0];


        if (!assetToRelease) {
            return res.status(404).json({message: 'Asset not found'}); 
        } 
        else{
            if(quantity > assetToRelease.holdingBalance){
                return res.status(400).json({message: "Insufficient balance in holding wallet"}); 
            }

            else{
                assetToRelease.holdingBalance -= quantity;
                assetToRelease.tradingBalance += quantity;

                const updatedAsset = await assetService.saveAsset(null, assetToRelease);
                
                res.status(200).json({
                    coin: updatedAsset.symbol,
                    balance: updatedAsset.tradingBalance,
                    avgPurchasePrice: updatedAsset.AvgPurchasePrice
                }); 
            }
        }
    }
    catch (error){
        console.log("\nError releasing asset:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const deductAsset = async (req, res) => {
    try{
        const {userId, coin, quantity} = req.body;

        if( !userId || !coin || !quantity || quantity <= 0){
            return res.status(400).json({message: 'Invalid Request Body'}); 
        }

        const assetToDeduct = ( await assetService.getAssets(req.body.userId, req.body.coin))[0];
 

        if (!assetToDeduct) {
            return res.status(404).json({message: 'Asset not found'});
        }   
        else{
            if(quantity > assetToDeduct.holdingBalance ){
                return res.status(400).json({message: `Insufficient balance in Holding Wallet`});
            }

            else{
                assetToDeduct.holdingBalance -= req.body.quantity;

                const updatedAsset = await assetService.saveAsset(null, assetToDeduct);

                res.status(200).json({
                    coin: updatedAsset.symbol,
                    balance: updatedAsset.tradingBalance,
                    avgPurchasePrice: updatedAsset.AvgPurchasePrice
                }); 
            }
        }
    }

    catch (error){
        console.log("\nError Deducting asset:", error);
        res.status(error.status || 500).json({message: error.message});
    }
}





const executeTrade = async (req, res) => {
    const queryRunner = dataSource.createQueryRunner();

    try {
        const { userId, coin, quantity, price, category, type } = req.body;

        if( 
            !userId || 
            !coin || 
            !quantity || 
            !price ||
            !category ||
            !type ||
            quantity <= 0 ||
            price <= 0 ||
            coin === 'USD' ||
            (type !== 'Buy' && type !== 'Sell') ||
            (category !== 'Market' && category !== 'Limit' && category !== 'ExecuteLimit')
        ){  return res.status(400).json({ message:"invalid request body"}); }


        let assetToUpdate = ( await assetService.getAssets(userId, coin))[0];
        let usdAsset = ( await assetService.getAssets(userId, 'USD'))[0];
        const wallet = category === 'ExecuteLimit' ? 'holdingBalance' : 'tradingBalance';
        const totalValue = quantity * price;


        if(!usdAsset){
            return res.status(400).json({message: 'Insufficient USD balance in trading wallet'});
        }

        
        if(type === 'Buy'){
            if(usdAsset[wallet] < totalValue){
                return res.status(400).json({message: 'Insufficient USD balance in trading wallet'});
            }

            if (category === 'Limit'){
                usdAsset.tradingBalance -= totalValue;
                usdAsset.holdingBalance += totalValue;
            }

            else {
                if (!assetToUpdate){
                    assetToUpdate = {
                        userId: userId,
                        symbol: coin,
                        AvgPurchasePrice: price,
                        tradingBalance: quantity
                    }
                } 
                else{
                    const { tradingBalance, holdingBalance, fundingBalance, AvgPurchasePrice } = assetToUpdate;
                    const oldTotalBalance       = ( tradingBalance + holdingBalance + fundingBalance );
                    const newTotalBalance       = ( oldTotalBalance + quantity );
                    const newPurchasePrice      = ( AvgPurchasePrice * oldTotalBalance ) + totalValue;
                    const newAvgPurchasePrice   = ( newPurchasePrice / newTotalBalance );

                    assetToUpdate.AvgPurchasePrice = newAvgPurchasePrice;
                    assetToUpdate.tradingBalance += quantity;
                }

                usdAsset[wallet] -= totalValue;
            }
        }



        else{
            if (!assetToUpdate){
                return res.status(404).json({message: 'Asset not found'});
            }

            if(assetToUpdate[wallet] < quantity){
                return res.status(400).json({message: 'Insufficient balance in trading wallet'});
            }

            if(category === 'Limit'){
                assetToUpdate.tradingBalance -= quantity;
                assetToUpdate.holdingBalance += quantity;
            }

            else{
                assetToUpdate[wallet] -= quantity;
                usdAsset.tradingBalance += totalValue;
            }         
        }

        console.log("assetToUpdate", assetToUpdate);	
        console.log("usdAsset", usdAsset);

        try{
            queryRunner.connect();
            queryRunner.startTransaction();

            await assetService.saveAsset(queryRunner, assetToUpdate);
            await assetService.saveAsset(queryRunner, usdAsset);
        }

        catch (error) {
            await queryRunner.rollbackTransaction();
            console.log("\nError in executing orders:", error.message);
            return res.status(500).json({ message: "Transaction failed in portfolio" });
        }
        

        await queryRunner.commitTransaction();

        res.status(200).json(
            await getBalance({params:{userId: userId, coin: `${coin},USD`}}, null)
        );  
    } 
    
    catch (error) {
        console.log("\nError adding asset:", error);
        res.status(500).json({message: error.message});
    }

    finally {
        await queryRunner.release();
    }
};




const allocateUSD = async (req, res) => {
    try {
        const { userId, userName, quantity } = req.body;

        if( !userId || !userName || !quantity || userName.length > 25 || quantity <= 0){
            return res.status(400).json({message: 'Invalid Request Body'});
        }

        await WalletAddressService.generateWalletAddress(req, null);

        await assetService.deleteAll(userId);

        await assetService.saveAsset(null, {
            userId: userId,
            symbol: 'USD',
            AvgPurchasePrice: 1,
            fundingBalance: quantity
        });

        res.status(200).json({ message: "USD allocated successfully"});
    }

    catch (error) {
        console.log("\nError allocating USD", error);
        res.status(500).json({message: error.message});
    }
}





module.exports = {
    getPortfolioData,
    getBalance,
    releaseAsset,
    executeTrade,
    allocateUSD,
    receiveFromEx,
    deductAsset,
    transferAsset
};