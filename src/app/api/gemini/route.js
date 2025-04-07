import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
  try {
    const { messages } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" })

    const chat = model.startChat({
      history: messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })),
    })

    const result = await chat.sendMessage(inputFromMessages(messages))
    const response = await result.response
    const text = await response.text() // ✅ `await` was missing here

    return Response.json({ reply: text })
  } catch (error) {
    console.error("Gemini error:", error)
    return new Response(
      JSON.stringify({ error: "Something went wrong with Gemini API" }),
      { status: 500 }
    )
  }
}

// Helper function to extract the latest user message as the prompt
function inputFromMessages(messages) {
  const last = messages[messages.length - 1]
  return last?.content || "Hello!"
}
