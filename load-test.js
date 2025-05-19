const http = require('http');

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_REQUESTS = 20;
const TOTAL_REQUESTS = 200;

const endpoints = [
    '/earthquakes?limit=10',
    '/earthquakes?startTime=2023-01-01T00:00:00&minMagnitude=5.0',
    '/earthquakes/us7000abcd' // Replace with a valid earthquake ID
];

async function makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        http.get(`${BASE_URL}${endpoint}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;
                resolve({
                    statusCode: res.statusCode,
                    duration,
                    headers: res.headers
                });
            });
        }).on('error', reject);
    });
}

async function runLoadTest(endpoint) {
    console.log(`\nTesting endpoint: ${endpoint}`);
    console.log('----------------------------------------');
    
    const results = [];
    const startTime = Date.now();
    
    // Run concurrent requests
    for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
        const batch = Array(Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i))
            .fill()
            .map(() => makeRequest(endpoint));
        
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
        
        // Log progress
        console.log(`Completed ${Math.min(i + CONCURRENT_REQUESTS, TOTAL_REQUESTS)}/${TOTAL_REQUESTS} requests`);
    }
    
    const totalTime = Date.now() - startTime;
    
    // Calculate statistics
    const successfulRequests = results.filter(r => r.statusCode === 200).length;
    const failedRequests = results.filter(r => r.statusCode !== 200).length;
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const rateLimitedRequests = results.filter(r => r.statusCode === 429).length;
    
    console.log('\nResults:');
    console.log('----------------------------------------');
    console.log(`Total Requests: ${TOTAL_REQUESTS}`);
    console.log(`Successful Requests: ${successfulRequests}`);
    console.log(`Failed Requests: ${failedRequests}`);
    console.log(`Rate Limited Requests: ${rateLimitedRequests}`);
    console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Requests per second: ${(TOTAL_REQUESTS / (totalTime / 1000)).toFixed(2)}`);
}

async function runAllTests() {
    console.log('Starting load tests...');
    for (const endpoint of endpoints) {
        await runLoadTest(endpoint);
    }
}

runAllTests().catch(console.error);