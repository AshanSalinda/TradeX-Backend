const dataSource = require("../config/config");
const bcrypt = require("bcrypt");
const { createAccessToken, createRefreshToken } = require("../JWT");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const userRepository = dataSource.getRepository("User");
    const user = userRepository.create({
      userName: username,
      email: email,
      password: hash,
      issue: "",
      hasTakenQuiz: false,
      level:"",
      role: "User",
    });
    await userRepository.save(user);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie("refresh-token", refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    const userDetail = {
        id: user.userId,
        userName: user.userName,
        email: user.email,
        hasTakenQuiz: user.hasTakenQuiz,
        role: user.role,
    }

    res.json({ message: "Logged in", accessToken, user: userDetail });
  } catch (err) {
    res.status(400).json({ message: "Error registering user" });
  }
};

const login = async (req, res) => {
  const userRepository = dataSource.getRepository("User");
  const { email, password } = req.body;
  const user = await userRepository.findOne({ where: { email: email } });

  if (!user) {
    return res.status(400).json({ message: "Incorrect E-mail address" });
  }

  const dbPassword = user.password;
  const match = await bcrypt.compare(password, dbPassword);

  if (!match) {
    return res
      .status(400)
      .json({ message: "Wrong Username and Password Combination!" });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  res.cookie("refresh-token", refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  const userDetail = {
    id: user.userId,
    userName: user.userName,
    email: user.email,
    hasTakenQuiz: user.hasTakenQuiz,
    role: user.role,
  };

  res.json({ message: "Logged in", accessToken, user: userDetail });
};

const refreshToken = async (req, res) => {
  const userRepository = dataSource.getRepository("User");
  const refreshToken = req.cookies["refresh-token"];
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token not found" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await userRepository.findOne({
      where: { userId: decoded.userId },
    });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    const newAccessToken = createAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};

const logout = (req, res) => {
  res.clearCookie("refresh-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

const updateUserHasTakenQuiz = async (req, res) => {
  const userRepo = dataSource.getRepository("User");
  const userId = req.params.id;

  try {
    const user = await userRepo.findOne({ where: { userId: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.hasTakenQuiz = true;
    await userRepo.save(user);

    res.json({ message: "User quiz status updated successfully" });
  } catch (error) {
    console.error("Error updating user quiz status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserVerifyStatus = async (req, res) => {
  const userRepo = dataSource.getRepository("User");
  const userId = req.body.id;
  const status = req.body.status;

  try {
    const user = await userRepo.findOne({ where: { userId: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = status;

    await userRepo.save(user);

    res.json({ message: "User verify status updated successfully" });
  } catch (error) {
    console.error("Error updating user quiz status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const profile = async (req, res) => {
  res.json("profile");
};

const saveUserVerificationDetails = async (req, res) => {
  const verifyRepo = dataSource.getRepository("UserVerificationDetail");
  const verifySave = verifyRepo.save(req.body);
  res.json(verifySave);
};

const deleteUser = async (req, res) => {
  const userRepo = dataSource.getRepository("User");
  const userId = req.params.id;

  try {
    const userToDelete = await userRepo.findOne({
      where: {
        userId: userId,
      },
    });

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRepo.remove(userToDelete);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getEmailById = async (req, res) => {
  try{
    const userRepo = dataSource.getRepository("User");
    const id = req.params.id;

    const user = await userRepo.findOne({ where: { userId: id } });

    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ email: user.email });
  }

  catch (error) {
    console.error("Error getting email", error);
    res.status(500).json({ message: "Getting Email failed" });
  }

}

module.exports = {
  deleteUser,
  saveUserVerificationDetails,
  register,
  login,
  profile,
  updateUserHasTakenQuiz,
  updateUserVerifyStatus,
  refreshToken,
  logout,
  getEmailById
};
