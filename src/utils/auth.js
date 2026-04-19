export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const safeJSONParse = (str) => {
  if (!str || str === 'null' || str === 'undefined') return null;
  try {
    return JSON.parse(str);
  } catch {
    console.warn('⚠️ Corrupted localStorage JSON, clearing:', str);
    return null;
  }
};

export const getAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    token,
    user: safeJSONParse(user),
  };
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return safeJSONParse(user);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const logout = () => {
  clearAuth();
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};