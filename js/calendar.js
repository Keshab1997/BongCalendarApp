// js/calendar.js

// ১. মেইন আপডেট ফাংশন
function updateCalendar() {
    const date = new Date();
    
    // ইংরেজি তারিখ
    if(document.getElementById('en-date')) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        document.getElementById('en-date').innerText = date.toLocaleDateString('en-US', options);
        document.getElementById('en-dayname').innerText = date.toLocaleString('default', { weekday: 'long' });
    }

    // বাংলা তারিখ
    const banglaDate = getBanglaDate(date);
    if(document.getElementById('bn-day')) {
        document.getElementById('bn-day').innerText = banglaNumber(banglaDate.day);
        document.getElementById('bn-month-year').innerText = `${banglaDate.month}, ${banglaNumber(banglaDate.year)}`;
        document.getElementById('bn-season').innerText = banglaDate.season;
    }

    // সময়সূচি এবং লোকেশন (এখান থেকেই ওয়েদার কল হবে)
    initSunTimeSmart();

    // উৎসব লোড
    loadFestivals();
}

// ২. স্মার্ট লোকেশন সিস্টেম (GPS -> IP -> Default)
function initSunTimeSmart() {
    const statusText = document.getElementById('loc-status');
    if(statusText) statusText.innerText = "(Locating...)";

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                if(statusText) statusText.innerText = "📍 GPS"; 
                fetchExactSunTime(lat, lng); // লোকেশন পাওয়া গেছে
            },
            (error) => {
                console.warn("GPS blocked/failed, trying IP...");
                getLocationByIP(); // GPS না পেলে IP
            }
        );
    } else {
        getLocationByIP();
    }
}

// ৩. IP লোকেশন (Fallback)
async function getLocationByIP() {
    const statusText = document.getElementById('loc-status');
    try {
        if(statusText) statusText.innerText = "(IP Loc...)";
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if(statusText) statusText.innerText = "📍 " + (data.city || "Detected"); 
        fetchExactSunTime(data.latitude, data.longitude);

    } catch (error) {
        if(statusText) statusText.innerText = "(Default: Kolkata)";
        updateSunAndAusTimeFallback(new Date());
    }
}

// ৪. API থেকে সময় আনা এবং Weather কল করা
async function fetchExactSunTime(lat, lng) {
    // === এই লাইনটি নতুন: ওয়েদার কল করা হচ্ছে ===
    if(typeof loadWeather === 'function') {
        loadWeather(lat, lng);
    }

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunrise,sunset&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        
        const sunriseISO = data.daily.sunrise[0]; 
        const sunsetISO = data.daily.sunset[0];   

        if(document.getElementById('val-sunrise')) {
            document.getElementById('val-sunrise').innerText = formatTimeEnglish(sunriseISO);
            document.getElementById('val-sunset').innerText = formatTimeEnglish(sunsetISO);
        }
        updateAusTimeOnly(new Date());

    } catch (error) {
        updateSunAndAusTimeFallback(new Date()); 
    }
}

// ৫. টাইম ফরম্যাটার (English)
function formatTimeEnglish(isoString) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMin = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMin} ${ampm}`;
}

// ৬. শুভ সময় আপডেট
function updateAusTimeOnly(date) {
    const dayOfWeek = date.getDay();
    const shuvoSomoyData = [
        "10:40 AM - 1:20 PM", "8:00 AM - 9:30 AM", "11:00 AM - 1:00 PM",
        "6:00 AM - 9:00 AM", "12:30 PM - 2:00 PM", "7:30 AM - 10:30 AM",
        "8:30 AM - 10:30 AM"
    ];
    if(document.getElementById('val-shuvo')) {
        document.getElementById('val-shuvo').innerText = shuvoSomoyData[dayOfWeek];
    }
}

// ৭. ফলব্যাক ফাংশন (ডিফল্ট কলকাতা)
function updateSunAndAusTimeFallback(date) {
    // যদি লোকেশন একদমই না পায়, তবুও ডিফল্ট ওয়েদার লোড করবে
    if(typeof loadWeather === 'function') {
        loadWeather(); // আর্গুমেন্ট ছাড়া কল করলে ডিফল্ট মান নেবে
    }

    const month = date.getMonth();
    const sunTimesKolkata = [
        { rise: "6:42 AM", set: "5:10 PM" }, { rise: "6:30 AM", set: "5:35 PM" },
        { rise: "6:05 AM", set: "5:52 PM" }, { rise: "5:35 AM", set: "6:05 PM" },
        { rise: "5:15 AM", set: "6:20 PM" }, { rise: "5:05 AM", set: "6:30 PM" },
        { rise: "5:10 AM", set: "6:29 PM" }, { rise: "5:20 AM", set: "6:15 PM" },
        { rise: "5:30 AM", set: "5:50 PM" }, { rise: "5:40 AM", set: "5:25 PM" },
        { rise: "5:58 AM", set: "5:05 PM" }, { rise: "6:28 AM", set: "5:02 PM" }
    ];
    const todaySun = sunTimesKolkata[month];
    if(document.getElementById('val-sunrise')) {
        document.getElementById('val-sunrise').innerText = todaySun.rise;
        document.getElementById('val-sunset').innerText = todaySun.set;
    }
    updateAusTimeOnly(date);
}

// ৮. বাংলা ক্যালেন্ডার লজিক
function getBanglaDate(date) {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const bnMonths = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ু", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
    const bnSeasons = ["গ্রীষ্ম", "গ্রীষ্ম", "বর্ষা", "বর্ষা", "শরৎ", "শরৎ", "হেমন্ত", "হেমন্ত", "শীত", "শীত", "বসন্ত", "বসন্ত"];
    let bnYear = (month < 3 || (month === 3 && day < 14)) ? (year - 594) : (year - 593);
    let bnMonthIndex, bnDay;

    if (month === 0) { if (day < 15) { bnMonthIndex = 8; bnDay = day + 16; } else { bnMonthIndex = 9; bnDay = day - 14; } }
    else if (month === 1) { if (day < 14) { bnMonthIndex = 9; bnDay = day + 17; } else { bnMonthIndex = 10; bnDay = day - 13; } }
    else if (month === 2) { if (day < 15) { bnMonthIndex = 10; bnDay = day + 16; } else { bnMonthIndex = 11; bnDay = day - 14; } }
    else if (month === 3) { if (day < 14) { bnMonthIndex = 11; bnDay = day + 16; } else { bnMonthIndex = 0; bnDay = day - 13; } }
    else if (month === 4) { if (day < 15) { bnMonthIndex = 0; bnDay = day + 17; } else { bnMonthIndex = 1; bnDay = day - 14; } }
    else if (month === 5) { if (day < 16) { bnMonthIndex = 1; bnDay = day + 17; } else { bnMonthIndex = 2; bnDay = day - 15; } }
    else if (month === 6) { if (day < 17) { bnMonthIndex = 2; bnDay = day + 16; } else { bnMonthIndex = 3; bnDay = day - 16; } }
    else if (month === 7) { if (day < 17) { bnMonthIndex = 3; bnDay = day + 15; } else { bnMonthIndex = 4; bnDay = day - 16; } }
    else if (month === 8) { if (day < 17) { bnMonthIndex = 4; bnDay = day + 15; } else { bnMonthIndex = 5; bnDay = day - 16; } }
    else if (month === 9) { if (day < 17) { bnMonthIndex = 5; bnDay = day + 14; } else { bnMonthIndex = 6; bnDay = day - 16; } }
    else if (month === 10) { if (day < 16) { bnMonthIndex = 6; bnDay = day + 15; } else { bnMonthIndex = 7; bnDay = day - 15; } }
    else { if (day < 16) { bnMonthIndex = 7; bnDay = day + 15; } else { bnMonthIndex = 8; bnDay = day - 15; } }

    return { day: bnDay, month: bnMonths[bnMonthIndex], year: bnYear, season: bnSeasons[bnMonthIndex] };
}

function banglaNumber(number) {
    const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return number.toString().split('').map(digit => bnNumbers[digit] || digit).join('');
}

// ৯. উৎসব লোডার
async function loadFestivals() {
    const listContainer = document.getElementById('festival-list');
    if(!listContainer) return;
    listContainer.innerHTML = '<li style="padding:10px; text-align:center; color:#888;">তথ্য খোঁজা হচ্ছে...</li>';
    try {
        const response = await fetch('assets/data/festivals.json');
        if (!response.ok) throw new Error("File not found");
        const allFestivals = await response.json();
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // ফিল্টার: মাস এবং বছর দুটোই মিলতে হবে
        let thisMonthFestivals = allFestivals.filter(item => {
            const fDate = new Date(item.date);
            return fDate.getMonth() === currentMonth && fDate.getFullYear() === currentYear;
        });

        // ডুপ্লিকেট রিমুভার
        thisMonthFestivals = thisMonthFestivals.filter((value, index, self) =>
            index === self.findIndex((t) => (t.name === value.name && t.date === value.date))
        );

        thisMonthFestivals.sort((a, b) => new Date(a.date) - new Date(b.date));

        let html = '';
        if (thisMonthFestivals.length > 0) {
            thisMonthFestivals.forEach(item => {
                const dateObj = new Date(item.date);
                const day = dateObj.getDate();
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const isToday = (day === today.getDate()) ? 'style="background-color: #fff3e0; border-left: 3px solid #ff9800;"' : '';
                html += `
                    <li class="festival-item" ${isToday}>
                        <span class="fes-name">${item.name}</span>
                        <span class="fes-date" style="font-family:sans-serif;">${day} ${monthNames[dateObj.getMonth()]}</span>
                    </li>`;
            });
        } else {
            html = '<li class="festival-item" style="justify-content:center; color:#999;">এই মাসে বিশেষ কোনো উৎসব নেই।</li>';
        }
        listContainer.innerHTML = html;
    } catch (error) {
        listContainer.innerHTML = '<li style="color:red; text-align:center;">লিস্ট লোড করা যায়নি</li>';
    }
}