/**
 * Middleware that suppresses socket errors (ECONNABORTED, ECONNRESET, EPIPE)
 * which are normal during video streaming and range-request serving.
 *
 * Without this, Strapi logs them as unhandled application errors, polluting
 * logs with noise that is not actionable.
 *
 * Must be the FIRST middleware in the chain so the overridden ctx.onerror
 * is in place before any response streaming begins.
 *
 * @see https://github.com/koajs/koa/issues/1514
 * @see https://nodejs.org/api/errors.html#common-system-errors
 */
import type { Core } from '@strapi/strapi';

const SUPPRESSED_CODES = new Set(['ECONNABORTED', 'ECONNRESET', 'EPIPE', 'ECANCELED']);

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }): Core.MiddlewareHandler => {
  return async (ctx, next) => {
    // Save original onerror so we can restore it after the response completes.
    const origOnerror = ctx.onerror;

    // Replace ctx.onerror with a version that silently swallows
    // client-disconnect errors. These happen AFTER the middleware
    // chain completes (during response streaming), so try/catch
    // around await next() would not catch them.
    ctx.onerror = (err: Error & { code?: string }) => {
      // Koa may call onerror with null/undefined (e.g. socket close
      // without a concrete Error).  Fall through to the original handler.
      if (!err) {
        origOnerror.call(ctx, err);
        return;
      }
      const code = (err as NodeJS.ErrnoException).code;
      if (code && SUPPRESSED_CODES.has(code)) {
        // Client disconnected — this is normal behaviour when a
        // browser cancels an in-flight video range request.
        // Ensure the response is properly cleaned up.
        if (!ctx.res.writableEnded) {
          ctx.res.end();
        }
        return;
      }

      // For all other errors, fall through to Strapi's normal
      // error handling so they get logged and reported.
      origOnerror.call(ctx, err);
    };

    // Also attach a raw error listener to suppress the Node.js
    // "unhandled error event" warning for socket-level errors.
    const onResError = (err: NodeJS.ErrnoException) => {
      if (!err) return;
      if (err.code && SUPPRESSED_CODES.has(err.code)) {
        return;
      }
      strapi.log.error(`Unhandled response socket error: ${err.message}`, err);
    };
    ctx.res.on('error', onResError);

    try {
      await next();
    } finally {
      // Restore the original onerror after the response has been
      // written (or the connection closed).  We keep the patched
      // version active during the streaming window.
      ctx.res.once('close', () => {
        ctx.res.removeListener('error', onResError);
        ctx.onerror = origOnerror;
      });
      ctx.res.once('finish', () => {
        ctx.res.removeListener('error', onResError);
        ctx.onerror = origOnerror;
      });
    }
  };
};
