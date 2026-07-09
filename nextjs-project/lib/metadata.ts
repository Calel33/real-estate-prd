import { EMPTY_GLOBAL, intake } from "@/lib/intake";
import { StrapiError } from "@/lib/fetch";
import type { Global } from "@/lib/schemas/global";

export async function getGlobalMetadata(): Promise<Global> {
  try {
    return await intake.global();
  } catch (error) {
    if (
      error instanceof StrapiError &&
      (error.status === 401 || error.status === 403)
    ) {
      console.warn(
        `Failed to fetch Global metadata (status: ${error.status}). Falling back to EMPTY_GLOBAL.`,
      );
      return EMPTY_GLOBAL;
    }

    throw error;
  }
}
