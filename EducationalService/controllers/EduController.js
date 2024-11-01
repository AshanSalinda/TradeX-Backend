const dataSource = require("../config/config");
const eduRepo = dataSource.getRepository("EduResources");
const favRepo = dataSource.getRepository("Favorite");
const Favorite = require("../models/Favorite");

const getAllEduResources = async (req, res) => {
    try{
        const userId=req.params.userId;
        if(!userId){
            return res.status(400).json ({message:"userId not found"});
        }

        const eduResources = await eduRepo.createQueryBuilder('eduResources')
        .leftJoin(
            qb => qb
                .select('favorite.eduId', 'eduId')
                .addSelect('BOOL_OR(favorite.userId = :userId)', 'isFavorite')
                .from(Favorite, 'favorite')
                .groupBy('favorite.eduId')
                .setParameter('userId', userId),
            'user_favorites',
            'user_favorites."eduId" = eduResources.eduId'
        )
        .select([
            'eduResources.eduId AS "eduId"',
            'eduResources.title AS "title"',
            'eduResources.description AS "description"',
            'eduResources.url AS "url"',
            'eduResources.image AS "image"',
            'user_favorites."isFavorite" AS "isFavorite"'
        ])
        .orderBy('eduResources.eduId', 'ASC')
        .getRawMany();

        res.status(200).json(eduResources);
    }
    catch(error){
        console.log("Error getting resource", error);
        res.status(500).json({message:"Error getting resource"})
        
    }
};

const getFavEduResources = async (req, res) => {
    try{
        const userId=req.params.userId;
        if(!userId){
            return res.status(400).json ({message:"userId not found"});
        }

        const eduResources = await eduRepo.createQueryBuilder('eduResources')
        .innerJoin(
            'favorite', 'fav',
            'fav.eduId = eduResources.eduId AND fav.userId = :userId',
            { userId }
        )
        .select([
            'eduResources.eduId AS "eduId"',
            'eduResources.title AS "title"',
            'eduResources.description AS "description"',
            'eduResources.url AS "url"',
            'eduResources.image AS "image"',
            'true AS "isFavorite"'
        ])
        .orderBy('eduResources.eduId', 'ASC')
        .getRawMany();


        res.status(200).json(eduResources);
    }
    catch(error){
        console.log("Error getting resource", error);
        res.status(500).json({message:"Error getting resource"})
        
    }
};

const saveEduResources = async (req, res) => {
    try {
        const { title, description, image, url } = req.body;

        if (!title || !description || !image || !url) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const isExist = await eduRepo.findOne({ where: { url } });

        if (isExist) {
            return res.status(400).json({ message: "Resource already exists" });
        }

        await eduRepo.save({ title, description, image, url });
        res.status(200).json({ message: "Resource added successfully" });
    } catch (error) {
        console.log("Error saving resource", error);
        res.status(500).json({ message: "Error saving resource" });
    }
};

const favorite = async (req, res) => {
    try{
        const {eduId,userId,isFavorite} = req.body;
        console.log(req.body);

        if(!eduId || !userId || isFavorite === undefined ){
            return res.status(400).json ({message:"invalid request"});
        }

        const eduResource = await eduRepo.findOne({where:{eduId}});
        const isAlreadyFav = await favRepo.findOne({where:{eduId,userId}});

        if (!eduResource){
            return res.status(404).json ({message:"Resource not found"});
        }

        if(isFavorite){

            if(!isAlreadyFav){
                await favRepo.save({eduId,userId});
            } 
            res.status(200).json({message:"added to favorite"});  
        }

        else{

            if(isAlreadyFav){
                await favRepo.remove({eduId,userId});
            }  
            res.status(200).json({message:"removed from favorite"});
        }

    }
    catch (error){
        console.log("Error in favorite resource", error);
        res.status(500).json({message:"Error in favorite resource"})
    }
}

const addEduResources = async (req, res) => {
    try {
        const { title, description, image, url } = req.body;

        if (!title || !description || !image || !url) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const isExist = await eduRepo.findOne({ where: { url } });

        if (isExist) {
            return res.status(400).json({ message: "Resource already exists" });
        }

        await eduRepo.save({ title, description, image, url });
        res.status(200).json({ message: "Resource added successfully" });
    } catch (error) {
        console.log("Error saving resource", error);
        res.status(500).json({ message: "Error saving resource" });
    }
};





module.exports = {
    getAllEduResources,
    saveEduResources,
    favorite,
    getFavEduResources,
    addEduResources

}