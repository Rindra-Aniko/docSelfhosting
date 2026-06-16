import { useState, useEffect, useMemo, useCallback } from "react";
import { UserProfile } from "../types";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("docacms_token"));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("docacms_token");
  }, []);

  // Verify token on load
  useEffect(() => {
    if (token) {
      fetch("/api/auth/me", { headers: authHeaders })
        .then((res) => (res.ok ? res.json() : Promise.reject("Invalid token")))
        .then((data) => {
          setUser(data);
          if (data.must_change_password) {
            setShowProfileModal(true);
          }
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [token, authHeaders, handleLogout]);

  const handleLogin = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login gagal");

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("docacms_token", data.token);
    setShowLoginModal(false);
    if (data.user.must_change_password) {
      setShowProfileModal(true);
    }
  };

  return {
    token,
    user,
    setUser,
    showLoginModal,
    setShowLoginModal,
    showProfileModal,
    setShowProfileModal,
    handleLogin,
    handleLogout,
    authHeaders,
  };
}
