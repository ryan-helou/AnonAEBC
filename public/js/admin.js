// ============================================================
// AnonAEBC - Admin Dashboard JavaScript
// Handles admin login, question viewing, and deletion
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const loginError = document.getElementById('login-error');
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const questionsList = document.getElementById('questions-list');
  const noQuestions = document.getElementById('no-questions');
  const refreshBtn = document.getElementById('refresh-btn');

  // Store the admin password in memory after successful login
  let adminPassword = '';

  // ----- Login Form -----
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');

    const password = passwordInput.value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Store password and show dashboard
        adminPassword = password;
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        loadQuestions();
      } else {
        loginError.textContent = 'Incorrect password.';
        loginError.classList.remove('hidden');
      }
    } catch {
      loginError.textContent = 'Could not connect to the server.';
      loginError.classList.remove('hidden');
    }
  });

  // ----- Refresh Button -----
  refreshBtn.addEventListener('click', loadQuestions);

  // ----- Load All Questions -----
  async function loadQuestions() {
    try {
      const res = await fetch('/api/admin/questions', {
        headers: { 'X-Admin-Password': adminPassword },
      });

      if (!res.ok) {
        questionsList.innerHTML = '<p class="error">Failed to load questions.</p>';
        return;
      }

      const data = await res.json();
      renderQuestions(data.questions);
    } catch {
      questionsList.innerHTML = '<p class="error">Could not connect to the server.</p>';
    }
  }

  // ----- Render Questions List -----
  function renderQuestions(questions) {
    questionsList.innerHTML = '';

    if (questions.length === 0) {
      noQuestions.classList.remove('hidden');
      return;
    }

    noQuestions.classList.add('hidden');

    questions.forEach((q) => {
      const card = document.createElement('div');
      card.className = 'question-card';

      // Format the timestamp for display
      const time = new Date(q.timestamp + 'Z').toLocaleString();

      card.innerHTML = `
        <p class="question-text">${escapeHtml(q.question_text)}</p>
        <div class="question-meta">
          <span class="timestamp">${time}</span>
          <button class="delete-btn" data-id="${q.id}">Delete</button>
        </div>
      `;

      // Attach delete handler
      card.querySelector('.delete-btn').addEventListener('click', () => deleteQuestion(q.id));

      questionsList.appendChild(card);
    });
  }

  // ----- Delete a Question -----
  async function deleteQuestion(id) {
    if (!confirm('Delete this question?')) return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': adminPassword },
      });

      if (res.ok) {
        // Reload the list after deletion
        loadQuestions();
      } else {
        alert('Failed to delete question.');
      }
    } catch {
      alert('Could not connect to the server.');
    }
  }

  // ----- Escape HTML to prevent XSS -----
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
