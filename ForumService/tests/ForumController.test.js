const request = require('supertest');
const express = require('express');
const {
    getAllQuestions,
    saveQuestion,
    deleteQuestion,
    getQuestionsByUserId,
    getQuestionsByQuestionId,
    addFavorite,
    getFavoritesByUserId,
    addLike,
    removeLike
} = require('../controllers/ForumController');
const dataSource = require('../config/config');

jest.mock('../config/config');

const app = express();
app.use(express.json());

app.get('/questions', getAllQuestions);
app.get('/questions/user/:userId', getQuestionsByUserId);
app.get('/questions/:questionId', getQuestionsByQuestionId);
app.post('/questions', saveQuestion);
app.delete('/questions/:id', deleteQuestion);
app.post('/questions/:qid/like/:uid', addLike);
app.post('/questions/:id/unlike', removeLike);
app.post('/questions/favorite', addFavorite);
app.get('/favorites/:userId', getFavoritesByUserId);

describe('Forum Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllQuestions', () => {
        it('should return all questions', async () => {
            const mockQuestions = [
                { QuestionId: 1, Title: 'Question One', Content: 'Content One', userId: 1 },
                { QuestionId: 2, Title: 'Question Two', Content: 'Content Two', userId: 2 }
            ];
            const QuestionRepo = { find: jest.fn().mockResolvedValue(mockQuestions) };
            dataSource.getRepository.mockReturnValue(QuestionRepo);

            const res = await request(app).get('/questions');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockQuestions);
        });
    });

    // Continue with the rest of the tests...

    describe('getQuestionsByUserId', () => {
        it('should return questions by user id', async () => {
            const userId = 1;
            const mockQuestions = [
                { QuestionId: 1, Title: 'Question One', Content: 'Content One', userId: userId }
            ];
            const QuestionRepo = { find: jest.fn().mockResolvedValue(mockQuestions) };
            dataSource.getRepository.mockReturnValue(QuestionRepo);

            const res = await request(app).get(`/questions/user/${userId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockQuestions);
        });
    });

    describe('getQuestionsByQuestionId', () => {
        it('should return question by question id', async () => {
            const questionId = 1;
            const mockQuestion = { QuestionId: questionId, Title: 'Question One', Content: 'Content One', userId: 1 };
            const QuestionRepo = { find: jest.fn().mockResolvedValue([mockQuestion]) };
            dataSource.getRepository.mockReturnValue(QuestionRepo);

            const res = await request(app).get(`/questions/${questionId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([mockQuestion]);
        });
    });

    describe('deleteQuestion', () => {

        it('should return 500 if there is an error', async () => {
            const QuestionRepo = { findOne: jest.fn().mockRejectedValue(new Error('Error deleting question')) };
            dataSource.getRepository.mockReturnValue(QuestionRepo);

            const res = await request(app).delete('/questions/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('addLike', () => {

        it('should return 400 if user already liked the question', async () => {
            const questionId = 1;
            const userId = 1;
            const mockPost = { questionId, likes: [userId] };
            const PostRepo = { findOne: jest.fn().mockResolvedValue(mockPost) };
            dataSource.getRepository.mockReturnValue(PostRepo);

            const res = await request(app).post(`/questions/${questionId}/like/${userId}`);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ success: false, message: 'User already liked this post' });
        });

    });


    describe('addFavorite', () => {
        it('should add a question to favorites', async () => {
            const newFavorite = { userId: 1, questionId: 1, title: 'Favorite Question' };
            const savedFavorite = { id: 1, ...newFavorite };
            const FavoriteRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn().mockResolvedValue(savedFavorite) };
            dataSource.getRepository.mockReturnValue(FavoriteRepo);

            const res = await request(app).post('/questions/favorite').send(newFavorite);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(savedFavorite);
        });

        it('should remove a question from favorites if already favorited', async () => {
            const existingFavorite = { id: 1, userId: 1, questionId: 1, title: 'Favorite Question' };
            const FavoriteRepo = { findOne: jest.fn().mockResolvedValue(existingFavorite), remove: jest.fn().mockResolvedValue() };
            dataSource.getRepository.mockReturnValue(FavoriteRepo);

            const res = await request(app).post('/questions/favorite').send({ userId: 1, questionId: 1, title: 'Favorite Question' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Favorite removed' });
        });

        it('should return 500 if there is an error', async () => {
            const newFavorite = { userId: 1, questionId: 1, title: 'Favorite Question' };
            const FavoriteRepo = { findOne: jest.fn().mockRejectedValue(new Error('Error handling favorite')) };
            dataSource.getRepository.mockReturnValue(FavoriteRepo);

            const res = await request(app).post('/questions/favorite').send(newFavorite);
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error handling favorite' });
        });
    });

    describe('getFavoritesByUserId', () => {
        it('should return favorites by user id', async () => {
            const userId = 1;
            const mockFavorites = [
                { id: 1, userId: userId, questionId: 1, title: 'Favorite Question One' }
            ];
            const FavoriteRepo = { find: jest.fn().mockResolvedValue(mockFavorites) };
            dataSource.getRepository.mockReturnValue(FavoriteRepo);

            const res = await request(app).get(`/favorites/${userId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockFavorites);
        });

        it('should return 500 if there is an error', async () => {
            const userId = 1;
            const FavoriteRepo = { find: jest.fn().mockRejectedValue(new Error('Error retrieving favorites')) };
            dataSource.getRepository.mockReturnValue(FavoriteRepo);

            const res = await request(app).get(`/favorites/${userId}`);
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ error: 'Error retrieving favorites' });
        });
    });
});
