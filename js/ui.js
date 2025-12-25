// এই ফাংশনটি বাইরের HTML ফাইল ফেচ করে এনে নির্দিষ্ট জায়গায় বসায়
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const content = await response.text();
            document.getElementById(elementId).innerHTML = content;
        } else {
            console.error(`Error loading ${filePath}: Status ${response.status}`);
        }
    } catch (error) {
        console.error(`Error loading component: ${error}`);
    }
}