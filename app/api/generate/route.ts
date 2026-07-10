import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageBase64, prompt, roomType, roomStyle, installationSurface } = await request.json();

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
      finalPrompt = `Apply this exact material texture to the ${installationSurface} of a ${roomStyle} ${roomType}. Keep the exact texture pattern and colors. Photorealistic interior design render.`;
    }

    console.log("Final Prompt:", finalPrompt);

    // Check if we have an API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn("No OPENROUTER_API_KEY found, using fallback");
      return getFallbackResponse(roomStyle, roomType, installationSurface);
    }

    // Call OpenRouter with Qwen
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
      return getFallbackResponse(roomStyle, roomType, installationSurface);
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
      
      // If no image, use the text description with Pollinations
      return getPollinationsFallback(roomStyle, roomType, installationSurface, content);
    }

    return getFallbackResponse(roomStyle, roomType, installationSurface);

  } catch (error: any) {
    console.error("Error:", error);
    return getFallbackResponse(roomStyle, roomType, installationSurface);
  }
}

function getFallbackResponse(roomStyle: string, roomType: string, surface: string) {
  const images: Record<string, string> = {
    "Modern": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6",
    "Minimalist": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    "Scandinavian": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
    "Industrial": "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    "Traditional": "https://images.unsplash.com/photo-1616137466211-f939a420be84",
    "Mediterranean": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    "Bohemian": "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6"
  };
  
  const image = images[roomStyle as keyof typeof images] || images["Modern"];
  return NextResponse.json({ 
    output: `${image}?auto=format&fit=crop&w=800&q=80`,
    note: "Fallback image",
    success: true 
  });
}

async function getPollinationsFallback(roomStyle: string, roomType: string, surface: string, description: string) {
  try {
    const prompt = `${roomStyle} ${roomType} with ${surface} installation. ${description || ''}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true`;
    
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      return NextResponse.json({ 
        output: `data:${blob.type || 'image/jpeg'};base64,${base64Image}`,
        success: true 
      });
    }
    return getFallbackResponse(roomStyle, roomType, surface);
  } catch (error) {
    return getFallbackResponse(roomStyle, roomType, surface);
  }
}