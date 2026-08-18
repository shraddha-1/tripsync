import React, { useState, useEffect } from 'react';
import { AuthAPI, TokenManager } from './apiService';
import HomePage from './HomePage';
import TravelPlanner from './TravelPlanner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const initAuth = async () => {
    // 1. Check for invite token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    
    if (inviteToken) {
      
      // Store it for later use during registration/login
      localStorage.setItem('pendingInvite', inviteToken);
      // Clean up URL (remove ?invite=token)
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Clean up any invalid/empty invite tokens
      const storedInvite = localStorage.getItem('pendingInvite');
      if (!storedInvite || storedInvite.trim() === '') {
        localStorage.removeItem('pendingInvite');
      }
    }

    const token = TokenManager.getToken();

    
    if (token) {
      try {
        // Verify token is still valid by fetching user data
        const user = await AuthAPI.getCurrentUser();

        setUserData(user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        // Token is invalid, clear it
        TokenManager.removeToken();
        setIsLoggedIn(false);
        setUserData(null);
      }
    }
    
    setLoading(false);
  };

  initAuth();
}, []);

  const handleGetStarted = (data) => {

    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {

    TokenManager.removeToken();
    setIsLoggedIn(false);
    setUserData(null);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <HomePage onGetStarted={handleGetStarted} />;
  }

  return (
    <TravelPlanner 
      userData={userData} 
      onLogoutToHome={handleLogout} 
    />
  );
}