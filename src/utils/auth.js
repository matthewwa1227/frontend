export const setAuth = (token, student) => {
  localStorage.setItem('token', token);
  localStorage.setItem('student', JSON.stringify(student));
};

export const getAuth = () => {
  const token = localStorage.getItem('token');
  const student = localStorage.getItem('student');
  return {
    token,
    student: student ? JSON.parse(student) : null,
  };
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('student');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};