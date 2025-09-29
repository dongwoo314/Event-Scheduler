import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import groupService from '@services/group';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  eventCount: number;
  type: 'work' | 'project' | 'social' | 'other';
  isOwner: boolean;
  lastActivity: string;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  max_members?: number;
  settings?: any;
}

interface GroupState {
  // 상태
  groups: Group[];
  selectedGroup: Group | null;
  loading: boolean;
  error: string | null;
  
  // 액션
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (updatedGroup: Group) => void;
  deleteGroup: (groupId: string) => void;
  setSelectedGroup: (group: Group | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 비동기 액션
  loadGroups: () => Promise<void>;
  createGroup: (groupData: any) => Promise<Group>;
  editGroup: (groupId: string, groupData: any) => Promise<Group>;
  removeGroup: (groupId: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  inviteMembers: (groupId: string, emails: string[], message?: string) => Promise<void>;
  
  // 유틸리티
  getGroupById: (groupId: string) => Group | undefined;
  getMyGroups: () => Group[];
  getPublicGroups: () => Group[];
  searchGroups: (query: string) => Group[];
  clearError: () => void;
  reset: () => void;
}

// 초기 목 데이터
const initialMockGroups: Group[] = [
  {
    id: '1',
    name: '개발팀',
    description: '프론트엔드 및 백엔드 개발팀',
    memberCount: 8,
    eventCount: 15,
    type: 'work',
    isOwner: true,
    lastActivity: '2시간 전',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false,
    max_members: 50
  },
  {
    id: '3',
    name: '취미 클럽',
    description: '주말 등산 및 여행 그룹',
    memberCount: 12,
    eventCount: 6,
    type: 'social',
    isOwner: true,
    lastActivity: '3일 전',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: true,
    max_members: 100
  }
];

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      groups: initialMockGroups,
      selectedGroup: null,
      loading: false,
      error: null,

      // 기본 액션
      setGroups: (groups) => set({ groups }),
      
      addGroup: (group) => set((state) => ({ 
        groups: [group, ...state.groups] 
      })),
      
      updateGroup: (updatedGroup) => set((state) => ({
        groups: state.groups.map(group => 
          group.id === updatedGroup.id ? { ...group, ...updatedGroup } : group
        ),
        selectedGroup: state.selectedGroup?.id === updatedGroup.id 
          ? { ...state.selectedGroup, ...updatedGroup } 
          : state.selectedGroup
      })),
      
      deleteGroup: (groupId) => {
        console.log('🗑️ deleteGroup 호출됨:', groupId);
        set((state) => {
          const groupToDelete = state.groups.find(g => g.id === groupId);
          const newGroups = state.groups.filter(group => group.id !== groupId);
          console.log('📝 그룹 삭제 완료:', groupToDelete?.name, '총 그룹 수:', newGroups.length);
          return {
            groups: newGroups,
            selectedGroup: state.selectedGroup?.id === groupId ? null : state.selectedGroup
          };
        });
      },
      
      setSelectedGroup: (group) => set({ selectedGroup: group }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // 비동기 액션
      loadGroups: async () => {
        console.log('🔄 loadGroups 호출됨');
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // const groups = await groupService.getMyGroups();
          // set({ groups, loading: false });
          
          // 기존 그룹이 있는지 확인
          const currentGroups = get().groups;
          
          // 마이그레이션: "프로젝트 알파" 그룹 제거
          const migratedGroups = currentGroups.filter(group => {
            if (group.id === '2' && group.name === '프로젝트 알파') {
              console.log('🔄 마이그레이션: 프로젝트 알파 그룹 제거');
              return false;
            }
            return true;
          });
          
          if (migratedGroups.length > 0 && migratedGroups.length !== currentGroups.length) {
            console.log('📦 마이그레이션된 그룹 데이터 적용:', migratedGroups.length, '개');
            set({ groups: migratedGroups, loading: false });
            return;
          }
          
          if (currentGroups.length > 0) {
            console.log('📦 기존 그룹 데이터 유지:', currentGroups.length, '개');
            set({ loading: false });
            return;
          }
          
          // persist 미들웨어로 이미 localStorage에서 로드되지만,
          // 데이터가 비어있다면 초기 데이터 설정
          console.log('📦 초기 그룹 데이터 설정');
          set({ groups: initialMockGroups, loading: false });
        } catch (error: any) {
          console.error('❌ 그룹 로드 실패:', error);
          set({ error: error.message || '그룹 로드에 실패했습니다.', loading: false });
        }
      },

      createGroup: async (groupData) => {
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // const newGroup = await groupService.createGroup(groupData);
          
          // 로컬 생성
          const newGroup: Group = {
            id: Date.now().toString(),
            name: groupData.name,
            description: groupData.description,
            type: groupData.type,
            memberCount: 1,
            eventCount: 0,
            isOwner: true,
            lastActivity: '방금 전',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_public: groupData.is_public || false,
            max_members: groupData.max_members || 50,
            settings: groupData.settings || {}
          };
          
          set((state) => ({
            groups: [newGroup, ...state.groups],
            loading: false
          }));
          
          // 그룹 생성자를 자동으로 소유자로 추가
          if (typeof window !== 'undefined' && window.__GROUP_MEMBER_STORE__) {
            const memberStore = window.__GROUP_MEMBER_STORE__.getState();
            memberStore.addMember({
              id: `member-${Date.now()}`,
              group_id: newGroup.id,
              user_id: 'current-user',
              user_name: '김철수', // 실제 환경에서는 auth store에서 가져옴
              user_email: 'user@example.com',
              role: 'owner',
              status: 'active',
              joined_at: new Date().toISOString()
            });
            console.log('✅ 그룹 생성자를 소유자로 등록');
          }
          
          return newGroup;
        } catch (error: any) {
          set({ error: error.message || '그룹 생성에 실패했습니다.', loading: false });
          throw error;
        }
      },

      editGroup: async (groupId, groupData) => {
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // const updatedGroup = await groupService.updateGroup(groupId, groupData);
          
          // 로컬 업데이트
          const updatedGroup = {
            ...get().groups.find(g => g.id === groupId),
            ...groupData,
            updated_at: new Date().toISOString()
          } as Group;
          
          get().updateGroup(updatedGroup);
          set({ loading: false });
          
          return updatedGroup;
        } catch (error: any) {
          set({ error: error.message || '그룹 수정에 실패했습니다.', loading: false });
          throw error;
        }
      },

      removeGroup: async (groupId) => {
        console.log('🗑️ removeGroup 호출됨:', groupId);
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // await groupService.deleteGroup(groupId);
          
          // 로컬 데이터 삭제
          get().deleteGroup(groupId);
          
          // 그룹 삭제 시 관련 이벤트 정리 (이벤트 스토어와 동기화)
          if (typeof window !== 'undefined' && window.__EVENT_STORE__) {
            const eventStore = window.__EVENT_STORE__.getState();
            const eventsToUpdate = eventStore.events.filter((event: any) => event.group_id === groupId);
            
            eventsToUpdate.forEach((event: any) => {
              eventStore.updateEvent({
                ...event,
                group_id: undefined,
                group_name: undefined,
                category: 'personal'
              });
            });
          }
          
          set({ loading: false });
          console.log('✅ 그룹 삭제 완료:', groupId);
        } catch (error: any) {
          console.error('❌ 그룹 삭제 실패:', error);
          set({ error: error.message || '그룹 삭제에 실패했습니다.', loading: false });
          throw error;
        }
      },

      joinGroup: async (groupId) => {
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // await groupService.joinGroup(groupId);
          
          // 로컬 업데이트 - 멤버 수 증가
          const group = get().groups.find(g => g.id === groupId);
          if (group) {
            const updatedGroup = {
              ...group,
              memberCount: group.memberCount + 1,
              lastActivity: '방금 전'
            };
            get().updateGroup(updatedGroup);
          }
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.message || '그룹 가입에 실패했습니다.', loading: false });
          throw error;
        }
      },

      leaveGroup: async (groupId) => {
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // await groupService.leaveGroup(groupId);
          
          // 로컬 업데이트 - 멤버 수 감소 또는 그룹 제거
          const group = get().groups.find(g => g.id === groupId);
          if (group) {
            if (group.isOwner) {
              // 소유자인 경우 그룹 삭제
              get().deleteGroup(groupId);
            } else {
              // 일반 멤버인 경우 멤버 수 감소
              const updatedGroup = {
                ...group,
                memberCount: Math.max(1, group.memberCount - 1),
                lastActivity: '방금 전'
              };
              get().updateGroup(updatedGroup);
            }
          }
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.message || '그룹 나가기에 실패했습니다.', loading: false });
          throw error;
        }
      },

      inviteMembers: async (groupId, emails, message) => {
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // await groupService.inviteToGroup(groupId, { emails, message });
          
          // 로컬 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 그룹의 마지막 활동 업데이트
          const group = get().groups.find(g => g.id === groupId);
          if (group) {
            const updatedGroup = {
              ...group,
              lastActivity: '방금 전'
            };
            get().updateGroup(updatedGroup);
          }
          
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.message || '멤버 초대에 실패했습니다.', loading: false });
          throw error;
        }
      },

      // 유틸리티 함수
      getGroupById: (groupId) => {
        return get().groups.find(group => group.id === groupId);
      },

      getMyGroups: () => {
        return get().groups.filter(group => group.isOwner);
      },

      getPublicGroups: () => {
        return get().groups.filter(group => group.is_public);
      },

      searchGroups: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().groups.filter(group =>
          group.name.toLowerCase().includes(lowerQuery) ||
          group.description.toLowerCase().includes(lowerQuery)
        );
      },

      clearError: () => set({ error: null }),
      
      reset: () => set({
        groups: initialMockGroups,
        selectedGroup: null,
        loading: false,
        error: null
      })
    }),
    {
      name: 'group-store', // localStorage key
      partialize: (state) => ({ 
        groups: state.groups,
        selectedGroup: state.selectedGroup 
      }), // 지속할 상태만 선택
    }
  )
);

// 글로벌 디버깅을 위한 참조 추가
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__GROUP_STORE__ = useGroupStore;
  console.log('🔧 글로벌 그룹 스토어 참조 등록됨');
}

export default useGroupStore;
