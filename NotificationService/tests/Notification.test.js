const request = require('supertest');
const express = require('express');
const {
    getAllRunningAlerts,
    getAlerts,
    addAlert,
    editAlert,
    deleteAlert,
    clearNotifiedAlerts
} = require('../controllers/AlertController');
const dataSource = require('../config/config');

jest.mock('../config/config');

const app = express();
app.use(express.json());
app.get('/alerts/running', async (req, res) => res.json(await getAllRunningAlerts()));
app.get('/alerts', getAlerts);
app.post('/alerts', addAlert);
app.put('/alerts', editAlert);
app.delete('/alerts', deleteAlert);
app.delete('/alerts/clear', clearNotifiedAlerts);

describe('Alert Controller', () => {
    describe('getAllRunningAlerts', () => {

        it('should return an empty array if there is an error', async () => {
            const alertRepo = {
                createQueryBuilder: jest.fn().mockReturnValue({
                    leftJoinAndSelect: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    orderBy: jest.fn().mockReturnThis(),
                    getRawMany: jest.fn().mockRejectedValue(new Error('Error fetching alerts'))
                })
            };

            dataSource.getRepository.mockReturnValue(alertRepo);

            const res = await request(app).get('/alerts/running');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('getAlerts', () => {

        it('should return 404 if userId is not provided', async () => {
            const res = await request(app).get('/alerts');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toEqual({ message: 'User not found' });
        });

    });

    describe('addAlert', () => {

        it('should return 400 if alert data is invalid', async () => {
            const res = await request(app).post('/alerts').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: 'Invalid alert data' });
        });

    });

    describe('editAlert', () => {
        it('should return 400 if alertId is not provided', async () => {
            const res = await request(app).put('/alerts').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: 'Invalid alert data' });
        });


    });

    describe('deleteAlert', () => {

        it('should return 400 if userId or alertId is not provided', async () => {
            const res = await request(app).delete('/alerts').query({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: 'Invalid alert data' });
        });



    });

    describe('clearNotifiedAlerts', () => {
        it('should return 400 if userId is not provided', async () => {
            const res = await request(app).delete('/alerts/clear').query({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toEqual({ message: 'Invalid alert data' });
        });


    });
});
