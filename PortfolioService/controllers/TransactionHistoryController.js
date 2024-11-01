const dataSource = require("../config/config");
const TransactionHistoryRepo = dataSource.getRepository("TransactionHistory");
const { getUserName } = require("../services/WalletAddressService");

const getTransactionHistory = async (req, res) => {
    try {

        if (!req.query.userId) {
            res.status(404).json({ message: 'User Id not found' });
        } 
        
        else {
            const transactionHistoryData = await TransactionHistoryRepo.find({
                where: {
                    userId: req.query.userId,
                },
                order: {
                    historyId: 'DESC',
                },
            });


            res.status(200).json(transactionHistoryData);
        }
    }
    
    catch (error) {
        console.log("\nError fetching transaction history:", error);
        res.status(500).json({ message: error.message });
    }
}


const updateTransactionHistory = async (queryRunner, historyData) => {
    switch (historyData.sendingWallet){
        case 'fundingWallet':
            historyData.sendingWallet = 'Funding Wallet';
            break;

        case 'tradingWallet':
            historyData.sendingWallet = 'Trading Wallet';
            break;

        default:
            historyData.sendingWallet = await getUserName(historyData.sendingWallet);
            break;
    }


    switch (historyData.receivingWallet){
        case 'fundingWallet':
            historyData.receivingWallet = 'Funding Wallet';
            break;

        case 'tradingWallet':
            historyData.receivingWallet = 'Trading Wallet';
            break;

        default:
            historyData.receivingWallet = await getUserName(historyData.receivingWallet);
            break;
    }


    historyData.date = new Date().getTime();
    historyData.sendingWallet = historyData.sendingWallet || 'External Wallet user';
    historyData.receivingWallet = historyData.receivingWallet || 'External Wallet user';


    await queryRunner.manager.withRepository(TransactionHistoryRepo).save(historyData);
}


module.exports = {
    getTransactionHistory,
    updateTransactionHistory
};
