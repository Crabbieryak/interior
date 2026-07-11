import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>🏠 StudioVisualizer Pro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
      background: #f5f5f5;
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
      color: #1a1a1a;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .header h1 { font-size: 28px; font-weight: bold; }
    .header p { color: #666; margin-top: 4px; }
    .card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .card-title {
      fontWeight: 600;
      font-size: 14px;
      margin-bottom: 8px;
      color: #333;
    }
    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
    }
    .upload-area img {
      max-height: 200px;
      max-width: 100%;
      border-radius: 8px;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 16px;
      margin: 8px 0;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .btn:active { transform: scale(0.98); }
    .btn-black { background: #1a1a1a; color: white; }
    .btn-black:active { background: #333; }
    .btn-gray { background: #e5e7eb; color: #1a1a1a; }
    .btn-gray:active { background: #d1d5db; }
    .btn-primary { background: #1a1a1a; color: white; font-size: 20px; padding: 18px; }
    .btn-primary:disabled { background: #ccc; color: #666; cursor: not-allowed; }
    .btn-danger { background: #dc2626; color: white; padding: 10px; font-size: 14px; }
    select, textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 16px;
      background: #fafafa;
      margin: 4px 0;
    }
    textarea { height: 80px; resize: vertical; font-family: inherit; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .log {
      background: #1a1a1a;
      color: #00ff00;
      padding: 12px;
      border-radius: 10px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      max-height: 150px;
      overflow-y: auto;
      margin-top: 8px;
    }
    .log-empty { color: #555; }
    .output-area {
      background: #f0f0f0;
      border-radius: 12px;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .output-area img { width: 100%; height: 100%; object-fit: cover; }
    .output-placeholder { color: #999; text-align: center; padding: 40px; }
    .output-placeholder .icon { font-size: 48px; display: block; margin-bottom: 12px; }
    .loading-spinner {
      display: inline-block;
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #1a1a1a;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 StudioVisualizer Pro</h1>
    <p>Instant Architectural Rendering — Show clients the finished look</p>
  </div>

  <div class="grid-2">
    <div>
      <div class="card">
        <div class="card-title">📸 Step 1: Snap your Material Texture</div>
        <div class="upload-area">
          <div id="previewContainer">
            <p style="color: #999; font-size: 16px;">No photo selected</p>
          </div>
        </div>
        <div style="margin-top: 12px;">
          <button class="btn btn-black" id="cameraBtn">📷 Open Camera</button>
          <button class="btn btn-gray" id="galleryBtn">🖼️ Choose from Gallery</button>
          <button class="btn btn-danger" id="clearBtn" style="display:none;">🗑️ Remove Photo</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🏗️ Step 2: Where will it be installed?</div>
        <select id="surfaceSelect">
          <option value="Floor">Floor</option>
          <option value="Wall">Wall</option>
          <option value="Ceiling">Ceiling</option>
          <option value="Countertop">Countertop</option>
          <option value="Backsplash">Backsplash</option>
        </select>
        <div class="card-title" style="margin-top:12px;">🛋️ Step 3: Room Type</div>
        <select id="roomSelect">
          <option value="Living Room">Living Room</option>
          <option value="Bathroom">Bathroom</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Office">Office</option>
          <option value="Entryway">Entryway</option>
        </select>
        <div class="card-title" style="margin-top:12px;">🎨 Step 4: Design Style</div>
        <select id="styleSelect">
          <option value="Modern">Modern</option>
          <option value="Minimalist">Minimalist</option>
          <option value="Scandinavian">Scandinavian</option>
          <option value="Industrial">Industrial</option>
          <option value="Traditional">Traditional</option>
          <option value="Mediterranean">Mediterranean</option>
          <option value="Bohemian">Bohemian</option>
        </select>
        <div style="margin-top:12px; border-top:1px solid #eee; padding-top:12px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <input type="checkbox" id="customPromptCheck">
            <label for="customPromptCheck" style="font-size:14px; font-weight:500;">✏️ Custom Prompt</label>
          </div>
          <textarea id="customPromptInput" placeholder="Describe exactly what you want..." style="display:none;"></textarea>
        </div>
      </div>

      <button class="btn btn-primary" id="generateBtn" disabled>🚀 Generate Concept</button>
      <div id="errorContainer" style="display:none; background:#fee2e2; color:#991b1b; padding:12px; border-radius:10px; margin-top:8px; font-size:14px;"></div>

      <div class="card" style="margin-top:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="card-title">📋 Live Console</span>
          <button onclick="clearConsole()" style="background:none; border:none; color:#999; font-size:12px; cursor:pointer;">Clear</button>
        </div>
        <div class="log" id="logContainer">
          <div class="log-empty">Waiting for actions...</div>
        </div>
      </div>
    </div>

    <div>
      <div class="card" style="height:100%;">
        <div class="card-title">🏗️ Rendered Result</div>
        <div class="output-area" id="outputArea">
          <div class="output-placeholder">
            <span class="icon">🏗️</span>
            <p>Your rendered room will appear here</p>
            <p style="font-size:12px; color:#bbb;">Select a photo and click generate</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    var imageData = null;
    var isLoading = false;
    var logContainer = document.getElementById('logContainer');
    var previewContainer = document.getElementById('previewContainer');
    var outputArea = document.getElementById('outputArea');
    var generateBtn = document.getElementById('generateBtn');
    var cameraBtn = document.getElementById('cameraBtn');
    var galleryBtn = document.getElementById('galleryBtn');
    var clearBtn = document.getElementById('clearBtn');
    var errorContainer = document.getElementById('errorContainer');
    var customPromptCheck = document.getElementById('customPromptCheck');
    var customPromptInput = document.getElementById('customPromptInput');

    function addLog(msg, type) {
      type = type || 'info';
      var time = new Date().toLocaleTimeString();
      var colors = { info: '#88ccff', success: '#00ff00', error: '#ff4444' };
      var emojis = { info: '📱', success: '✅', error: '❌' };
      var entry = document.createElement('div');
      entry.style.color = colors[type] || '#ffffff';
      entry.textContent = '[' + time + '] ' + (emojis[type] || '📱') + ' ' + msg;
      logContainer.prepend(entry);
      while (logContainer.children.length > 30) {
        logContainer.removeChild(logContainer.lastChild);
      }
      console.log(msg);
    }

    function clearConsole() {
      logContainer.innerHTML = '<div class="log-empty">Console cleared</div>';
    }

    function handleFile(file) {
      addLog('📁 File: ' + file.name + ' (' + (file.size / 1024).toFixed(0) + ' KB)', 'info');
      if (!file) { addLog('❌ No file', 'error'); return; }
      if (!file.type.startsWith('image/')) { addLog('❌ Not an image', 'error'); return; }
      if (file.size > 10 * 1024 * 1024) { addLog('❌ Too large', 'error'); return; }
      var reader = new FileReader();
      reader.onload = function(e) {
        var dataUrl = e.target.result;
        addLog('✅ File read', 'success');
        imageData = dataUrl;
        previewContainer.innerHTML = '<img src="' + dataUrl + '" alt="Preview">';
        clearBtn.style.display = 'inline-block';
        generateBtn.disabled = false;
        errorContainer.style.display = 'none';
        addLog('✅ Preview shown', 'success');
      };
      reader.readAsDataURL(file);
    }

    function openCamera() {
      addLog('📷 Opening camera...', 'info');
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
          addLog('📷 Camera returned', 'success');
          handleFile(file);
        } else {
          addLog('❌ No photo', 'error');
        }
        document.body.removeChild(input);
      };
      input.click();
      addLog('✅ Camera opened', 'success');
    }

    function openGallery() {
      addLog('🖼️ Opening gallery...', 'info');
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (file) {
          addLog('🖼️ Gallery returned', 'success');
          handleFile(file);
        } else {
          addLog('❌ No file', 'error');
        }
        document.body.removeChild(input);
      };
      input.click();
      addLog('✅ Gallery opened', 'success');
    }

    function clearImage() {
      imageData = null;
      previewContainer.innerHTML = '<p style="color: #999; font-size: 16px;">No photo selected</p>';
      clearBtn.style.display = 'none';
      generateBtn.disabled = true;
      addLog('🗑️ Cleared', 'info');
    }

    async function generate() {
      if (!imageData) { addLog('❌ No image', 'error'); return; }
      if (isLoading) return;
      isLoading = true;
      generateBtn.disabled = true;
      generateBtn.textContent = '⏳ Rendering...';
      addLog('🚀 Starting generation...', 'info');
      outputArea.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loading-spinner"></div><p style="margin-top:12px; color:#666;">Processing...</p></div>';

      try {
        var roomType = document.getElementById('roomSelect').value;
        var roomStyle = document.getElementById('styleSelect').value;
        var installationSurface = document.getElementById('surfaceSelect').value;
        var useCustom = customPromptCheck.checked;
        var customPrompt = customPromptInput.value.trim();

        var prompt = useCustom && customPrompt ? customPrompt : 
          'Apply this exact material texture to the ' + installationSurface + ' of a ' + roomStyle + ' ' + roomType + '. Photorealistic.';

        addLog('📤 Sending to API...', 'info');
        var response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64: imageData, 
            prompt: prompt, 
            roomType: roomType, 
            roomStyle: roomStyle, 
            installationSurface: installationSurface 
          })
        });
        var data = await response.json();
        addLog('📥 API Response: ' + response.status, response.ok ? 'success' : 'error');
        if (!response.ok) throw new Error(data.error || 'Failed');
        if (data.output) {
          outputArea.innerHTML = '<img src="' + data.output + '" alt="Generated" style="width:100%; height:100%; object-fit:cover;">';
          addLog('✅ Generated! 🎉', 'success');
        } else {
          throw new Error('No image generated');
        }
      } catch (err) {
        addLog('❌ Error: ' + err.message, 'error');
        errorContainer.textContent = '❌ ' + err.message;
        errorContainer.style.display = 'block';
        outputArea.innerHTML = '<div class="output-placeholder"><span class="icon">❌</span><p>Error generating image</p><p style="font-size:12px; color:#ef4444;">' + err.message + '</p></div>';
      } finally {
        isLoading = false;
        generateBtn.disabled = !imageData;
        generateBtn.textContent = '🚀 Generate Concept';
      }
    }

    cameraBtn.addEventListener('click', openCamera);
    galleryBtn.addEventListener('click', openGallery);
    clearBtn.addEventListener('click', clearImage);
    generateBtn.addEventListener('click', generate);
    customPromptCheck.addEventListener('change', function() {
      customPromptInput.style.display = this.checked ? 'block' : 'none';
    });

    addLog('✅ App loaded', 'success');
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
