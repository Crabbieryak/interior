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

    // SUPER DETAILED PROMPT - This is the key to getting good results
    let finalPrompt = prompt;
    if (!finalPrompt || finalPrompt.trim() === '') {
      finalPrompt = `[TASK]: Generate a photorealistic interior design image.

[Material Reference]: The user has uploaded a photo of a material texture. This is the EXACT material that MUST be used.

[Requirements]:
1. Apply the uploaded material to the ${installationSurface} of a ${roomStyle} ${roomType}
2. The ${installationSurface} must show the EXACT texture, pattern, color, and finish from the uploaded photo
3. The material should look naturally installed with proper lighting, shadows, and perspective
4. The rest of the room should match the ${roomStyle} style
5. Professional interior design, high quality, 8k resolution, photorealistic

[Style Guide]: ${roomStyle} style - clean lines, contemporary design, professional finish

[Surface]: ${installationSurface}

[Room]: ${roomType}

IMPORTANT: The uploaded image contains the actual material that MUST be visible on the ${installationSurface}. Do not replace it with a generic material. Show the exact texture from the photo.`;
    }

    console.log("📤 Sending to OpenRouter with Qwen VL...");
    console.log("📝 Prompt length:", finalPrompt.length);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        note: "No API key - using fallback"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://interior.vercel.app",
        "X-Title": "StudioVisualizer Pro",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-vl-8b-thinking",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: finalPrompt 
              },
              { 
                type: "image_url", 
                image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } 
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return getFallbackImage(roomStyle, roomType, installationSurface);
    }

    const data = await response.json();
    console.log("✅ API Response received");
    
    // Try to extract image from response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      
      // Check if content contains an image
      const imageMatch = content.match(/data:image\/[^;]+;base64,[^"]+/);
      if (imageMatch) {
        console.log("✅ Image extracted from response");
        return NextResponse.json({ 
          output: imageMatch[0],
          success: true 
        });
      }
      
      // If no image, try Pollinations with the description
      console.log("No image in response, using Pollinations...");
      return getPollinationsImage(roomStyle, roomType, installationSurface, content);
    }

    return getFallbackImage(roomStyle, roomType, installationSurface);

  } catch (error: any) {
    console.error("Error:", error);
    return getFallbackImage("Modern", "Living Room", "Floor");
  }
}

// Generate image from text description using Pollinations
async function getPollinationsImage(roomStyle: string, roomType: string, surface: string, description: string) {
  try {
    // Use a different seed each time for variety
    const seed = Date.now();
    const prompt = `${roomStyle} ${roomType} with ${surface} made of premium material. Photorealistic interior design. ${description?.substring(0, 100) || ''}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&seed=${seed}`;
    
    console.log("🎨 Calling Pollinations with seed:", seed);
    
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      return NextResponse.json({ 
        output: `data:${blob.type || 'image/jpeg'};base64,${base64Image}`,
        success: true,
        note: "Generated from text description"
      });
    }
    return getFallbackImage(roomStyle, roomType, surface);
  } catch (error) {
    return getFallbackImage(roomStyle, roomType, surface);
  }
}

// Fallback image
function getFallbackImage(roomStyle: string, roomType: string, surface: string) {
  // Random seed so images vary
  const seed = Date.now();
  const prompt = `${roomStyle} ${roomType} with ${surface} installation, photorealistic interior design, 8k`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&seed=${seed}`;
  
  return NextResponse.json({ 
    output: url,
    note: "Using fallback image",
    success: true 
  });
}