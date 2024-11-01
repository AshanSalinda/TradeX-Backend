const request = require('supertest');
const express = require('express');
const {
    getAllOrders,
    saveOrder,
    deleteOrder,
    getAllOrdersByType,
    updateOrderStatus,
    getAllOrdersByCoinAndCategory,
    getAllOrdersByCato,
    updateOrderTime,
    updateOrderCategory,
    getAllOrdersByIdAndCato
} = require('../controllers/OrderController');
const dataSource = require('../config/config');

jest.mock('../config/config');

const app = express();
app.use(express.json());

app.get('/order', getAllOrders);
app.post('/order', saveOrder);
app.delete('/order/:orderId', deleteOrder);
app.get('/order/type/:type', getAllOrdersByCato);
app.get('/order/:type/:id', getAllOrdersByIdAndCato);
app.get('/order/:coin/:category/:userId', getAllOrdersByCoinAndCategory);

describe('Order Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllOrders', () => {
        it('should return all orders', async () => {
            const mockOrders = [
                { orderId: 1, category: 'Electronics', orderStatus: 'Pending', userId: 1 },
                { orderId: 2, category: 'Books', orderStatus: 'Completed', userId: 2 }
            ];
            const orderRepo = { find: jest.fn().mockResolvedValue(mockOrders) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).get('/order');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockOrders);
        });
    });

    describe('saveOrder', () => {
        it('should save a new order', async () => {
            const newOrder = { category: 'Clothing', orderStatus: 'Pending', userId: 3 };
            const savedOrder = { orderId: 3, ...newOrder };
            const orderRepo = { save: jest.fn().mockResolvedValue(savedOrder) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).post('/order').send(newOrder);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(savedOrder);
        });

        it('should return 500 if there is an error', async () => {
            const newOrder = { category: 'Clothing', orderStatus: 'Pending', userId: 3 };
            const orderRepo = { save: jest.fn().mockRejectedValue(new Error('Error saving order')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).post('/order').send(newOrder);
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order', async () => {
            const orderRepo = { findOne: jest.fn().mockResolvedValue({ orderId: 1 }), remove: jest.fn().mockResolvedValue() };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).delete('/order/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Order deleted successfully' });
        });

        it('should return 404 if order not found', async () => {
            const orderRepo = { findOne: jest.fn().mockResolvedValue(null) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).delete('/order/1');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ message: 'Order not found' });
        });

        it('should return 500 if there is an error', async () => {
            const orderRepo = { findOne: jest.fn().mockRejectedValue(new Error('Error deleting order')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).delete('/order/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('getAllOrdersByCato', () => {
        it('should return orders by type', async () => {
            const mockOrders = [
                { orderId: 1, type: 'Clothing', orderStatus: 'Pending', userId: 1 }
            ];
            const orderRepo = { find: jest.fn().mockResolvedValue(mockOrders) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).get('/order/type/Clothing');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockOrders);
        });

        it('should return 500 if there is an error', async () => {
            const orderRepo = { find: jest.fn().mockRejectedValue(new Error('Error fetching orders')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).get('/order/type/Clothing');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('getAllOrdersByIdAndCato', () => {
        it('should return orders by userId and type', async () => {
            const mockOrders = [
                { orderId: 1, type: 'Clothing', orderStatus: 'Completed', userId: 1 }
            ];
            const orderRepo = { find: jest.fn().mockResolvedValue(mockOrders) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).get('/order/Clothing/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockOrders);
        });

        it('should return 500 if there is an error', async () => {
            const orderRepo = { find: jest.fn().mockRejectedValue(new Error('Error fetching orders')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).get('/order/Clothing/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('getAllOrdersByCoinAndCategory', () => {
        it('should return orders by coin, category, and userId', async () => {
            const mockOrders = [
                { orderId: 1, coin: 'Bitcoin', category: 'Electronics', orderStatus: 'Pending', userId: 1 }
            ];
            const orderRepo = { find: jest.fn().mockResolvedValue(mockOrders) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).get('/order/Bitcoin/Electronics/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockOrders);
        });

        it('should return 500 if there is an error', async () => {
            const orderRepo = { find: jest.fn().mockRejectedValue(new Error('Error fetching orders')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const res = await request(app).get('/order/Bitcoin/Electronics/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    // Tests for non-endpoint functions: getAllOrdersByType, updateOrderStatus, updateOrderCategory, and updateOrderTime
    describe('getAllOrdersByType', () => {
        it('should return orders by type and order status', async () => {
            const mockOrders = [
                { orderId: 1, category: 'Electronics', orderStatus: 'Pending' }
            ];
            const orderRepo = { find: jest.fn().mockResolvedValue(mockOrders) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            const orders = await getAllOrdersByType('Electronics', 'Pending');
            expect(orders).toEqual(mockOrders);
        });

        it('should throw an error if there is an issue', async () => {
            const orderRepo = { find: jest.fn().mockRejectedValue(new Error('Error fetching orders')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            await expect(getAllOrdersByType('Electronics', 'Pending')).rejects.toThrow('Error fetching orders');
        });
    });

    describe('updateOrderStatus', () => {
        it('should update the order status', async () => {
            const mockOrder = { orderId: 1, orderStatus: 'Pending' };
            const orderRepo = { findOne: jest.fn().mockResolvedValue(mockOrder), save: jest.fn() };
            dataSource.getRepository.mockReturnValue(orderRepo);

            await updateOrderStatus(1, 'Completed');
            expect(orderRepo.findOne).toHaveBeenCalledWith({ where: { orderId: 1 } });
            expect(mockOrder.orderStatus).toEqual('Completed');
            expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
        });

        it('should log an error if the order is not found', async () => {
            const orderRepo = { findOne: jest.fn().mockResolvedValue(null) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            console.error = jest.fn();

            await updateOrderStatus(1, 'Completed');
            expect(console.error).toHaveBeenCalledWith(`Order with ID 1 not found.`);
        });

        it('should throw an error if there is an issue', async () => {
            const orderRepo = { findOne: jest.fn().mockRejectedValue(new Error('Error fetching order')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            await expect(updateOrderStatus(1, 'Completed')).rejects.toThrow('Error fetching order');
        });
    });

    describe('updateOrderCategory', () => {
        it('should update the order category', async () => {
            const mockOrder = { orderId: 1, category: 'Books' };
            const orderRepo = { findOne: jest.fn().mockResolvedValue(mockOrder), save: jest.fn() };
            dataSource.getRepository.mockReturnValue(orderRepo);

            await updateOrderCategory(1, 'Electronics');
            expect(orderRepo.findOne).toHaveBeenCalledWith({ where: { orderId: 1 } });
            expect(mockOrder.category).toEqual('Electronics');
            expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
        });

        it('should log an error if the order is not found', async () => {
            const orderRepo = { findOne: jest.fn().mockResolvedValue(null) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            console.error = jest.fn();

            await updateOrderCategory(1, 'Electronics');
            expect(console.error).toHaveBeenCalledWith(`Order with ID 1 not found.`);
        });

        it('should throw an error if there is an issue', async () => {
            const orderRepo = { findOne: jest.fn().mockRejectedValue(new Error('Error fetching order')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            await expect(updateOrderCategory(1, 'Electronics')).rejects.toThrow('Error fetching order');
        });
    });

    describe('updateOrderTime', () => {
        it('should update the order time', async () => {
            const mockOrder = { orderId: 1, time: '10:00' };
            const orderRepo = { findOne: jest.fn().mockResolvedValue(mockOrder), save: jest.fn() };
            dataSource.getRepository.mockReturnValue(orderRepo);

            await updateOrderTime(1, '12:00');
            expect(orderRepo.findOne).toHaveBeenCalledWith({ where: { orderId: 1 } });
            expect(mockOrder.time).toEqual('12:00');
            expect(orderRepo.save).toHaveBeenCalledWith(mockOrder);
        });

        it('should log an error if the order is not found', async () => {
            const orderRepo = { findOne: jest.fn().mockResolvedValue(null) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            console.error = jest.fn();

            await updateOrderTime(1, '12:00');
            expect(console.error).toHaveBeenCalledWith(`Order with ID 1 not found.`);
        });

        it('should throw an error if there is an issue', async () => {
            const orderRepo = { findOne: jest.fn().mockRejectedValue(new Error('Error fetching order')) };
            dataSource.getRepository.mockReturnValue(orderRepo);

            await expect(updateOrderTime(1, '12:00')).rejects.toThrow('Error fetching order');
        });
    });
});
