
const https = require('https');

const url = 'https://nclex-study-guide-production.up.railway.app/api/admin/users';

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body:', data);
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
