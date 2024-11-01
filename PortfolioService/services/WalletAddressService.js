require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const dataSource = require("../config/config");
const walletAddressRepo = dataSource.getRepository("WalletAddress");
const CryptoJS = require("crypto-js");



const generateWalletAddress = async (req, res) => {
    try{
        const { userName, userId } = req.body;

        if(!userId || !userName){
            return !res ? false : res.status(400).json({ message: "userId and userName are required" });
        }

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const iv = CryptoJS.lib.WordArray.random(16);
        let margin = '';

        for(let i = 0; i < 25 - userName.length; i++){
            margin += (i === 0) ? ':' : characters.charAt(Math.floor(Math.random() * characters.length));
        }

        const walletAddress = CryptoJS.AES.encrypt(userName + margin, secretKey, {iv: iv}).toString();

        const isExists = await walletAddressRepo.exists({ where: { walletAddress } });

        if (isExists) {
            return await generateWalletAddress(req, res);
        } else {
            await walletAddressRepo.save({ userId, walletAddress });
            return !res ? true : res.status(200).json({ walletAddress });
        }
    }

    catch(error){
        console.log("error generating wallet Address", error);
        return !res ? false : res.status(500).json({ message: "error generating wallet Address" });
    }
}



const getWalletAddress = async (userId) => {
    try{
        const data = await walletAddressRepo.findOne({ where:{ userId }});
        return !data ? null: data.walletAddress;
    }
    catch(error){
        console.log("error fetching wallet Address", error);
        return null;
    }
}



const getUserId = async (walletAddress) => {
    try{
        const data = await walletAddressRepo.findOne({ where:{ walletAddress }});
        return !data ? null : data.userId;
    }
    catch(error){
        console.log("error fetching user", error);
        return null;
    }
}



const getUserName = async (walletAddress) => {
    try{
        return CryptoJS.AES
        .decrypt(walletAddress, secretKey)
        .toString(CryptoJS.enc.Utf8)
        .split(":")[0];
    }
    catch(error){
        console.log("Error decrypting wallet address:", error);
        return null;
    }
}



module.exports = {
    generateWalletAddress,
    getWalletAddress,
    getUserId,
    getUserName
};