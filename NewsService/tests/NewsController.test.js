const request = require('supertest');
const express = require('express');
const { getAllNews, saveNews, deleteNews } = require('../controllers/NewsController');
const dataSource = require('../config/config');
const axios = require('axios');

jest.mock('axios');
jest.mock('../config/config');

const app = express();
app.use(express.json());
app.get('/news/:userId', getAllNews);
app.delete('/news/:id', deleteNews);

describe('News Controller', () => {
    describe('getAllNews', () => {
        it('should return news with status 200', async () => {
            const mockNews = [{ newsId: 1, title: 'Test News', description: 'Description', url: 'http://example.com', image: 'http://example.com/image.jpg', publishedAt: '2023-06-25', likeCount: 0, dislikeCount: 0, isLiked: false, isDisliked: false, isFavorite: false }];
            const newsRepo = {
                createQueryBuilder: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    orderBy: jest.fn().mockReturnThis(),
                    setParameter: jest.fn().mockReturnThis(),
                    getRawMany: jest.fn().mockResolvedValue(mockNews)
                })
            };

            dataSource.getRepository.mockReturnValue(newsRepo);

            const res = await request(app).get('/news/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockNews);
        });


        it('should return 500 if there is an error', async () => {
            const newsRepo = {
                createQueryBuilder: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    orderBy: jest.fn().mockReturnThis(),
                    setParameter: jest.fn().mockReturnThis(),
                    getRawMany: jest.fn().mockRejectedValue(new Error('Error getting news'))
                })
            };

            dataSource.getRepository.mockReturnValue(newsRepo);

            const res = await request(app).get('/news/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: "error getting news" });
        });
    });

    describe('saveNews', () => {

        it('should log an error if saving news fails', async () => {
            console.log = jest.fn();

            const newsRepo = {
                find: jest.fn().mockResolvedValue([]),
                save: jest.fn().mockRejectedValue(new Error('Error saving news'))
            };

            dataSource.getRepository.mockReturnValue(newsRepo);

            await saveNews([]);

            expect(console.log).toHaveBeenCalledWith('error saving news', expect.any(Error));
        });
    });

    describe('deleteNews', () => {
        it('should delete news with status 200', async () => {
            const mockNews = { newsId: 1 };

            const newsRepo = {
                findOne: jest.fn().mockResolvedValue(mockNews),
                remove: jest.fn().mockResolvedValue()
            };

            dataSource.getRepository.mockReturnValue(newsRepo);

            const res = await request(app).delete('/news/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'News deleted successfully' });
        });

        it('should return 404 if news not found', async () => {
            const newsRepo = {
                findOne: jest.fn().mockResolvedValue(null)
            };

            dataSource.getRepository.mockReturnValue(newsRepo);

            const res = await request(app).delete('/news/1');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ message: 'News not found' });
        });

        it('should return 500 if there is an error', async () => {
            const newsRepo = {
                findOne: jest.fn().mockRejectedValue(new Error('Error deleting news'))
            };

            dataSource.getRepository.mockReturnValue(newsRepo);

            const res = await request(app).delete('/news/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });
});
