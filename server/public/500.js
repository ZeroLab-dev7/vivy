// Countdown timer
let t = 10;
const el = document.getElementById('countdown');
const interval = setInterval(() => {
    t--;
    if (el) el.textContent = t;
    if (t <= 0) {
        clearInterval(interval);
        location.reload();
    }
}, 1000);

document.getElementById('btn-retry')?.addEventListener('click', () => {
    location.reload();
});
