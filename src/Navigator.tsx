import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './components/App';
import MathTasks from './components/MathTasks';
import Math from './components/Training/Math';
import SignInPage from './components/Sign-in';
import SignUpPage from './components/Sign-up';
import TestSelection from './components/TestSelection';
import Sat_Verbal from './components/Tests/SAT_Verbal';
import Sat_Math from './components/Tests/Sat_Math';
import ResultsPage from './components/UserResults';
import TrainingPage from './components/TrainingPage';
const Navigator: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/Training" element={<TrainingPage />} />
                <Route path="/Training/Math" element={<Math />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/Test" element={<TestSelection />} />
                <Route path="/Test/Sat_Verbal" element={<Sat_Verbal />} />
                <Route path="/Test/Sat_Math" element={<Sat_Math />} />
                <Route path="/Results" element={<ResultsPage/>}/>
            </Routes>
        </Router>
    );
}

export default Navigator;