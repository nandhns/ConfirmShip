## Overview 
TBD

## Tech Stack 
TBD

## Project Structure 
TBD


## Getting Started 
### Challenge Environment Setup
The challenge server and dataset provided by the organisers are not included
in this repository.

1. Download and extract the `sdoc-hackathon-docker` ZIP provided by the organisers.

2. Copy the provided `server/` and `data_v2/` directories into a `challenge/`
directory at the project root:

ConfirmShip/
├── backend/
├── frontend/
├── challenge/
│   ├── server/
│   └── data_v2/
├── docker-compose.yml
└── README.md

3. From the project root, start the challenge server with this command:

docker compose up --build (Or use Docker Desktop)

## Development Workflow 
### Branching 

Do not develop directly on `main`

Before starting a new task, pull the latest changes and create a new branch. 

Branch naming: 
* feature/<name> : new features 
* fix/<name> : bug fixes
* docs/<name> : documentation changes 

Examples: 
feature/email-classification
feature/document-extraction
feature/inbox-ui
fix/weight-normalisation 

###Commit & Pull Requests

Use short, descriptive commit messages.

Examples:
feat: add document extraction
fix: handle missing attachments
docs: update setup instructions
test: add comparison tests

Push your branch, then open a Pull Request into main. 

Before merging:

1. Make sure the feature works locally.
2. Do not commit .env, API keys, or files under challenge/.
3. Resolve merge conflicts.
4. Get another teammate to review the PR when possible.

