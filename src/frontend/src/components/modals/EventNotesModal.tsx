import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Edit3, Save, Trash2, Plus, Clock, Tag } from 'lucide-react';
import { Event } from '@types/index';

interface EventNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onNotesUpdated: (event: Event) => void;
}

interface Note {
  id: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const EventNotesModal: React.FC<EventNotesModalProps> = ({
  isOpen,
  onClose,
  event,
  onNotesUpdated
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      // 실제로는 API에서 메모들을 불러올 것
      loadNotes();
    }
  }, [event, isOpen]);

  const loadNotes = () => {
    // 임시 데이터 - 실제로는 API 호출
    const sampleNotes: Note[] = [
      {
        id: '1',
        content: '회의 준비물: 프레젠테이션 파일, 프로젝트 진행 상황 보고서',
        tags: ['회의', '준비물'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        content: '참석자들에게 미리 전달할 자료 목록 확인',
        tags: ['할일', '중요'],
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setNotes(sampleNotes);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      tags: newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setNewNoteTags('');
    
    // 실제로는 API 호출
    console.log('새 메모 추가:', note);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  const handleSaveEdit = () => {
    if (!editingNote || !editContent.trim()) return;

    setNotes(prev => prev.map(note => 
      note.id === editingNote 
        ? {
            ...note,
            content: editContent.trim(),
            tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
            updated_at: new Date().toISOString()
          }
        : note
    ));

    setEditingNote(null);
    setEditContent('');
    setEditTags('');

    // 실제로는 API 호출
    console.log('메모 수정 완료');
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('이 메모를 삭제하시겠습니까?')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      // 실제로는 API 호출
      console.log('메모 삭제:', noteId);
    }
  };

  const handleSaveAllNotes = () => {
    if (!event) return;

    setLoading(true);
    
    // 실제로는 API 호출하여 이벤트에 메모들 저장
    setTimeout(() => {
      const updatedEvent = {
        ...event,
        notes: notes,
        updated_at: new Date().toISOString()
      };

      onNotesUpdated(updatedEvent as Event);
      setLoading(false);
      onClose();
      alert('메모가 저장되었습니다!');
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    ];
    return colors[index % colors.length];
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              이벤트 메모
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 이벤트 정보 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(event.start_time).toLocaleString('ko-KR')} - {new Date(event.end_time).toLocaleString('ko-KR')}
            </p>
          </div>

          {/* 새 메모 추가 */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              새 메모 추가
            </h3>
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="메모 내용을 입력하세요..."
              />
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    태그 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={newNoteTags}
                    onChange={(e) => setNewNoteTags(e.target.value)}
                    className="w-full input"
                    placeholder="예: 중요, 할일, 회의"
                  />
                </div>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="btn btn-primary self-end"
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          {/* 메모 목록 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              메모 목록 ({notes.length}개)
            </h3>
            
            {notes.length === 0 ? (
              <div className="text-center py-8">
                <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  아직 메모가 없습니다. 첫 번째 메모를 추가해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card p-4"
                  >
                    {editingNote === note.id ? (
                      // 편집 모드
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          rows={3}
                        />
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={editTags}
                              onChange={(e) => setEditTags(e.target.value)}
                              className="w-full input"
                              placeholder="태그 (쉼표로 구분)"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="btn btn-sm btn-primary flex items-center space-x-1"
                            >
                              <Save className="w-4 h-4" />
                              <span>저장</span>
                            </button>
                            <button
                              onClick={() => setEditingNote(null)}
                              className="btn btn-sm btn-secondary"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // 보기 모드
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                              {note.content}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditNote(note)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="편집"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* 태그들 */}
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {note.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getTagColor(tagIndex)}`}
                              >
                                <Tag className="w-3 h-3 inline mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 시간 정보 */}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>작성: {formatDate(note.created_at)}</span>
                          </div>
                          {note.updated_at !== note.created_at && (
                            <div className="flex items-center space-x-1">
                              <span>수정: {formatDate(note.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              취소
            </button>
            <button
              onClick={handleSaveAllNotes}
              className="btn btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>모든 메모 저장</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventNotesModal;