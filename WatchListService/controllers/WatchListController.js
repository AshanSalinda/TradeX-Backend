const dataSource = require("../config/config");
const CoinsRepo = dataSource.getRepository("Watchlist");

const getCoins = async (req, res) => {
    try{
        if(!req.params.userId){
            return res.status(400).json({messege:"invalid request"});
        }
        console.log("get user id", req.params.userId);
        const coins = await CoinsRepo.findOne({where:{userId:req.params.userId}});
        res.status(200).json(coins);
    }
    catch(error){
        console.log("error getting coins", error);
        res.status(500).json({messege:"error getting coins"});
        
    }
};

const saveCoins = async (req, res) => {
    try{
        if(!req.body.userId || !Array.isArray(req.body.coins)){
            return res.status(400).json({messege:"invalid request"});
        }

        if(req.body.coins.length === 0){
            await deleteCoins(req.body.userId);
        }
        else{
            await CoinsRepo.save(req.body);
        }
        res.status(200).json({messege:"coins updated"});
    }
    catch(error){
        console.log("error updating coins", error);
        res.status(500).json({messege:"error updating coins"});
    }
    
};

const deleteCoins = async (userId) => {
    try{
        await CoinsRepo.delete({userId});
        return;
    }
    catch(error){
        console.log("error deleting coins", error);
    }
    
};


module.exports = {
    getCoins,
    saveCoins,
    deleteCoins
}