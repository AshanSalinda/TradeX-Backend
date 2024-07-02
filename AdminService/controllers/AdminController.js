const bcrypt = require("bcrypt");
const dataSource = require("../config/config");
const axios = require('axios');
const { createAccessToken, createRefreshToken } = require("../JWT");

const getAllAdmins = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    res.json(await AdminRepo.find());
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const AdminRepo = dataSource.getRepository("Admin");
    
    const user = await AdminRepo.findOne({ where: { email: email } });

    if (!user) {
        return res.status(400).json({ message: "Incorrect E-mail address" });
    }

    const dbPassword = user.password;
    const isMatch = await bcrypt.compare(password, dbPassword);

    if (!isMatch) {
        return res.status(400).json({ message: "Wrong Username and Password Combination!" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);


    res.cookie("refresh-token", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    });

    const userDetail = {
        id: user.AdminId,
        userName: user.AdminName,
        email: user.email,
        hasTakenQuiz: user.hasTakenQuiz,
        role: user.role,
    }

    res.json({ message: "Logged in", accessToken , user: userDetail});
};


const saveAdmin = async (req, res) => {
    try {
        const { AdminName, email, password, NIC, Contact } = req.body;
        const AdminRepo = dataSource.getRepository("Admin");        

        // Retrieve the last admin to generate a new ID
        const lastAdmin = await AdminRepo.createQueryBuilder("admin")
            .orderBy("admin.AdminId", "ASC")
            .getOne();


        const newAdminId = !lastAdmin ? -1 : lastAdmin.AdminId - 1;


        // Create the new admin with the generated ID
        const newAdmin = AdminRepo.create({
            AdminId: newAdminId,
            AdminName,
            email,
            password,
            NIC,
            Contact,
            role: "Admin"
        });


        await axios.post("http://localhost:8002/notification/send/email", {
            receiverEmail: email,
            title: "TradeX Admin Account",
            emailHeader: "Admin permissions granted",
            emailBody: `
                <p>Dear ${AdminName},</p>
                <p>Your account has been successfully created. You can now login to the TradeX Admin Panel using the following credentials:</p>
                <table style="width:400px;margin:auto;border-collapse:collapse;">
                    <tr>
                        <td style="border:1px solid black">Email:</td>
                        <td style="border:1px solid black">${email}</td>
                    </tr>
                    <tr>
                        <td style="border:1px solid black">Password:</td>
                        <td style="border:1px solid black">${password}</td>
                    </tr>
                </table><br>
                <span>Thank you for joining TradeX!</span><br>
                <span>Best Regards,</span><br>
                <span>TradeX Team</span><br>
            `
        }).then(() => {
            console.log("Email sent to new admin");
        }).catch((error) => {
            console.error("Error sending email to new admin:", error);
        });

        res.status(201).json(newAdmin);
    } catch (error) {
        console.error("Error saving admin:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAdmin = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    const AdminId = req.params.id;

    try {
        const AdminToDelete = await AdminRepo.findOne({
            where: {
                AdminId: AdminId,
            },
        })

        if (!AdminToDelete) {
            return res.status(404).json({message: 'Admin not found'});
        }

        await AdminRepo.remove(AdminToDelete);
        res.json({message: 'Admin deleted successfully'});
    } catch (error) {
        console.error("Error deleting Admin:", error);
        res.status(500).json({message: 'Internal server error'});
    }
};

const getAdminCount = async (req, res) => {
    const AdminRepo = dataSource.getRepository("Admin");
    try {
        const count = await AdminRepo.count();
        res.json({ count: count });
    } catch (error) {
        console.error("Error retrieving admin count:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    getAllAdmins,
    saveAdmin,
    deleteAdmin,
    getAdminCount,
    login
}