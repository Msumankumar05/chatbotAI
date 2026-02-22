import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Chat from './pages/Chat';
import History from './pages/History';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#e5e5e5',
            border: '1px solid #262626',
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;