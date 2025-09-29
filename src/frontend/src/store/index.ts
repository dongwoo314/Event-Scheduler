// 전역 상태 관리 스토어들을 모두 내보내는 인덱스 파일

export { useGroupStore } from './group';
export { useEventStore } from './event';
export { useUiStore } from './ui';
export { useNotificationStore } from './notification';
export { useGroupMemberStore } from './groupMember';

// 타입 정의들도 함께 내보내기
export type { default as GroupStore } from './group';
export type { default as EventStore } from './event';
export type { default as NotificationStore } from './notification';
export type { default as GroupMemberStore } from './groupMember';

// 스토어 리셋 함수 (개발/테스트용)
export const resetAllStores = () => {
  useGroupStore.getState().reset();
  useEventStore.getState().reset();
  useNotificationStore.getState().clearAllNotifications();
  useGroupMemberStore.getState().reset();
};

// 전체 앱 상태 초기화 함수
export const initializeStores = async () => {
  const groupStore = useGroupStore.getState();
  const eventStore = useEventStore.getState();
  const notificationStore = useNotificationStore.getState();
  const memberStore = useGroupMemberStore.getState();
  
  try {
    // 병렬로 데이터 로드
    await Promise.all([
      groupStore.loadGroups(),
      eventStore.loadEvents()
    ]);
    
    // 이벤트 기반 알림 생성
    notificationStore.generateNotificationsFromEvents();
    
    console.log('📋 모든 스토어 초기화 완료');
  } catch (error) {
    console.error('스토어 초기화 오류:', error);
  }
};

// 스토어 상태 동기화 헬퍼 함수들
export const syncStores = {
  // 그룹 삭제 시 관련 이벤트도 정리
  onGroupDeleted: (groupId: string) => {
    const eventStore = useEventStore.getState();
    const eventsToUpdate = eventStore.events.filter(event => event.group_id === groupId);
    
    eventsToUpdate.forEach(event => {
      eventStore.updateEvent({
        ...event,
        group_id: undefined,
        group_name: undefined,
        category: 'personal'
      });
    });
  },

  // 그룹 업데이트 시 관련 이벤트의 그룹명도 업데이트
  onGroupUpdated: (updatedGroup: any) => {
    const eventStore = useEventStore.getState();
    const eventsToUpdate = eventStore.events.filter(event => event.group_id === updatedGroup.id);
    
    eventsToUpdate.forEach(event => {
      eventStore.updateEvent({
        ...event,
        group_name: updatedGroup.name
      });
    });
  }
};
