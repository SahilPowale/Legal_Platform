const express = require('express');
const router = express.Router();
const multer = require('multer');

const { askAI, getUserChats, getSingleChat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// 🚨 UPGRADED: Step-by-Step Interview Directive 🚨
const injectDraftingPrompt = (req, res, next) => {
    if (req.body && req.body.question) {
        req.body.question += `
        
        [SYSTEM DIRECTIVE: If the user requests to draft a formal or legal document (rental agreement, NDA, etc.), DO NOT generate the full document immediately with blank spaces. 
        Instead, initiate a step-by-step interview:
        1. Ask for ONE piece of required information at a time (e.g., "What is the landlord's full name?"). 
        2. Wait for the user to answer. 
        3. Do NOT ask a list of multiple questions at once. 
        4. ONLY when you have gathered ALL necessary details from the user, generate the final document. 
        5. When outputting the final document, you MUST wrap the exact content strictly between [DOC_START] and [DOC_END] tags using formal Indian Legal Formatting (centered titles, numbered clauses). Keep conversational text outside these tags.]`;
    }
    next();
};

// ==========================================
// AI CHAT ROUTES
// ==========================================
router.post('/ask', protect, upload.single('document'), injectDraftingPrompt, askAI);
router.get('/chats', protect, getUserChats);
router.get('/chats/:id', protect, getSingleChat);

module.exports = router;