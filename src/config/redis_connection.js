// redis_connection.js
import redis from "redis"

// Crear un cliente Redis
export const redisClient = redis.createClient({
  url: `redis://redis:6379`,
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));