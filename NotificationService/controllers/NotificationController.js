const dataSource = require("../config/config");
const notificationRepo = dataSource.getRepository("AppNotification");
const deviceTokenRepo = dataSource.getRepository("DeviceToken");
const sendFcmNotification = require("../NotificationServices/Firebase");
const sendEmailNotification = require("../NotificationServices/Email");
const axios = require('axios');
const { sendWebSocketNotification } = require("../NotificationServices/WebSocket");
const { In } = require('typeorm');



const saveDeviceToken = async (req, res) => {
    try {        
        await deviceTokenRepo.save(req.body);
        res.status(200).json({message: 'Device token saved successfully'});    
    } 
    
    catch (error) {
        console.log("\nError saving device token:", error);
        res.status(500).json({message: error.message});
    }
}


const getAppNotifications = async (req, res) => {
    try {
        if(!req.query.userId){
            res.status(400).json({message: 'User ID is required'});
        }

        else{
            const notifications = await notificationRepo.find({
                where: { userId: req.query.userId },
                order: { notificationId: 'DESC' }
            });

            const isNew = notifications.some(notification => !notification.isViewed);
            
            res.status(200).json({notifications, isNew});
        }
    }

    catch (error) {
        console.log("\nError fetching All notifications:", error); 
        res.status(500).json({message: 'Error fetching notifications'});
    }
};


const addAppNotification = async (newNotification) => {
    try {
        await notificationRepo.save({ ...newNotification, sentAt: new Date().toUTCString()});
    } 
    
    catch (error) {
        console.log("\nError adding new notification:", error);
    }
};


const markAsViewed = async (req, res) => {
    try {
        const { userId, notificationIds } = req.body;


        if(!userId || !notificationIds || !notificationIds.length){
            return res.status(400).json({message: 'invalid request'});
        }


        await notificationRepo.update(
            { notificationId: In(notificationIds) },
            { isViewed: true }
        );
        

        await getAppNotifications({query:{userId}}, res);
    }   

    catch (error) {
        console.log("\nError marking notifications as viewed:", error);
        res.status(500).json({ message: error.message });
    }
}


const sendNotification = async (req, res) => {
    try {
        const { userId, title, body, onClick, emailHeader, emailBody, attachments } = req.body;
        let { deviceToken, receiverEmail } = req.body;
        const type = req.params.type;


        if(( type.includes('email') && !emailBody ) || !title ){
            throw Object.assign(new Error('invalid request'), { status: 400 });
        }


        if(type.includes('push')){
            if(!deviceToken){
                if(!userId){
                    throw Object.assign(new Error('User ID not found'), { status: 404 });
                }

                const user = await deviceTokenRepo.findOne({where: { userId }});

                deviceToken = !user ? null : user.deviceToken;
            }

            if(!deviceToken){
                throw Object.assign(new Error('Device Token not found'), { status: 404 });
            } else {
                await sendFcmNotification(deviceToken, title, body, onClick);
            }
        }


        if(type.includes('app')){
            if(!userId){
                throw Object.assign(new Error('User ID not found'), { status: 404 });
            }

            await sendWebSocketNotification(userId);

            await addAppNotification({userId, title, body, onClick});
        }


        if(type.includes('email')){
            if(!receiverEmail){
                if(!userId){
                    throw Object.assign(new Error('User ID not found'), { status: 404 });
                }

                const endpoint = userId > 0 ? 
                    `http://localhost:8004/user/getEmail/${userId}` : 
                    `http://localhost:8003/admin/getEmail/${userId}`;

                receiverEmail = (await axios.get(endpoint)).data.email;

            }

            if(!receiverEmail){
                throw Object.assign(new Error('Receiver Email Address not found'), { status: 404 });
            } else {
                await sendEmailNotification(title, emailHeader, emailBody, receiverEmail, attachments);
            }
        }


        if(!res){
            return true;
        } else {
            res.status(200).json({message: 'Notification sent successfully'});
        }
    }

    catch (error) {
        console.log("Error sending notification:", error);

        if (!res) {
            throw error;
        } else {
            res.status(error.status || 500).json({message: error.message});
        }
    }
};



module.exports = {
    saveDeviceToken,
    getAppNotifications,
    addAppNotification,
    markAsViewed,
    sendNotification
};