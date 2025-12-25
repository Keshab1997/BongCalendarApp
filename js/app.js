// js/app.js

document.addEventListener("DOMContentLoaded", async () => {
    
    // স্ট্রাকচার লোড (আপনার লোডার ফাংশন ব্যবহার করে)
    // নিশ্চিত হোন loadComponent ফাংশনটি ui.js এ আছে
    await loadComponent('header-container', 'components/header.html');
    
    // মেইন কন্টেন্ট সেকশনগুলো (index.html এ এই আইডিগুলো থাকতে হবে)
    await loadComponent('calendar-container', 'components/calendar.html'); // ১. ক্যালেন্ডার
    await loadComponent('chart-container', 'components/calendar-chart.html'); // ২. চার্ট
    await loadComponent('weather-container', 'components/weather.html'); // ৩. আবহাওয়া
    await loadComponent('news-container', 'components/news.html'); // ৪. খবর
    
    // ফুটার ও ন্যাভ
    await loadComponent('footer-container', 'components/footer.html');
    // ন্যাভ বার (nav-container যদি থাকে, অথবা index.html এ হার্ডকোড থাকলে এই লাইন লাগবে না)
    // await loadComponent('nav-container', 'components/nav.html'); 

    // --- লজিক শুরু ---
    
    // ১. ন্যাভিগেশন সেটআপ (যদি nav.js থাকে)
    if(typeof setupNavigation === 'function') {
        setupNavigation();
    }

    // ২. ক্যালেন্ডার আপডেট (এটিই লোকেশন এবং ওয়েদার ট্রিগার করবে)
    if(typeof updateCalendar === 'function') {
        updateCalendar();
    }

    // ৩. চার্ট জেনারেট
    if(typeof initChart === 'function') {
        initChart();
    }
    
    // ৪. খবর লোড (যদি থাকে)
    if(typeof fetchNews === 'function') {
        fetchNews(); // news.js এ এই ফাংশন থাকতে হবে
    }
});

// হেল্পার ফাংশন (যদি ui.js এ না থাকে তবে এখানে রাখতে পারেন)
async function loadComponent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;
        }
    } catch (err) {
        console.error(`Error loading ${filePath}:`, err);
    }
}