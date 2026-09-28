# AttendEase UniFace - 24/7 Cloud Deployment Guide

Aapka UniFace AI Server 24/7 bina laptop on kiye chalane ke liye do sabse aasan tareeqe:

---

## Option 1: Hugging Face Spaces (Recommended - 100% Free, 16GB RAM)

1. [huggingface.co](https://huggingface.co) par free account banayein ya login karein.
2. Upper right corner me **Profile** par click karke **New Space** par click karein.
3. Settings select karein:
   - **Space Name:** `attendease-ai` (ya koi bhi naam)
   - **License:** `apache-2.0`
   - **Space SDK:** **Docker** (Blank) select karein
   - **Space Hardware:** Free (2 vCPU - 16 GB RAM)
4. Space create hone ke baad **Files** tab me jayein aur yeh 3 files upload (drag-drop) kar dein:
   - `Dockerfile`
   - `requirements.txt`
   - `server.py`
5. **Commit changes** par click karein. Hugging Face 2 minute me build kar dega.
6. Upper right 3 dots `...` par click karke **Embed this Space** ya Direct URL copy kar lijiye:
   - Example: `https://<your-username>-attendease-ai.hf.space`

---

## Option 2: Render.com (Free)

1. [render.com](https://render.com) par free account banayein.
2. **New +** > **Web Service** select karein.
3. Apna GitHub repository connect karein.
4. Settings:
   - **Root Directory:** `ai-service`
   - **Environment:** `Docker`
   - **Instance Type:** `Free`
5. Deploy click karein. Aapko live HTTPS link mil jayega:
   - Example: `https://attendease-ai.onrender.com`

---

## Netlify & Mobile App me Connect Kaise Karein:

1. **Netlify Dashboard** me jayein:  
   `Site configuration` > `Environment variables` > **Add variable**:
   - Key: `AI_SERVICE_URL`
   - Value: `https://<your-username>-attendease-ai.hf.space` (Aapka cloud URL)

2. **Mobile App me**:  
   Mobile app open karke **Profile** > **AI Biometrics Engine** me apna naya URL daal kar **Save** kar dein.

Ab laptop band rahe tab bhi 24/7 AI face attendance smoothly kaam karega!
