# Song Search

- Song Search is a web application that recommends songs based on similarity search run on song "embeddings".

- Embeddings are created using normalized values of song characteristics sourced from spotify's database

- Dataset used for this project can be found here -> [songs](https://www.kaggle.com/datasets/joebeachcapital/30000-spotify-songs)

## Project Structure
- [Client](/client): code for the nextjs frontend
- [Backend](/backend/): python code running on aws lambda
- [Notebook](/notebook/): all jupyter notebooks used for testing out ideas
- [Dataset](/dataset/): primary datasets used for this project

## Setup

Run client locally
```bash
cd client
npm ci
npm run dev
```

Upload the backend/lambda code as a .zip in a aws lambda function

Create a .env.local file and add the following
```
NEXT_PUBLIC_LAMBDA=<URL of your lambda function>
```
