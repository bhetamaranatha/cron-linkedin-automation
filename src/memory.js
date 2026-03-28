const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const EXECUTIONS_FILE = path.join(DATA_DIR, 'executions.json');
const INSIGHTS_FILE = path.join(DATA_DIR, 'insights.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readJSON(filePath, defaultValue) {
    try {
        if (!fs.existsSync(filePath)) return defaultValue;
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return defaultValue;
    }
}

function writeJSON(filePath, data) {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Executions ---

function getExecutions() {
    return readJSON(EXECUTIONS_FILE, []);
}

function saveExecution(record) {
    const executions = getExecutions();
    const newRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...record
    };
    executions.unshift(newRecord); // newest first
    // Keep last 200 records
    if (executions.length > 200) executions.length = 200;
    writeJSON(EXECUTIONS_FILE, executions);
    return newRecord;
}

function getStats() {
    const executions = getExecutions();
    return {
        total: executions.length,
        success: executions.filter(e => e.status === 'success').length,
        failed: executions.filter(e => e.status === 'failed').length,
        skipped: executions.filter(e => e.status === 'skipped').length,
    };
}

// --- AI Insights ---

function getInsights() {
    return readJSON(INSIGHTS_FILE, []);
}

function saveInsight(insight) {
    const insights = getInsights();
    insights.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...insight
    });
    // Keep last 30 insights
    if (insights.length > 30) insights.length = 30;
    writeJSON(INSIGHTS_FILE, insights);
}

function getRecentInsightsSummary(maxCount = 5) {
    const insights = getInsights().slice(0, maxCount);
    if (insights.length === 0) return null;
    return insights.map((ins, i) => `${i + 1}. ${ins.note}`).join('\n');
}

module.exports = {
    saveExecution,
    getExecutions,
    getStats,
    saveInsight,
    getInsights,
    getRecentInsightsSummary,
};
