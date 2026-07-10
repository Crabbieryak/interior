import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageUrl, imageBase64, roomType, roomStyle, installationSurface } = await request.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const prompt = `A ${roomStyle} ${roomType} with ${installationSurface} installation using this material texture. Professional interior design render, high quality, photorealistic.`;

    // Try with base64 first (most reliable)
    let imageParam = '';
    if (imageBase64) {
      let cleanBase64 = imageBase64;
      if (imageBase64.startsWith('data:image')) {
        cleanBase64 = imageBase64.split(',')[1];
      }
      imageParam = `&image=${encodeURIComponent(cleanBase64)}`;
    } else if (imageUrl) {
      imageParam = `&image=${encodeURIComponent(imageUrl)}`;
    }

    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=768&nologo=true${imageParam}`;

    console.log("Calling Pollinations API...");
    console.log("Using image:", imageParam ? "Yes" : "No");

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      // Fallback to text-only
      const fallbackPrompt = `A ${roomStyle} ${roomType} with ${installationSurface} installation, photorealistic interior design`;
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=1024&height=768&nologo=true`;
      
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
        throw new Error(`Pollinations error: ${fallbackResponse.status}`);
      }
      
      const blob = await fallbackResponse.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const imageDataUrl = `data:${blob.type || 'image/jpeg'};base64,${base64Image}`;

      return NextResponse.json({ 
        output: imageDataUrl,
        note: "Generated from text (image upload failed)",
        success: true 
      });
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const imageDataUrl = `data:${blob.type || 'image/jpeg'};base64,${base64Image}`;

    return NextResponse.json({ 
      output: imageDataUrl,
      success: true 
    });

  } catch (error: any) {
    console.error("Pollinations API Error:", error);
    
    // Mock images as fallback
    const mockImages: Record<string, string> = {
      "Modern": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      "Minimalist": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
      "Scandinavian": "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "Industrial": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    };
    
    const mockImage = mockImages[roomStyle as keyof typeof mockImages] || mockImages["Modern"];
    
    return NextResponse.json({ 
      output: mockImage,
      note: "Using mock image - API error",
      success: true 
    });
  }
}