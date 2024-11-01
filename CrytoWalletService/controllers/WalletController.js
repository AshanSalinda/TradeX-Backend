// Import required modules
const axios = require("axios");
const dataSource = require("../config/config");
const walletRepo = dataSource.getRepository("Capital");
const updateWalletHistory = require("./WalletHistoryController").updateWalletHistory;
const address = require("./WalletAddress");


// Function to get all balances for a user
const getAllBalances = async (req, res) => {
    try {
        // Extract userId from request parameters
        const walletId = req.params.walletId;	
        let usdBalance = 0;
        let walletValue = 0;

        // Check if userId is provided
        if (!walletId || walletId === 'undefined') {
            return res.status(404).json({ message: 'Invalid request' });
        } 


        // Retrieve assets for the user
        const assets = await walletRepo.find({
            where: { walletId },
        });


        // Fetch market prices for the assets
        await axios.get(
            'https://api.binance.com/api/v3/ticker/price?symbols=' + 
            "[\"" + assets
            .filter(asset => asset.coin !== 'USD')
            .map(asset => `${asset.coin}USDT`)
            .join('\",\"') + "\"]"
        ).then((response) => {
            assets.map(asset => {
                if (asset.coin !== 'USD') {
                    const marketPrice = response.data.find(data => data.symbol === asset.coin + 'USDT');
                    asset.marketPrice = (marketPrice) ? parseFloat(marketPrice.price) : 0;
                }
            });
        }).catch((error) => {
            console.log("\nError getting market prices:", error.message);
            assets.map(asset => {
                if (asset.coin !== 'USD') {
                    asset.marketPrice = 0;
                }
            });
        });

        // Process and update asset data
        let updatedAssets = assets.map(asset => {
            let updatedAsset = {};
            updatedAsset.coin = asset.coin;
            updatedAsset.balance = asset.balance;

            // Calculate portfolio value and USD balance
            if (asset.coin === 'USD') {
                usdBalance = asset.balance;
                walletValue += asset.balance;
            } else {
                updatedAsset.marketPrice = `$ ${asset.marketPrice}`;
                updatedAsset.value = ((asset.marketPrice > 0) ? asset.marketPrice : 1) * asset.balance;
                walletValue += updatedAsset.value;

                const ROI = (asset.marketPrice - asset.AvgPurchasePrice) * (100 / asset.AvgPurchasePrice);
                updatedAsset.ROI = `${ROI.toFixed(2)} %`;
                updatedAsset.RoiColor = (ROI > 0) ? '#21DB9A' : (ROI < 0) ? '#FF0000' : '#FFFFFF';
            }

            return updatedAsset;
        }).filter(asset => Object.keys(asset).length > 0).sort((a, b) => b.value - a.value);

        // Move USD asset to the top of the list
        const usdAsset = updatedAssets.find(asset => asset.coin === 'USD') || {};
        updatedAssets = [ usdAsset, ...updatedAssets.filter(asset => asset.coin !== 'USD') ];

        // Return response with portfolio data
        res.status(200).json({
            usdBalance: usdBalance,
            walletValue: walletValue,
            assets: updatedAssets,
            address: await address.getWalletAddress(walletId)
        }); 
    } catch (error) {
        console.log("\nError getting Wallet Data:", error);
        res.status(error.status || 500).json({message: error.message});
    }
};

// Function to transfer balance between wallets
const transferBalance = async (req, res) => {
    const queryRunner = dataSource.createQueryRunner();

    try {
        // Validate request parameters
        if (!req.body.userId || !req.body.walletId || !req.body.coin || !req.body.quantity || !req.body.sendingWallet || !req.body.receivingWallet ) {
            return res.status(400).json({message: "Invalid request"});
        }
        if (req.body.quantity <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

      
        // Find the asset to transfer
        let assetToTransfer = await walletRepo.findOne({
            where: {
                walletId: req.body.walletId,
                coin: req.body.coin
            },
        });
        
        // Handle asset not found
        if (!assetToTransfer) {
            return res.status(400).json({ message: "Assets not found" });
        }
        // Check for insufficient balance
        if (req.body.quantity > assetToTransfer.balance) {
            return res.status(400).json({ message: "Insufficient balance in sending wallet" });
        }

        else {
            assetToTransfer.balance -= req.body.quantity;
        }

        try{
            await queryRunner.connect();
            await queryRunner.startTransaction();
            await queryRunner.manager.withRepository(walletRepo).save(assetToTransfer);
            await updateWalletHistory(queryRunner, {
                walletId: req.body.walletId,
                coin: req.body.coin,
                quantity: req.body.quantity,
                date: new Date(),
                type: "Send",
                from_to: await address.getUserName(req.body.receivingWallet)
            });
        }

        catch (error) {
            await queryRunner.rollbackTransaction();
            console.log("\nError in internal operations:", error.message);
            return res.status(500).json({ message: "Transaction failed" });
        }

        

        // Transfer asset
        await axios.post("http://localhost:8011/portfolio/asset/transfer", {
            receivingWallet: req.body.receivingWallet,
            sendingWallet: req.body.sendingWallet,
            coin: assetToTransfer.coin,
            quantity: req.body.quantity,
            AvgPurchasePrice: assetToTransfer.AvgPurchasePrice,
        }).then(async() => {
            //commit transaction
            await queryRunner.commitTransaction();
            getAllBalances({ params: { walletId: req.body.walletId } }, res);
        }).catch(async (error) => {
            //rollback transaction
            await queryRunner.rollbackTransaction();
            console.log("\nError in External operations:", error.message);

            return error.response ? 
            res.status(400).json({ message: error.response.data.message }) : 
            res.status(500).json({ message: "Transaction failed" });
        });

    } catch (error) {
        console.log("\nError transferring asset:");
        res.status(500).json({ message: "Transaction failed"});
        
    } finally {
        await queryRunner.release();
    }
};

// Function to add capital to the wallet
const addCapital = async (req, res) => {
    const queryRunner = dataSource.createQueryRunner();

    try {
        // Validate request parameters
        if (!req.body.receivingWallet|| !req.body.sendingWallet || !req.body.coin || !req.body.quantity || !req.body.purchasePrice ){
            return res.status(400).json({ 
                message:"invalid request, contain null values for 'userId', 'coin', 'quantity' or 'purchasePrice'"
            });
        }
        if (req.body.quantity <= 0 || req.body.purchasePrice <= 0){
            return res.status(400).json({ message:"invalid quantity or purchasePrice" });
        }

        const sendingWallet = await address.getUserName(req.body.sendingWallet)
        const user = await address.getIds(req.body.receivingWallet);
        const walletId = user ? user.walletId : null;
        const userId = user ? user.userId : null;

        if(!walletId){
            return res.status(400).json({ message:"invalid wallet address"});
        }

        // Set purchase price to 1 for USD
        req.body.purchasePrice = (req.body.coin === 'USD') ? 1 : req.body.purchasePrice;

        // Find existing asset or create new one
        let assetToUpdate = await walletRepo.findOne({
            where:{
                walletId: walletId,
                coin: req.body.coin
            }
        })

        // Update asset details
        if (!assetToUpdate){
            assetToUpdate = {
                walletId: walletId,
                coin: req.body.coin,
                balance: req.body.quantity,
                AvgPurchasePrice: req.body.purchasePrice
            }
        } 
        
        else {
            const newTotalBalance = (assetToUpdate.balance + req.body.quantity);
            const newPurchasePrice = (assetToUpdate.AvgPurchasePrice * assetToUpdate.balance  ) + (req.body.purchasePrice * req.body.quantity);
            const newAvgPurchasePrice = (newPurchasePrice / newTotalBalance);

            assetToUpdate.AvgPurchasePrice = newAvgPurchasePrice;
            assetToUpdate.balance += req.body.quantity;
        }


        try{
            await queryRunner.connect();
            await queryRunner.startTransaction();
            await queryRunner.manager.withRepository(walletRepo).save(assetToUpdate);
            await updateWalletHistory(queryRunner, {
                walletId: walletId,
                coin: req.body.coin,
                quantity: req.body.quantity,
                date: new Date(),
                type: "Receive",
                from_to: sendingWallet
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
            body: `You have received ${req.body.quantity} ${req.body.coin} from ${sendingWallet}`,
            onClick: "http://localhost:3000/wallet/dashboard"
        }).then(() => {
            console.log("\nNotification sent");
        }).catch((error) => {
            console.log("\nError sending notification:", error.message);
        });

        res.status(200).json({ message: "Asset Updated" }); 
        
    } catch (error) {
        console.log("\nError adding asset:", error);
        res.status(400).json({ message:"Transaction failed" });

    } finally {
        await queryRunner.release();
    }
};


const initEmptyCapitalRemover = async () => {
    const sqlQuery = `
        CREATE OR REPLACE FUNCTION empty_capital_remover()
        RETURNS TRIGGER AS $$
        DECLARE
            total FLOAT;
        BEGIN
            SELECT "balance" INTO total
            FROM capital
            WHERE "walletId" = NEW."walletId" AND "coin" = NEW."coin";
        
            IF total <= 0 THEN
                DELETE FROM capital WHERE "walletId" = NEW."walletId" AND "coin" = NEW."coin";
            END IF;
        
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        
        CREATE OR REPLACE TRIGGER check_and_delete_capital_on_insert_trigger
        AFTER INSERT ON capital
        FOR EACH ROW
        EXECUTE FUNCTION empty_capital_remover();
        
        CREATE OR REPLACE TRIGGER check_and_delete_capital_on_update_trigger
        AFTER UPDATE ON capital
        FOR EACH ROW
        EXECUTE FUNCTION empty_capital_remover();`
    ;

    try {
        await dataSource.query(sqlQuery);
    } catch (error) {
        console.error('\n\nError creating emptyCapitalRemover trigger function:\n\n', error);
    }
}

// Export controller functions
module.exports = {
    transferBalance,
    getAllBalances,
    addCapital,
    initEmptyCapitalRemover,
}
