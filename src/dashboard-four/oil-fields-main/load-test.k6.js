
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// --- Configuration ---
// This configuration is designed for the specified scenario:
// - 200 concurrent users (VUs)
// - A sustained 15-minute load period.
export const options = {
  stages: [
    { duration: '2m', target: 200 }, // Ramp-up to 200 users over 2 minutes
    { duration: '15m', target: 200 }, // Stay at 200 users for 15 minutes
    { duration: '1m', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<800'], // 95% of requests should be below 800ms
  },
};

// --- Custom Metrics ---
const loginDuration = new Trend('login_duration');
const getScheduleDuration = new Trend('get_schedule_duration');
const submitHandoverDuration = new Trend('submit_handover_duration');
const errorRate = new Rate('error_rate');

// --- Test Setup ---
// In a real test, you would fetch credentials or prepare test data here.
const BASE_URL = 'https://api.example.com'; // IMPORTANT: Replace with the actual API URL
const USERS = [
  { username: 'user1@test.com', password: 'password' },
  { username: 'user2@test.com', password: 'password' },
  // This array would be populated with hundreds of test users in a real scenario.
];

// --- Main Test Function ---
export default function () {
  // Select a random user for this virtual user iteration
  const user = USERS[__VU % USERS.length];
  let authToken = null;

  group('User Login', () => {
    // **ACTION 1: User logs in**
    // This is a placeholder for a real authentication endpoint.
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Login' },
    });

    if (
      check(loginRes, {
        'login successful': (r) => r.status === 200,
      })
    ) {
      authToken = loginRes.json('token'); // Assuming the response contains an auth token
    } else {
      errorRate.add(1);
      return; // Abort this iteration if login fails
    }

    loginDuration.add(loginRes.timings.duration);
    sleep(1); // Think time after login
  });

  if (!authToken) {
    // Do not proceed if authentication failed
    return;
  }
  
  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  group('Main Application Flow', () => {
    // These actions are performed by a logged-in user.
    // Replace placeholder URLs with actual API endpoints.
    
    // **ACTION 2: Check Personal Schedule**
    const scheduleRes = http.get(`${BASE_URL}/api/schedule/me`, { ...authHeaders, tags: { name: 'GetSchedule' } });
    check(scheduleRes, { 'schedule fetched': (r) => r.status === 200 });
    getScheduleDuration.add(scheduleRes.timings.duration);

    sleep(3); // Think time while viewing schedule

    // **ACTION 3: Submit Handover Note**
    const handoverPayload = JSON.stringify({
      locationId: 'loc-1',
      equipmentStatus: `All systems nominal at ${new Date().toISOString()} from VU ${__VU}`,
      pendingTasks: 'Monitor pressure on Well-03.'
    });
    const handoverRes = http.post(`${BASE_URL}/api/handovers`, handoverPayload, { ...authHeaders, tags: { name: 'SubmitHandover' } });
    check(handoverRes, { 'handover submitted': (r) => r.status === 201 });
    submitHandoverDuration.add(handoverRes.timings.duration);
    
    sleep(5); // Longer think time before ending the session for this VU
  });
}
