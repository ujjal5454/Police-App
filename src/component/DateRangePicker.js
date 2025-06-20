import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DateRangePicker.css';

const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 
  'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const DateRangePicker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null
  });

  // Generate calendar data for multiple months
  const generateCalendarData = () => {
    const calendarData = [];
    const currentYear = 2081; // Starting Nepali year

    // Generate 3 months of data (you can adjust this number)
    for (let monthIndex = 0; monthIndex < 3; monthIndex++) {
      const month = {
        name: NEPALI_MONTHS[monthIndex],
        year: currentYear,
        weeks: []
      };

      // Generate days for the month (assuming 30 days per month for simplicity)
      let currentWeek = [];
      const daysInMonth = 32;
      
      // Add empty days at the start if needed (for proper day alignment)
      const firstDayOffset = monthIndex === 0 ? 5 : 0; // Example: Baishakh 1 starts on Friday
      for (let i = 0; i < firstDayOffset; i++) {
        currentWeek.push(null);
      }

      // Add the days
      for (let day = 1; day < daysInMonth; day++) {
        currentWeek.push(day);
        
        if (currentWeek.length === 7) {
          month.weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      // Add the remaining days
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        month.weeks.push(currentWeek);
      }

      calendarData.push(month);
    }

    return calendarData;
  };

  const handleDayClick = (year, month, day) => {
    if (!day) return;

    const newDate = { year, month, day };
    
    if (!selectedDates.startDate || (selectedDates.startDate && selectedDates.endDate)) {
      // Start new selection
      setSelectedDates({
        startDate: newDate,
        endDate: null
      });
    } else {
      // Complete the selection
      const start = selectedDates.startDate;
      if (
        year < start.year ||
        (year === start.year && month < start.month) ||
        (year === start.year && month === start.month && day < start.day)
      ) {
        // If selected date is before start date, make it the new start date
        setSelectedDates({
          startDate: newDate,
          endDate: null
        });
      } else {
        setSelectedDates({
          startDate: start,
          endDate: newDate
        });
      }
    }
  };

  const isDateSelected = (year, month, day) => {
    if (!day) return false;
    
    const { startDate, endDate } = selectedDates;
    if (!startDate) return false;

    if (!endDate) {
      return (
        year === startDate.year &&
        month === startDate.month &&
        day === startDate.day
      );
    }

    const isAfterStart =
      year > startDate.year ||
      (year === startDate.year && month > startDate.month) ||
      (year === startDate.year && month === startDate.month && day >= startDate.day);

    const isBeforeEnd =
      year < endDate.year ||
      (year === endDate.year && month < endDate.month) ||
      (year === endDate.year && month === endDate.month && day <= endDate.day);

    return isAfterStart && isBeforeEnd;
  };

  const handleSave = () => {
    if (selectedDates.startDate && selectedDates.endDate) {
      const fromNotice = location.state?.fromNotice;
      const targetPath = fromNotice ? '/notice' : '/my-incidents';

      navigate(targetPath, {
        state: {
          dateRange: selectedDates,
          ...(fromNotice && { currentFilters: location.state.currentFilters })
        }
      });
    }
  };

  const handleClose = () => {
    const fromNotice = location.state?.fromNotice;
    const targetPath = fromNotice ? '/notice' : '/my-incidents';
    navigate(targetPath);
  };

  const formatDateRange = () => {
    if (!selectedDates.startDate) return 'Start Date - End Date';
    if (!selectedDates.endDate) return `${selectedDates.startDate.day} ${NEPALI_MONTHS[selectedDates.startDate.month]} - End Date`;
    return `${selectedDates.startDate.day} ${NEPALI_MONTHS[selectedDates.startDate.month]} - ${selectedDates.endDate.day} ${NEPALI_MONTHS[selectedDates.endDate.month]}`;
  };

  const calendarData = generateCalendarData();

  return (
    <div className="date-range-picker">
      <div className="date-picker-card">
        <div className="date-picker-header">
          <button className="close-button" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="white"/>
            </svg>
          </button>
          <div className="header-title">
            <span>Select range</span>
            <div className="date-range">
              {formatDateRange()}
              <button className="edit-button">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/>
                </svg>
              </button>
            </div>
          </div>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>

        <div className="calendar-container">
          {calendarData.map((month, monthIndex) => (
            <div key={month.name} className="month-section">
              <h3>{month.name} {month.year}</h3>
              <div className="calendar">
                <div className="weekdays">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="weekday">{day}</div>
                  ))}
                </div>
                {month.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="week">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`day ${day ? 'active' : ''} ${
                          isDateSelected(month.year, monthIndex, day) ? 'selected' : ''
                        }`}
                        onClick={() => handleDayClick(month.year, monthIndex, day)}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker; 