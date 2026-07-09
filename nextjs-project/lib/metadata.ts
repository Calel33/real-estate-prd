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
      return EMPTY_GLOBAL;
    }

    throw error;
  }
}
