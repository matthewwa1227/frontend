// familyApi.js

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

// ---- Parent: Children with schedule data ----
export async function fetchChildrenStats() {
  const res = await fetch(`${API_BASE}/family/children-stats`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

// ---- Parent: View child's schedules ----
export async function fetchChildSchedules(studentId) {
  const res = await fetch(`${API_BASE}/family/children/${studentId}/schedules`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

// ---- Parent: View child's mastery report ----
export async function fetchChildMastery(studentId) {
  const res = await fetch(`${API_BASE}/family/children/${studentId}/mastery`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}

// ---- Parent: Adjust time limit ----
export async function updateChildTimeLimit(studentId, dailyMinutes) {
  const res = await fetch(`${API_BASE}/family/children/${studentId}/time-limit`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ dailyMinutes })
  });
  return handleResponse(res);
}

// ---- Parent: Force rest day ----
export async function setChildRestDay(studentId, date = null) {
  const res = await fetch(`${API_BASE}/family/children/${studentId}/rest-day`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ date })
  });
  return handleResponse(res);
}

// ---- Parent: Acknowledge burnout alert ----
export async function acknowledgeBurnout(studentId) {
  const res = await fetch(`${API_BASE}/family/children/${studentId}/burnout-ack`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return handleResponse(res);
}

// ---- Student: Submit onboarding ----
export async function submitOnboarding(formLevel) {
  const res = await fetch(`${API_BASE}/schedule/onboard`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ formLevel })
  });
  return handleResponse(res);
}

// ---- Student: Create learning schedule ----
export async function createSchedule(topic, subject) {
  const res = await fetch(`${API_BASE}/schedule`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ topic, subject })
  });
  return handleResponse(res);
}

// ---- Student: Get active schedules ----
export async function fetchMySchedules() {
  const res = await fetch(`${API_BASE}/schedule`, {
    headers: getHeaders()
  });
  return handleResponse(res);
}