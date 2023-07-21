import { z } from "zod";

export const env = z
  .object({
    BEE_DEBUG_ENDPOINT: z.string().url().optional(),
    BEE_ENDPOINT: z.string().url().optional(),
    CHAIN_ID: z
      .string()
      .min(1)
      .default("7011893055")
      .transform((value, ctx) => {
        const chainId = parseInt(value, 10);

        if (isNaN(chainId) || chainId <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CHAIN_ID must be a number greater than 0",
          });

          return z.NEVER;
        }

        return chainId;
      }),
    GOOGLE_STORAGE_BUCKET_NAME: z.string().default("blobscan-test-bucket"),
    GOOGLE_STORAGE_PROJECT_ID: z.string().optional(),
    GOOGLE_SERVICE_KEY: z.string().optional(),
    GOOGLE_STORAGE_API_ENDPOINT: z.string().url().optional(),
  })
  .parse(process.env);
