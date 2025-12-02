// tracking.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TrackingGateway {
  @WebSocketServer() server: Server;

  broadcastLocation(
    tripId: string,
    payload: {
      tripId: string;
      latitude: number;
      longitude: number;
      timestamp: string;
      speed?: number;
      status?: string;
    },
  ) {
    this.server.to(`trip:${tripId}`).emit('bus.location', payload);
  }

  handleConnection(socket: any) {
    const { tripId } = socket.handshake.query;
    if (tripId) socket.join(`trip:${tripId}`);
  }
}
