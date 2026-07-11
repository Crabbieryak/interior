import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageBase64, roomType, roomStyle, installationSurface, customPrompt } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Clean base64
    let cleanBase64 = imageBase64;
    if (imageBase64.startsWith('data:image')) {
      cleanBase64 = imageBase64.split(',')[1];
    }

    // Build the prompt - this is where you tell it WHERE to put the texture
    let prompt = customPrompt;
    if (!prompt || prompt.trim() === '') {
      prompt = `Apply this exact material texture to the ${installationSurface} of a ${roomStyle} ${roomType}. 
      The ${installationSurface} should show this exact texture pattern, color, and material. 
      Make it look realistic and professionally installed. Photorealistic interior design.`;
    }

    // Call Reve Remix API
    const response = await fetch("https://api.reve.com/v1/image/remix", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REVE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        images: [`data:image/jpeg;base64,${cleanBase64}`],
        aspect_ratio: "16:9",
      }),
    });

    if (!response.ok) {
      throw new Error(`Reve API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      output: data.image_url || data.output,
      success: true 
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ 
      output: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      note: "Error - using fallback"
    });
  }
}