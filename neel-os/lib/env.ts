type EnvName =
  | 'GROQ_API_KEY'
  | 'KV_REST_API_URL'
  | 'KV_REST_API_TOKEN'
  | 'UPSTASH_REDIS_REST_URL'
  | 'UPSTASH_REDIS_REST_TOKEN';

interface KvConfig {
  url: string;
  token: string;
}

export function readEnv(name: EnvName): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function requireEnv(name: EnvName): string {
  const value = readEnv(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function hasGroqApiKey(): boolean {
  return Boolean(readEnv('GROQ_API_KEY'));
}

export function getGroqApiKey(): string {
  return requireEnv('GROQ_API_KEY');
}

export function getKvConfig(): KvConfig | null {
  const url = readEnv('KV_REST_API_URL') ?? readEnv('UPSTASH_REDIS_REST_URL');
  const token = readEnv('KV_REST_API_TOKEN') ?? readEnv('UPSTASH_REDIS_REST_TOKEN');
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}
