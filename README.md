# AttendEase – AI-Powered Attendance System  

An automated attendance management system powered by **AI-driven face recognition, QR check-ins, and real-time reporting**.  
This project helps institutions save time, improve accuracy, and generate valuable insights.  

---

## 🌐 Live Demo  
👉 [http://ai-attendance.netlify.app/](http://ai-attendance.netlify.app/)  

---


## 🚀 Features  
✅ AI-powered **Face Recognition Attendance**  
✅ **QR Check-ins** for quick verification  
✅ Real-time **Attendance Tracking & Reports**  
✅ Modern **Analytics Dashboard**  
✅ **Student & Teacher Directory** management  
✅ **Firebase Authentication** & Database integration  
✅ **Deployed on Netlify** for fast, secure hosting  

---

## ⚙️ Running the Project Locally in VS Code  

Follow these steps to run the application on your local machine using **Visual Studio Code**.  

---

### **Step 1: Prerequisites**  
Make sure you have installed:  
- [Node.js](https://nodejs.org/) (includes `npm`)  
- [Visual Studio Code](https://code.visualstudio.com/)  

---

### **Step 2: Set Up Environment Variables**  

1. **Create a new file** in the root of your project directory named `.env.local`.  
2. **Copy the contents** from `.env.local.example` and paste into `.env.local`.  
3. **Get Firebase credentials**:  
   - Go to [Firebase Console](https://console.firebase.google.com/).  
   - Select your project → ⚙️ **Project settings**.  
   - Under **General > Your apps**, choose your web app.  
   - Click **SDK setup and configuration → Config**.  
   - Copy the `firebaseConfig` object values into your `.env.local` file.  
4. **Get Gemini API Key**:  
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey).  
   - Generate a new API key.  
   - Add it to `.env.local`:  
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```  

---

### **Step 3: Install Dependencies**  
Open a terminal in VS Code and run:  

```bash
npm install
