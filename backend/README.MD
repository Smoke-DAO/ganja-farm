# Template for node-express-mongo rest-api backend

 - Rename `.env.template` to `.env` to use it for environment variables

 - To run local mongo instance: `docker run --name some-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=dbuser -e MONGO_INITDB_ROOT_PASSWORD=secretpassword -d mongo`

# Gnaja Farm Backend

## About the Project

Gnaja Farm is a backend service for a farming simulation game. It provides APIs for player management, seed purchasing, planting, harvesting, and item selling. The project uses Node.js with Express for the server, MongoDB for data storage, and Docker for containerization.

## To-Do List

- [ ] Implement SmokenTreasury for token storage and transactions
- [ ] Add authentication system
- [ ] Write unit and integration tests
- [ ] Complete API documentation

## API Endpoints

- POST `/api/v1/new-player`: Create a new player
- POST `/api/v1/level-up`: Level up a player
- GET `/api/v1/player/:id`: Get player information
- GET `/api/v1/can-level-up/:id`: Check if a player can level up
- POST `/api/v1/buy-seeds`: Buy seeds
- GET `/api/v1/seed-amount/:id/:item`: Get the amount of seeds for a player
- POST `/api/v1/plant-seed`: Plant a seed
- POST `/api/v1/harvest`: Harvest plants
- GET `/api/v1/garden-vector/:id`: Get the garden vector for a player
- GET `/api/v1/can-harvest/:index`: Check if a plant can be harvested
- POST `/api/v1/sell-item`: Sell an item
- GET `/api/v1/item-amount/:id/:item`: Get the amount of items for a player

## Dotenv and Database

- Rename `.env.template` to `.env`
- run mongo locally or using docker-compose with `docker-compose up -d mongodb`


## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## Running with Docker Compose

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. The server will be available at `http://localhost:5000`, and MongoDB will be exposed on port 27020.

## Deployment

1. Update the `MONGO_URL` in your production `.env` file to point to your production MongoDB instance.

2. Build the Docker image:
   ```bash
   docker build -t gnaja-farm-backend .
   ```

3. Push the image to your container registry.

4. On your production server, pull the image and run it:
   ```bash
   docker run -d -p 5000:5000 --env-file .env gnaja-farm-backend
   ```

Remember to set up proper security measures, such as using HTTPS, implementing rate limiting, and securing your MongoDB instance in a production environment.