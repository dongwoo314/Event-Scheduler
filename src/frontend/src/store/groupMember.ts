import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'invited' | 'pending';
  joined_at: string;
  invited_by?: string;
  invited_at?: string;
}

interface GroupMemberState {
  // 상태
  members: GroupMember[];
  loading: boolean;
  error: string | null;
  
  // 액션
  setMembers: (members: GroupMember[]) => void;
  addMember: (member: GroupMember) => void;
  updateMember: (updatedMember: GroupMember) => void;
  removeMember: (memberId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 비동기 액션
  loadGroupMembers: (groupId: string) => Promise<void>;
  inviteMembersToGroup: (groupId: string, emails: string[], message?: string, invitedBy?: string) => Promise<void>;
  acceptInvitation: (memberId: string) => Promise<void>;
  declineInvitation: (memberId: string) => Promise<void>;
  removeMemberFromGroup: (groupId: string, memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, newRole: 'admin' | 'member') => Promise<void>;
  leaveGroup: (groupId: string, userId: string) => Promise<void>;
  
  // 유틸리티
  getMembersByGroup: (groupId: string) => GroupMember[];
  getMemberById: (memberId: string) => GroupMember | undefined;
  getMemberByUserAndGroup: (userId: string, groupId: string) => GroupMember | undefined;
  getActiveMemberCount: (groupId: string) => number;
  getPendingInvitations: (userId: string) => GroupMember[];
  isGroupOwner: (groupId: string, userId: string) => boolean;
  isGroupAdmin: (groupId: string, userId: string) => boolean;
  clearError: () => void;
  reset: () => void;
}

// 초기 목 데이터
const createInitialMembers = (): GroupMember[] => [
  {
    id: 'member-1',
    group_id: '1',
    user_id: 'current-user',
    user_name: '김철수',
    user_email: 'user@example.com',
    role: 'owner',
    status: 'active',
    joined_at: new Date().toISOString()
  },
  {
    id: 'member-2',
    group_id: '1',
    user_id: 'user-2',
    user_name: '이영희',
    user_email: 'lee@example.com',
    role: 'admin',
    status: 'active',
    joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'member-3',
    group_id: '1',
    user_id: 'user-3',
    user_name: '박민수',
    user_email: 'park@example.com',
    role: 'member',
    status: 'active',
    joined_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'member-4',
    group_id: '3',
    user_id: 'current-user',
    user_name: '김철수',
    user_email: 'user@example.com',
    role: 'owner',
    status: 'active',
    joined_at: new Date().toISOString()
  }
];

// localStorage에서 초기 멤버 로드
const loadInitialMembers = (): GroupMember[] => {
  try {
    const savedMembers = localStorage.getItem('group-members');
    if (savedMembers) {
      const parsedMembers = JSON.parse(savedMembers);
      console.log('📦 초기화: localStorage에서 멤버 로드:', parsedMembers.length, '개');
      return parsedMembers;
    }
  } catch (error) {
    console.warn('📦 초기화: localStorage 파싱 오류, 초기 데이터 생성');
  }
  
  const freshMembers = createInitialMembers();
  localStorage.setItem('group-members', JSON.stringify(freshMembers));
  console.log('📦 초기화: 새로운 멤버 데이터 생성:', freshMembers.length, '개');
  return freshMembers;
};

export const useGroupMemberStore = create<GroupMemberState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      members: loadInitialMembers(),
      loading: false,
      error: null,

      // 기본 액션
      setMembers: (members) => {
        console.log('🔄 setMembers 호출됨:', members.length, '개');
        set({ members });
        localStorage.setItem('group-members', JSON.stringify(members));
      },
      
      addMember: (member) => {
        console.log('➕ addMember 호출됨:', member.user_name);
        set((state) => {
          const newMembers = [member, ...state.members];
          localStorage.setItem('group-members', JSON.stringify(newMembers));
          return { members: newMembers };
        });
      },
      
      updateMember: (updatedMember) => {
        console.log('✏️ updateMember 호출됨:', updatedMember.user_name);
        set((state) => {
          const newMembers = state.members.map(member => 
            member.id === updatedMember.id ? { ...member, ...updatedMember } : member
          );
          localStorage.setItem('group-members', JSON.stringify(newMembers));
          return { members: newMembers };
        });
      },
      
      removeMember: (memberId) => {
        console.log('🗑️ removeMember 호출됨:', memberId);
        set((state) => {
          const newMembers = state.members.filter(member => member.id !== memberId);
          localStorage.setItem('group-members', JSON.stringify(newMembers));
          return { members: newMembers };
        });
      },
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // 비동기 액션
      loadGroupMembers: async (groupId) => {
        console.log('🔄 loadGroupMembers 호출됨:', groupId);
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // const members = await groupService.getGroupMembers(groupId);
          
          // 기존 멤버 반환
          const groupMembers = get().members.filter(m => m.group_id === groupId);
          console.log('📦 그룹 멤버 로드 완료:', groupMembers.length, '개');
          set({ loading: false });
        } catch (error: any) {
          console.error('❌ 그룹 멤버 로드 실패:', error);
          set({ error: error.message || '멤버 로드에 실패했습니다.', loading: false });
        }
      },

      inviteMembersToGroup: async (groupId, emails, message, invitedBy = 'current-user') => {
        console.log('📧 inviteMembersToGroup 호출됨:', groupId, emails);
        set({ loading: true, error: null });
        try {
          // 실제 환경에서는 API 호출
          // await groupService.inviteMembers(groupId, { emails, message });
          
          // 로컬 초대 생성
          const newMembers: GroupMember[] = emails.map((email, index) => ({
            id: `member-${Date.now()}-${index}`,
            group_id: groupId,
            user_id: `user-${Date.now()}-${index}`,
            user_name: email.split('@')[0],
            user_email: email,
            role: 'member' as const,
            status: 'invited' as const,
            joined_at: new Date().toISOString(),
            invited_by: invitedBy,
            invited_at: new Date().toISOString()
          }));
          
          newMembers.forEach(member => get().addMember(member));
          
          // 그룹 멤버 수 업데이트
          if (typeof window !== 'undefined' && window.__GROUP_STORE__) {
            const groupStore = window.__GROUP_STORE__.getState();
            const group = groupStore.groups.find((g: any) => g.id === groupId);
            if (group) {
              groupStore.updateGroup({
                ...group,
                memberCount: get().getActiveMemberCount(groupId)
              });
            }
          }
          
          set({ loading: false });
          console.log('✅ 멤버 초대 완료:', newMembers.length, '명');
        } catch (error: any) {
          console.error('❌ 멤버 초대 실패:', error);
          set({ error: error.message || '멤버 초대에 실패했습니다.', loading: false });
          throw error;
        }
      },

      acceptInvitation: async (memberId) => {
        console.log('✅ acceptInvitation 호출됨:', memberId);
        set({ loading: true, error: null });
        try {
          const member = get().members.find(m => m.id === memberId);
          if (!member) {
            throw new Error('멤버를 찾을 수 없습니다.');
          }
          
          get().updateMember({
            ...member,
            status: 'active'
          });
          
          set({ loading: false });
          console.log('✅ 초대 수락 완료');
        } catch (error: any) {
          console.error('❌ 초대 수락 실패:', error);
          set({ error: error.message || '초대 수락에 실패했습니다.', loading: false });
          throw error;
        }
      },

      declineInvitation: async (memberId) => {
        console.log('❌ declineInvitation 호출됨:', memberId);
        set({ loading: true, error: null });
        try {
          get().removeMember(memberId);
          set({ loading: false });
          console.log('✅ 초대 거절 완료');
        } catch (error: any) {
          console.error('❌ 초대 거절 실패:', error);
          set({ error: error.message || '초대 거절에 실패했습니다.', loading: false });
          throw error;
        }
      },

      removeMemberFromGroup: async (groupId, memberId) => {
        console.log('🗑️ removeMemberFromGroup 호출됨:', groupId, memberId);
        set({ loading: true, error: null });
        try {
          get().removeMember(memberId);
          
          // 그룹 멤버 수 업데이트
          if (typeof window !== 'undefined' && window.__GROUP_STORE__) {
            const groupStore = window.__GROUP_STORE__.getState();
            const group = groupStore.groups.find((g: any) => g.id === groupId);
            if (group) {
              groupStore.updateGroup({
                ...group,
                memberCount: get().getActiveMemberCount(groupId)
              });
            }
          }
          
          set({ loading: false });
          console.log('✅ 멤버 제거 완료');
        } catch (error: any) {
          console.error('❌ 멤버 제거 실패:', error);
          set({ error: error.message || '멤버 제거에 실패했습니다.', loading: false });
          throw error;
        }
      },

      updateMemberRole: async (memberId, newRole) => {
        console.log('👑 updateMemberRole 호출됨:', memberId, newRole);
        set({ loading: true, error: null });
        try {
          const member = get().members.find(m => m.id === memberId);
          if (!member) {
            throw new Error('멤버를 찾을 수 없습니다.');
          }
          
          get().updateMember({
            ...member,
            role: newRole
          });
          
          set({ loading: false });
          console.log('✅ 멤버 역할 변경 완료');
        } catch (error: any) {
          console.error('❌ 멤버 역할 변경 실패:', error);
          set({ error: error.message || '멤버 역할 변경에 실패했습니다.', loading: false });
          throw error;
        }
      },

      leaveGroup: async (groupId, userId) => {
        console.log('🚪 leaveGroup 호출됨:', groupId, userId);
        set({ loading: true, error: null });
        try {
          const member = get().members.find(m => m.group_id === groupId && m.user_id === userId);
          if (member) {
            get().removeMember(member.id);
            
            // 그룹 멤버 수 업데이트
            if (typeof window !== 'undefined' && window.__GROUP_STORE__) {
              const groupStore = window.__GROUP_STORE__.getState();
              const group = groupStore.groups.find((g: any) => g.id === groupId);
              if (group) {
                groupStore.updateGroup({
                  ...group,
                  memberCount: get().getActiveMemberCount(groupId)
                });
              }
            }
          }
          
          set({ loading: false });
          console.log('✅ 그룹 나가기 완료');
        } catch (error: any) {
          console.error('❌ 그룹 나가기 실패:', error);
          set({ error: error.message || '그룹 나가기에 실패했습니다.', loading: false });
          throw error;
        }
      },

      // 유틸리티 함수
      getMembersByGroup: (groupId) => {
        return get().members.filter(member => member.group_id === groupId);
      },

      getMemberById: (memberId) => {
        return get().members.find(member => member.id === memberId);
      },

      getMemberByUserAndGroup: (userId, groupId) => {
        return get().members.find(
          member => member.user_id === userId && member.group_id === groupId
        );
      },

      getActiveMemberCount: (groupId) => {
        return get().members.filter(
          member => member.group_id === groupId && member.status === 'active'
        ).length;
      },

      getPendingInvitations: (userId) => {
        return get().members.filter(
          member => member.user_id === userId && member.status === 'invited'
        );
      },

      isGroupOwner: (groupId, userId) => {
        const member = get().getMemberByUserAndGroup(userId, groupId);
        return member?.role === 'owner';
      },

      isGroupAdmin: (groupId, userId) => {
        const member = get().getMemberByUserAndGroup(userId, groupId);
        return member?.role === 'admin' || member?.role === 'owner';
      },

      clearError: () => set({ error: null }),
      
      reset: () => {
        console.log('🔄 멤버 스토어 리셋');
        const freshMembers = createInitialMembers();
        localStorage.setItem('group-members', JSON.stringify(freshMembers));
        set({
          members: freshMembers,
          loading: false,
          error: null
        });
      }
    }),
    {
      name: 'group-member-store',
      partialize: (state) => ({ 
        members: state.members
      })
    }
  )
);

// 글로벌 디버깅을 위한 참조 추가
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__GROUP_MEMBER_STORE__ = useGroupMemberStore;
  console.log('🔧 글로벌 그룹 멤버 스토어 참조 등록됨');
}

export default useGroupMemberStore;
