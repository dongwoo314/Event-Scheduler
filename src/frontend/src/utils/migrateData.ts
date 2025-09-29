// 데이터 마이그레이션 유틸리티
// "프로젝트 알파" 그룹 삭제에 따른 데이터 정리

export const migrateProjectAlphaRemoval = () => {
  console.log('🔄 데이터 마이그레이션 시작: 프로젝트 알파 그룹 삭제');

  try {
    // 그룹 데이터 마이그레이션
    const groupData = localStorage.getItem('group-store');
    if (groupData) {
      const parsedGroupData = JSON.parse(groupData);
      if (parsedGroupData.state && parsedGroupData.state.groups) {
        const filteredGroups = parsedGroupData.state.groups.filter((group: any) => {
          if (group.id === '2' && group.name === '프로젝트 알파') {
            console.log('🗑️ 그룹 데이터에서 프로젝트 알파 제거');
            return false;
          }
          return true;
        });
        
        parsedGroupData.state.groups = filteredGroups;
        localStorage.setItem('group-store', JSON.stringify(parsedGroupData));
        console.log('✅ 그룹 데이터 마이그레이션 완료');
      }
    }

    // 이벤트 데이터 마이그레이션
    const eventsData = localStorage.getItem('events');
    if (eventsData) {
      const parsedEvents = JSON.parse(eventsData);
      const migratedEvents = parsedEvents.map((event: any) => {
        if (event.group_id === '2' && event.group_name === '프로젝트 알파') {
          console.log('🔄 이벤트 마이그레이션:', event.title, '-> 개인 카테고리로 변경');
          return {
            ...event,
            group_id: undefined,
            group_name: undefined,
            category: 'personal'
          };
        }
        return event;
      });
      
      localStorage.setItem('events', JSON.stringify(migratedEvents));
      console.log('✅ 이벤트 데이터 마이그레이션 완료');
    }

    console.log('🎉 데이터 마이그레이션 완료: 프로젝트 알파 그룹이 성공적으로 제거되었습니다');
    return true;
  } catch (error) {
    console.error('❌ 데이터 마이그레이션 실패:', error);
    return false;
  }
};

// 즉시 실행
if (typeof window !== 'undefined') {
  migrateProjectAlphaRemoval();
}
