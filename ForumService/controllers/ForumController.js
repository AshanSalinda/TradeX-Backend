const express = require("express");
const dataSource = require("../config/config");
const { removeLike } = require("./AnswerController");
const WebSocket = require("ws");
let wss;

const getAllQuestions = async (req, res) => {
  const QuestionRepo = dataSource.getRepository("Forum-question");
  res.json(await QuestionRepo.find());
};

const getQuestionsByUserId = async (req, res) => {
  const userId = req.params.userId;

  if (!userId || isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "Invalid or missing userId" });
  }

  const parsedUserId = parseInt(userId, 10);
  const QuestionRepo = dataSource.getRepository("Forum-question");

  try {
    const questions = await QuestionRepo.find({
      where: { userId: parsedUserId },
    });
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions by userId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getQuestionsByQuestionId = async (req, res) => {
  const questionId = req.params.questionId;

  if (!questionId || isNaN(parseInt(questionId, 10))) {
    return res.status(400).json({ message: "Invalid or missing questionId" });
  }

  const parsedQuestionId = parseInt(questionId, 10);
  const QuestionRepo = dataSource.getRepository("Forum-question");

  try {
    const questions = await QuestionRepo.find({
      where: { questionId: parsedQuestionId },
    });
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions by questionId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const saveQuestion = async (req, res) => {
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const Questionsave = QuestionRepo.save(req.body);
  res.json(Questionsave);
};

const deleteQuestion = async (req, res) => {
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const QuestionId = req.params.id;

  try {
    const QuestionToDelete = await QuestionRepo.findOne({
      where: {
        QuestionId: QuestionId,
      },
    });

    if (!QuestionToDelete) {
      return res.status(404).json({ message: "Forum-question not found" });
    }

    await QuestionRepo.remove(QuestionToDelete);
    res.json({ message: "Forum-question deleted successfully" });
  } catch (error) {
    console.error("Error deleting Forum-question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// //add like
// const addLike = async (req, res, next) => {
//   const questionId = parseInt(req.params.qid);
//   const userId = parseInt(req.params.uid);

//   try {
//     const PostRepo = dataSource.getRepository("Forum-addlikes");

//     // Find the post by its ID
//     let post = await PostRepo.findOne({ where: { questionId: questionId } });

//     if (!post) {
//       // If the post does not exist, create a new entry with the likes array
//       post = PostRepo.create({ questionId: questionId, likes: [userId] });
//     } else {
//       // If the post exists, update the likes array
//       if (!post.likes.includes(userId)) {
//         post.likes.push(userId);
//       } else {
//         return res
//           .status(400)
//           .json({ success: false, message: "User already liked this post" });
//       }
//     }

//     await PostRepo.save(post);

//     // Emit the updated likes if needed
//     main.io.emit("add-like", post);

//     res.status(200).json({
//       success: true,
//       post,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
const webSocketStart = async () => {
  try {
    wss = new WebSocket.Server({ port: 8083 });
    wss.on("connection", (ws) => {
      console.log("WebSocket connection established with client");
    });
  } catch (error) {
    console.log("Error starting webSocket", error);
  }
};

const like = async (req, res) => {
  try {
    const { isLike, userId, questionId } = req.body;
    if (isLike === undefined || !userId || !questionId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const LikeRepo = dataSource.getRepository("Like");
    const QuestionRepo = dataSource.getRepository("Forum-question");

    const isLiked = await LikeRepo.findOne({ where: { userId, questionId } });
    const question = await QuestionRepo.findOne({ where: { questionId } });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (isLike) {
      if (!isLiked) {
        await LikeRepo.save({ userId, questionId });
        question.likes = question.likes + 1;
        await QuestionRepo.save(question);
      }
    } else {
      if (isLiked) {
        await LikeRepo.remove(isLiked);
        question.likes = question.likes - 1;
        QuestionRepo.save(question);
      }
    }

    const likeCount = await LikeRepo.count({ where: { questionId } });

    likeDetail = {
      questionId: questionId,
      likeCount: likeCount,
    };

    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: "liked", likeDetail }));
    });

    res.status(200).json({ likeCount });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const userIsLiked = async (req, res) => {
  const { userId, questionId } = req.body;
  const LikeRepo = dataSource.getRepository("Like");
  const isLiked = await LikeRepo.findOne({ where: { userId, questionId } });

  const DiLikeRepo = dataSource.getRepository("Dislike");
  const isDisLiked = await DiLikeRepo.findOne({
    where: { userId, questionId },
  });
  res.json({
    like: isLiked ? true : false,
    dislike: isDisLiked ? true : false,
  });
};

const userIsViewd = async (req, res) => {
  const { questionId } = req.body;
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const question = await QuestionRepo.findOne({ where: { questionId } });
  question.views = question.views + 1;
  QuestionRepo.save(question);
  res.json({ message: "view added sucessfully" });
};

const dislike = async (req, res) => {
  try {
    const { isDislike, userId, questionId } = req.body;
    if (isDislike === undefined || !userId || !questionId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const DislikeRepo = dataSource.getRepository("Dislike");
    const QuestionRepo = dataSource.getRepository("Forum-question");

    const isDisliked = await DislikeRepo.findOne({
      where: { userId, questionId },
    });
    const question = await QuestionRepo.findOne({ where: { questionId } });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (isDislike) {
      if (!isDisliked) {
        await DislikeRepo.save({ userId, questionId });
        question.dislike = question.dislike + 1;
        await QuestionRepo.save(question);
      }
    } else {
      if (isDisliked) {
        await DislikeRepo.remove(isDisliked);
        question.dislike = question.dislike - 1;
        await QuestionRepo.save(question);
      }
    }

    const dislikeCount = await DislikeRepo.count({ where: { questionId } });

    disLikeDetail = {
      questionId: questionId,
      likeCount: dislikeCount,
    };

    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: "disLiked", disLikeDetail }));
    });

    res.status(200).json({ dislikeCount });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Adding favorites
const addFavorite = async (req, res) => {
  const { userId, questionId, title } = req.body;
  try {
    const FavoriteRepo = dataSource.getRepository("Favourites"); // Use the Favourites entity schema
    const existingFavorite = await FavoriteRepo.findOne({
      where: { userId, questionId },
    });

    if (existingFavorite) {
      // Remove favorite
      await FavoriteRepo.remove(existingFavorite);
      res.status(200).json({ message: "Favorite removed" });
    } else {
      // Add favorite
      const newFavorite = await FavoriteRepo.save({
        userId,
        questionId,
        title,
      });
      await FavoriteRepo.save(newFavorite);
      res.status(200).json(newFavorite);
    }
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: error.message });
  }
};
// Getting favorites by userId
const getFavoritesByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const FavoriteRepo = dataSource.getRepository("Favourites");
    const favorites = await FavoriteRepo.find({ where: { userId } });

    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllQuestions,
  saveQuestion,
  deleteQuestion,
  getQuestionsByUserId,
  getQuestionsByQuestionId,
  addFavorite,
  getFavoritesByUserId,
  like,
  dislike,
  removeLike,
  userIsLiked,
  userIsViewd,
  webSocketStart,
};
