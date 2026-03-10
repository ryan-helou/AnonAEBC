// ============================================================
// AnonAEBC - User-Facing JavaScript
// Handles anonymous question submission
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // ----- DOM Elements -----
  const form = document.getElementById('question-form');
  const input = document.getElementById('question-input');
  const submitBtn = document.getElementById('submit-btn');
  const charCounter = document.getElementById('char-counter');
  const charCountWrap = document.querySelector('.char-count');
  const formView = document.getElementById('form-view');
  const successView = document.getElementById('success-view');
  const anotherBtn = document.getElementById('another-btn');
  const errorMessage = document.getElementById('error-message');

  // ----- Character Counter -----
  input.addEventListener('input', () => {
    const len = input.value.length;
    charCounter.textContent = len;

    // Visual warning when approaching or exceeding limit
    if (len > 500) {
      charCountWrap.classList.add('over-limit');
    } else {
      charCountWrap.classList.remove('over-limit');
    }
  });

  // ----- Form Submission -----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const questionText = input.value.trim();

    // Client-side validation
    if (!questionText) {
      showError('Please enter a question.');
      return;
    }
    if (questionText.length > 500) {
      showError('Question must be 500 characters or less.');
      return;
    }

    // Disable button to prevent double-submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_text: questionText }),
      });

      const data = await res.json();

      if (res.ok) {
        // Show success view
        formView.classList.add('hidden');
        successView.classList.remove('hidden');
      } else {
        showError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      showError('Could not connect to the server. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Question';
    }
  });

  // ----- "Ask Another Question" Button -----
  anotherBtn.addEventListener('click', () => {
    // Reset form and switch back to form view
    input.value = '';
    charCounter.textContent = '0';
    charCountWrap.classList.remove('over-limit');
    successView.classList.add('hidden');
    formView.classList.remove('hidden');
    input.focus();
  });

  // ----- Helper Functions -----
  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }
});
