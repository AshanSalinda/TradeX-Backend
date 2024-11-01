const express = require('express');
const dataSource = require("../config/config");
const bcrypt = require('bcrypt')
const userRepo = dataSource.getRepository("UserDetail");
const address = require('./WalletAddress');
const {createAccessToken, createRefreshToken} = require("../JWT");


const login = async (req, res) => {
    try{
        const {userName, password} = req.body;

        if(!userName || !password){
            return res.status(400).json({message: "Please fill all the fields"})
        }
        
        const user = await userRepo.findOne({where: {userName}});

        if(!user) {return res.status(400).json({message: "invalid Username or Password"})}

        const dbPassword = user.password;
        bcrypt.compare(password,dbPassword)
        .then((match)=>{
            if(!match){
                res.status(400).json({message: "invalid Username or Password"})
            }
            else{

                const accessToken = createAccessToken(user);
                const refreshToken = createRefreshToken(user);
            
            
                res.cookie("wallet-refresh-token", refreshToken, {
                    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                });
            
                const userDetail = {
                    id: user.userId,
                    userName: user.userName,
                }
            
                res.status(200).json({ accessToken , user});
                
            }
        })
        .catch((error)=>{
            console.log("bcrypt error in login", error);
            res.status(500).json({message: "Login Failed, Please try again"});
        });

    }

    catch(error){
        console.log("error in login", error);
        res.status(500).json({message: "Login Failed, Please try again"});
    }
};

const refreshToken = (req, res) => {
    const refreshToken = req.cookies["refresh-token"];
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not found" });
    }

    try {
        const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = createAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

const register = async (req, res) => {
    try{
        const {userId, userName, password, seedPhrase} = req.body;

        if(!userId || !userName || !password || !seedPhrase){
            return res.status(400).json({"message": "Please fill all the fields"})
        }

        const user = await userRepo.findOne({  where: {userName} });

        if(user){
            return res.status(400).json({message: "User Name Already taken"})
        }

        bcrypt.hash(password, 10)
        .then(async(hash) => {
            userRepo.save({
                "userId": userId,	
                "userName": userName, 
                "password": hash,
                "seedPhrase":seedPhrase
            }).then(async(userData)=>{

                await address.generateWalletAddress({body: { walletId: userData.walletId }});
        
                res.status(200).json({message: "Wallet Created Successfully", user: userData})
            }).catch((error)=>{
                console.log("Error in saving register user", error)
                res.status(500).json({message: "Failed to create Wallet. Please try again."});
            })
        }).catch((error)=>{
            console.log("bcrypt error in register user", error)
            res.status(400).json({message: "Failed to create Wallet. Please try again."});
        })

    }

    catch(error){
        console.log("error in register user", error)
        res.status(400).json({message: "Failed to create Wallet. Please try again."});
    }
};

const checkUserName = async (req, res) => {
    try{
        const userName = req.params.userName;

        if(!userName){
            return res.status(400).json({message: "Please fill all the fields"})
        }

        const user = await userRepo.findOne({ where: {userName} });

        if(!user){
            return res.status(200).json({message: "User Name is Available"})
        } else {
            res.status(400).json({message: "User Name Already taken"})
        }
    }

    catch(error){
        console.log(error)
        res.status(500).json({message: "Please try again."});
    }
};



const resetPassword = async (req, res) => {
    try{
        const {userId, password, userName, seedPhrase} = req.body;

        console.log("resetPassword", req.body)

        if(!userId || !password || !userName || !seedPhrase){
            return res.status(400).json({message: "Please fill all the fields"})
        }

        bcrypt.hash(password, 10)
        .then(async(hash) => {
            const user = await userRepo.findOne({ where:{userId, userName, seedPhrase}})

            if(!user){
                return res.status(400).json({message: "Invalid User name or Seed Phrase. Please try again."})
            }

            user.password = hash;

            await userRepo.save(user)
            .then((userData)=>{
                res.status(200).json({message: "Password Reset Successfully", user: userData});

            }).catch((error)=>{
                console.log("Error in saving recover user", error)
                res.status(500).json({message: "Failed to reset password. Please try again."});

            })
        }).catch((error)=>{
            console.log("bcrypt error in reset password", error)
            res.status(400).json({message: "Failed to reset password. Please try again."});
        })
    }

    catch(error){
        console.log("error in reset password", error)
        res.status(500).json({message: "Failed to reset password. Please try again."});
    }
};

module.exports = {
   register,
   login,
   resetPassword,
   checkUserName,
   refreshToken
}