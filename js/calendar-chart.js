// js/calendar-chart.js

let currMonth = new Date().getMonth();
let currYear = new Date().getFullYear();
let storedEvents = []; 
let autoEvents = [];   

async function initChart() {
    await fetchEventsForChart(); 
    generateAutoEvents(currYear); 
    renderChart(currMonth, currYear);

    // ১. আগের মাস বাটন (Dynamic Listener)
    const prevBtn = document.getElementById('prev-month-btn');
    if(prevBtn) {
        let newPrev = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrev, prevBtn);
        newPrev.addEventListener('click', () => {
            currMonth--;
            if(currMonth < 0) { currMonth = 11; currYear--; }
            generateAutoEvents(currYear);
            renderChart(currMonth, currYear);
        });
    }

    // ২. পরের মাস বাটন
    const nextBtn = document.getElementById('next-month-btn');
    if(nextBtn) {
        let newNext = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        newNext.addEventListener('click', () => {
            currMonth++;
            if(currMonth > 11) { currMonth = 0; currYear++; }
            generateAutoEvents(currYear);
            renderChart(currMonth, currYear);
        });
    }
}

// JSON ফাইল লোড
async function fetchEventsForChart() {
    try {
        const res = await fetch('assets/data/festivals.json');
        if (res.ok) {
            storedEvents = await res.json();
        }
    } catch (err) {
        console.error("Chart events load error:", err);
    }
}

// অটো ইভেন্ট
function generateAutoEvents(year) {
    autoEvents = [
        { date: `${year}-01-01`, name: "ইংরেজি নববর্ষ" },
        { date: `${year}-01-12`, name: "স্বামী বিবেকানন্দের জন্মদিন" },
        { date: `${year}-01-23`, name: "নেতাজি জয়ন্তী" },
        { date: `${year}-01-26`, name: "প্রজাতন্ত্র দিবস" },
        { date: `${year}-02-21`, name: "আন্তর্জাতিক মাতৃভাষা দিবস" },
        { date: `${year}-05-01`, name: "মে দিবস" },
        { date: `${year}-05-09`, name: "রবীন্দ্র জয়ন্তী" },
        { date: `${year}-08-15`, name: "স্বাধীনতা দিবস" },
        { date: `${year}-10-02`, name: "গান্ধী জয়ন্তী" },
        { date: `${year}-12-25`, name: "বড়দিন (Christmas)" }
    ];
}

// চার্ট রেন্ডার
function renderChart(month, year) {
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const dateDisplay = document.getElementById('current-month-display');
    const daysGrid = document.getElementById('days-grid');

    if(!daysGrid || !dateDisplay) return;

    // সেফটি চেক: getBanglaDate ফাংশন আছে কিনা
    const firstBn = typeof getBanglaDate === 'function' ? getBanglaDate(new Date(year, month, 1)) : {day:1, month:'...', year:'...'};
    const lastBn = typeof getBanglaDate === 'function' ? getBanglaDate(new Date(year, month + 1, 0)) : {day:30, month:'...', year:'...'};
    
    let bnYearText = banglaNumChart(lastBn.year);
    if (firstBn.year !== lastBn.year) bnYearText = `${banglaNumChart(firstBn.year)} - ${banglaNumChart(lastBn.year)}`;

    dateDisplay.innerHTML = `
        <span style="display:block; font-size:18px;">${months[month]} ${banglaNumChart(year)}</span>
        <span style="display:block; font-size:13px; color:#d32f2f; margin-top:2px;">
            (${firstBn.month} - ${lastBn.month} ${bnYearText})
        </span>
    `;

    daysGrid.innerHTML = ""; 

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const allEvents = [...storedEvents, ...autoEvents];

    for (let i = 0; i < firstDay; i++) {
        daysGrid.appendChild(document.createElement("div")); // ফাঁকা বক্স
    }

    for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement("div");
        const currentLoopDate = new Date(year, month, i);
        const dayOfWeek = currentLoopDate.getDay(); 
        
        const banglaDateObj = typeof getBanglaDate === 'function' ? getBanglaDate(currentLoopDate) : {day: i, month: '', year: ''}; 
        const bnDay = banglaNumChart(banglaDateObj.day);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const eventFound = allEvents.find(e => e.date === dateString);

        dayDiv.innerHTML = `<span class="en-date">${i}</span><span class="bn-date">${bnDay}</span>`;

        if (dayOfWeek === 0) dayDiv.classList.add("is-sunday");

        if (eventFound) {
            dayDiv.classList.add("has-event");
            // ইভেন্ট থাকলে মোডাল ওপেন হবে (এখানে openModalChart কল হচ্ছে)
            dayDiv.onclick = (e) => {
                e.stopPropagation(); // বাবলিং বন্ধ করা
                openModalChart(i, months[month], year, banglaDateObj, eventFound.name);
            };
        }

        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add("today-active");
        }

        daysGrid.appendChild(dayDiv);
    }
}

// --- মোডাল লজিক (Event Delegation - আসল সমাধান) ---

// ১. মোডাল খোলার ফাংশন
function openModalChart(day, monthName, year, bnObj, eventName) {
    const modal = document.getElementById('event-modal');
    if(modal) {
        document.getElementById('modal-date').innerText = `${day} ${monthName}, ${year}`;
        document.getElementById('modal-bn-date').innerText = `${banglaNumChart(bnObj.day)} ${bnObj.month}, ${banglaNumChart(bnObj.year)}`;
        document.getElementById('modal-event-name').innerText = `🎉 ${eventName}`;
        modal.style.display = 'flex';
    }
}

// ২. মোডাল বন্ধ করার গ্লোবাল লিসেনার
// এই অংশটিই আপনার সমস্যার সমাধান করবে। এটি ডকুমেন্টের যেকোনো ক্লিকে নজর রাখবে।
document.addEventListener('click', function(event) {
    const modal = document.getElementById('event-modal');
    
    // যদি মোডাল ওপেন না থাকে, তাহলে কিছু করার দরকার নেই
    if (!modal || modal.style.display === 'none') return;

    // ক. যদি ইউজার "X" (close-btn) এ ক্লিক করে
    if (event.target.classList.contains('close-btn') || event.target.closest('.close-btn')) {
        modal.style.display = 'none';
    }

    // খ. যদি ইউজার মোডালের বাইরে (কালো অংশে) ক্লিক করে
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


// বাংলা সংখ্যা কনভার্টার
function banglaNumChart(n) {
    if(!n) return "";
    const nums = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return n.toString().split('').map(d => nums[d] || d).join('');
}