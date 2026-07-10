"use server";

import { z } from "zod";

const SavingsFormSchema = z.object({
  firstname: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  company: z.string().max(200).optional(),
});

type SavingsFormData = z.infer<typeof SavingsFormSchema>;

type HubSpotResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string>; detail?: unknown };

export async function submitSavingsForm(
  data: SavingsFormData
): Promise<HubSpotResult> {
  const parsed = SavingsFormSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((e) => {
      if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
    });
    return { success: false, error: "Validation failed", fieldErrors };
  }

  const { firstname, email, company } = parsed.data;

  const portalId = "2624857";
  const formId = "cd910727-b09a-44f3-9d42-2239e121676a";

  const url = `https://api-na2.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

  const fields: Array<{ name: string; value: string }> = [
    { name: "firstname", value: firstname },
    { name: "email", value: email },
  ];
  if (company) {
    fields.push({ name: "company", value: company });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields,
        context: {
          pageUri: "https://www.fieldequip.com/roi-calculator/",
          pageName: "ROI Calculator",
        },
      }),
      signal: AbortSignal.timeout(8000),
    });


    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[HubSpot] submission failed", res.status, JSON.stringify(body));
      const isBlockedEmail = body?.errors?.some(
        (e: { errorType?: string }) => e.errorType === "BLOCKED_EMAIL"
      );
      return {
        success: false,
        error: isBlockedEmail
          ? "Please use your work email address to unlock your report."
          : "Submission failed. Please try again.",
        detail: body,
      };
    }

    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { success: false, error: "Request timed out. Please try again." };
    }
    console.error("[HubSpot] unexpected error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
