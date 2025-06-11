import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Gemini API key is not configured" }),
      { status: 500 }
    )
  }

  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })),
    })

    const result = await chat.sendMessage(inputFromMessages(messages))
    const response = await result.response
    const text = response.text()

    return Response.json({ reply: text })
  } catch (error) {
    console.error("Gemini error:", error)
    return new Response(
      JSON.stringify({ 
        error: "Failed to get response from Gemini",
        details: error.message 
      }),
      { status: 500 }
    )
  }
}

// Helper function to extract the latest user message as the prompt
function inputFromMessages(messages) {
  const last = messages[messages.length - 1]
  return last?.content || "Hello!"
}
