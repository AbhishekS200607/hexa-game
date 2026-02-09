// Theme Toggle
const themeToggle = document.createElement('button');
themeToggle.className = 'fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center transition-all hover:scale-110';
themeToggle.innerHTML = '<span class="material-symbols-outlined text-black dark:text-white">light_mode</span>';
document.body.appendChild(themeToggle);

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  
  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<span class="material-symbols-outlined text-black">dark_mode</span>';
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<span class="material-symbols-outlined text-white">light_mode</span>';
  }
}

themeToggle.addEventListener('click', toggleTheme);

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  document.documentElement.classList.remove('dark');
  themeToggle.innerHTML = '<span class="material-symbols-outlined text-black">dark_mode</span>';
}
