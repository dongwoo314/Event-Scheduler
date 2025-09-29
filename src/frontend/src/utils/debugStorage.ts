// 전역 함수로 추가 - 브라우저 콘솔에서 사용 가능
declare global {
  interface Window {
    clearEventStorage: () => void;
    resetEventStore: () => void;
    debugEventStore: () => void;
  }
}

// localStorage와 sessionStorage 완전 정리
window.clearEventStorage = () => {
  console.log('🧹 이벤트 스토리지 완전 정리 시작...');
  
  // localStorage 정리
  const localKeys = Object.keys(localStorage);
  localKeys.forEach(key => {
    if (key.includes('event') || key.includes('zustand') || key.includes('store')) {
      localStorage.removeItem(key);
      console.log(`🗑️ localStorage 삭제: ${key}`);
    }
  });
  
  // sessionStorage 정리
  const sessionKeys = Object.keys(sessionStorage);
  sessionKeys.forEach(key => {
    if (key.includes('event') || key.includes('zustand') || key.includes('store')) {
      sessionStorage.removeItem(key);
      console.log(`🗑️ sessionStorage 삭제: ${key}`);
    }
  });
  
  console.log('✅ 스토리지 정리 완료!');
};

// 이벤트 스토어 강제 리셋
window.resetEventStore = () => {
  console.log('🔄 이벤트 스토어 강제 리셋...');
  try {
    // @ts-ignore
    if (window.__EVENT_STORE__) {
      // @ts-ignore
      window.__EVENT_STORE__.getState().reset();
      console.log('✅ 스토어 리셋 완료!');
    }
  } catch (error) {
    console.log('⚠️ 스토어 리셋 실패, 페이지 새로고침 필요');
  }
};

// 디버깅 정보 출력
window.debugEventStore = () => {
  console.log('🔍 이벤트 스토어 디버깅 정보:');
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('sessionStorage keys:', Object.keys(sessionStorage));
  
  try {
    // @ts-ignore
    if (window.__EVENT_STORE__) {
      // @ts-ignore
      const state = window.__EVENT_STORE__.getState();
      console.log('현재 이벤트 수:', state.events.length);
      console.log('이벤트 목록:', state.events.map(e => ({ id: e.id, title: e.title })));
    }
  } catch (error) {
    console.log('스토어 상태 확인 불가');
  }
};

export {};