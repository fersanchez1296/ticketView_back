// redis_connection.js
import redis from "redis"
import "dotenv/config";

// Crear un cliente Redis
export const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
