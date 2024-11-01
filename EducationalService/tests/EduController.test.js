const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { getAllEduResources, getFavEduResources, saveEduResources, favorite } = require('../controllers/EduController');

jest.mock('../config/config');
const dataSource = require('../config/config');
const eduRepo = { createQueryBuilder: jest.fn(), findOne: jest.fn(), save: jest.fn() };
const favRepo = { findOne: jest.fn(), save: jest.fn(), remove: jest.fn() };

dataSource.getRepository.mockImplementation(repo => (repo === 'EduResources' ? eduRepo : favRepo));

const app = express();
app.use(bodyParser.json());
app.get('/edu/:userId', getAllEduResources);
app.get('/edu/fav/:userId', getFavEduResources);
app.post('/edu', saveEduResources);
app.post('/edu/favorite', favorite);

describe('Education Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllEduResources', () => {

        it('should return 500 if there is an error', async () => {
            eduRepo.createQueryBuilder.mockImplementation(() => {
                throw new Error('Error getting resource');
            });

            const res = await request(app).get('/edu/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Error getting resource' });
        });
    });

    describe('getFavEduResources', () => {


        it('should return 500 if there is an error', async () => {
            eduRepo.createQueryBuilder.mockImplementation(() => {
                throw new Error('Error getting resource');
            });

            const res = await request(app).get('/edu/fav/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Error getting resource' });
        });
    });

    describe('saveEduResources', () => {

        it('should return 400 if any field is missing', async () => {
            const newResource = { title: 'Title', description: 'Description', image: 'http://example.com/image.jpg' };
            const res = await request(app).post('/edu').send(newResource);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid request' });
        });

        it('should return 500 if there is an error', async () => {
            const newResource = { title: 'Title', description: 'Description', url: 'http://example.com', image: 'http://example.com/image.jpg' };
            eduRepo.findOne.mockImplementation(() => {
                throw new Error('Error saving resource');
            });

            const res = await request(app).post('/edu').send(newResource);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Error saving resource' });
        });
    });

    describe('favorite', () => {

        it('should return 400 if request is invalid', async () => {
            const favResource = { eduId: 1, isFavorite: true };
            const res = await request(app).post('/edu/favorite').send(favResource);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'invalid request' });
        });

        it('should return 500 if there is an error', async () => {
            const favResource = { eduId: 1, userId: '1', isFavorite: true };
            eduRepo.findOne.mockImplementation(() => {
                throw new Error('Error in favorite resource');
            });

            const res = await request(app).post('/edu/favorite').send(favResource);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Error in favorite resource' });
        });
    });
});
