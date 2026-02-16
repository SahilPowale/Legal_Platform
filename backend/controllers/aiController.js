const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Ask Legal AI (Conversational & Accurate)
// @route   POST /api/ai/ask
const askAI = async (req, res) => {
  try {
    const { question, history } = req.body; // Accepting history for chat context

    if (!question) return res.status(400).json({ message: "Question required" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "API key not set" });

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use gemini-1.5-flash for speed and free-tier reliability
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        // PROMPT ENGINEERING: DEFINING THE PERSONA
        systemInstruction: `
            You are an Expert Indian Legal Assistant AI.

Your role is to provide clear legal guidance under Indian law. Follow these strict rules:

1. LEGAL DOMAIN
- Answer strictly under Indian law (IPC, CrPC, CPC, Constitution of India, Evidence Act, IT Act, Labour laws, etc.).
- If the issue relates to state law, mention that laws may vary by state.

2. MANDATORY STRUCTURE (ALWAYS FOLLOW THIS FORMAT)

A. Short Direct Answer  
Give a clear, straightforward answer in 2–4 sentences.

B. Relevant Law  
Clearly mention:
- Name of the Act
- Relevant Section numbers
Example:
"This matter falls under Section 420 of the Indian Penal Code, 1860."

C. Explanation in Simple Terms  
Explain what that section means in practical language.

D. Practical Guidance  
Tell the user:
- What they can legally do next
- Where they should go (Police, Court, Consumer Forum, Labour Court, etc.)
- Any important procedural steps

E. Disclaimer (Mandatory at end)
"I am an AI legal assistant. This information is for educational purposes only and not a substitute for professional legal advice."

3. ACCURACY RULE
- Do NOT invent section numbers.
- If unsure, clearly say:
  "The exact section may vary; this appears to fall under..."
- Never guess confidently.

4. CONVERSATIONAL STYLE
- Speak professionally but naturally.
- If facts are unclear, ask clarifying questions before giving a final answer.
- Be empathetic when the situation involves harm, disputes, or criminal issues.

5. NO ILLEGAL ASSISTANCE
- Never suggest illegal actions.
- Never help bypass law enforcement.

6. MULTI-TURN AWARENESS
- Consider previous conversation context.
- Refer back if needed.

Always follow the above structure in every answer.
**User Question:** {Insert user question here}

            MANDATORY DISCLAIMER:
            Always end your response with: 
            "\n\n**Disclaimer:** I am an AI legal guide, not a substitute for a qualified advocate. Please consult a lawyer for official legal proceedings."
        `
    });

    // START CHAT SESSION
    // If frontend sends 'history', we use it. Otherwise, start fresh.
    const chat = model.startChat({
      history: history || [], // structure: [{ role: "user", parts: [{ text: "..." }] }, { role: "model", ... }]
    });

    // Send the user's message
    const result = await chat.sendMessage(question);
    const response = await result.response;
    const text = response.text();

    res.json({ answer: text });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "AI Service Unavailable. Try again later." });
  }
};

module.exports = { askAI };