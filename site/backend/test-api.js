/**
 * Stage 4 — Backend API Verification Script
 * 
 * Tests all endpoints end-to-end against a running server.
 * Run: node test-api.js
 * 
 * Prerequisites: 
 *   - Server running on PORT (default 4000)
 *   - MongoDB connected
 */

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';

let apiKey = '';
let token = '';
let newApiKey = '';

// ─── helpers ────────────────────────────────────────────────────────

async function request(method, path, { body, headers = {} } = {}) {
  const url = `${BASE}${path}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else if (contentType.includes('text/csv')) {
    data = await res.text();
  } else {
    data = await res.text();
  }

  return { status: res.status, data, headers: res.headers };
}

function assert(condition, label) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`  ✓ ${label}`);
}

// ─── test suites ────────────────────────────────────────────────────

async function test_4_1_ServerHealth() {
  console.log('\n━━━ 4.1  Server connectivity ━━━');
  try {
    // Just hit a non-existent route to confirm Express is responding
    const { status } = await request('GET', '/api/health-check-nonexistent');
    // Express returns 404 for unknown routes — that's fine, it means the server is up
    assert(status === 404 || status === 200, 'Server is responding');
  } catch (err) {
    console.error(`  ✗ FAIL: Could not reach server at ${BASE}`);
    console.error(`    ${err.message}`);
    process.exit(1);
  }
}

async function test_4_2_Register() {
  console.log('\n━━━ 4.2  POST /api/auth/register ━━━');

  const { status, data } = await request('POST', '/api/auth/register', {
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });

  assert(status === 201, `Status 201 (got ${status})`);
  assert(typeof data.apiKey === 'string' && data.apiKey.startsWith('usr_'), 'API key returned with usr_ prefix');
  assert(typeof data.token === 'string' && data.token.length > 20, 'JWT token returned');
  assert(data.message === 'Account created', 'Correct success message');

  apiKey = data.apiKey;
  token = data.token;
  console.log(`  → API Key: ${apiKey.slice(0, 12)}...`);
  console.log(`  → Token:   ${token.slice(0, 20)}...`);

  // Test duplicate registration
  console.log('\n  ── Duplicate registration check ──');
  const { status: dupStatus, data: dupData } = await request('POST', '/api/auth/register', {
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  assert(dupStatus === 409, `Status 409 for duplicate (got ${dupStatus})`);
  assert(dupData.error === 'Email already registered', 'Correct duplicate error message');

  // Test validation
  console.log('\n  ── Validation check ──');
  const { status: valStatus } = await request('POST', '/api/auth/register', {
    body: { email: 'not-an-email', password: '12' },
  });
  assert(valStatus === 400, `Status 400 for invalid input (got ${valStatus})`);
}

async function test_4_3_Login() {
  console.log('\n━━━ 4.3  POST /api/auth/login ━━━');

  const { status, data } = await request('POST', '/api/auth/login', {
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });

  assert(status === 200, `Status 200 (got ${status})`);
  assert(typeof data.token === 'string' && data.token.length > 20, 'JWT token returned');
  assert(data.apiKey === apiKey, 'Same API key returned');

  // Use the login token going forward
  token = data.token;

  // Wrong password
  console.log('\n  ── Wrong password check ──');
  const { status: wrongStatus, data: wrongData } = await request('POST', '/api/auth/login', {
    body: { email: TEST_EMAIL, password: 'WrongPass999' },
  });
  assert(wrongStatus === 401, `Status 401 for wrong password (got ${wrongStatus})`);
  assert(wrongData.error === 'Invalid credentials', 'Correct error message');
}

async function test_4_4_Track() {
  console.log('\n━━━ 4.4  POST /api/track ━━━');

  const trackPayload = {
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'summer-sale-2025',
    utm_content: 'banner-v2',
    utm_term: 'web design agency',
    page_url: 'https://testsite.com/get-a-quote/',
    timestamp: new Date().toISOString(),
    // Custom captured fields
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '+91 98765 43210',
    company: 'Test Corp',
  };

  const { status, data } = await request('POST', '/api/track', {
    body: trackPayload,
    headers: { 'X-API-Key': apiKey },
  });

  assert(status === 200, `Status 200 (got ${status})`);
  assert(data.ok === true, 'Response { ok: true }');

  // Test without API key
  console.log('\n  ── Missing API key check ──');
  const { status: noKeyStatus } = await request('POST', '/api/track', {
    body: trackPayload,
  });
  assert(noKeyStatus === 401, `Status 401 without API key (got ${noKeyStatus})`);

  // Test with invalid API key
  console.log('\n  ── Invalid API key check ──');
  const { status: badKeyStatus } = await request('POST', '/api/track', {
    body: trackPayload,
    headers: { 'X-API-Key': 'usr_invalid_key_12345' },
  });
  assert(badKeyStatus === 401, `Status 401 with invalid API key (got ${badKeyStatus})`);

  // Send a second conversion with different data for CSV testing later
  console.log('\n  ── Sending second conversion ──');
  const { status: status2 } = await request('POST', '/api/track', {
    body: {
      utm_source: 'meta',
      utm_medium: 'social',
      utm_campaign: 'retarget-v2',
      page_url: 'https://testsite.com/contact/',
      timestamp: new Date().toISOString(),
      name: 'Another User',
      email: 'another@example.com',
    },
    headers: { 'X-API-Key': apiKey },
  });
  assert(status2 === 200, `Second conversion tracked (status ${status2})`);
}

async function test_4_5_GetConversions() {
  console.log('\n━━━ 4.5  GET /api/dashboard/conversions ━━━');

  const { status, data } = await request('GET', '/api/dashboard/conversions', {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert(status === 200, `Status 200 (got ${status})`);
  assert(typeof data.total === 'number' && data.total >= 2, `total >= 2 (got ${data.total})`);
  assert(data.page === 1, `page is 1 (got ${data.page})`);
  assert(Array.isArray(data.conversions), 'conversions is an array');

  // Find the google conversion from 4.4
  const googleConversion = data.conversions.find(c => c.utm_source === 'google' && c.utm_campaign === 'summer-sale-2025');
  assert(googleConversion !== undefined, 'Google conversion found');
  assert(googleConversion.captured && googleConversion.captured.name === 'Test User', 'captured.name = "Test User"');
  assert(googleConversion.captured.email === 'testuser@example.com', 'captured.email correct');
  assert(googleConversion.captured.phone === '+91 98765 43210', 'captured.phone correct');
  assert(googleConversion.captured.company === 'Test Corp', 'captured.company correct');

  // Test filtering by source
  console.log('\n  ── Source filter check ──');
  const { status: filterStatus, data: filterData } = await request(
    'GET', '/api/dashboard/conversions?source=meta',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  assert(filterStatus === 200, `Filter status 200 (got ${filterStatus})`);
  assert(filterData.conversions.every(c => c.utm_source === 'meta'), 'All filtered results are from "meta"');

  // Test without auth
  console.log('\n  ── Auth required check ──');
  const { status: noAuthStatus } = await request('GET', '/api/dashboard/conversions');
  assert(noAuthStatus === 401, `Status 401 without token (got ${noAuthStatus})`);
}

async function test_4_6_Config() {
  console.log('\n━━━ 4.6  POST /api/dashboard/config ━━━');

  const configPayload = {
    triggerPage: '/get-a-quote/',
    buttonId: 'wpforms-submit-7209',
    fields: [
      { key: 'name', id: 'wpforms-7209-field_1' },
      { key: 'email', id: 'wpforms-7209-field_2' },
      { key: 'phone', id: 'wpforms-7209-field_3' },
    ],
  };

  const { status, data } = await request('POST', '/api/dashboard/config', {
    body: configPayload,
    headers: { Authorization: `Bearer ${token}` },
  });

  assert(status === 200, `Status 200 (got ${status})`);
  assert(data.ok === true, 'Response { ok: true }');
  assert(data.message === 'Configuration saved', 'Correct success message');

  // Verify config was saved by reading it back
  console.log('\n  ── GET /api/dashboard/config ──');
  const { status: getStatus, data: getData } = await request('GET', '/api/dashboard/config', {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert(getStatus === 200, `GET status 200 (got ${getStatus})`);
  assert(getData.triggerPage === '/get-a-quote/', `triggerPage correct (got "${getData.triggerPage}")`);
  assert(getData.buttonId === 'wpforms-submit-7209', `buttonId correct (got "${getData.buttonId}")`);
  assert(Array.isArray(getData.fields) && getData.fields.length === 3, `3 field mappings (got ${getData.fields?.length})`);
  assert(getData.fields[0].key === 'name' && getData.fields[0].id === 'wpforms-7209-field_1', 'First field mapping correct');

  // Test validation — missing fields
  console.log('\n  ── Validation check ──');
  const { status: valStatus } = await request('POST', '/api/dashboard/config', {
    body: { triggerPage: '/test/', buttonId: 'btn', fields: [] },
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(valStatus === 400, `Status 400 for empty fields (got ${valStatus})`);
}

async function test_4_7_Snippet() {
  console.log('\n━━━ 4.7  GET /api/dashboard/snippet ━━━');

  const { status, data } = await request('GET', '/api/dashboard/snippet', {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert(status === 200, `Status 200 (got ${status})`);
  assert(typeof data.snippet === 'string', 'snippet is a string');
  assert(data.snippet.includes('<script>'), 'Contains <script> tag');
  assert(data.snippet.includes('</script>'), 'Contains </script> closing tag');
  assert(data.snippet.includes(apiKey), 'Contains the API key');
  assert(data.snippet.includes('/get-a-quote/'), 'Contains triggerPage');
  assert(data.snippet.includes('wpforms-submit-7209'), 'Contains buttonId');
  assert(data.snippet.includes('wpforms-7209-field_1'), 'Contains field ID');
  assert(data.snippet.includes('saveUTM'), 'Contains saveUTM function');
  assert(data.snippet.includes('/api/track'), 'Contains tracking endpoint');

  console.log(`  → Snippet length: ${data.snippet.length} chars`);
}

async function test_4_8_CSVExport() {
  console.log('\n━━━ 4.8  GET /api/dashboard/conversions/export ━━━');

  const { status, data, headers } = await request('GET', '/api/dashboard/conversions/export', {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert(status === 200, `Status 200 (got ${status})`);
  assert(headers.get('content-type')?.includes('text/csv'), 'Content-Type is text/csv');
  assert(headers.get('content-disposition')?.includes('conversions.csv'), 'Content-Disposition contains filename');

  // Parse CSV
  const lines = data.trim().split('\n');
  assert(lines.length >= 3, `At least 3 CSV lines (header + 2 data rows, got ${lines.length})`);

  const headerCols = lines[0].split(',');
  assert(headerCols.includes('timestamp'), 'CSV has timestamp column');
  assert(headerCols.includes('utm_source'), 'CSV has utm_source column');
  assert(headerCols.includes('utm_medium'), 'CSV has utm_medium column');
  assert(headerCols.includes('utm_campaign'), 'CSV has utm_campaign column');
  assert(headerCols.includes('page_url'), 'CSV has page_url column');

  // Dynamic captured columns
  assert(headerCols.includes('name'), 'CSV has dynamic "name" column');
  assert(headerCols.includes('email'), 'CSV has dynamic "email" column');

  console.log(`  → CSV columns: ${headerCols.join(', ')}`);
  console.log(`  → Data rows: ${lines.length - 1}`);

  // Test with source filter
  console.log('\n  ── Filtered CSV export ──');
  const { status: filteredStatus, data: filteredData } = await request(
    'GET', '/api/dashboard/conversions/export?source=google',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  assert(filteredStatus === 200, `Filtered export status 200 (got ${filteredStatus})`);
  const filteredLines = filteredData.trim().split('\n');
  assert(filteredLines.length >= 2, `Filtered CSV has data (got ${filteredLines.length} lines)`);
}

async function test_4_9_RegenerateApiKey() {
  console.log('\n━━━ 4.9  POST /api/dashboard/apikey/regenerate ━━━');

  // First, get current API key
  const { status: getStatus, data: getData } = await request('GET', '/api/dashboard/apikey', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(getStatus === 200, `GET apikey status 200 (got ${getStatus})`);
  assert(getData.apiKey === apiKey, 'Current API key matches');

  // Regenerate
  const { status, data } = await request('POST', '/api/dashboard/apikey/regenerate', {
    body: {},
    headers: { Authorization: `Bearer ${token}` },
  });

  assert(status === 200, `Status 200 (got ${status})`);
  assert(typeof data.apiKey === 'string' && data.apiKey.startsWith('usr_'), 'New API key returned with usr_ prefix');
  assert(data.apiKey !== apiKey, 'New key is different from old key');
  assert(typeof data.warning === 'string' && data.warning.length > 0, 'Warning message returned');

  newApiKey = data.apiKey;
  console.log(`  → Old key: ${apiKey.slice(0, 12)}...`);
  console.log(`  → New key: ${newApiKey.slice(0, 12)}...`);

  // Verify old key no longer works
  console.log('\n  ── Old key rejected check ──');
  const { status: oldKeyStatus } = await request('POST', '/api/track', {
    body: {
      utm_source: 'test',
      page_url: 'https://test.com',
      timestamp: new Date().toISOString(),
    },
    headers: { 'X-API-Key': apiKey },
  });
  assert(oldKeyStatus === 401, `Old key rejected with 401 (got ${oldKeyStatus})`);

  // Verify new key works
  console.log('\n  ── New key accepted check ──');
  const { status: newKeyStatus, data: newKeyData } = await request('POST', '/api/track', {
    body: {
      utm_source: 'test-new-key',
      page_url: 'https://test.com/new-key-test',
      timestamp: new Date().toISOString(),
      name: 'New Key Test',
    },
    headers: { 'X-API-Key': newApiKey },
  });
  assert(newKeyStatus === 200, `New key accepted with 200 (got ${newKeyStatus})`);
  assert(newKeyData.ok === true, 'Track with new key returns { ok: true }');
}

// ─── cleanup helper ─────────────────────────────────────────────────

async function cleanup() {
  console.log('\n━━━ Cleanup ━━━');
  console.log('  ℹ Test user and data left in DB for manual inspection.');
  console.log(`  ℹ Test email: ${TEST_EMAIL}`);
}

// ─── main ───────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   UTM Tracker — Stage 4 Backend Verification    ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nTarget: ${BASE}`);
  console.log(`Test user: ${TEST_EMAIL}`);

  await test_4_1_ServerHealth();
  await test_4_2_Register();
  await test_4_3_Login();
  await test_4_4_Track();
  await test_4_5_GetConversions();
  await test_4_6_Config();
  await test_4_7_Snippet();
  await test_4_8_CSVExport();
  await test_4_9_RegenerateApiKey();

  await cleanup();

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   ✓ ALL TESTS PASSED — Backend verified!        ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
}

main().catch((err) => {
  console.error('\n✗ FATAL ERROR:', err);
  process.exit(1);
});
