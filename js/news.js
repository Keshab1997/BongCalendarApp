// js/news.js - Auto Sorting & Brave Support

let currentTopic = "West Bengal News";

// ১. খবর লোড করার মেইন ফাংশন
async function fetchNews(topic = "West Bengal News") {
    injectModalHTML(); // মোডাল সেটআপ

    const newsContainer = document.getElementById('news-list');
    if (!newsContainer) return;

    // লোডিং অ্যানিমেশন
    newsContainer.innerHTML = `
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton"></div>
    `;

    // লজিক
    let searchQuery = topic;
    if(topic.includes('Job')) {
        searchQuery = "West Bengal Govt Job Recruitment karmakshetra";
    }

    // Google News RSS URL
    const RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=bn&gl=IN&ceid=IN:bn`;
    // ক্যাশ এড়াতে টাইমস্ট্যাম্প যোগ করা হলো (যাতে সবসময় ফ্রেশ ডাটা আসে)
    const timeStamp = new Date().getTime(); 
    const API_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&t=${timeStamp}`;

    try {
        const response = await fetch(API_ENDPOINT);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            
            // === নতুন ফিচার: অটোমেটিক সর্টিং (Newest First) ===
            // এটি নিশ্চিত করবে যে সবচেয়ে নতুন খবরটিই সবার উপরে থাকবে
            const sortedItems = data.items.sort((a, b) => {
                return new Date(b.pubDate) - new Date(a.pubDate);
            });

            renderNews(sortedItems, topic);
        } else {
            console.warn("API Error, Loading Demo...");
            loadFallbackNews(topic);
        }
    } catch (error) {
        loadFallbackNews(topic);
    }
}

// ২. নিউজ রেন্ডার
function renderNews(items, topic) {
    const newsContainer = document.getElementById('news-list');
    let htmlContent = '';

    const jobImages = ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400'];
    const normalImages = ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400'];

    const isJobNews = topic.includes('Job');
    const fallbackImages = isJobNews ? jobImages : normalImages;
    const btnText = isJobNews ? "আবেদন" : "পড়ুন";
    const btnClass = isJobNews ? "job-btn" : "news-btn";

    items.slice(0, 15).forEach((item, index) => {
        let image = item.enclosure?.link || item.thumbnail;
        if (!image) image = fallbackImages[index % fallbackImages.length];

        const timeAgo = getTimeAgo(item.pubDate);
        
        // লিংকে ক্লিক করলে মোডাল ওপেন হবে
        const linkStr = encodeURIComponent(item.link);

        htmlContent += `
            <div class="news-card" onclick="openNewsOption('${linkStr}')">
                <div class="news-img-box">
                    <img src="${image}" alt="news" onerror="this.src='${fallbackImages[0]}'">
                </div>
                <div class="news-content">
                    <h3 class="news-title">${item.title}</h3>
                    <div class="news-footer">
                        <!-- লেটেস্ট খবরে 'NEW' ব্যাজ দেখানো হবে (যদি ১ ঘন্টার কম হয়) -->
                        ${isNew(item.pubDate) ? '<span class="badge-new">NEW</span>' : ''}
                        <span>🕒 ${timeAgo}</span>
                        <span class="${btnClass}">${btnText} ↗</span>
                    </div>
                </div>
            </div>
        `;
    });

    newsContainer.innerHTML = htmlContent;
}

// ৩. নতুন খবর চেনার ফাংশন (১ ঘণ্টার কম হলে NEW দেখাবে)
function isNew(dateString) {
    const diff = new Date() - new Date(dateString);
    return diff < 3600000; // ১ ঘণ্টা = ৩৬০০০০০ মিলি সেকেন্ড
}

// ৪. মডাল ওপেন ফাংশন
function openNewsOption(encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    const modal = document.getElementById('brave-modal');
    
    const btnBrave = document.getElementById('btn-open-brave');
    const btnDefault = document.getElementById('btn-open-default');

    // Android Intent Logic (Brave)
    const urlNoProtocol = url.replace(/^https?:\/\//, '');
    const intentUrl = `intent://${urlNoProtocol}#Intent;scheme=https;package=com.brave.browser;S.browser_fallback_url=${url};end`;

    const isAndroid = /Android/i.test(navigator.userAgent);
    btnBrave.href = isAndroid ? intentUrl : url; 
    btnDefault.href = url;

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('brave-modal').style.display = 'none';
}

function injectModalHTML() {
    if(document.getElementById('brave-modal')) return;
    const modalHTML = `
    <div id="brave-modal" class="modal-overlay" onclick="if(event.target === this) closeModal()">
        <div class="modal-box">
            <span class="close-modal" onclick="closeModal()">&times;</span>
            <h3 class="modal-title">ব্রাউজার নির্বাচন করুন</h3>
            <p class="modal-desc">বিজ্ঞাপন এড়াতে Brave বাঞ্ছনীয়।</p>
            <a href="#" id="btn-open-brave" class="modal-btn btn-brave" target="_blank" onclick="closeModal()">🦁 Brave এ খুলুন</a>
            <a href="#" id="btn-open-default" class="modal-btn btn-default" target="_blank" onclick="closeModal()">🌏 ডিফল্ট ব্রাউজার</a>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// হেল্পার ফাংশন
function loadFallbackNews(topic) {
    const newsContainer = document.getElementById('news-list');
    const demoLink = encodeURIComponent("https://news.google.com");
    newsContainer.innerHTML = `
        <div class="news-card" onclick="openNewsOption('${demoLink}')">
            <div class="news-img-box"><img src="https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400"></div>
            <div class="news-content">
                <h3 class="news-title">ডেমো: নতুন কোনো খবর পাওয়া যায়নি</h3>
                <div class="news-footer"><span>🕒 এইমাত্র</span><span class="news-btn">পড়ুন ↗</span></div>
            </div>
        </div>`;
}

function switchCategory(topic, btnElement) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active-tab'));
    btnElement.classList.add('active-tab');
    fetchNews(topic);
}

function getTimeAgo(dateString) {
    const now = new Date();
    const publishedDate = new Date(dateString);
    if (isNaN(publishedDate.getTime())) return "আজকের";
    const diff = Math.floor((now - publishedDate) / 1000);
    const m = Math.floor(diff / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const bn = n => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
    if (m < 1) return "এইমাত্র";
    if (m < 60) return `${bn(m)} মি: আগে`;
    if (h < 24) return `${bn(h)} ঘ: আগে`;
    return `${bn(d)} দিন আগে`;
}