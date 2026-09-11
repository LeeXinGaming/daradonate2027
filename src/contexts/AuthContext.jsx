import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

const saveAuthToken = (token) => {
  localStorage.setItem('zoee_auth_token', token);
  localStorage.setItem('dara_auth_token', token);
};

const getAuthToken = () => {
  return localStorage.getItem('zoee_auth_token') || localStorage.getItem('dara_auth_token');
};

const removeAuthToken = () => {
  localStorage.removeItem('zoee_auth_token');
  localStorage.removeItem('dara_auth_token');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [streamer, setStreamer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on page load
  useEffect(() => {
    const initAuth = async () => {
      // 0. Check URL hash parameters for OAuth redirects (e.g. #access_token=...&refresh_token=...)
      if (window.location.hash && window.location.hash.includes('access_token=')) {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            // Decode JWT payload
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const payload = JSON.parse(jsonPayload);

            if (payload && (payload.email || payload.sub)) {
              const userMeta = payload.user_metadata || {};
              const googleData = {
                email: payload.email || userMeta.email,
                displayName: userMeta.full_name || userMeta.name || payload.email?.split('@')[0] || 'Creator',
                avatarUrl: userMeta.avatar_url || userMeta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                googleId: payload.sub
              };

              // Set session in Supabase client if available
              if (supabase && refreshToken) {
                supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).catch(() => {});
              }

              // Sync with backend API to auto-provision streamer profile & issue platform token
              const res = await api.post('/auth/google', googleData);
              if (res.success && res.data.token) {
                saveAuthToken(res.data.token);
                setUser(res.data.user);
                setStreamer(res.data.streamer);

                // Clean up hash from address bar
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                setLoading(false);
                return;
              }
            }
          }
        } catch (hashErr) {
          console.warn('OAuth URL hash parsing error:', hashErr);
        }
      }

      // 1. Check if Supabase session returned from Google OAuth redirect
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const userMeta = session.user.user_metadata || {};
            const googleData = {
              email: session.user.email,
              displayName: userMeta.full_name || userMeta.name || session.user.email.split('@')[0],
              avatarUrl: userMeta.avatar_url || userMeta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              googleId: session.user.id
            };
            const res = await api.post('/auth/google', googleData);
            if (res.success && res.data.token) {
              saveAuthToken(res.data.token);
              setUser(res.data.user);
              setStreamer(res.data.streamer);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase session recovery error:', err);
        }
      }


      // 2. Check local JWT token
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      api.get('/auth/me')
        .then((res) => {
          if (res.success) {
            setUser(res.data.user);
            setStreamer(res.data.streamer);
          }
        })
        .catch(() => {
          removeAuthToken();
          setUser(null);
          setStreamer(null);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    initAuth();

    // 3. Listen to Supabase auth state changes for OAuth redirects
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userMeta = session.user.user_metadata || {};
          const googleData = {
            email: session.user.email,
            displayName: userMeta.full_name || userMeta.name || session.user.email.split('@')[0],
            avatarUrl: userMeta.avatar_url || userMeta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            googleId: session.user.id
          };
          try {
            const res = await api.post('/auth/google', googleData);
            if (res.success && res.data.token) {
              saveAuthToken(res.data.token);
              setUser(res.data.user);
              setStreamer(res.data.streamer);
            }
          } catch (err) {
            console.error('Failed to sync Supabase Google user:', err);
          }
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data.token) {
      saveAuthToken(res.data.token);
      setUser(res.data.user);
      setStreamer(res.data.streamer);
    }
    return res;
  };

  const loginWithGoogle = async (googlePayload = {}) => {
    // 1. Primary Flow: Supabase Google OAuth 2.0 with redirect
    if (supabase && typeof supabase.auth?.signInWithOAuth === 'function') {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.warn('Supabase Google OAuth error, trying direct backend auth:', err.message);
      }
    }

    // 2. Direct Backend Google Auth Fallback
    const defaultGoogleData = {
      email: googlePayload.email || 'zoee_google@gmail.com',
      displayName: googlePayload.displayName || 'Google Creator',
      avatarUrl: googlePayload.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      googleId: googlePayload.googleId || 'google_' + Math.random().toString(36).substring(2, 9)
    };

    const res = await api.post('/auth/google', defaultGoogleData);
    if (res.success && res.data.token) {
      saveAuthToken(res.data.token);
      setUser(res.data.user);
      setStreamer(res.data.streamer);
    }
    return res;
  };


  const register = async (email, username, password, displayName) => {
    const res = await api.post('/auth/register', {
      email,
      username,
      password,
      display_name: displayName
    });
    if (res.success && res.data.token) {
      saveAuthToken(res.data.token);
      setUser(res.data.user);
      setStreamer(res.data.streamer || null);
    }
    return res;
  };


  const loginWithTelegram = async (telegramPayload = {}) => {
    const res = await api.post('/auth/telegram', telegramPayload);
    if (res.success && res.data?.token) {
      saveAuthToken(res.data.token);
      setUser(res.data.user);
      setStreamer(res.data.streamer || null);
    }
    return res;
  };

  const setDirectSession = (token, userData, streamerData) => {
    if (token) {
      saveAuthToken(token);
      setUser(userData);
      setStreamer(streamerData || null);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setStreamer(null);
  };

  const refreshSession = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.data.user);
        setStreamer(res.data.streamer);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      streamer,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      isStreamer: user?.role === 'STREAMER' || Boolean(streamer),
      login,
      loginWithGoogle,
      loginWithTelegram,
      setDirectSession,
      register,
      logout,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
