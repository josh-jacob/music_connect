# music_connect

MusicConnect is a microservices-based project built on IBM Cloud.  
It connects Spotify and YouTube APIs to provide unified search, trends, and playlist management.

---

## 🚀 Getting Started (via SSH)

1. Clone the repository:
   ```bash
   git clone git@github.com:josh-jacob/music_connect.git

2.  Project Structure:

    /music_connect  #Project Core  
    /services       # Individual microservices (search, trends, exports, etc.)  
    /k8s            # Kubernetes manifests and deployment configs  
    /docs           # Architecture diagrams, API specs, and setup notes  

3.  Review and update the `.gitignore` file as you add new tools or environments.  

    Common examples of what should **not** be committed:
    - Local environment files (`.env`, `.env.local`)
    - Build and dependency folders (`node_modules/`, `dist/`, `__pycache__/`)
    - Editor or IDE settings (`.vscode/`, `.idea/`)
    - System-generated files (`.DS_Store`, `Thumbs.db`)
    - Log and temp files (`*.log`, `*.tmp`)