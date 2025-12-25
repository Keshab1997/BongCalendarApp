// js/nav.js

function setupNavigation() {
    // বাটন
    const btnToday = document.getElementById('btn-today');
    const btnChart = document.getElementById('btn-chart');
    const btnWeather = document.getElementById('btn-weather');
    const btnNews = document.getElementById('btn-news');

    // ভিউ কন্টেইনার
    const viewToday = document.getElementById('view-today');
    const viewChart = document.getElementById('view-chart');
    const viewWeather = document.getElementById('view-weather');
    const viewNews = document.getElementById('view-news');

    // সব ভিউ লুকানোর হেল্পার ফাংশন
    function hideAllViews() {
        viewToday.style.display = 'none';
        viewChart.style.display = 'none';
        viewWeather.style.display = 'none';
        viewNews.style.display = 'none';
    }

    // সব বাটন রিসেট করার ফাংশন
    function resetButtons() {
        [btnToday, btnChart, btnWeather, btnNews].forEach(btn => {
            if(btn) btn.classList.remove('active-nav');
        });
    }

    // ১. আজ (Today) ক্লিক
    if(btnToday) {
        btnToday.addEventListener('click', () => {
            hideAllViews();
            resetButtons();
            viewToday.style.display = 'block';
            btnToday.classList.add('active-nav');
            if(typeof updateCalendar === 'function') updateCalendar();
        });
    }

    // ২. মাসিক (Chart) ক্লিক
    if(btnChart) {
        btnChart.addEventListener('click', () => {
            hideAllViews();
            resetButtons();
            viewChart.style.display = 'block';
            btnChart.classList.add('active-nav');
            // চার্ট যদি আগে রেন্ডার না হয়ে থাকে বা রিফ্রেশ দরকার হয়
            if(typeof renderChart === 'function') {
                let currMonth = new Date().getMonth();
                let currYear = new Date().getFullYear();
                // গ্লোবাল ভেরিয়েবল থাকলে ভালো, নাহলে ডিফল্ট রেন্ডার
                if(typeof initChart === 'function') initChart();
            }
        });
    }

    // ৩. আবহাওয়া (Weather) ক্লিক
    if(btnWeather) {
        btnWeather.addEventListener('click', () => {
            hideAllViews();
            resetButtons();
            viewWeather.style.display = 'block';
            btnWeather.classList.add('active-nav');
            if(typeof loadWeather === 'function') loadWeather();
        });
    }

    // ৪. খবর (News) ক্লিক
    if(btnNews) {
        btnNews.addEventListener('click', () => {
            hideAllViews();
            resetButtons();
            viewNews.style.display = 'block';
            btnNews.classList.add('active-nav');
            if(typeof fetchNews === 'function') fetchNews();
        });
    }
}