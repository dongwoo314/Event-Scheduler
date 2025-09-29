            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 빠른 통계 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">이번 달 이벤트</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {events.filter(event => {
                  const eventDate = parseISO(event.start_time);
                  return eventDate.getMonth() === currentDate.getMonth() && 
                         eventDate.getFullYear() === currentDate.getFullYear();
                }).length}개
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">오늘 이벤트</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {getEventsForDate(new Date()).length}개
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">그룹 이벤트</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {events.filter(event => event.group_id).length}개
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarPage;
