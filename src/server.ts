import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as express from 'express';
import { Application, RequestHandler } from 'express';
import morgan from 'morgan';
import SocketIo from 'socket.io';
import * as WebSocket from 'ws';
import * as http from 'http';
// const WebSocket = require('ws')

export class KillPlusServer extends Server {
    private readonly SERVER_STARTED = 'Kill Plus server started on port: ';
    private io: SocketIO.Server;
    private ws: any;

    constructor() {
        super(true);
        this.setupStatic();
        this.setupControllers();
    }

    private setupControllers() {
        this.app.use('/call', (req: any, res: any) => {
            res.send('call');
            this.ws.send('get call');
        });

        this.app.use('/lead/:phone', (req: any, res: any) => {
            res.send('lead');
        });
    }

    private setupStatic() {
        this.app.use('/', express.static('public'));
    }

    private setupSockets() {
        this.io = SocketIo(this);

        this.io.on('connect', (socket: any) => {
            Logger.Info('Connected client on port');


            socket.on('disconnect', () => {
                Logger.Info('Client disconnected');
            });
        });
    }

    public start(port: number): void {
        this.app.use(morgan('dev'));

        this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port);

            //  this.setupSockets();



            const wsPort = process.env.NODE_ENV === 'production' ? 8083 : parseInt(process.env.WS_PORT, 3003) || 3003;

            const server = http.createServer(this.app);

            const wss = new WebSocket.Server({ server })

            Logger.Info('Set ws connectio');

            wss.on('connection', (ws: WebSocket) => {
                Logger.Info('Set ws');
                this.ws = ws;
                ws.on('message', (message: string) => {
                    Logger.Info(`Received message => ${message}`)
                })
            })

        });

    }
}