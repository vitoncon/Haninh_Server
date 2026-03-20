import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

export class SocketService {
    private static io: SocketIOServer;

    static init(server?: HttpServer | HttpsServer, port?: number) {
        const socketOptions: any = {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
            },
            transports: ['websocket', 'polling']
        };

        if (port) {
            this.io = new SocketIOServer(port, socketOptions);
            console.log(`✅ Socket.io started on dedicated port: ${port}`);
        } else if (server) {
            this.io = new SocketIOServer(server, socketOptions);
            console.log('✅ Socket.io initialized on shared server port');
        } else {
            throw new Error('Either server or port must be provided to initialize Socket.io');
        }

        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);

            socket.on('disconnect', () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    /**
     * Get the socket.io instance
     */
    static getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error('Socket.io not initialized');
        }
        return this.io;
    }

    /**
     * Emit a payment update event
     */
    static emitPaymentUpdated(feeId: number, status: string = 'PAID') {
        if (this.io) {
            this.io.emit('payment-updated', { feeId, status });
            console.log(`Emitted payment-updated event for feeId: ${feeId}, status: ${status}`);
        }
    }

    /**
     * Emit a new lead event
     */
    static emitLeadCreated(lead: any) {
        if (this.io) {
            this.io.emit('new-lead', lead);
            console.log(`Emitted new-lead event for lead: ${lead.fullname || lead.name}`);
        }
    }
}
