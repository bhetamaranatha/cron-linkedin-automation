const express = require('express');
const path = require('path');
const fs = require('fs');
const { getExecutions, getStats, getInsights } = require('./memory');
const { runWorkflow } = require('./index');

const app = express();
const PORT = process.env.PORT || process.env.DASHBOARD_PORT || 3000;

app.use(express.json());

// Flexible static file pathing for different environments
const publicPath = fs.existsSync(path.join(__dirname, '..', 'public'))
    ? path.join(__dirname, '..', 'public') // Local/Standard structure (src/server.js)
    : path.join(__dirname, 'public');      // If running from root or flattened structure

console.log(`[Server] Searching for dashboard in: ${publicPath}`);
console.log(`[Server] Dashboard folder exists: ${fs.existsSync(publicPath)}`);

app.use(express.static(publicPath));

// Fallback for root route if static files fail
app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`
            <h1>Dashboard Files Missing</h1>
            <p>The server is running, but it cannot find the <b>public/index.html</b> file.</p>
            <p><b>Path searched:</b> ${publicPath}</p>
            <p><b>Current directory:</b> ${__dirname}</p>
            <hr>
            <p>Check your GitHub repo to ensure the <b>public</b> folder was uploaded correctly.</p>
        `);
    }
});

// Add a simple health check to verify server is alive
app.get('/health', (req, res) => res.send('Server is active!'));

// ----- API Routes -----

// GET /api/stats — total, success, failed, skipped counts
app.get('/api/stats', (req, res) => {
    try {
        res.json(getStats());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/executions — last 50 execution records
app.get('/api/executions', (req, res) => {
    try {
        const executions = getExecutions().slice(0, 50);
        res.json(executions);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/insights — AI learned writing principles
app.get('/api/insights', (req, res) => {
    try {
        res.json(getInsights().slice(0, 20));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/run — manually trigger a workflow run
app.post('/api/run', async (req, res) => {
    try {
        console.log('[Dashboard] Manual run triggered via API');
        res.json({ message: 'Workflow started. Check executions for result.' });
        // Run async after response sent
        runWorkflow();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ----- Start Server -----
app.listen(PORT, () => {
    console.log(`\n✅ Dashboard running at http://localhost:${PORT}`);
});
