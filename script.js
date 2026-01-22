// ===== NAVBAR SCROLL EFFECT + PARALLAX =====
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  const scrolled = window.pageYOffset;

  if (scrolled > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  requestAnimationFrame(() => {
    const leaves = document.querySelectorAll('.leaf');
    leaves.forEach((leaf, index) => {
      const speed = 0.3 + (index * 0.1);
      leaf.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
});

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  mobileMenuBtn.classList.toggle('active');
});

navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  }
});

document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    navLinks.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  });
});

// ===== FORM SUBMISSION (NO LOCAL STORAGE; POSTS TO SERVER) =====
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const submitBtn = form.querySelector('.notify-btn');
  const originalText = submitBtn.textContent;

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const company = form.elements.company.value.trim(); // honeypot

  if (company) return; // likely bot

  if (!name || name.length < 2) {
    showNotification('Please enter a valid name (at least 2 characters).', 'error');
    return;
  }
  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address.', 'error');
    return;
  }

  submitBtn.textContent = 'SUBMITTING...';
  submitBtn.disabled = true;
  submitBtn.style.background = '#ccc';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Submission failed');
    }

    showNotification(`Thank you ${name}! We'll notify you at ${email}.`, 'success');
    form.reset();
  } catch (err) {
    showNotification(err.message || 'Something went wrong. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.style.background = '';
  }
});

// ===== LANGUAGE SWITCHER =====
document.querySelectorAll('.lang-switcher a').forEach(langLink => {
  langLink.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.lang-switcher a').forEach(link => link.classList.remove('active'));
    this.classList.add('active');

    const selectedLang = this.textContent;
    if (selectedLang === 'FR') showNotification('Français sélectionné! (French support coming soon)', 'info');
    else showNotification('English selected!', 'info');
  });
});

const chatWidget = document.querySelector('.chat-widget');
const chatPopup = document.getElementById('chatPopup');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatCloseBtn = document.getElementById('chatCloseBtn');
let hasWelcomed = false;

function appendChatMessage(sender, text) {
  if (!chatMessages) return;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function openChat(includeGreeting = false) {
  if (!chatPopup) return;
  chatPopup.classList.add('open');
  chatPopup.setAttribute('aria-hidden', 'false');
  if (includeGreeting && !hasWelcomed) {
    appendChatMessage('bot', 'Welcome to GoCerise! How can we help you today?');
    hasWelcomed = true;
  }
}

function closeChat() {
  if (!chatPopup) return;
  chatPopup.classList.remove('open');
  chatPopup.setAttribute('aria-hidden', 'true');
}

chatWidget?.addEventListener('click', () => {
  if (chatPopup?.classList.contains('open')) closeChat();
  else openChat(true);
});
chatCloseBtn?.addEventListener('click', closeChat);
chatForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;
  appendChatMessage('user', message);
  chatInput.value = '';
  setTimeout(() => appendChatMessage('bot', 'Thanks for reaching out! Our team will follow up via help@GoCerise.com.'), 600);
});


// ===== FEEDBACK LINK =====
document.getElementById('feedbackLink').addEventListener('click', (e) => {
  e.preventDefault();
  showNotification('Feedback form coming soon! Email us at help@GoCerise.com', 'info');
});

// ===== HOVER EFFECTS =====
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px)';
    this.style.transition = 'transform 0.3s ease';
  });
  link.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// ===== INPUT ANIMATIONS =====
document.querySelectorAll('.form-input').forEach(input => {
  input.addEventListener('focus', function() {
    this.style.transform = 'scale(1.02) translateY(-2px)';
    this.style.transition = 'all 0.3s ease';
    this.parentElement?.classList.add('focused');
  });
  input.addEventListener('blur', function() {
    this.style.transform = 'scale(1) translateY(0)';
    this.parentElement?.classList.remove('focused');
  });
});

// ===== BUTTON RIPPLE =====
document.querySelectorAll('button, .download-btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute; width: ${size}px; height: ${size}px; left: ${x}px; top: ${y}px;
      background: rgba(255, 255, 255, 0.4); border-radius: 50%; transform: scale(0);
      animation: ripple 0.6s ease-out; pointer-events: none; z-index: 10;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);

    setTimeout(() => ripple.parentNode && ripple.remove(), 600);
  });
});

// ===== LOGO ANIMATION =====
function initLogoAnimation() {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  setInterval(() => {
    logo.style.transition = 'transform 2s ease-in-out';
    logo.style.transform = 'scale(1.02)';
    setTimeout(() => { logo.style.transform = 'scale(1)'; }, 1000);
  }, 6000);
}

// ===== UTILITIES =====
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function showNotification(message, type = 'info') {
  document.querySelectorAll('.notification').forEach(n => n.remove());
  const n = document.createElement('div');
  n.className = `notification ${type}`;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => { n.style.transform = 'translateX(0)'; }, 100);
  setTimeout(() => {
    n.style.transform = 'translateX(400px)';
    setTimeout(() => n.parentNode && n.parentNode.removeChild(n), 300);
  }, 4000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  // Dynamic styles (animations)
  if (!document.querySelector('#dynamic-styles')) {
    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.textContent = `
      @keyframes ripple { to { transform: scale(2); opacity: 0; } }
      .notification { animation: slideIn 0.3s ease; }
      @keyframes slideIn { from { transform: translateX(400px); } to { transform: translateX(0); } }
    `;
    document.head.appendChild(style);
  }

  // Page fade-in
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.8s ease-in';
    document.body.style.opacity = '1';
  }, 100);

  // Nav entrance
  const navContainer = document.querySelector('.nav-container');
  if (navContainer) {
    navContainer.style.opacity = '0';
    navContainer.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      navContainer.style.transition = 'all 0.8s ease';
      navContainer.style.opacity = '1';
      navContainer.style.transform = 'translateY(0)';
    }, 300);
  }

  // Welcome chat instead of toast
  setTimeout(() => openChat(true), 2000);

});

// Cleanup
window.addEventListener('beforeunload', () => {
  document.querySelectorAll('[data-floating]').forEach(el => el.remove());
});