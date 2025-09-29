import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Plus, Filter, Search, Calendar, MapPin, Users, 
  Edit, Trash2, Eye, Bell, Star, MoreVertical, Edit3
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '@store/ui';
import { useEventStore } from '@store/event';
import eventService from '@services/event';
import { Event } from '@types/index';
import CreateEventModal from '@components/modals/CreateEventModal';
import EventDetailModal from '@components/modals/EventDetailModal';
import EditEventModal from '@components/modals/EditEventModal';
import NotificationSettingsModal from '@components/modals/NotificationSettingsModal';
import EventNotesModal from '@components/modals/EventNotesModal';

const EventsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 전역 이벤트 스토어 사용
  const {
    events,
    loading,
    error,
    loadEvents,
    createEvent,
    editEvent,
    removeEvent,
    selectedEvent,
    setSelectedEvent,
    searchEvents,
    clearError
  } = useEventStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { setPageTitle, setBreadcrumbs } = useUiStore();

  // URL 파라미터에서 필터 추출
  const getFilterFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('filter') || 'all';
  };

  const currentFilter = getFilterFromUrl();

  // 페이지 설정
  useEffect(() => {
    const filterTitles = {
      'all': '이벤트',
      'this-month': '이번 달 일정',
      'completed': '완료된 일정',
      'upcoming': '예정된 일정'
    };
    
    const pageTitle = filterTitles[currentFilter as keyof typeof filterTitles] || '이벤트';
    setPageTitle(`${pageTitle} - Event Scheduler`);
    setBreadcrumbs([
      { label: pageTitle }
    ]);
  }, [setPageTitle, setBreadcrumbs, currentFilter]);

  // 이벤트 데이터 로드 - 데이터가 없을 때만 로드
  useEffect(() => {
    console.log('📝 EventsPage 마운트됨, 현재 이벤트 수:', events.length);
    if (events.length === 0) {
      console.log('📝 이벤트가 없어서 로드 시도');
      loadEvents();
    }
  }, [loadEvents, events.length]);
  
  // 이벤트 변경 감지
  useEffect(() => {
    console.log('📝 Events 이벤트 상태 변경:', events.length, '개');
  }, [events]);

  // 이벤트 삭제
  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
      try {
        await removeEvent(id);
        alert('이벤트가 삭제되었습니다.');
      } catch (error: any) {
        console.error('이벤트 삭제 오류:', error);
        alert('이벤트 삭제에 실패했습니다.');
      }
    }
  };

  // 새 이벤트 추가
  const handleEventCreated = async (eventData: any) => {
    try {
      await createEvent(eventData);
      alert('이벤트가 성공적으로 생성되었습니다!');
    } catch (error: any) {
      console.error('이벤트 생성 오류:', error);
      alert('이벤트 생성에 실패했습니다.');
    }
  };

  // 이벤트 업데이트
  const handleEventUpdated = async (eventId: string, eventData: any) => {
    try {
      await editEvent(eventId, eventData);
      alert('이벤트가 성공적으로 수정되었습니다!');
    } catch (error: any) {
      console.error('이벤트 수정 오류:', error);
      alert('이벤트 수정에 실패했습니다.');
    }
  };

  // 이벤트 상세보기
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  // 이벤트 편집
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // 알림 설정
  const handleNotificationSettings = (event: Event) => {
    setSelectedEvent(event);
    setShowNotificationModal(true);
  };

  // 메모 관리
  const handleNotesManagement = (event: Event) => {
    setSelectedEvent(event);
    setShowNotesModal(true);
  };

  // 드롭다운 토글
  const toggleDropdown = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === eventId ? null : eventId);
  };

  // 드롭다운 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 모달 닫기 핸들러
  const closeAllModals = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowNotificationModal(false);
    setShowNotesModal(false);
    setSelectedEvent(null);
  };

  // 이벤트 상태 변경
  const handleStatusChange = async (id: string, status: Event['status']) => {
    try {
      await editEvent(id, { status });
      
      const statusText = status === 'upcoming' ? '예정' :
                        status === 'ongoing' ? '진행중' :
                        status === 'completed' ? '완료' : '취소';
      alert(`이벤트 상태가 '${statusText}'로 변경되었습니다.`);
    } catch (error: any) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // 필터링된 이벤트들
  const filteredEvents = events.filter(event => {
    // 기본 검색 필터
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    
    // URL 파라미터 필터
    let matchesUrlFilter = true;
    const today = new Date();
    
    switch (currentFilter) {
      case 'this-month':
        const eventDate = new Date(event.start_time);
        matchesUrlFilter = eventDate.getMonth() === today.getMonth() && 
                          eventDate.getFullYear() === today.getFullYear();
        break;
      case 'completed':
        matchesUrlFilter = event.status === 'completed';
        break;
      case 'upcoming':
        matchesUrlFilter = event.status === 'upcoming';
        break;
      case 'all':
      default:
        matchesUrlFilter = true;
        break;
    }
    
    return matchesSearch && matchesCategory && matchesUrlFilter;
  });

  // 카테고리 색상
  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      work: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      social: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  // 우선순위 색상
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-red-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {currentFilter === 'this-month' ? '이번 달 일정' :
             currentFilter === 'completed' ? '완료된 일정' :
             currentFilter === 'upcoming' ? '예정된 일정' : '이벤트 관리'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {currentFilter === 'this-month' ? '이번 달에 예정된 모든 일정을 확인하세요' :
             currentFilter === 'completed' ? '완료된 모든 일정을 확인하세요' :
             currentFilter === 'upcoming' ? '예정된 모든 일정을 확인하세요' : '모든 이벤트를 한눈에 보고 효율적으로 관리하세요'}
          </p>
          {currentFilter !== 'all' && (
            <button 
              onClick={() => navigate('/events')}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              ← 모든 이벤트 보기
            </button>
          )}
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>새 이벤트</span>
        </button>
      </motion.div>

      {/* 검색 및 필터 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이벤트 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-64"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input w-40"
            >
              <option value="all">모든 카테고리</option>
              <option value="personal">개인</option>
              <option value="work">업무</option>
              <option value="social">사교</option>
              <option value="other">기타</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>총 {filteredEvents.length}개의 이벤트</span>
          </div>
        </div>
      </motion.div>

      {/* 이벤트 목록 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {loading ? (
          <div className="card p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">로딩 중...</span>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="card p-12">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || filterCategory !== 'all' ? '검색 결과가 없습니다' : '이벤트가 없습니다'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? '다른 검색어나 필터를 사용해보세요.' 
                  : '첫 번째 이벤트를 만들어보세요.'}
              </p>
              {(!searchTerm && filterCategory === 'all') && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  이벤트 만들기
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {event.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                          {event.category === 'personal' ? '개인' : 
                           event.category === 'work' ? '업무' : 
                           event.category === 'social' ? '사교' : '기타'}
                        </span>
                        <Star className={`w-4 h-4 ${getPriorityColor(event.priority)}`} />
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.start_time)}</span>
                        </div>
                        {!event.is_all_day && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEvent(event);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="상세 보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="편집"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={(e) => toggleDropdown(event.id, e)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="더보기"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdown === event.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                            <div className="py-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleViewEvent(event);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>상세보기</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleEditEvent(event);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span>편집</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleNotificationSettings(event);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Bell className="w-4 h-4" />
                                <span>알림 설정</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleNotesManagement(event);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span>메모 관리</span>
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleStatusChange(event.id, 'ongoing');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                진행중으로 변경
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleStatusChange(event.id, 'completed');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                완료로 변경
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleStatusChange(event.id, 'cancelled');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                취소로 변경
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                  handleDeleteEvent(event.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>삭제</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 이벤트 상태 표시 */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          event.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          event.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {event.status === 'upcoming' ? '예정' :
                           event.status === 'ongoing' ? '진행중' :
                           event.status === 'completed' ? '완료' : '취소'}
                        </span>
                        
                        {event.status === 'upcoming' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationSettings(event);
                            }}
                            className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            <Bell className="w-3 h-3" />
                            <span>알림 설정</span>
                          </button>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotesManagement(event);
                          }}
                          className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <Edit className="w-3 h-3" />
                          <span>메모 관리</span>
                        </button>
                      </div>
                      
                      <span className="text-xs text-gray-400">
                        {new Date(event.updated_at).toLocaleDateString('ko-KR')} 업데이트
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* 개발 상태 알림 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              🚀 실제 API 연동 준비 완료!
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              현재 목업 데이터로 UI를 표시하고 있습니다. 백엔드 API와 연동하면 실제 이벤트 데이터를 저장하고 불러올 수 있습니다.
            </p>
            <div className="mt-3 space-x-4">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                API 연동하기
              </button>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                테스트 이벤트 추가
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 이벤트 생성 모달 */}
      <CreateEventModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />

      {/* 이벤트 상세보기 모달 */}
      <EventDetailModal 
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEventUpdated={(updatedEvent) => handleEventUpdated(updatedEvent.id, updatedEvent)}
        onEventDeleted={handleDeleteEvent}
        onEditEvent={(event) => {
          setShowDetailModal(false);
          handleEditEvent(event);
        }}
      />

      {/* 이벤트 편집 모달 */}
      <EditEventModal 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEventUpdated={(updatedEvent) => handleEventUpdated(updatedEvent.id, updatedEvent)}
      />

      {/* 알림 설정 모달 */}
      <NotificationSettingsModal 
        isOpen={showNotificationModal}
        onClose={() => {
          setShowNotificationModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSettingsUpdated={(updatedEvent) => handleEventUpdated(updatedEvent.id, updatedEvent)}
      />

      {/* 메모 관리 모달 */}
      <EventNotesModal 
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onNotesUpdated={(updatedEvent) => handleEventUpdated(updatedEvent.id, updatedEvent)}
      />
    </div>
  );
};

export default EventsPage;
