const dataSource = require("../config/config");
const assetRepo = dataSource.getRepository("Asset");
const { getMarketPrices } = require("./MarketPrices");


const getAssets = async (userId, coins) => {
    try {
        let condition = {userId: userId};

        if(coins !== undefined && coins){
            condition = coins.split(',').map(coin => ({
                userId: userId, 
                symbol: coin
            }));
        }

        const assets = await assetRepo.find({
            where: condition
        });

        return assets;
    }

    catch (error) {
        console.log("\nError getting balance:", error);
        return null;
    }
}





const getRealtimeTotalValues = async () => {
    try{
        const marketPrices = getMarketPrices();
        const groupedValues = {};

        
        const allAssets =  await assetRepo
            .createQueryBuilder("asset")
            .select(["asset.userId", "asset.symbol"])
            .addSelect("SUM(asset.tradingBalance + asset.holdingBalance + asset.fundingBalance)", "totalValue")
            .groupBy(["asset.userId", "asset.symbol"])
            .orderBy("asset.userId", "ASC")
            .getRawMany();


        while(allAssets.length > 0) {
            const asset = allAssets.pop();
            const marketPrice = marketPrices[asset.asset_symbol] || 1;
            const value = marketPrice * asset.totalValue;
            const userId = asset.asset_userId;

            groupedValues[userId] = !groupedValues[userId] ? value : groupedValues[userId] + value;
        };


        return(
            Object.keys(groupedValues).map(userId => {
                return { userId: Number(userId), value: groupedValues[userId] };
            }
        ));
    }
    
    catch (error) {
        console.log("\nError getting realtime total values:", error);
        return [];
    }
}





const getAssetsWithMarketPrice = async (userId, coins) => {
    try {
        const assets = await getAssets(userId, coins);
        const marketPrices = getMarketPrices();
      
        if (assets.length === 0){
            return [];
        } 

        else if(assets.length === 1 && assets[0].symbol === 'USD') {
            assets[0].marketPrice = 1;
            return assets;
        }

        assets.map(asset => { 
            const marketPrice = marketPrices[asset.symbol] || 0;
            asset.marketPrice = (asset.symbol === 'USD') ? 1 : marketPrice; 
        });

        return assets;
    }

    catch (error) {
        console.log("\nError getting market price:", error);
        return null;
    }
}





const saveAsset = async (queryRunner, asset) => {
    try {
        if(!asset){
            console.log("\nError saving Asset, Asset is empty");
            return 
        }

        const savedAsset = !queryRunner ? 
            await assetRepo.save(asset) :
            await queryRunner.manager.withRepository(assetRepo).save(asset);
        return savedAsset;
    }

    catch (error) {
        console.log("\nError saving asset:", error);
        throw new Error("Error saving Asset")
    }
}





const deleteAll = async (userId) => {
    try {
        await assetRepo.delete({userId: userId});
    }

    catch (error) {
        console.log("\nError deleting assets:", error);
    }
}


module.exports = {
    getAssets,
    getRealtimeTotalValues,
    getAssetsWithMarketPrice,
    saveAsset,
    deleteAll
};