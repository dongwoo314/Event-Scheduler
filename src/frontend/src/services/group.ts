import apiService from './api';
import { 
  Group, 
  GroupMember,
  CreateGroupRequest,
  UpdateGroupRequest,
  InviteToGroupRequest,
  GroupsQueryParams,
  PaginatedResponse,
  Event
} from '@types/index';

class GroupService {
  /**
   * 그룹 목록 조회
   */
  async getGroups(params?: GroupsQueryParams): Promise<PaginatedResponse<Group>> {
    const response = await apiService.get<{ groups: Group[]; pagination: any }>('/groups', {
      params,
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        message: response.message,
        data: {
          items: response.data.groups,
          pagination: response.data.pagination,
        },
      };
    }
    
    throw new Error(response.message || '그룹 목록을 불러올 수 없습니다.');
  }

  /**
   * 특정 그룹 조회
   */
  async getGroup(id: string): Promise<Group> {
    const response = await apiService.get<{ group: Group }>(`/groups/${id}`);
    
    if (response.success && response.data) {
      return response.data.group;
    }
    
    throw new Error(response.message || '그룹을 불러올 수 없습니다.');
  }

  /**
   * 그룹 생성
   */
  async createGroup(data: CreateGroupRequest): Promise<Group> {
    const response = await apiService.post<{ group: Group }>('/groups', data);
    
    if (response.success && response.data) {
      return response.data.group;
    }
    
    throw new Error(response.message || '그룹 생성에 실패했습니다.');
  }

  /**
   * 그룹 수정
   */
  async updateGroup(id: string, data: UpdateGroupRequest): Promise<Group> {
    const response = await apiService.put<{ group: Group }>(`/groups/${id}`, data);
    
    if (response.success && response.data) {
      return response.data.group;
    }
    
    throw new Error(response.message || '그룹 수정에 실패했습니다.');
  }

  /**
   * 그룹 삭제
   */
  async deleteGroup(id: string): Promise<void> {
    const response = await apiService.delete(`/groups/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || '그룹 삭제에 실패했습니다.');
    }
  }

  /**
   * 그룹 멤버 목록 조회
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const response = await apiService.get<{ members: GroupMember[] }>(`/groups/${groupId}/members`);
    
    if (response.success && response.data) {
      return response.data.members;
    }
    
    throw new Error(response.message || '멤버 목록을 불러올 수 없습니다.');
  }

  /**
   * 그룹에 사용자 초대
   */
  async inviteToGroup(groupId: string, data: InviteToGroupRequest): Promise<void> {
    const response = await apiService.post(`/groups/${groupId}/invite`, data);
    
    if (!response.success) {
      throw new Error(response.message || '초대 발송에 실패했습니다.');
    }
  }

  /**
   * 그룹 가입
   */
  async joinGroup(groupId: string): Promise<void> {
    const response = await apiService.post(`/groups/${groupId}/join`);
    
    if (!response.success) {
      throw new Error(response.message || '그룹 가입에 실패했습니다.');
    }
  }

  /**
   * 그룹 나가기
   */
  async leaveGroup(groupId: string): Promise<void> {
    const response = await apiService.post(`/groups/${groupId}/leave`);
    
    if (!response.success) {
      throw new Error(response.message || '그룹 나가기에 실패했습니다.');
    }
  }

  /**
   * 그룹 멤버 역할 변경
   */
  async updateMemberRole(
    groupId: string, 
    memberId: string, 
    role: 'owner' | 'admin' | 'moderator' | 'member'
  ): Promise<void> {
    const response = await apiService.patch(`/groups/${groupId}/members/${memberId}`, {
      role,
    });
    
    if (!response.success) {
      throw new Error(response.message || '멤버 역할 변경에 실패했습니다.');
    }
  }

  /**
   * 그룹에서 멤버 제거
   */
  async removeMember(groupId: string, memberId: string): Promise<void> {
    const response = await apiService.delete(`/groups/${groupId}/members/${memberId}`);
    
    if (!response.success) {
      throw new Error(response.message || '멤버 제거에 실패했습니다.');
    }
  }

  /**
   * 그룹 초대 응답
   */
  async respondToGroupInvitation(
    groupId: string, 
    status: 'accepted' | 'declined'
  ): Promise<void> {
    const response = await apiService.post(`/groups/${groupId}/respond`, {
      status,
    });
    
    if (!response.success) {
      throw new Error(response.message || '응답 전송에 실패했습니다.');
    }
  }

  /**
   * 그룹 이벤트 목록 조회
   */
  async getGroupEvents(groupId: string, params?: any): Promise<Event[]> {
    const response = await apiService.get<{ events: Event[] }>(`/groups/${groupId}/events`, {
      params,
    });
    
    if (response.success && response.data) {
      return response.data.events;
    }
    
    throw new Error(response.message || '그룹 이벤트를 불러올 수 없습니다.');
  }

  /**
   * 그룹 검색
   */
  async searchGroups(query: string): Promise<Group[]> {
    const response = await apiService.get<{ groups: Group[] }>('/groups/search', {
      params: { q: query },
    });
    
    if (response.success && response.data) {
      return response.data.groups;
    }
    
    return [];
  }

  /**
   * 공개 그룹 목록 조회
   */
  async getPublicGroups(params?: GroupsQueryParams): Promise<Group[]> {
    const response = await apiService.get<{ groups: Group[] }>('/groups/public', {
      params,
    });
    
    if (response.success && response.data) {
      return response.data.groups;
    }
    
    return [];
  }

  /**
   * 내가 가입한 그룹 목록
   */
  async getMyGroups(): Promise<Group[]> {
    const response = await apiService.get<{ groups: Group[] }>('/groups/my');
    
    if (response.success && response.data) {
      return response.data.groups;
    }
    
    return [];
  }

  /**
   * 그룹 권한 확인
   */
  async getGroupPermissions(groupId: string): Promise<any> {
    const response = await apiService.get<{ permissions: any }>(`/groups/${groupId}/permissions`);
    
    if (response.success && response.data) {
      return response.data.permissions;
    }
    
    return {};
  }

  /**
   * 그룹 설정 업데이트
   */
  async updateGroupSettings(groupId: string, settings: any): Promise<void> {
    const response = await apiService.patch(`/groups/${groupId}/settings`, settings);
    
    if (!response.success) {
      throw new Error(response.message || '그룹 설정 업데이트에 실패했습니다.');
    }
  }

  /**
   * 그룹 프로필 이미지 업로드
   */
  async uploadGroupImage(groupId: string, file: File): Promise<string> {
    const response = await apiService.uploadFile(`/groups/${groupId}/image`, file);
    
    if (response.success && response.data) {
      return response.data.url;
    }
    
    throw new Error(response.message || '이미지 업로드에 실패했습니다.');
  }

  /**
   * 그룹 통계 조회
   */
  async getGroupStats(groupId: string): Promise<any> {
    const response = await apiService.get<{ stats: any }>(`/groups/${groupId}/stats`);
    
    if (response.success && response.data) {
      return response.data.stats;
    }
    
    return {};
  }

  /**
   * 그룹 활동 로그 조회
   */
  async getGroupActivity(groupId: string, params?: any): Promise<any[]> {
    const response = await apiService.get<{ activities: any[] }>(`/groups/${groupId}/activity`, {
      params,
    });
    
    if (response.success && response.data) {
      return response.data.activities;
    }
    
    return [];
  }

  /**
   * 그룹 내 역할별 멤버 수 조회
   */
  async getGroupMemberStats(groupId: string): Promise<any> {
    const response = await apiService.get<{ memberStats: any }>(`/groups/${groupId}/member-stats`);
    
    if (response.success && response.data) {
      return response.data.memberStats;
    }
    
    return {};
  }

  /**
   * 그룹 복제
   */
  async duplicateGroup(groupId: string, newName: string): Promise<Group> {
    const response = await apiService.post<{ group: Group }>(`/groups/${groupId}/duplicate`, {
      name: newName,
    });
    
    if (response.success && response.data) {
      return response.data.group;
    }
    
    throw new Error(response.message || '그룹 복제에 실패했습니다.');
  }

  /**
   * 그룹 아카이브
   */
  async archiveGroup(groupId: string): Promise<void> {
    const response = await apiService.patch(`/groups/${groupId}/archive`);
    
    if (!response.success) {
      throw new Error(response.message || '그룹 아카이브에 실패했습니다.');
    }
  }

  /**
   * 그룹 아카이브 해제
   */
  async unarchiveGroup(groupId: string): Promise<void> {
    const response = await apiService.patch(`/groups/${groupId}/unarchive`);
    
    if (!response.success) {
      throw new Error(response.message || '그룹 아카이브 해제에 실패했습니다.');
    }
  }

  /**
   * 그룹 내보내기
   */
  async exportGroup(groupId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    const response = await apiService.get<{ exportData: any }>(`/groups/${groupId}/export`, {
      params: { format },
    });
    
    if (response.success && response.data) {
      return response.data.exportData;
    }
    
    throw new Error(response.message || '그룹 내보내기에 실패했습니다.');
  }
}

// 싱글톤 인스턴스 생성
const groupService = new GroupService();

export default groupService;
export { GroupService };
