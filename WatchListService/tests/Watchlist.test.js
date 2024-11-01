const request = require('supertest');
const express = require('express');
const dataSource = require('../config/config');
const { getAllCoins, saveCoins, deleteCoins } = require('../controllers/WatchListController');

jest.mock('../config/config');

const app = express();
app.use(express.json());
app.get('/coins', getAllCoins);
app.post('/coins', saveCoins);
app.delete('/coins/:id', deleteCoins);

describe('Watchlist Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCoins', () => {
        it('should return all coins', async () => {
            const coinsRepo = { find: jest.fn() };
            dataSource.getRepository.mockReturnValue(coinsRepo);
            const coins = [{ coinId: 1, name: 'Bitcoin' }];
            coinsRepo.find.mockResolvedValue(coins);

            const res = await request(app).get('/coins');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(coins);
        });

    });


    describe('deleteCoins', () => {
        it('should delete a coin', async () => {
            const coinsRepo = { findOne: jest.fn(), delete: jest.fn() };
            dataSource.getRepository.mockReturnValue(coinsRepo);

            const coin = { coinId: 1, name: 'Bitcoin' };
            coinsRepo.findOne.mockResolvedValue(coin);

            const res = await request(app).delete('/coins/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Coins deleted successfully');
            expect(coinsRepo.delete).toHaveBeenCalledWith(coin);
        });

        it('should return 404 if coin is not found', async () => {
            const coinsRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(coinsRepo);
            coinsRepo.findOne.mockResolvedValue(null);

            const res = await request(app).delete('/coins/1');
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toEqual('Coins not found');
        });

        it('should return 500 if there is an error', async () => {
            const coinsRepo = { findOne: jest.fn() };
            dataSource.getRepository.mockReturnValue(coinsRepo);
            coinsRepo.findOne.mockRejectedValue(new Error('Error deleting coin'));

            const res = await request(app).delete('/coins/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body.message).toEqual('Internal server error');
        });
    });
});
