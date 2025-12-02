import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Report } from './entities/report.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class ReportsGateway {
    @WebSocketServer() server!: Server;

    broadcastReportCreated(report: Report) {
        this.server.emit('report_created', {
            id: report.id,
            title: report.title,
            content: report.content,
            type: report.type,
            status: report.status,
            createdAt: report.createdAt,
            imageUrl: report.imageUrl,
            senderId: report.senderId,
            tripId: report.tripId,
            studentId: report.studentId,
        });
    }
}
