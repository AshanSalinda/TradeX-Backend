require ("dotenv").config();
const CryptoJS = require("crypto-js");
const dataSource = require("../config/config");
const userRepo = dataSource.getRepository("UserDetail");
const secretKey = process.env.SECRET_KEY


const generateWalletAddress = async (req, res) => {
    try{
        const walletId = req.body.walletId;

        if(!walletId){
            return res.status(400).json({message:"invalid request"})
        }

        const user = await userRepo.findOne({ where: {walletId}});

        if(!user){
            return res.status(404).json({message:"user not found"});
        }

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const iv = CryptoJS.lib.WordArray.random(16);
        let margin = '';

        for(let i=0; i < 25 - user.userName.length; i++){
            margin += (i === 0) ? ':' : characters.charAt(Math.floor(Math.random() * characters.length));
        }
        

        const walletAddress = CryptoJS.AES.encrypt(user.userName + margin, secretKey, {iv: iv}).toString();

        const isExists = await userRepo.exists({ where: { walletAddress } });

        if (isExists) {
            return await generateWalletAddress(req, res);
        } else {
            user.walletAddress = walletAddress;
            await userRepo.save(user);
            return !res ? true : res.status(200).json({ walletAddress });
        }
    }

    catch(error){
        console.log("error generating wallet Address", error);
        return !res ? false : res.status(500).json({ message: "error generating wallet Address" });
    }
}



const getWalletAddress = async (walletId) => {
    try{
        const address  = await userRepo.findOne({ where:{ walletId }});
        return !address ? null : address.walletAddress;
    }
    catch(error){
        console.log("error fetching wallet Address", error);
        return null;
    }
}



const getIds = async (walletAddress) => {
    try{
        const  user  = await userRepo.findOne({ where:{ walletAddress }});
        return !user ? null : {
            walletId: user.walletId,
            userId: user.userId
        };
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
        console.log("\nError decrypting wallet address:", error);
        return null;
    }
}




module.exports = {
    generateWalletAddress,
    getWalletAddress,
    getIds,
    getUserName
};