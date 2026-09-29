import { getCloudflareContext } from '@opennextjs/cloudflare'

/**
 * Safely resolves an environment variable at runtime in both
 * Cloudflare Workers (via getCloudflareContext().env) and local/Node environments (via process.env).
 *
 * Uses dynamic key lookup to prevent Next.js from inlining undefined during CI builds.
 */
export function getServerEnv(key: string): string | undefined {
  // 1. Try Cloudflare Worker request context first
  try {
    const context = getCloudflareContext()
    const cfEnv = context?.env as Record<string, unknown> | undefined
    if (cfEnv && typeof cfEnv[key] === 'string' && cfEnv[key]) {
      return cfEnv[key] as string
    }
  } catch {
    // Outside request context, in build-time prerender, or local dev
  }

  // 2. Try process.env with dynamic index access (not inlined by compiler)
  if (typeof process !== 'undefined' && process.env) {
    const val = process.env[key]
    if (typeof val === 'string' && val) {
      return val
    }
  }

  return undefined
}
