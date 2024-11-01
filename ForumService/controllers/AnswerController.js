const dataSource = require("../config/config"); // Assuming dataSource is where your TypeORM connection is established
const main = require("../index");

const stripHtmlTags = (str) => {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
};

// save answer
const saveAnswer = async (req, res) => {
  const AnswerRepo = dataSource.getRepository("Forum-answers");
  const QuestionRepo = dataSource.getRepository("Forum-question");
  const Answersave = AnswerRepo.save(req.body);
  const question = await QuestionRepo.findOne({
    where: { questionId: req.body.questionId },
  });
  question.replies = question.replies + 1;
  QuestionRepo.save(question);
  res.json(Answersave);
};

//get answer by question id
const getAnswersByQuestionId = async (req, res) => {
  const questionId = req.params.questionId;
  console.log("Received questionId:", questionId);

  const parsedQuestionId = parseInt(questionId, 10);

  if (isNaN(parsedQuestionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid questionId" });
  }

  const AnswerRepo = dataSource.getRepository("Forum-answers");

  try {
    const answers = await AnswerRepo.find({
      where: { questionId: parsedQuestionId },
    });

    res.json(answers);
  } catch (error) {
    console.error("Error fetching answers by questionId:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// get answer by userId
const getAnswersByUserId = async (req, res) => {
  const userId = parseInt(req.params.userId, 10); // Ensure userId is an integer

  console.log("Received userId:", userId); // Log to verify

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "Invalid userId" });
  }

  try {
    const AnswerRepo = dataSource.getRepository("Forum-answers");
    const answers = await AnswerRepo.find({
      where: { userId: userId },
    });
    res.json(answers);
  } catch (error) {
    console.error("Error fetching answers by userId:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// get answer by answer id

const getAnswer = async (req, res) => {
  const answerId = req.params.answerId;

  try {
    const AnswerRepo = dataSource.getRepository("Forum-answers");
    const answer = await AnswerRepo.findOne({ where: { answerId: answerId } });

    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    res.json(answer);
  } catch (error) {
    console.error("Error fetching answer by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// In your controller file

const updateAnswer = async (req, res) => {
  const answerId = req.params.answerId;
  const { comment } = req.body; // Adjust based on what fields are being updated

  try {
    const AnswerRepo = dataSource.getRepository("Forum-answers");
    const answer = await AnswerRepo.findOne({ where: { answerId: answerId } });

    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    answer.comment = comment; // Update the necessary fields
    await AnswerRepo.save(answer);

    res.json(answer);
  } catch (error) {
    console.error("Error updating answer:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete answer
const deleteAnswer = async (req, res) => {
  const answerId = req.params.answerId;

  try {
    const AnswerRepo = dataSource.getRepository("Forum-answers");
    const answer = await AnswerRepo.findOne({ where: { answerId: answerId } });
    const questionId = answer.questionId;
    if (!answer) {
      return res
        .status(404)
        .json({ success: false, message: "Answer not found" });
    }

    await AnswerRepo.remove(answer);
    const QuestionRepo = dataSource.getRepository("Forum-question");
    const question = await QuestionRepo.findOne({
      where: { questionId },
    });
    question.replies = question.replies - 1;
    QuestionRepo.save(question);

    res
      .status(200)
      .json({ success: true, message: "Answer deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//add like
const addLike = async (req, res, next) => {
  const postId = req.params.qid;
  const userId = req.params.uid; // Assuming user ID is available in req.user

  try {
    const PostRepo = dataSource.getRepository("Forum-answers");

    // Find the post by its ID
    const post = await PostRepo.findOne({ where: { answerId: postId } });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Add the user ID to the likes set if it's not already present
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await PostRepo.save(post);
    }

    // Retrieve all posts, sorted by creation date
    const posts = await PostRepo.find({
      order: {
        createdAt: "DESC",
      },
      relations: ["postedBy"], // Assuming postedBy is a relation in your entity
    });

    // Emit the updated posts
    main.io.emit("add-like", posts);

    res.status(200).json({
      success: true,
      post,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

//remove like
exports.removeLike = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    );

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name");
    main.io.emit("remove-like", posts);

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveAnswer,
  getAnswersByQuestionId,
  getAnswersByUserId,
  getAnswer,
  updateAnswer,
  deleteAnswer,
  addLike,

  // Other exported functions for answers
};
