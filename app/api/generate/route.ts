import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, prompt, roomType, roomStyle, installationSurface } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Clean base64
    let cleanBase64 = imageBase64;
    if (imageBase64.startsWith('data:image')) {
      cleanBase64 = imageBase64.split(',')[1];
    }

    // Build the prompt - tell it EXACTLY where to put the texture
    let finalPrompt = prompt;
    if (!finalPrompt || finalPrompt.trim() === '') {
      finalPrompt = `Apply this exact material texture to the ${installationSurface} of a ${roomStyle} ${roomType}. 
      The ${installationSurface} must show this exact texture pattern and colors. 
      Make it look realistic, professional, and properly installed. 
      Photorealistic interior design render.`;
    }

    console.log("📤 Using Reve Remix API");
    console.log("📝 Prompt:", finalPrompt);

    // Call Reve Remix API
    const response = await fetch("https://api.reve.com/v1/image/remix", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REVE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        images: [`data:image/jpeg;base64,${cleanBase64}`],
        aspect_ratio: "16:9",
        num_outputs: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Reve API Error:", response.status, errorText);
      
      // Fallback to OpenRouter if Reve fails
      return getOpenRouterFallback(cleanBase64, finalPrompt, roomType, roomStyle, installationSurface);
    }

    const data = await response.json();
    console.log("✅ Reve API Response:", data);

    const imageUrl = data.image_url || data.output || data.images?.[0]?.url;
    
    if (imageUrl) {
      return NextResponse.json({ 
        output: imageUrl,
        success: true,
        provider: "Reve Remix"
      });
    }

    // If Reve didn't return an image, try OpenRouter
    return getOpenRouterFallback(cleanBase64, finalPrompt, roomType, roomStyle, installationSurface);

  } catch (error: any) {
    console.error("Error:", error);
    
    // Try OpenRouter as fallback
    try {
      const body = await request.json();
      const { imageBase64, prompt, roomType, roomStyle, installationSurface } = body;
      let cleanBase64 = imageBase64;
      if (imageBase64.startsWith('data:image')) {
        cleanBase64 = imageBase64.split(',')[1];
      }
      return getOpenRouterFallback(cleanBase64, prompt, roomType, roomStyle, installationSurface);
    } catch (e) {
      return NextResponse.json({ 
        output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        note: "Error - using fallback"
      });
    }
  }
}

// Fallback to OpenRouter (Qwen VL)
async function getOpenRouterFallback(imageBase64: string, prompt: string, roomType: string, roomStyle: string, installationSurface: string) {
  try {
    console.log("🔄 Falling back to OpenRouter...");
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        note: "No API key - using fallback"
      });
    }

    let finalPrompt = prompt;
    if (!finalPrompt || finalPrompt.trim() === '') {
      finalPrompt = `Apply this exact material texture to the ${installationSurface} of a ${roomStyle} ${roomType}. The ${installationSurface} must show this exact texture pattern and colors. Photorealistic interior design render.`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-vl-8b-thinking",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: finalPrompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ 
        output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        note: "API error - using fallback"
      });
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      const imageMatch = content.match(/data:image\/[^;]+;base64,[^"]+/);
      if (imageMatch) {
        return NextResponse.json({ output: imageMatch[0], success: true, provider: "OpenRouter" });
      }
    }

    return NextResponse.json({ 
      output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      note: "Using fallback image"
    });

  } catch (error) {
    return NextResponse.json({ 
      output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      note: "Error - using fallback"
    });
  }
}