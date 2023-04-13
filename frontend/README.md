# SENG 468 Day Trader Frontend
NextJS application for managing stock trading operations.

## Prerequisites
- Node.js v16 or greater is required to run this application.

## Getting Started
1. Clone the repository:
```sh
git clone https://github.com/MarcusDunn/day-trader.git
cd day-trader/frontend
```

2. Install the dependencies:
```sh
npm install
```

3. Fill the application with dummy data:
Create a new file named .env.local in the root directory and fill it with the following text:

```
DUMMY_DATA=true
```

Or, to use real data, ensure all other containers in the docker-compose file are running.

4. Run the application in development mode:
```sh
npm run dev
```
The application will be available at http://localhost:3000.

## File Structure
The project is organized as follows:

```bash
swift-trader-frontend/
├── pages/               # Contains all routed pages
│   ├── api/             # Contains all server side code which interacts with gRPC
│   └── ...
└── src/                 # Contains all components and app files
    ├── components/      # Contains reusable UI components
    └── ...           
```
