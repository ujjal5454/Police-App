import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { IoArrowBack, IoSearch, IoChevronUp, IoChevronDown } from 'react-icons/io5';
import './FAQ.css';

const FAQ = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const faqItems = [
    {
      id: 1,
      question: 'Do I need to register in the app to report an incident?',
      answer: 'No, it is not mandatory to register in app to report an incident. However, there are additional features that you can access if you register such as follow-up the reported incident, panic mode and many more. Therefore, we highly recommend that you do.'
    },
    {
      id: 2,
      question: 'How to access the police personnel related features in app? (For police personnel only)',
      answer: 'You need to login in app using your PMIS code and password to access the police related features. If you have any problem regarding the PMIS login, please contact PMIS section, Police Headquarters at 01-4411210 (extension 548). For detail information about PMIS login / password, refer to User guide section of the app.'
    },
    {
      id: 3,
      question: 'How can I change my password?',
      answer: 'You can change your password by going to Settings > User Settings > Change Password. You will need to enter your current password and then set a new password.'
    },
    {
      id: 4,
      question: 'What is Panic Mode and how does it work?',
      answer: 'Panic Mode is an emergency feature that allows you to quickly alert authorities in case of danger. When activated, it sends your location and emergency signal to nearby police stations.'
    },
    {
      id: 5,
      question: 'How do I report a traffic violation using Public Eye?',
      answer: 'Open the Public Eye feature, select the type of violation, take photos or videos as evidence, add location details, and submit the report. You can track the status of your report in the My Reports section.'
    },
    {
      id: 6,
      question: 'Can I use the app without internet connection?',
      answer: 'Some basic features like emergency contacts and saved information can be accessed offline. However, most features including reporting incidents, Public Eye, and real-time updates require an internet connection.'
    }
  ];

  const filteredItems = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div className="faq-container">
      <div className="faq-card">
        {/* Header */}
        <div className="faq-header">
          <button className="back-button" onClick={() => navigate('/settings')}>
            <IoArrowBack size={24} />
          </button>
          <h1 className="faq-title">Frequently Asked Questions</h1>
        </div>

        {/* Content */}
        <div className="faq-content">
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <IoSearch className="search-icon" />
            </div>
          </div>

          {/* FAQ Items */}
          <div className="faq-items">
            {filteredItems.map((item) => (
              <div key={item.id} className="faq-item">
                <button 
                  className="faq-question-btn"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <span className="faq-question">{item.question}</span>
                  {expandedItems[item.id] ? (
                    <IoChevronUp className="chevron-icon" />
                  ) : (
                    <IoChevronDown className="chevron-icon" />
                  )}
                </button>
                
                {expandedItems[item.id] && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredItems.length === 0 && (
            <div className="no-results">
              <p>No questions found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
