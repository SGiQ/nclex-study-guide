
async function testGenerate() {
    try {
        console.log('Testing generation API...');
        const res = await fetch('http://localhost:4010/api/mindmaps/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ episodeId: 2 })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

testGenerate();
