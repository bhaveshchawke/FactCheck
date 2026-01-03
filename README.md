# TrueCheck - AI-Powered Fact Checking & Source Analysis

TrueCheck is a full-stack MERN application that leverages Google's Gemini AI and Custom Search API to verify news, headlines, and claims. It provides a credibility score, detects logical fallacies, and cites authoritative sources.

![Application Screenshot](https://via.placeholder.com/800x400?text=TrueCheck+Application+Screenshot)

## Features

-   **AI Deep Analysis**: Uses Gemini 3 Flash Preview to analyze content for bias, fallacies, and trust score.
-   **Source Citations**: Automatically fetches and displays top 3 Google Search results for verification.
-   **Credibility Score**: A visual score meter (0-100) combining AI analysis and heuristic checks.
-   **Trust Graph**: Visual representation of the trust metrics.
-   **User Voting**: Community voting system to crowd-source accuracy.

## Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Framer Motion
-   **Backend**: Node.js, Express, MongoDB
-   **AI**: Google Gemini API
-   **Search**: Google Custom Search JSON API

## Prerequisites

-   Node.js (v18+)
-   MongoDB Atlas URI
-   Google Cloud Project with:
    -   Gemini API Key
    -   Custom Search API Key
    -   Search Engine ID (CX)

## Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/bhaveshchawke/FactCheck.git
    cd FactCheck
    ```

2.  **Install Dependencies** (Root, Client, and Server)
    ```bash
    npm run install-all
    ```

3.  **Environment Setup**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    GOOGLE_SEARCH_API_KEY=your_google_search_api_key
    GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
    ```

4.  **Run the Application**
    To run both client and server concurrently:
    ```bash
    npm run dev
    ```
    -   Frontend: `http://localhost:5173`
    -   Backend: `http://localhost:5000`

## Contributing

1.  Fork the repo
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
