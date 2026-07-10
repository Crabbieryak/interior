import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, prompt, roomType, roomStyle, installationSurface } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Clean base64 for API
    let cleanBase64 = imageBase64;
    if (imageBase64.startsWith('data:image')) {
      cleanBase64 = imageBase64.split(',')[1];
    }

    // Use custom prompt or build one
    let finalPrompt = prompt;
    if (!finalPrompt || finalPrompt.trim() === '') {
      finalPrompt = `Apply this exact material texture to the ${installationSurface || 'Floor'} of a ${roomStyle || 'Modern'} ${roomType || 'Living Room'}. Keep the exact texture pattern and colors. Photorealistic interior design render.`;
    }

    console.log("Final Prompt:", finalPrompt);

    // Check if we have an API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn("No OPENROUTER_API_KEY found, using fallback");
      return NextResponse.json({ 
        output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        note: "No API key - using fallback"
      });
    }

    // Call OpenRouter with Qwen
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://interior.vercel.app",
        "X-Title": "StudioVisualizer Pro",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-vl-8b-thinking",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: finalPrompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return NextResponse.json({ 
        output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        note: "API error - using fallback"
      });
    }

    const data = await response.json();
    
    // Try to extract image from response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      
      // Check if content contains an image
      const imageMatch = content.match(/data:image\/[^;]+;base64,[^"]+/);
      if (imageMatch) {
        return NextResponse.json({ 
          output: imageMatch[0],
          success: true 
        });
      }
    }

    // Fallback - return a placeholder image
    return NextResponse.json({ 
      output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      note: "Using fallback image"
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ 
      output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      note: "Error - using fallback"
    });
  }
}