import { io } from 'socket.io-client';

const SOCKET_URL = 'https://admin.qnsport.vn'; // Thay thế bằng URL Directus của bạn

class WebSocketService {
  socket;
  
  constructor() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      path: '/realtime',
    });
  }

  on(event, callback) {
    this.socket.on(event, callback);
  }

  off(event, callback) {
    this.socket.off(event, callback);
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }
}

const websocketService = new WebSocketService();
export default websocketService;
