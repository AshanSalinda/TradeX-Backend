const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    register,
    login,
    refreshToken,
    logout,
    getAllUsers,
    updateUserHasTakenQuiz,
    updateUserVerifyStatus,
    profile,
    saveUserVerificationDetails,
    deleteUser
} = require('../controllers/UserController');
const dataSource = require('../config/config');
const { createAccessToken, createRefreshToken } = require('../JWT');

jest.mock('../config/config');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../JWT');

const app = express();
app.use(express.json());
app.post('/register', register);
app.post('/login', login);
app.post('/refresh-token', refreshToken);
app.post('/logout', logout);
app.get('/users', getAllUsers);
app.put('/users/quiz/:id', updateUserHasTakenQuiz);
app.put('/users/verify', updateUserVerifyStatus);
app.get('/profile', profile);
app.post('/users/verify', saveUserVerificationDetails);
app.delete('/users/:id', deleteUser);

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {

        it('should return 400 if there is an error', async () => {
            bcrypt.hash.mockRejectedValue(new Error('Hashing error'));
            const newUser = { userName: 'testuser', password: 'password', email: 'test@example.com', isVerified: false, hasTakenQuiz: false, level: 1 };

            const res = await request(app).post('/register').send(newUser);
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Hashing error');
        });
    });

    describe('login', () => {
        it('should log in a user', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            bcrypt.compare.mockResolvedValue(true);
            createAccessToken.mockReturnValue('accessToken');
            createRefreshToken.mockReturnValue('refreshToken');

            const user = { userId: 1, userName: 'testuser', email: 'test@example.com', password: 'hashedPassword', isVerified: false, hasTakenQuiz: false, level: 1, role: 'User' };
            userRepo.findOne.mockResolvedValue(user);

            const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'password' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Logged in');
            expect(res.body.accessToken).toEqual('accessToken');
            expect(res.body.user).toEqual({
                id: 1,
                userName: 'testuser',
                email: 'test@example.com',
                isVerified: false,
                hasTakenQuiz: false,
                level: 1,
                role: 'User'
            });
        });

        it('should return 400 if the user does not exist', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.findOne.mockResolvedValue(null);

            const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'password' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual("User doesn't exist");
        });

        it('should return 400 if the password is incorrect', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            bcrypt.compare.mockResolvedValue(false);

            const user = { userId: 1, userName: 'testuser', email: 'test@example.com', password: 'hashedPassword', isVerified: false, hasTakenQuiz: false, level: 1, role: 'User' };
            userRepo.findOne.mockResolvedValue(user);

            const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'password' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual("Wrong Username and Password Combination!");
        });
    });


    describe('logout', () => {
        it('should log out a user', async () => {
            const res = await request(app).post('/logout');
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Logged out successfully');
        });
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const userRepo = { find: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            const users = [{ userId: 1, userName: 'testuser', email: 'test@example.com' }];
            userRepo.find.mockResolvedValue(users);

            const res = await request(app).get('/users');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(users);
        });

        it('should return 500 if there is an error', async () => {
            const userRepo = { find: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.find.mockRejectedValue(new Error('Error fetching users'));

            const res = await request(app).get('/users');
            expect(res.statusCode).toEqual(500);
            expect(res.body.message).toEqual('Internal server error');
        });
    });

    describe('updateUserHasTakenQuiz', () => {
        it('should update the user quiz status', async () => {
            const userRepo = { findOne: jest.fn(), save: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);

            const user = { userId: 1, hasTakenQuiz: false };
            userRepo.findOne.mockResolvedValue(user);

            const res = await request(app).put('/users/quiz/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('User quiz status updated successfully');
            expect(user.hasTakenQuiz).toEqual(true);
            expect(userRepo.save).toHaveBeenCalledWith(user);
        });

        it('should return 404 if user is not found', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.findOne.mockResolvedValue(null);

            const res = await request(app).put('/users/quiz/1');
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });

        it('should return 500 if there is an error', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.findOne.mockRejectedValue(new Error('Error updating user quiz status'));

            const res = await request(app).put('/users/quiz/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body.message).toEqual('Internal server error');
        });
    });

    describe('updateUserVerifyStatus', () => {
        it('should update the user verify status', async () => {
            const userRepo = { findOne: jest.fn(), save: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);

            const user = { userId: 1, role: 'User' };
            userRepo.findOne.mockResolvedValue(user);

            const res = await request(app).put('/users/verify').send({ id: 1, status: 'Yes' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('User verify status updated successfully');
            expect(user.role).toEqual('Trader');
            expect(userRepo.save).toHaveBeenCalledWith(user);
        });

        it('should return 404 if user is not found', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.findOne.mockResolvedValue(null);

            const res = await request(app).put('/users/verify').send({ id: 1, status: 'Yes' });
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });

        it('should return 500 if there is an error', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.findOne.mockRejectedValue(new Error('Error updating user verify status'));

            const res = await request(app).put('/users/verify').send({ id: 1, status: 'Yes' });
            expect(res.statusCode).toEqual(500);
            expect(res.body.message).toEqual('Internal server error');
        });
    });

    describe('profile', () => {
        it('should return profile', async () => {
            const res = await request(app).get('/profile');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual('profile');
        });
    });


    describe('deleteUser', () => {
        it('should delete a user', async () => {
            const userRepo = { findOne: jest.fn(), remove: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);

            const user = { userId: 1 };
            userRepo.findOne.mockResolvedValue(user);

            const res = await request(app).delete('/users/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('User deleted successfully');
            expect(userRepo.remove).toHaveBeenCalledWith(user);
        });

        it('should return 404 if user is not found', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.findOne.mockResolvedValue(null);

            const res = await request(app).delete('/users/1');
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('User not found');
        });

        it('should return 500 if there is an error', async () => {
            const userRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(userRepo);
            userRepo.findOne.mockRejectedValue(new Error('Error deleting user'));

            const res = await request(app).delete('/users/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body.message).toEqual('Internal server error');
        });
    });
});
