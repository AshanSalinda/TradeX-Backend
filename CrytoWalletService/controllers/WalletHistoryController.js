const dataSource = require("../config/config");
const WalletHistoryRepo = dataSource.getRepository("WalletHistory");

const getWalletHistory = async (req, res) => {
    try {
        if (!req.query.walletId) {
            res.status(404).json({ message: 'User Id not found' });
        } 
        
        else {
            const WalletHistoryData = await WalletHistoryRepo.find({
                where: {
                    walletId: req.query.walletId,
                },
                order: {
                    historyId: 'DESC',
                },
            });

           
            res.status(200).json(WalletHistoryData);
        }
    }
    
    catch (error) {
        console.log("\nError fetching transaction history:", error);
        res.status(500).json({ message: error.message });
    }
}

const updateWalletHistory = async (queryRunner, historyData) => {
    await queryRunner.manager.withRepository(WalletHistoryRepo).save(historyData);
    return;
}


module.exports = {
    getWalletHistory,
    updateWalletHistory,
};
