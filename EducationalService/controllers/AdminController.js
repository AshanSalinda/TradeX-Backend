const dataSource = require("../config/config");
const eduRepo = dataSource.getRepository("EduResources");

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

const deleteEduResources = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Deleting resource with ID:", id)

        const resource = await eduRepo.findOne({ where: { eduId: id } });

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        await eduRepo.remove(resource);
        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
        console.log("Error deleting resource", error);
        res.status(500).json({ message: "Error deleting resource" });
    }
};

module.exports = {
    addEduResources,
    deleteEduResources
};
