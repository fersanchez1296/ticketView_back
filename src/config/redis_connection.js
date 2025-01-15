// redis_connection.js
import redis from "redis"

// Crear un cliente Redis
export const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));