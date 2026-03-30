import React from 'react';
import { cn } from '../../utils/cn';

/**
 * QuestFilters - Filter tabs and controls for quest log
 * 
 * @param {Object} props
 * @param {string} props.activeFilter - Current filter (ALL, STUDY, ASSIGNMENTS, CHALLENGES)
 * @param {function} props.onFilterChange - Filter change handler
 * @param {string} props.activeTab - Current tab (ACTIVE, DAILY, COMPLETED)
 * @param {function} props.onTabChange - Tab change handler
 * @param {string} props.sortBy - Current sort (NEWEST, OLDEST, XP_HIGH, XP_LOW)
 * @param {function} props.onSortChange - Sort change handler
 * @param {string} props.className - Additional CSS classes
 */
const QuestFilters = ({
  activeFilter = 'ALL',
  onFilterChange,
  activeTab = 'ACTIVE',
  onTabChange,
  sortBy = 'NEWEST',
  onSortChange,
  className = '',
}) => {
  const filters = [
    { id: 'ALL', label: 'ALL QUESTS', count: null },
    { id: 'STUDY', label: 'STUDY', count: null },
    { id: 'ASSIGNMENTS', label: 'ASSIGNMENTS', count: null },
    { id: 'CHALLENGES', label: 'CHALLENGES', count: null },
  ];

  const tabs = [
    { id: 'ACTIVE', label: 'ACTIVE QUESTS', icon: 'swords' },
    { id: 'DAILY', label: 'DAILY BOUNTIES', icon: 'schedule' },
    { id: 'COMPLETED', label: 'COMPLETED', icon: 'inventory' },
  ];

  const sortOptions = [
    { id: 'NEWEST', label: 'NEWEST' },
    { id: 'OLDEST', label: 'OLDEST' },
    { id: 'XP_HIGH', label: 'XP: HIGH' },
    { id: 'XP_LOW', label: 'XP: LOW' },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-['Press_Start_2P'] text-[10px] uppercase transition-all",
              "border-b-4 active:translate-y-1 active:border-b-0",
              activeTab === tab.id
                ? "bg-primary text-on-primary border-on-primary-fixed-variant"
                : "bg-surface-container text-on-surface-variant border-surface-container-high hover:text-primary"
            )}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Pills & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id)}
              className={cn(
                "px-3 py-1.5 font-['Press_Start_2P'] text-[8px] uppercase transition-all",
                activeFilter === filter.id
                  ? "bg-secondary text-on-secondary border border-secondary"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant hover:border-secondary hover:text-secondary"
              )}
            >
              {filter.label}
              {filter.count !== null && (
                <span className="ml-1 text-tertiary">({filter.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">sort</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="bg-surface-container border border-outline-variant px-3 py-1.5
                       font-['Press_Start_2P'] text-[8px] text-on-surface
                       focus:border-primary focus:outline-none cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * SubjectFilter - Sidebar filter for subjects
 */
export const SubjectFilter = ({
  subjects = [],
  activeSubject = 'ALL',
  onSubjectChange,
  className = '',
}) => {
  const defaultSubjects = [
    { id: 'ALL', name: 'All Subjects', icon: 'school', color: 'primary' },
    { id: 'MATH', name: 'Mathematics', icon: 'calculate', color: 'secondary' },
    { id: 'ENGLISH', name: 'English', icon: 'menu_book', color: 'primary' },
    { id: 'SCIENCE', name: 'Science', icon: 'science', color: 'tertiary' },
    { id: 'HISTORY', name: 'History', icon: 'history', color: 'secondary' },
  ];

  const subjectList = subjects.length > 0 ? subjects : defaultSubjects;

  return (
    <div className={cn("bg-surface-container border-2 border-outline-variant p-4", className)}>
      <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined">filter_list</span>
        SUBJECTS
      </h3>
      
      <div className="space-y-2">
        {subjectList.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSubjectChange?.(subject.id)}
            className={cn(
              "w-full flex items-center gap-3 p-2 transition-all",
              activeSubject === subject.id
                ? "bg-surface-container-high border-l-2 border-primary"
                : "hover:bg-surface-container-high border-l-2 border-transparent"
            )}
          >
            <span className={cn(
              "material-symbols-outlined text-sm",
              activeSubject === subject.id ? `text-${subject.color}` : 'text-on-surface-variant'
            )}>
              {subject.icon}
            </span>
            <span className={cn(
              "font-['Press_Start_2P'] text-[8px]",
              activeSubject === subject.id ? 'text-on-surface' : 'text-on-surface-variant'
            )}>
              {subject.name}
            </span>
            {activeSubject === subject.id && (
              <span className="material-symbols-outlined text-primary text-sm ml-auto">check</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestFilters;
