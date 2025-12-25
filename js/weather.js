// js/weather.js

// Lat/Lon প্যারামিটার যোগ করা হয়েছে (ডিফল্ট কলকাতা)
async function loadWeather(lat = 22.5726, lon = 88.3639) {
    
    // API URL এ daily প্যারামিটার যোগ করা হয়েছে
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // ১. বর্তমান আবহাওয়া
        const temp = data.current_weather.temperature;
        const wind = data.current_weather.windspeed;
        const code = data.current_weather.weathercode;

        // UI আপডেট (যদি এলিমেন্ট থাকে)
        if(document.getElementById('w-temp')) {
            document.getElementById('w-temp').innerText = `${Math.round(temp)}°C`;
            document.getElementById('w-wind').innerText = wind;
            
            const condition = getWeatherCondition(code);
            document.getElementById('w-desc').innerText = condition.text;
            document.getElementById('w-icon').innerText = condition.icon;
        }

        // ২. ৫ দিনের পূর্বাভাস আপডেট
        updateForecastUI(data.daily);

    } catch (error) {
        console.error("Weather Error:", error);
        if(document.getElementById('w-desc')) {
            document.getElementById('w-desc').innerText = "নেটওয়ার্ক সমস্যা";
        }
    }
}

// ৫ দিনের লিস্ট তৈরি করার ফাংশন
function updateForecastUI(dailyData) {
    const listContainer = document.getElementById('forecast-list');
    if(!listContainer) return;

    let html = '';

    // লুপ ১ থেকে ৫ পর্যন্ত (০ = আজ, ১ = কাল)
    for(let i = 1; i <= 5; i++) {
        const dateStr = dailyData.time[i];
        const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
        const minTemp = Math.round(dailyData.temperature_2m_min[i]);
        const code = dailyData.weathercode[i];
        
        const dayName = getBanglaDayName(dateStr);
        const condition = getWeatherCondition(code);

        html += `
            <div class="daily-item">
                <span class="day-name">${dayName}</span>
                <span class="small-icon">${condition.icon}</span>
                <div class="temp-range">
                    <span>${maxTemp}°</span>
                    <span class="min-temp">${minTemp}°</span>
                </div>
            </div>
        `;
    }
    listContainer.innerHTML = html;
}

// তারিখ থেকে বারের নাম (বাংলায়)
function getBanglaDayName(dateString) {
    const date = new Date(dateString);
    const days = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];
    return days[date.getDay()];
}

// WMO কোড লজিক
function getWeatherCondition(code) {
    if (code === 0) return { text: "পরিষ্কার", icon: "☀️" };
    if (code >= 1 && code <= 3) return { text: "মেঘলা", icon: "⛅" };
    if (code >= 45 && code <= 48) return { text: "কুয়াশা", icon: "🌫️" };
    if (code >= 51 && code <= 67) return { text: "বৃষ্টি", icon: "🌧️" };
    if (code >= 80 && code <= 99) return { text: "ঝড়-বৃষ্টি", icon: "⛈️" };
    return { text: "সাধারণ", icon: "🌥️" };
}