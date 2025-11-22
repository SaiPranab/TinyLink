// import express from 'express';
// import cors from 'cors';
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
// import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

// // --- Global Variables (Provided by Canvas Environment) ---
// // These variables are provided at runtime in the Canvas environment.
// const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
// const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
// // --- End Global Variables ---

// // Initialize Firebase and Firestore
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const auth = getAuth(app);

// const PORT = 3000;
// const server = express();

// // Middleware
// server.use(cors({ origin: '*' }));
// server.use(express.json());
// // server.use(express.static('public')); // Serving static files is not necessary in this environment

// // --- Firebase Authentication Setup ---
// let isAuthReady = false;
// let currentUserId = null;

// const authenticateAndSetup = async () => {
//     try {
//         if (initialAuthToken) {
//             await signInWithCustomToken(auth, initialAuthToken);
//         } else {
//             // Sign in anonymously if no custom token is provided
//             await signInAnonymously(auth);
//         }
//         currentUserId = auth.currentUser?.uid || 'anonymous-server-user';
//         isAuthReady = true;
//         console.log(`[Server] Firebase authenticated. User ID: ${currentUserId}`);
//     } catch (error) {
//         console.error("[Server] Firebase authentication failed:", error.message);
//     }
// };

// authenticateAndSetup();

// // Middleware to ensure auth is ready (for database-dependent routes)
// const ensureAuthReady = (req, res, next) => {
//     if (isAuthReady) {
//         next();
//     } else {
//         res.status(503).json({ error: "Service unavailable, server authentication initializing." });
//     }
// };

// // Firestore Path Helper (Public data for this application)
// // Path: /artifacts/{appId}/public/data/links/{code}
// const getLinkDocRef = (code) => {
//     return doc(db, 'artifacts', appId, 'public', 'data', 'links', code);
// };

// // Helper function to generate a short, random code (6-8 chars)
// const generateShortCode = (length = 6) => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//         result += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return result;
// };

// // --- CORE ROUTES ---

// // 1. Redirect Route (/:code) - MUST be defined before the client's catch-all if serving static files
// server.get('/:code', ensureAuthReady, async (req, res) => {
//     const { code } = req.params;
    
//     // Explicitly check for API paths to prevent accidentally redirecting API calls
//     if (code === 'api' || code === 'healthz') {
//         return res.status(404).send('Not Found');
//     }

//     const linkRef = getLinkDocRef(code);

//     try {
//         const docSnap = await getDoc(linkRef);

//         if (!docSnap.exists()) {
//             return res.status(404).send('Not Found: TinyLink code does not exist.');
//         }

//         const linkData = docSnap.data();
//         const originalUrl = linkData.targetUrl;
//         const now = new Date().toISOString();

//         // Increment total clicks and update last clicked time
//         await updateDoc(linkRef, {
//             totalClicks: (linkData.totalClicks || 0) + 1,
//             lastClicked: now,
//         });

//         console.log(`[Redirect] Code: ${code} redirected to: ${originalUrl}`);
//         // HTTP 302 Redirect
//         res.redirect(302, originalUrl);

//     } catch (error) {
//         console.error(`[Redirect] Error processing link ${code}:`, error.message);
//         res.status(500).send('Internal Server Error');
//     }
// });

// // 2. Health Check (/healthz)
// server.get('/healthz', (req, res) => {
//     // A simple check to ensure the server is responding
//     const status = isAuthReady ? 'ready' : 'initializing';
//     res.status(200).json({
//         ok: true,
//         version: "1.0",
//         authStatus: status,
//         database: "Firestore (Mocked Postgres for structure)"
//     });
// });

// // --- API Endpoints ---
// const apiRouter = express.Router();

// // Middleware applied only to API routes
// apiRouter.use(ensureAuthReady);

// // 3. Create Link (POST /links) -> /api/links
// apiRouter.post('/links', async (req, res) => {
//     let { targetUrl, customCode } = req.body;

//     // Basic URL validation
//     if (!targetUrl || !targetUrl.startsWith('http')) {
//         return res.status(400).json({ error: 'Invalid URL. Target URL must be provided and start with http/https.' });
//     }

//     let code = customCode;

//     // 4. Code Generation & Uniqueness Check
//     if (code) {
//         // Validation: Codes follow [A-Za-z0-9]{6,8}.
//         if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
//              return res.status(400).json({ error: 'Custom code must be 6-8 alphanumeric characters.' });
//         }
//     } else {
//         // Generate a unique code
//         let attempts = 0;
//         do {
//             code = generateShortCode();
//             const docSnap = await getDoc(getLinkDocRef(code));
//             if (!docSnap.exists()) break;
//             attempts++;
//         } while (attempts < 5); // Try a few times
//     }

//     // Final check for custom code collision (if provided)
//     if (customCode) {
//         const collisionCheck = await getDoc(getLinkDocRef(customCode));
//         if (collisionCheck.exists()) {
//              // 409 if code exists
//             return res.status(409).json({ error: `Code '${customCode}' already exists. Please choose another.` });
//         }
//     }

//     const now = new Date().toISOString();

//     const linkData = {
//         shortCode: code,
//         targetUrl: targetUrl,
//         totalClicks: 0,
//         createdAt: now,
//         lastClicked: null,
//         createdBy: currentUserId 
//     };

//     try {
//         await setDoc(getLinkDocRef(code), linkData);
//         console.log(`[API] Link created: ${code}`);
//         res.status(201).json(linkData);
//     } catch (error) {
//         console.error("[API] Error creating link:", error.message);
//         res.status(500).json({ error: 'Failed to create link due to a server error.' });
//     }
// });

// // 4. List All Links (GET /links) -> /api/links
// apiRouter.get('/links', async (req, res) => {
//     try {
//         const linksCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'links');
//         const q = query(linksCollectionRef); 
//         const querySnapshot = await getDocs(q);

//         const links = [];
//         querySnapshot.forEach((doc) => {
//             links.push(doc.data());
//         });

//         res.status(200).json(links);
//     } catch (error) {
//         console.error("[API] Error listing links:", error.message);
//         res.status(500).json({ error: 'Failed to retrieve links.' });
//     }
// });

// // 5. Get Stats for One Code (GET /links/:code) -> /api/links/:code
// apiRouter.get('/links/:code', async (req, res) => {
//     const { code } = req.params;
    
//     try {
//         const docSnap = await getDoc(getLinkDocRef(code));
        
//         if (!docSnap.exists()) {
//             return res.status(404).json({ error: 'Link not found.' });
//         }

//         res.status(200).json(docSnap.data());
//     } catch (error) {
//         console.error(`[API] Error getting stats for ${code}:`, error.message);
//         res.status(500).json({ error: 'Failed to retrieve link stats.' });
//     }
// });

// // 6. Delete Link (DELETE /links/:code) -> /api/links/:code
// apiRouter.delete('/links/:code', async (req, res) => {
//     const { code } = req.params;

//     try {
//         const linkRef = getLinkDocRef(code);
//         const docSnap = await getDoc(linkRef);

//         if (!docSnap.exists()) {
//             return res.status(404).json({ error: 'Link not found.' });
//         }

//         await deleteDoc(linkRef);
//         console.log(`[API] Link deleted: ${code}`);
//         res.status(204).send(); 
//     } catch (error) {
//         console.error(`[API] Error deleting link ${code}:`, error.message);
//         res.status(500).json({ error: 'Failed to delete link.' });
//     }
// });

// // Mount the API Router under /api
// server.use('/api', apiRouter);

// // Fallback for React SPA (simulated)
// // This should serve the index.html that loads the React App for all client-side routes.
// server.get('*', (req, res) => {
//     // Since we can't serve a physical index.html, we assume the environment
//     // handles the SPA routing for non-API/Redirect paths. 
//     // If running outside Canvas, this should serve the static file.
//     // For this environment, we just log a 404 since the client is running directly.
//     console.log(`[Server] Unhandled route hit: ${req.url}. Returning 404.`);
//     res.status(404).send('Server route not found. The React client should be handling this route.');
// });


// // Start server after successful auth
// auth.onAuthStateChanged(user => {
//     if (user) {
//         server.listen(PORT, () => {
//             console.log(`TinyLink Express Server running on port ${PORT}`);
//             console.log(`API URL: http://localhost:${PORT}/api/links`);
//             console.log(`Redirect URL BASE: http://localhost:${PORT}/`);
//         });
//     } else {
//         // Server might still start if running outside the Canvas environment, 
//         // but with degraded database access.
//         server.listen(PORT, () => {
//             console.log(`TinyLink Express Server starting, awaiting full Firebase auth on port ${PORT}`);
//         });
//     }
// });






import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const PORT = 3000;
const server = express();

server.use(cors({ origin: '*' }));
server.use(express.json());

// Utility: generate short code
const generateShortCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// --------------------------------------
// 1. REDIRECT ROUTE (/:code)
// --------------------------------------
server.get('/:code', async (req, res) => {
    const { code } = req.params;

    if (code === "api" || code === "healthz") 
        return res.status(404).send("Not found");

    try {
        const [rows] = await db.query(
            "SELECT * FROM links WHERE shortCode = ?",
            [code]
        );

        if (rows.length === 0)
            return res.status(404).send("Code not found");

        const link = rows[0];

        await db.query(
            "UPDATE links SET totalClicks = totalClicks + 1, lastClicked = NOW() WHERE shortCode = ?",
            [code]
        );

        return res.redirect(link.targetUrl);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// --------------------------------------
// 2. Health Check
// --------------------------------------
server.get('/healthz', (req, res) => {
    res.status(200).json({
        ok: true,
        version: "1.0",
        database: "MySQL"
    });
});

// --------------------------------------
// API ROUTER
// --------------------------------------
const apiRouter = express.Router();

// 3. CREATE LINK  (POST /api/links)
apiRouter.post('/links', async (req, res) => {
    let { targetUrl, customCode } = req.body;

    if (!targetUrl || !targetUrl.startsWith("http")) {
        return res.status(400).json({ error: "Invalid URL" });
    }

    let code = customCode;

    if (customCode) {
        // Validate format
        if (!/^[A-Za-z0-9]{6,8}$/.test(customCode)) {
            return res.status(400).json({ error: "Code must be 6–8 alphanumeric chars" });
        }

        const [exists] = await db.query(
            "SELECT id FROM links WHERE shortCode = ?",
            [customCode]
        );

        if (exists.length > 0) {
            return res.status(409).json({ error: "Custom code already exists" });
        }
    } 
    else {
        // Auto-generate
        let attempts = 0;
        do {
            code = generateShortCode();
            const [rows] = await db.query(
                "SELECT id FROM links WHERE shortCode = ?",
                [code]
            );
            if (rows.length === 0) break;
            attempts++;
        } while (attempts < 5);
    }

    try {
        await db.query(
            "INSERT INTO links (shortCode, targetUrl, totalClicks, createdBy) VALUES (?, ?, 0, ?)",
            [code, targetUrl, "server-user"]
        );

        const linkData = {
            shortCode: code,
            targetUrl,
            totalClicks: 0
        };

        res.status(201).json(linkData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create link" });
    }
});

// 4. LIST ALL LINKS (GET /api/links)
apiRouter.get('/links', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM links ORDER BY createdAt DESC");
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load links" });
    }
});

// 5. GET ONE LINK (GET /api/links/:code)
apiRouter.get('/links/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT * FROM links WHERE shortCode = ?",
            [code]
        );

        if (rows.length === 0)
            return res.status(404).json({ error: "Link not found" });

        res.status(200).json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get link" });
    }
});

// 6. DELETE LINK (DELETE /api/links/:code)
apiRouter.delete('/links/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT id FROM links WHERE shortCode = ?",
            [code]
        );

        if (rows.length === 0)
            return res.status(404).json({ error: "Not found" });

        await db.query("DELETE FROM links WHERE shortCode = ?", [code]);

        res.status(204).send();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete link" });
    }
});

server.use("/api", apiRouter);

// Fallback
server.get("*", (req, res) => {
    res.status(404).send("Route not found");
});

// Start server
server.listen(PORT, () => {
    console.log(`MySQL TinyLink Server running on port ${PORT}`);
});
