// Socket manager that works both locally and on serverless

class SocketManager {
  constructor() {
    this.io = null;
    this.isServerless = process.env.VERCEL === '1';
  }

  // Call this from server.js to set the io instance
  setIO(ioInstance) {
    if (!this.isServerless && ioInstance) {
      this.io = ioInstance;
    }
  }

  // Emit to a specific user
  emitToUser(userId, event, data) {
    if (this.io && !this.isServerless) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
    // For Vercel, you could store notifications in DB
    console.log(`[Socket] Emitting ${event} to user ${userId}:`, data);
  }

  // Emit to a specific claim room
  emitToClaim(claimId, event, data) {
    if (this.io && !this.isServerless) {
      this.io.to(`claim_${claimId}`).emit(event, data);
    }
    console.log(`[Socket] Emitting ${event} to claim ${claimId}:`, data);
  }

  // Broadcast to all connected clients
  broadcast(event, data) {
    if (this.io && !this.isServerless) {
      this.io.emit(event, data);
    }
    console.log(`[Socket] Broadcasting ${event}:`, data);
  }
}

// Export a singleton instance
const socketManager = new SocketManager();
export default socketManager;
