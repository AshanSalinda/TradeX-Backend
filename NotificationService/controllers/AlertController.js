const dataSource = require("../config/config");
const alertRepo = dataSource.getRepository("Alert");



const getAllRunningAlerts = async () => {
    try {
        const alerts = await alertRepo
        .createQueryBuilder("a")
        .leftJoinAndSelect("a.deviceToken", "t", "a.userId = t.userId")
        .select([
            `a.alertId AS "alertId"`,
            `a.userId AS "userId"`,
            `a.coin AS "coin"`,
            `a.condition AS "condition"`,
            `a.price AS "price"`,
            `a.emailActiveStatus AS "emailActiveStatus"`,
            `a.runningStatus AS "runningStatus"`,
            `t.deviceToken AS "deviceToken"`,
        ])
        .where("a.runningStatus = true")
        .orderBy({
            "a.coin": "ASC",
            "a.userId": "ASC",
            "a.condition": "ASC",
        })
        .getRawMany();

        return alerts;
    }

    catch (error) {
        console.log("\nError fetching All alerts:", error); 
        return [];
    }
};



const getAlerts = async (req, res) => {
    try {
        if(!req.query.userId){
            res.status(404).json({message: 'User not found'});
        }

        else{
            const alerts = await alertRepo.find({
                where: {
                    userId: req.query.userId,
                    runningStatus: req.query.runningStatus === undefined ? true : req.query.runningStatus,
                },
                order: {
                    coin: 'ASC',
                    condition: 'ASC'
                }
            });
            

            res.status(200).json(alerts);
        }
    } 
    
    catch (error) {
        console.log("\nError fetching alerts:", error);
        res.status(500).json({ message: error.message });
    }
};



const addAlert = async (req, res) => {
    try {
        const { userId, coin, price, condition } = req.body;
        
        if(!userId || !coin || !price || !condition){
            return res.status(400).json({message: 'Invalid alert data'});
        }

        await alertRepo.save(req.body);
        await getAlerts({ query: { userId: userId, runningStatus: true}}, res ); 
    } 
    
    catch (error) {
        console.log("\nError adding alert:", error);
        error.message.includes('violates foreign key constraint') ? 
        res.status(500).json({message: 'Allow Notifications in your browser settings to Add alerts..!'}) :
        res.status(500).json({message: error.message});
    }
};



const editAlert = async (req, res) => {
    try {
        const { alertId, userId } = req.body;
        const returnStatus = req.query && req.query.returnStatus;
        
        if(!alertId){
            return res.status(400).json({message: 'Invalid alert data'});
        }

        const alertToUpdate = await alertRepo.findOne({ where: { alertId }})

        if (!alertToUpdate) {
            res.status(404).json({message: 'Alert not found'});
        } 
        
        else {
            alertRepo.merge(alertToUpdate, req.body);
            await alertRepo.save(alertToUpdate);

            if(!res){
                return true;
            }
            else{
                await getAlerts({ query: { userId, runningStatus: returnStatus }}, res );
            }
        }
    } 
    
    catch (error) {
        console.log("\nError Editing alert:", error);
        if(!res){
            return false;
        }
        else{
            res.status(500).json({message: error.message});
        }
    }
};



const deleteAlert = async (req, res) => {
    try {
        const { userId, alertId, runningStatus } = req.query;

        if(!userId || !alertId){
            return res.status(400).json({message: 'Invalid alert data'});
        }

        const alertToDelete = await alertRepo.findOne({where: { alertId }})

        if (!alertToDelete) {
            res.status(404).json({message: 'Alert not found'});
        } 
        
        else {
            await alertRepo.remove(alertToDelete);
            await getAlerts({ query: { userId, runningStatus }}, res );
        }
    } 
    
    catch (error) {
        console.log("\nError deleting alert:", error);
        res.status(500).json({message: error.message});
    }
};



const clearNotifiedAlerts = async (req, res) => {
    try {
        if(!req.query.userId){
            return res.status(400).json({message: 'Invalid alert data'});
        }
        
        await alertRepo.delete({ userId: req.query.userId, runningStatus: false });

        await getAlerts({ 
            query: { 
                userId: req.query.userId,
                runningStatus: false
            }
        }, res );
    } 
    
    catch (error) {
        console.log("\nError clearing notified alerts:", error);
        res.status(500).json({message: error.message});
    }
};




module.exports = {
    getAllRunningAlerts,
    getAlerts,
    addAlert,
    editAlert,
    deleteAlert,
    clearNotifiedAlerts
};