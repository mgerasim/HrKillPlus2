import express, { json } from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import moment from 'moment';
import { Logger } from '@overnightjs/logger';
import axios from 'axios';
import * as mongodb from 'mongodb';
import { Staff } from './models/staff'

const app = express();

import bodyParser from 'body-parser';
import { KillPlusIntegrator } from './integrators/killPlusIntegrator';
import { Lead } from './models/lead';
import { MegapbxInterator } from './integrators/megapbxIntegrator';
import { MongoClient } from 'mongodb';
import { UiscomIntegrator } from './integrators/uiscomIntegrator';
import { Task } from './models/task';
// const bodyParser = require('body-parser');
app.use(bodyParser.json());
// app.use(express.bodyParser());

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const jsonParser = bodyParser.json({})

app.use('/', express.static('public'));

// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let webWs: WebSocket;

const wsClients = new Array<WebSocket>();

const killPlusIntegrator = new KillPlusIntegrator();

const uiscomIntegrator = new UiscomIntegrator();


app.use('/hrkillplus/notify/records', async (req: any, res: any) => {
    try {
        Logger.Info('notify/records');
        console.log(req.query);
        const employee_phone_number = req.query.employee_phone_number
        const contact_phone_number = req.query.contact_phone_number;
        const direction = req.query.direction;

        console.log(direction);

        const now = new Date();
        console.log(now);
        console.log(moment(req.query.notification_time).add(1, 'hours').toDate());
        if (moment(req.query.notification_time).add(1, 'hours').toDate() < now) {
            res.status(200).send({});
            return;
        }

        let lead = await killPlusIntegrator.getLeadBySearch(contact_phone_number);

        const staff = await killPlusIntegrator.getStaffBySearch(employee_phone_number);
        console.log('staff');
        console.log(staff);

        if (!lead) {
            console.log(`Лид отсутствует: ${contact_phone_number}`);
            lead = {
                id: undefined,
                assigned: `${staff === undefined ? 1 : staff.staffid}`,
                source: '7',
                status: '2',
                addedfrom: '0',
                name: 'входящий',
                phonenumber: contact_phone_number
            };

            console.log('addLead');
            await killPlusIntegrator.addLead(lead);

            lead = await killPlusIntegrator.getLeadBySearch(contact_phone_number);

        }

        const description = `${direction === 'in' ? '%D0%92%D1%85%D0%BE%D0%B4%D1%8F%D1%89%D0%B8%D0%B9%20%D0%B7%D0%B2%D0%BE%D0%BD%D0%BE%D0%BA' : '%D0%98%D1%81%D1%85%D0%BE%D0%B4%D1%8F%D1%89%D0%B8%D0%B9%20%D0%B7%D0%B2%D0%BE%D0%BD%D0%BE%D0%BA'}:%20${req.query.file_link}`;
        console.log(description);
        const url = `https://hr.killercrm.ru/mgerasim_megapbx/Events/add_note?lead=${lead.id}&staff=${staff === undefined ? 1 : staff.staffid}&description=${description}`;
        await axios.get<any>(url);

        res.status(200).send({});
    } catch (err) {
        console.error(err.message);
        res.status(200).send({});
    }
})

app.use('/hrkillplus/notify/noanswered', async (req: any, res: any) => {
    try {
        Logger.Info('notify/noanswered');
        console.log(req.query);
        const employee_phone_number = req.query.employee_phone_number
        const contact_phone_number = req.query.contact_phone_number;
        console.log(`Ответил сотрудник ${employee_phone_number} на номер ${contact_phone_number}`);

        const now = new Date();

        console.log(now);
        console.log(moment(req.query.notification_time).add(1, 'hours').toDate());
        if (moment(req.query.notification_time).add(1, 'hours').toDate() < now) {
            res.status(200).send({});
            return;
        }

        let lead = await killPlusIntegrator.getLeadBySearch(contact_phone_number);

        const staff: Staff = await killPlusIntegrator.getStaffBySearch(employee_phone_number);
        console.log('staff');
        console.log(staff);

        if (!lead) {
            console.log(`Лид отсутствует: ${contact_phone_number}`);
            lead = {
                id: undefined,
                assigned: `${staff === undefined ? 1 : staff.staffid}`,
                source: '7',
                status: '2',
                addedfrom: '0',
                name: 'пропущенный',
                phonenumber: contact_phone_number
            }

            console.log('addLead');
            await killPlusIntegrator.addLead(lead);
        } else {
            await killPlusIntegrator.updateLastContactLead(lead.id);
        };

        const date = new Date();

        const task: Task = {
            id: 0,
            name: `Пропущенный звонок от номера: ${lead.phonenumber}`,
            description: `Пропущенный звонок от номера: ${lead.phonenumber}`,
            startdate: `${date.getDay()}-${date.getMonth()}-${date.getFullYear()}`,
            duedate: `${date.getDay()}-${date.getMonth()}-${date.getFullYear()}`
        };

        const res_task = await killPlusIntegrator.addTask(task);

        console.log(res_task);

        //await killPlusIntegrator.

        res.status(200).send({});

    } catch (error) {
        res.status(200).send(error.message);
    }
});


app.use('/hrkillplus/notify/answered', async (req: any, res: any) => {
    try {
        Logger.Info('notify/answered');
        console.log(req.query);
        const employee_phone_number = req.query.employee_phone_number
        const contact_phone_number = req.query.contact_phone_number;
        console.log(`Ответил сотрудник ${employee_phone_number} на номер ${contact_phone_number}`);


        const now = new Date();
        console.log(now);
        console.log(moment(req.query.notification_time).add(1, 'hours').toDate());
        if (moment(req.query.notification_time).add(1, 'hours').toDate() < now) {
            res.status(200).send({});
            return;
        }

        let lead = await killPlusIntegrator.getLeadBySearch(contact_phone_number);

        const staff: Staff = await killPlusIntegrator.getStaffBySearch(employee_phone_number);
        console.log('staff');
        console.log(staff);

        if (!lead) {
            console.log(`Лид отсутствует: ${contact_phone_number}`);
            lead = {
                id: undefined,
                assigned: `${staff === undefined ? 1 : staff.staffid}`,
                source: '7',
                status: '2',
                addedfrom: `${staff === undefined ? 0 : staff.staffid}`,
                name: 'входящий',
                phonenumber: contact_phone_number
            };

            console.log('addLead');
            await killPlusIntegrator.addLead(lead);

            lead = await killPlusIntegrator.getLeadBySearch(contact_phone_number);
            console.log(lead);

        }

        if (staff) {

            await killPlusIntegrator.updateAddedFrom(lead.id, staff.staffid);

            console.log(`Всплытие карточки ${staff.staffid}`);
            wsClients.forEach(ws => {
                if (ws) {
                    ws.send(`{"phone":${contact_phone_number},"lead":${lead.id},"staff":${staff.staffid}}`);
                }
            });
            //       webWs.send(`{"phone":${contact_phone_number},"lead":${lead.id},"staff":${staff.staffid}}`);
            return;
        }

        res.status(200).send({});
    } catch (error) {
        res.stauts(200).send({});
    }
});


app.use('/hrkillplus/events', jsonParser, async (req: any, res: any) => {
    try {

        Logger.Info('events');
        const event = req.body;

        // await mongoDb.collection('events').insert(event);

        console.log(event);

        const lead = await killPlusIntegrator.getLeadBySearch(event.numa);

        if (!lead) {
            console.log(`Лид отсутствует: ${event.numa}`);

        } else {
            console.log(`Лид найден: ${event.numa}`);

            await killPlusIntegrator.updateLastContactLead(lead.id);

            if (lead.assigned) {
                console.log(`К лиду ${event.numa} прикреплен сотрудник: ${lead.assigned}`);
                const staff = await killPlusIntegrator.getStaffById(lead.assigned);
                if (!staff) {
                    throw new Error(`Не найден сотрудник ${lead.assigned} привязанный к лиду ${event.numa}`);
                }
                console.log(`Выполняем переадресацию сотруднику ${staff.phonenumber}`);
                res.status(200).send({
                    phones: [`${staff.phonenumber}`]
                });
                return;
            } else {
                console.log(`К лиду ${event.numa} не прикреплен сотрудник`);
            }
        }

        res.status(200).send({
            returned_code: '2'
        });

        return;
    } catch (err) {
        console.error(err.message);
        console.log('Отправляем код возврата 2 по ошибкк');
        res.status(200).send({
            returned_code: '2'
        });
    }
}

);

app.use('/hrkillplus/call', async (req: any, res: any) => {

    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');

        Logger.Info('post call');
        console.log(req.query)
        const staffId = req.query.staff;
        Logger.Info(staffId);
        const leadId = req.query.lead;
        Logger.Info(leadId);
        const staff = await killPlusIntegrator.getStaffById(staffId);
        if (staff === undefined) {
            res.send('staff === undefined');
            return;
        }
        const lead = await killPlusIntegrator.getLeadById(leadId);
        if (lead === undefined) {
            res.send('lead === undefined');
            return;
        }

        console.log(staff.phonenumber);

        const employee = await uiscomIntegrator.getEmployee(staff.phonenumber);

        console.log(`Найден сотрудник`);
        console.log(employee.id);

        const result = await uiscomIntegrator.makeCall(lead.phonenumber, employee.id, staff.phonenumber);

        console.log(result);

        res.send('call successed');
    } catch (error) {
        res.status(500).send(error);
    }

    //  Logger.Info(JSON.stringify(call));
    //  webWs.send(`{"phone":${call.phone},"staff":${call.staff}}`);
});

app.use('/lead/:phone', (req: any, res: any) => {
    Logger.Info('get lead');
    Logger.Info(req.params.phone);
    axios.get<any>(`http:// killercrm.ru/api/leads/search/${req.params.phone}`, {
        headers: {
            authtoken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiVGVzdCIsIm5hbWUiOiJUZXN0IiwicGFzc3dvcmQiOm51bGwsIkFQSV9USU1FIjoxNTgzMzczMjU5fQ.QHvXm5TRBgI9eiuyH-QC2Jq_htMgfm3qMgHxVUELb3o"
        }
    }).then((result) => {
        // Logger.Info(JSON.parse(result.data));
        console.log(result.data)
        Logger.Info(result.data[0].assigned);
        res.send(result.data[0].assigned);
    });
});

app.use('/sip_phone/:staff', (req: any, res: any) => {
    Logger.Info('get sip phone');
    Logger.Info(req.params.staff);
    axios.get<any>(`http://killercrm.ru/api/staffs/${req.params.staff}`, {
        headers: {
            authtoken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiVGVzdCIsIm5hbWUiOiJUZXN0IiwicGFzc3dvcmQiOm51bGwsIkFQSV9USU1FIjoxNTgzMzczMjU5fQ.QHvXm5TRBgI9eiuyH-QC2Jq_htMgfm3qMgHxVUELb3o"
        }
    }).then((result) => {
        // Logger.Info(JSON.parse(result.data));
        console.log(result.data)
        Logger.Info(result.data.phonenumber);
        res.send(result.data.phonenumber);
    });
});

wss.on('connection', (ws: WebSocket) => {

    Logger.Info('WSS connection');


    webWs = ws;

    wsClients.push(ws);


    // connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        // log the received message and send it back to the client
        Logger.Info(message);
        //  ws.send(`Hello, you sent -> ${message}`);
    });

    // send immediatly a feedback to the incoming connection
    // ws.send('Hi there, I am a WebSocket server');
});


server.listen(process.env.PORT || 8083, () => {
    Logger.Info(`Server started on port`);
});

/*
const mongoClient: MongoClient | null = null;

let mongoDb: mongodb.Db;

const mongoConnect = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });
mongoConnect.connect().then(client => {
    console.log('MongoDB connected');
    mongoClient = client;
    mongoDb= client.db("killplus_db");


    // start our server
    server.listen(process.env.PORT || 8080, () => {
        Logger.Info(`Server started on port`);
    });

}).catch(err => {
    console.log(err);
});

*/
