const request = require('supertest');
const express = require('express');
const { getAllAdmins, saveAdmin, deleteAdmin, getAdminCount } = require('../controllers/AdminController');
const dataSource = require('../config/config');

jest.mock('../config/config');

const app = express();
app.use(express.json());

app.get('/admin', getAllAdmins);
app.post('/admin', saveAdmin);
app.delete('/admin/:id', deleteAdmin);
app.get('/admin/count', getAdminCount);

describe('Admin Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllAdmins', () => {
        it('should return all admins', async () => {
            const mockAdmins = [
                { AdminId: 1, AdminName: 'Admin One', NIC: '123456', Contact: '1234567890', Age: 30, Date: '2023-01-01' },
                { AdminId: 2, AdminName: 'Admin Two', NIC: '789012', Contact: '0987654321', Age: 40, Date: '2023-01-02' }
            ];
            const AdminRepo = { find: jest.fn().mockResolvedValue(mockAdmins) };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).get('/admin');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockAdmins);
        });
    });

    describe('saveAdmin', () => {
        it('should save a new admin', async () => {
            const newAdmin = { AdminName: 'Admin Three', Date: '2023-01-03', NIC: '345678', Contact: '1122334455', Age: 25 };
            const savedAdmin = { AdminId: 3, ...newAdmin };
            const AdminRepo = { create: jest.fn().mockReturnValue(newAdmin), save: jest.fn().mockResolvedValue(savedAdmin) };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).post('/admin').send(newAdmin);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual(savedAdmin);
        });

        it('should return 500 if there is an error', async () => {
            const newAdmin = { AdminName: 'Admin Three', Date: '2023-01-03', NIC: '345678', Contact: '1122334455', Age: 25 };
            const AdminRepo = { create: jest.fn(), save: jest.fn().mockRejectedValue(new Error('Error saving admin')) };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).post('/admin').send(newAdmin);
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('deleteAdmin', () => {
        it('should delete an admin', async () => {
            const AdminRepo = { findOne: jest.fn().mockResolvedValue({ AdminId: 1 }), remove: jest.fn().mockResolvedValue() };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).delete('/admin/1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: 'Admin deleted successfully' });
        });

        it('should return 404 if admin not found', async () => {
            const AdminRepo = { findOne: jest.fn().mockResolvedValue(null) };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).delete('/admin/1');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ message: 'Admin not found' });
        });

        it('should return 500 if there is an error', async () => {
            const AdminRepo = { findOne: jest.fn().mockRejectedValue(new Error('Error deleting Admin')) };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).delete('/admin/1');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('getAdminCount', () => {
        it('should return the count of admins', async () => {
            const AdminRepo = { count: jest.fn().mockResolvedValue(2) };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).get('/admin/count');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ count: 2 });
        });

        it('should return 500 if there is an error', async () => {
            const AdminRepo = { count: jest.fn().mockRejectedValue(new Error('Error retrieving admin count')) };
            dataSource.getRepository.mockReturnValue(AdminRepo);

            const res = await request(app).get('/admin/count');
            expect(res.statusCode).toEqual(500);
            expect(res.body).toEqual({ message: 'Internal server error' });
        });
    });
});
