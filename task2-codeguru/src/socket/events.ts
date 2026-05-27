import { Server } from 'socket.io';

let io: Server;

export function initSocket(server: Server) {
  io = server;
}

export function emitToUser(userId: string, event: string, data: object) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}
