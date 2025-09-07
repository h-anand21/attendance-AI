

## Running the Project Locally in VS Code

Follow these steps to run your application on your local machine using Visual Studio Code.

### Step 1: Prerequisites

Ensure you have the following installed on your computer:
- [Node.js](https://nodejs.org/) (which includes `npm`)
- [Visual Studio Code](https://code.visualstudio.com/)

### Step 2: Set Up Environment Variables

Your application needs to connect to your Firebase project to function correctly. This is done using environment variables.

1.  **Create a new file** in the root of your project directory named `.env.local`.
2.  **Copy the contents** from the provided `.env.local.example` file and paste them into your new `.env.local` file.
3.  **Get your Firebase credentials**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
        *   Select your project.
            *   Click the gear icon (⚙️) next to "Project Overview" and select **Project settings**.
                *   In the **General** tab, under the "Your apps" section, find your web app.
                    *   Click on **SDK setup and configuration** and select the **Config** option.
                        *   You will see a `firebaseConfig` object. Copy the values from this object into your `.env.local` file.
                        4.  **Get your Gemini API Key**:
                            *   The AI features in this app use the Gemini API. You will need to create an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
                                *   Create a new API key and copy it.
                                    *   In your `.env.local` file, paste the key as the value for `GEMINI_API_KEY`.

                                    ### Step 3: Install Dependencies

                                    Open a terminal within VS Code (`View` -> `Terminal`) and run the following command to install all the necessary packages for the project:

                                    ```bash
                                    npm install
                                    ```

                                    ### Step 4: Run the Application

                                    This project requires two processes to run simultaneously: one for the Next.js web application and one for the Genkit AI server.

                                    1.  **Start the Next.js App**: In your first terminal, run:
                                        ```bash
                                            npm run dev
                                                ```
                                                    This will start the main web application, usually on `http://localhost:3000`.

                                                    2.  **Start the Genkit Server**: Open a *second* terminal in VS Code and run:
                                                        ```bash
                                                            npm run genkit:watch
                                                                ```
                                                                    This starts the AI development server, which your Next.js app will communicate with for features like face recognition.

                                                                    Your application is now running! You can open `http://localhost:3000` in your web browser to see it in action.
                                                                    
