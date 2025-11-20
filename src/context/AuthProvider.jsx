import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("crm_user");
    const token = localStorage.getItem("token");
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("crm_user");
      }
    }
  }, []);

  const login = (authData) => {
    // authData contains { token, user }
    const userData = authData.user || authData;
    setUser(userData);
    // Store user data for context
    localStorage.setItem("crm_user", JSON.stringify(userData));
    // Token is already stored in Login component
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
