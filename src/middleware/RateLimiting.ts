import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

dotenv.config();

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_TOKEN || !UPSTASH_REDIS_REST_URL) {
  throw new Error("Please Provide Upstash Credentials in .env");
}

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(7, "10 s"),
  analytics: true,
});

interface RateLimitMiddleware {
  (req: Request, res: Response, next: NextFunction): any;
}

const RateLimit: RateLimitMiddleware = async (req, res, next) => {
  const ip = req.get("x-forward-for") ?? "";
  const { success, reset } = await ratelimit.limit(ip);
  if (!success) {
    const now = Date.now();
    const retryAfter = Math.floor((reset - now) / 1000);
    return res
      .status(429)
      .set("Retry-After", String(retryAfter))
      .send(`Too Many Requests Retry After ${retryAfter} Seconds`);
  }
  next();
};

export default RateLimit;
