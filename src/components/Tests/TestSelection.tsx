import React, { useState } from 'react';
import './TestSelection.css';
import Logo from '../Logo';
import { Link } from 'react-router-dom';

const TestSelection: React.FC = () => {
  const [hoveredTest, setHoveredTest] = useState<string | null>(null);
  const [Chapter, setChapter] = useState<string | null>(null);

  const testInfo = {
    IELTS: "IELTS (International English Language Testing System) assesses your English proficiency through Listening, Reading, Writing, and Speaking.",
    SAT: "SAT (Scholastic Assessment Test) evaluates your readiness for college, focusing on Verbal and Math skills."
  };

  const chapterInfo = {
    Reading: `
      IELTS Reading\n
      40 questions - 60 minutes\n
      1. True/False/Not Given\n
      2. Matching Headings\n
      3. Multiple Choice\n
      4. Filling the Gap\n
      5. Matching Information\n
      6. Diagram Labeling\n
      Part 1: 1 text (simple topics)\n
      Part 2: 1 text (work-related topics)\n
      Part 3: 1 long text (complex topics)
    `,
    Listening: `
      IELTS Listening\n
      40 questions - 40(30) minutes\n
      Read about the exam structure
    `,
    Writing: `
      IELTS Writing\n
      1st Essay - 20 minutes\n
      2nd Essay - 40 minutes\n
      Read about the exam structure
    `,
    Speaking: `
      IELTS Speaking\n
      3 parts - 15 minutes\n
      Read about the exam structure
    `,
    Math: `
      SAT Math\n
      2 modules - 22 questions each - 35 minutes each\n
      Total: 44 questions - 70 minutes\n
      Test questions and questions requiring a written response
    `,
    Verbal: `
      SAT Verbal\n
      2 modules - 27 questions each - 32 minutes each\n
      Total: 54 questions - 64 minutes\n
      1-5: Words in context\n
      5-10: Central Ideas and Details/Text structure and Purpose/Cross-Text Connections\n
      10-15: Command of Evidence: Textual and Quantitative\n
      15-24: Transitions/Boundaries/Form, Structure, and Sense\n
      24-27: Rhetorical Synthesis
    `
  };

  const formatText = (text: string) => {
    return text.split('\n').map((str, index) => (
      <React.Fragment key={index}>
        {str.trim()}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="test-selection">
      <div className='Logo-color'><Logo/></div>
      <h1>Select Your Test</h1>
      <div className="test-options">
        <div
          className="test-option"
          onMouseEnter={() => setHoveredTest('IELTS')}
        >
          <h2>IELTS</h2>
          <ul>
            <li
              onMouseEnter={() => setChapter('Reading')}
            ><i className="fa fa-book"></i> Reading</li>
            <li
              onMouseEnter={() => setChapter('Listening')}
            ><i className="fa fa-headphones"></i> Listening</li>
            <li
              onMouseEnter={() => setChapter('Writing')}
            ><i className="fa fa-pencil"></i> Writing</li>
            <li
              onMouseEnter={() => setChapter('Speaking')}
            ><i className="fa fa-comments"></i> Speaking</li>
          </ul>
        </div>
        <div
          className="test-option"
          onMouseEnter={() => setHoveredTest('SAT')}
        >
          <h2>SAT</h2>
          <ul>
            <Link to='/Test/Sat_Verbal'><li
              onMouseEnter={() => setChapter('Verbal')}
            ><i className="fa fa-book"></i> Verbal</li></Link>
            <Link to='/Test/Sat_Math'><li
              onMouseEnter={() => setChapter('Math')}
            ><i className="fa fa-calculator"></i> Math</li></Link>
          </ul>
        </div>
      </div>

      {hoveredTest && (
        <div className="test-info">
          {formatText(testInfo[hoveredTest as keyof typeof testInfo])}
          <br />
          {Chapter && formatText(chapterInfo[Chapter as keyof typeof chapterInfo])}
        </div>
      )}
    </div>
  );
}

export default TestSelection;
