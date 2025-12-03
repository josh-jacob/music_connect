###
1) Run this 
pip install -r requirements.txt

2) create .env file with this

YOUTUBE_CLIENT_SECRET_FILE=./youtube_oauth_credentials.json
YOUTUBE_CLIENT_ID=347957274338-77u52c7mp6vl39tth5tru0q8e1u1aiks.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=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
YOUTUBE_UI_REDIRECT_URL=http://localhost:3000/youtube-music

3) Run terminal 
uvicorn app.main:app

4) login on 
http://localhost:8000/auth/youtube/login
###