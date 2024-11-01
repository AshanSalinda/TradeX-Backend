const request = require('supertest');
const express = require('express');
const {
    getPortfolioData,
    getBalance,
    releaseAsset,
    executeTrade,
    allocateUSD,
    receiveFromEx,
    deductAsset,
    transferAsset
} = require('../controllers/AssetController');
const assetService = require('../services/AssetService');
const WalletAddressService = require('../services/WalletAddressService');
const { updateTransactionHistory } = require('../controllers/TransactionHistoryController');
const dataSource = require('../config/config');

jest.mock('../services/AssetService');
jest.mock('../services/WalletAddressService');
jest.mock('../controllers/TransactionHistoryController');
jest.mock('../config/config');

const app = express();
app.use(express.json());

describe('Portfolio Controller', () => {
    describe('getPortfolioData', () => {

        it('should return 404 if assets are not found for a userId', async () => {
            const mockReq = {
                query: { userId: 'user1' },
                params: { wallet: 'overview' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            assetService.getAssetsWithMarketPrice.mockResolvedValue(null);

            await getPortfolioData(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Assets not found' });
        });

        it('should return 400 if invalid wallet type is provided', async () => {
            const mockReq = {
                query: { userId: 'user1' },
                params: { wallet: 'invalidWallet' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPortfolioData(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid request' });
        });

        it('should return 404 if userId is not provided', async () => {
            const mockReq = {
                query: {},
                params: { wallet: 'overview' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getPortfolioData(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'User Id not found' });
        });

        it('should handle errors and return 500', async () => {
            const mockReq = {
                query: { userId: 'user1' },
                params: { wallet: 'overview' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            assetService.getAssetsWithMarketPrice.mockRejectedValue(new Error('Asset service error'));

            await getPortfolioData(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Asset service error' });
        });
    });

    describe('getBalance', () => {
        it('should return asset balances for a valid userId and coin', async () => {
            const mockReq = {
                params: { userId: 'user1', coin: 'BTC' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const mockAssets = [
                { symbol: 'BTC', tradingBalance: 10, AvgPurchasePrice: 45000 }
            ];

            assetService.getAssets.mockResolvedValue(mockAssets);

            await getBalance(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockAssets.map(asset => ({
                symbol: asset.symbol,
                balance: asset.tradingBalance,
                avgPurchasePrice: asset.AvgPurchasePrice
            })));
        });

        it('should return 404 if assets are not found for a userId and coin', async () => {
            const mockReq = {
                params: { userId: 'user1', coin: 'BTC' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            assetService.getAssets.mockResolvedValue(null);

            await getBalance(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Asset not found' });
        });

        it('should return 400 if invalid parameters are provided', async () => {
            const mockReq = {
                params: { userId: 'user1' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await getBalance(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid Request' });
        });

        it('should handle errors and return 500', async () => {
            const mockReq = {
                params: { userId: 'user1', coin: 'BTC' }
            };

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            assetService.getAssets.mockRejectedValue(new Error('Asset service error'));

            await getBalance(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Asset service error' });
        });
    });

    // Add tests for other functions (releaseAsset, executeTrade, allocateUSD, receiveFromEx, deductAsset, transferAsset) here
});

