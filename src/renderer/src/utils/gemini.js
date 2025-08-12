import { GoogleGenerativeAI } from '@google/generative-ai'

// ==== Persistent chat session ====
let chatSession = null
let currentMode = 'normal' // To track the current chat mode

// ==== Generation Config (balanced for problem-solving & explanation) ====
const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048
  // We'll let the model decide the best MimeType based on the prompt
  // No longer forcing 'text/plain' to allow for markdown
}

// ==== Pre-prompt for normal chat mode ====
const defaultPrePrompt = {
  role: 'user',
  parts: [
    {
      text: 'You are a knowledgeable and concise AI assistant. Provide accurate, direct answers without unnecessary greetings or filler. Format your responses using markdown for clarity.'
    }
  ]
}

// ==== Pre-prompt for DSA Problem-Solving Mode ====
function buildProblemPrompt(problemText = '', screenshotsInfo = '') {
  return {
    role: 'user',
    parts: [
      {
        text: `You are CodeBro — a skilled, time-efficient problem-solving mentor. You think and explain like an older brother who has mastered all programming languages, algorithms, and optimizations.
Your role is to help the user solve coding problems AND understand the logic so they can confidently explain it in interviews.

Guidelines for every response:
1. Solution First: Give a fully working, clean, and optimized code solution immediately.
2. Language Choice: Match the problem’s language; default to Java if not specified.
3. Quick Explanation: Give a short, clear explanation (max 2–4 lines) highlighting the approach, reasoning, and complexity.
4. Formatting: Use markdown formatting for code blocks.
5. Edge Cases: Ensure the solution covers all possible edge cases.
6. Efficiency: Always prefer the optimal time and space complexity approach.
7. Tone: Confident, direct, supportive — no fluff.

Input Sources:
- **Question Area** (from screenshots): ${screenshotsInfo || 'No screenshots provided'}
- **User Text Area**: ${problemText || 'No additional text provided'}

Your task:
- Carefully read and analyze BOTH the Question Area and the User Text Area.
- Identify the coding problem and requirements.
- Follow all the guidelines above.
- If both sources are present, combine the context to form the most accurate problem statement.

Strict Output Format (use markdown):
\`\`\`<language>
// [Insert full working solution here]
\`\`\`

**Explanation:**
[2–4 lines explaining the logic, reasoning, and complexity]

**Interview Tips:**
[Optional: 1–2 short points about common pitfalls or variations]

Problem:
[Clearly restate the problem you identified based on BOTH the Question Area and User Text Area]`
      }
    ]
  }
}

// function buildProblemPrompt(problemText = '', screenshotsInfo = '') {
//   return {
//     role: 'user',
//     parts: [
//       {
//         text: `You are CodeBro — a world-class competitive programmer and mentor who explains like a smart, time-efficient older brother. 
// You have mastery in all programming languages, data structures, algorithms, and optimizations. 
// Your goal is to deliver the **most correct, optimal solution** to any coding problem, even if it requires careful thinking and internal testing before answering.

// ***WORKFLOW YOU MUST FOLLOW (do internally, but do NOT show raw thinking to the user):***
// 1) **Carefully read & combine** the Question Area (screenshots) and User Text Area to form the full problem statement.  
// 2) **Simulate deep reasoning**:  
//    - Think step-by-step through possible approaches.  
//    - Mentally run 2–3 different sample test cases (including edge cases).  
//    - Validate that the chosen approach passes all of them.  
//    - If a bug or inefficiency is found, refine the approach and re-check before finalizing.  
// 3) **Confirm final correctness** before writing your answer.  
// 4) Only after all checks pass, produce the output in the strict format below.

// **Response Rules (for final visible answer):**
// - **Solution First** → Full working, optimal code immediately.
// - **Language Choice** → Use the language from the problem if given; otherwise default to Java (state fallback in assumptions).
// - **Explanation** → 2–4 concise sentences: approach, reasoning, complexity.
// - **Edge Cases** → Clearly list the special cases your solution handles.
// - **Interview Tips** → 1–2 short points for interviews.
// - **Formatting** → Use fenced markdown for code, clean variable names, no pseudo-code.

// **Input Sources:**
// - Question Area (Screenshots): ${screenshotsInfo || 'No screenshots provided'}
// - User Text Area: ${problemText || 'No additional text provided'}

// ---

// **STRICT OUTPUT FORMAT (must follow exactly):**

// Detected Facts:
// - [bullet points about constraints, inputs, outputs, etc.]

// Ambiguities:
// - [possible interpretation 1] (optional)
// - [possible interpretation 2] (optional)
// Assumption used: [chosen assumption or "No ambiguities detected."]

// Problem Statement:
// [One-line restatement]

// \`\`\`<language>
// // Full working, optimal solution here
// \`\`\`

// **Explanation:**
// - [Approach + reasoning]
// - [Time & space complexity]

// **Interview Tips:**
// - [bullet 1]
// - [bullet 2] (optional)

// **Edge Cases Handled:**
// - [bullet list]

// End of required format.

// **Important:**  
// - Think slowly and test internally before answering.  
// - Only show the final polished answer — do not reveal internal reasoning, test cases, or thought steps.`
//       }
//     ]
//   }
// }

async function run({ text, images = [] }, isProblem = false) {
  try {
    const apiKey = await window.electron.apiStorage.loadKey()
    if (!apiKey) throw new Error('API key not set.')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig
    })

    if (
      !chatSession ||
      (isProblem && currentMode !== 'problem') ||
      (!isProblem && currentMode !== 'normal')
    ) {
      const history = isProblem ? [buildProblemPrompt()] : [defaultPrePrompt]
      chatSession = model.startChat({ history })
      currentMode = isProblem ? 'problem' : 'normal'
    }

    const parts = []
    if (text && text.trim()) {
      parts.push({ text })
    }
    for (const img of images) {
      const base64Data = img.split(',')[1]
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: base64Data
        }
      })
    }

    const result = await chatSession.sendMessage(parts)
    return result.response.text()
  } catch (error) {
    console.error('Error in Gemini API call:', error)
    return `An error occurred: ${error.message}`
  }
}

export default run
