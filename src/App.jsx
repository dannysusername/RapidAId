import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Header from './components/Header.jsx';
import SubmitRequestPage from './pages/SubmitRequestPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import './App.css';

function App() {
  // <Authenticator> gates the entire app behind Cognito sign-in / sign-up and
  // renders the hosted login UI. Children only render once a user is signed in.
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <div className="App">
            <Header signOut={signOut} user={user} />
            <main>
              <Routes>
                <Route path="/" element={<SubmitRequestPage />} />
                <Route path="/submit" element={<SubmitRequestPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;
