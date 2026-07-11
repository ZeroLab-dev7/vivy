const path = require('path');
const helmet = require('helmet');

const scannerIps = new Map();

// Threat thresholds
const THREAT_LIMIT_SLOW = 3;   
const THREAT_LIMIT_BLOCK = 5;  // Block after 5 suspicious requests
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour temporary block

// Clean stale IP reputation data every hour to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of scannerIps.entries()) {
        if (now - record.lastRequest > 24 * 60 * 60 * 1000) {
            scannerIps.delete(ip);
        }
    }
}, 60 * 60 * 1000);

/**
 * Logs a suspicious activity attempt for a given IP and increments threat score.
 */
function logThreatAttempt(ip, reason, pathname) {
    const now = Date.now();
    let record = scannerIps.get(ip) || { count: 0, blockedUntil: 0, lastRequest: 0 };
    
    record.count++;
    record.lastRequest = now;
    console.warn(`[Security Threat] IP ${ip} flagged: ${reason} on path "${pathname}". Threat count: ${record.count}`);
    
    if (record.count >= THREAT_LIMIT_BLOCK) {
        record.blockedUntil = now + BLOCK_DURATION;
        console.error(`[Security Block] IP ${ip} has been temporarily blocked for 60 minutes due to repeated security policy violations.`);
    }
    
    scannerIps.set(ip, record);
}

/**
 * Middleware: IP Reputation and Threat Mitigation
 */
const checkIpReputation = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const record = scannerIps.get(ip);
    
    if (record) {
        // If blocked, reject immediately
        if (record.blockedUntil && now < record.blockedUntil) {
            return res.status(403).send('Forbidden: Connection closed due to security policy violations.');
        }
        
        // If in slow-down zone, inject a progressive delay
        if (record.count >= THREAT_LIMIT_SLOW) {
            const delay = Math.min((record.count - THREAT_LIMIT_SLOW + 1) * 2000, 10000); // Max 10 seconds delay
            return setTimeout(() => {
                next();
            }, delay);
        }
    }
    next();
};

/**
 * Middleware: Sanity check for malformed HTTP requests
 */
const rejectMalformedRequests = (req, res, next) => {
    // 1. Validate HTTP Method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!allowedMethods.includes(req.method)) {
        logThreatAttempt(req.ip, `Malformed HTTP method: ${req.method}`, req.path);
        return res.status(400).send('Bad Request: Invalid HTTP Method');
    }

    // 2. Validate URI Encoding
    try {
        decodeURIComponent(req.path);
        decodeURIComponent(req.url);
    } catch (err) {
        logThreatAttempt(req.ip, 'Malformed URI encoding', req.url);
        return res.status(400).send('Bad Request: Malformed URI encoding');
    }

    next();
};

/**
 * Middleware: User-Agent Validation
 */
const validateUserAgent = (req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    if (!ua.trim()) {
        logThreatAttempt(req.ip, 'Empty User-Agent', req.path);
        return res.status(400).send('Bad Request: User-Agent header is required.');
    }

    // Block common automated vulnerability scanner signatures
    const scannerUserAgents = [
        /sqlmap/i, /nikto/i, /masscan/i, /censys/i, /shodan/i, /nmap/i,
        /zgrab/i, /acunetix/i, /dirbuster/i, /gobuster/i, /mj12bot/i,
        /netsparker/i, /python-urllib/i, /openvas/i, /nessus/i, /w3af/i
    ];

    if (scannerUserAgents.some(pattern => pattern.test(ua))) {
        logThreatAttempt(req.ip, `Scanner User-Agent: ${ua}`, req.path);
        return res.status(403).send('Forbidden: Access denied.');
    }

    next();
};

/**
 * Middleware: Blocks access to sensitive paths, dotfiles, and directory traversal attempts.
 * Returns a generic 404 response to avoid disclosing whether a file exists.
 */
const blockSensitivePaths = (req, res, next) => {
    const rawPath = req.path || '';
    const rawUrl = req.url || '';
    
    let decodedPath = rawPath;
    let decodedUrl = rawUrl;
    
    // Decode multiple times to resolve double-encoding bypasses (e.g. %252e)
    for (let i = 0; i < 3; i++) {
        try {
            decodedPath = decodeURIComponent(decodedPath);
            decodedUrl = decodeURIComponent(decodedUrl);
        } catch (e) {
            break;
        }
    }
    
    // Normalize path separators (backslash to forward slash)
    decodedPath = decodedPath.replace(/\\/g, '/');
    decodedUrl = decodedUrl.replace(/\\/g, '/');

    // Check for null-byte or traversal indicators
    const hasNullByte = decodedPath.includes('\0') || decodedUrl.includes('\0');
    const hasTraversal = decodedPath.includes('..') || decodedPath.includes('%2e') || 
                         decodedPath.includes('..;') || decodedPath.includes('.;') || 
                         decodedUrl.includes('..') || decodedUrl.includes('%2e');

    let isSensitive = false;
    let matchReason = '';

    if (hasNullByte) {
        isSensitive = true;
        matchReason = 'Null-byte injection attempt';
    } else if (hasTraversal) {
        isSensitive = true;
        matchReason = 'Directory traversal sequence';
    } else {
        // Evaluate segment boundaries to capture hidden directories/files starting with a dot
        const pathSegments = decodedPath.toLowerCase().split('/');
        const hasHiddenSegment = pathSegments.some(seg => seg.startsWith('.') && seg !== '.' && seg !== '..');
        
        if (hasHiddenSegment) {
            isSensitive = true;
            matchReason = 'Hidden directory/file access attempt';
        } else {
            // General blocked terms list
            const blockedFilePatterns = [
                /\.env/i,
                /\.git/i,
                /\.svn/i,
                /node_modules/i,
                /package-lock\.json/i,
                /package\.json/i,
                /tsconfig\.json/i,
                /ecosystem\.config\.js/i,
                /dockerfile/i,
                /docker-compose/i,
                /\.docker/i,
                /config\.json/i,
                /config\.js/i,
                /\.sqlite/i,
                /\.db$/i, 
                /\.log$/i, 
                /\.(zip|sql|bak|tar|gz)$/i,
                /\.ds_store/i,
                /thumbs\.db/i,
                /\.runtimeconfig/i
            ];

            const matchedPattern = blockedFilePatterns.find(pattern => pattern.test(decodedPath));
            if (matchedPattern) {
                isSensitive = true;
                matchReason = `Matched sensitive file pattern: ${matchedPattern}`;
            }
        }
    }

    if (isSensitive) {
        logThreatAttempt(req.ip, matchReason, rawPath);
        
        // Enterprise-grade protection: generic 404 response
        res.status(404);
        if (req.accepts('html')) {
            return res.sendFile(path.join(__dirname, '..', 'public', '404.html'));
        } else {
            return res.json({ error: 'Not Found' });
        }
    }

    next();
};

/**
 * Helper: Recursively strips prototype-pollution keys from request payload objects
 */
const cleanPrototypePollution = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                cleanPrototypePollution(obj[key]);
            }
        }
    }
};

/**
 * Middleware: Protect against Prototype Pollution
 */
const sanitizeBodyAndQuery = (req, res, next) => {
    if (req.body) cleanPrototypePollution(req.body);
    if (req.query) cleanPrototypePollution(req.query);
    if (req.params) cleanPrototypePollution(req.params);
    next();
};

/**
 * Middleware: Validate Query Parameters
 */
const validateQueryParams = (req, res, next) => {
    if (req.query) {
        for (const [key, val] of Object.entries(req.query)) {
            // Rejects non-string array structures in query keys/values to prevent query parameter injection
            if (Array.isArray(val) || typeof val === 'object') {
                logThreatAttempt(req.ip, `Malformed array/object query parameter for key ${key}`, req.path);
                return res.status(400).json({ error: 'Bad Request: Query parameter must be string value.' });
            }

            if (typeof val === 'string') {
                // Check value for common injection signs
                const dangerousXss = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i;
                const dangerousSql = /\b(union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|drop\s+table)\b/i;
                
                if (dangerousXss.test(val) || dangerousSql.test(val)) {
                    logThreatAttempt(req.ip, `Dangerous signature matched in query value for key: ${key}`, req.path);
                    return res.status(400).json({ error: 'Bad Request: Invalid query parameter input.' });
                }

                // Check specific keys
                if (key === 'guild' && !/^\d{17,19}$/.test(val)) {
                    logThreatAttempt(req.ip, `Malformed guild ID query parameter: ${val}`, req.path);
                    return res.status(400).json({ error: 'Bad Request: Invalid parameter value.' });
                }
                if (key === 'tab' && !/^[a-zA-Z0-9_-]+$/.test(val)) {
                    logThreatAttempt(req.ip, `Malformed tab query parameter: ${val}`, req.path);
                    return res.status(400).json({ error: 'Bad Request: Invalid parameter value.' });
                }
            }
        }
    }
    next();
};

/**
 * Middleware: Validate Route Parameters
 */
const validateRouteParams = (req, res, next) => {
    if (req.params) {
        if (req.params.guildId && !/^\d{17,19}$/.test(req.params.guildId)) {
            logThreatAttempt(req.ip, `Malformed route param guildId: ${req.params.guildId}`, req.path);
            return res.status(400).json({ error: 'Bad Request: Invalid route parameter value.' });
        }
        if (req.params.tab && !/^[a-zA-Z0-9_-]+$/.test(req.params.tab)) {
            logThreatAttempt(req.ip, `Malformed route param tab: ${req.params.tab}`, req.path);
            return res.status(400).json({ error: 'Bad Request: Invalid route parameter value.' });
        }
        if (req.params.section && !/^[a-zA-Z0-9_-]+$/.test(req.params.section)) {
            logThreatAttempt(req.ip, `Malformed route param section: ${req.params.section}`, req.path);
            return res.status(400).json({ error: 'Bad Request: Invalid route parameter value.' });
        }
        if (req.params.moduleName && !/^[a-zA-Z0-9_-]+$/.test(req.params.moduleName)) {
            logThreatAttempt(req.ip, `Malformed route param moduleName: ${req.params.moduleName}`, req.path);
            return res.status(400).json({ error: 'Bad Request: Invalid route parameter value.' });
        }
    }
    next();
};

/**
 * Middleware: Validate Request Body
 */
const validateRequestBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        const bodyKeys = Object.keys(req.body);
        
        // Prevent extremely large body payloads or nested structures
        if (bodyKeys.length > 100) {
            logThreatAttempt(req.ip, 'Request body keys limit exceeded', req.path);
            return res.status(400).json({ error: 'Bad Request: Body content too large' });
        }
    }
    next();
};

// Export all hardened middlewares
module.exports = {
    helmetMiddleware: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
                imgSrc: ["'self'", "data:", "https://cdn.discordapp.com", "https://media.discordapp.net", "https://ui-avatars.com"],
                connectSrc: ["'self'"],
                frameAncestors: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            }
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: 'deny' },
        dnsPrefetchControl: { allow: false },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
        xssFilter: true
    }),
    customHeaders: (req, res, next) => {
        // Set specific Permissions-Policy to block camera, microphone, geolocation
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // Prevent opening downloads directly in IE/Edge
        res.setHeader('X-Download-Options', 'noopen');
        next();
    },
    checkIpReputation,
    rejectMalformedRequests,
    validateUserAgent,
    blockSensitivePaths,
    sanitizeBodyAndQuery,
    validateQueryParams,
    validateRouteParams,
    validateRequestBody
};
