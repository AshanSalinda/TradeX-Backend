require('dotenv').config();
const CryptoJS = require('crypto-js');
const { generateWalletAddress, getWalletAddress, getUserId, getUserName } = require('../controllers/WalletAddress');
const dataSource = require('../config/config');
const secretKey = process.env.SECRET_KEY;

jest.mock('../config/config');
jest.mock('crypto-js');

const mockUserId = '1';
const mockUserName = 'testUser';
const mockWalletAddress = 'mockedWalletAddress';
const mockIv = 'mockedIv';

// Mock repository functions
const addressRepo = {
    exists: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn()
};

dataSource.getRepository.mockReturnValue(addressRepo);

describe('CryptoWalletController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateWalletAddress', () => {

        it('should generate a new wallet address', async () => {
            const req = { body: { userId: mockUserId, userName: mockUserName } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            CryptoJS.lib.WordArray.random = jest.fn(() => mockIv);
            CryptoJS.AES.encrypt = jest.fn(() => ({ toString: () => mockWalletAddress }));

            addressRepo.exists.mockResolvedValue(false);
            await generateWalletAddress(req, res);
            expect(addressRepo.exists).toHaveBeenCalled();
            expect(addressRepo.save).toHaveBeenCalledWith({ userId: mockUserId, walletAddress: mockWalletAddress });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ walletAddress: mockWalletAddress });
        });

        it('should call generateWalletAddress again if wallet address already exists', async () => {
            const req = { body: { userId: mockUserId, userName: mockUserName } };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            CryptoJS.lib.WordArray.random = jest.fn(() => mockIv);
            CryptoJS.AES.encrypt = jest.fn(() => ({ toString: () => mockWalletAddress }));

            addressRepo.exists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
            addressRepo.save.mockResolvedValueOnce();

            await generateWalletAddress(req, res);
            expect(addressRepo.exists).toHaveBeenCalledTimes(2);
            expect(addressRepo.save).toHaveBeenCalledWith({ userId: mockUserId, walletAddress: mockWalletAddress });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ walletAddress: mockWalletAddress });
        });
    });

    describe('getWalletAddress', () => {
        it('should return wallet address for a given userId', async () => {
            addressRepo.findOne.mockResolvedValue({ walletAddress: mockWalletAddress });

            const result = await getWalletAddress(mockUserId);
            expect(addressRepo.findOne).toHaveBeenCalledWith({ where: { userId: mockUserId } });
            expect(result).toBe(mockWalletAddress);
        });

        it('should return null if wallet address not found', async () => {
            addressRepo.findOne.mockResolvedValue(null);

            const result = await getWalletAddress(mockUserId);
            expect(addressRepo.findOne).toHaveBeenCalledWith({ where: { userId: mockUserId } });
            expect(result).toBeNull();
        });
    });

    describe('getUserId', () => {
        it('should return userId for a given wallet address', async () => {
            // Mock data and functions
            const mockUserId = 1; // Example userId
            const mockWalletAddress = '0x123abc'; // Example wallet address
            const addressRepo = {
                findOne: jest.fn().mockResolvedValue({ userId: mockUserId })
            };
            dataSource.getRepository.mockReturnValue(addressRepo);

            // Call the function to test
            const result = await getUserId(mockWalletAddress);

            // Assertions
            expect(addressRepo.findOne).toHaveBeenCalledWith({ where: { walletAddress: mockWalletAddress } });
            expect(result).toBe(mockUserId);
        });

    });

    describe('getUserName', () => {
        it('should return userName for a given wallet address', async () => {
            const decryptedUserName = 'testUser:randomString';
            CryptoJS.AES.decrypt.mockReturnValue({ toString: jest.fn(() => decryptedUserName) });

            const result = await getUserName(mockWalletAddress);
            expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith(mockWalletAddress, secretKey);
            expect(result).toBe(mockUserName);
        });

        it('should return null if decryption fails', async () => {
            CryptoJS.AES.decrypt.mockImplementation(() => { throw new Error('Decryption error'); });

            const result = await getUserName(mockWalletAddress);
            expect(result).toBeNull();
        });
    });
});
