import { ChatRepository } from '../repositories/chat.repository';

export class CacheScheduler {
  private chatRepository: ChatRepository;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  /**
   * 캐시 정리 스케줄러 시작
   */
  startCleanupScheduler(): void {
    // 5분마다 만료된 캐시 정리
    this.cleanupInterval = setInterval(() => {
      this.chatRepository.cleanupExpiredCaches();
      
      // 캐시 통계 출력
      const stats = this.chatRepository.getCacheStats();
      console.log(`[Cache Stats] 채팅방 목록: ${stats.chatRoomsCache}, 참여자: ${stats.participantCache}, 상세정보: ${stats.chatRoomDetailsCache}`);
    }, 5 * 60 * 1000); // 5분

    console.log('[Cache Scheduler] 캐시 정리 스케줄러 시작됨 (5분 간격)');
  }

  /**
   * 캐시 정리 스케줄러 중지
   */
  stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[Cache Scheduler] 캐시 정리 스케줄러 중지됨');
    }
  }
}
