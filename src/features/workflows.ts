import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { assertPermission } from "@/lib/authorization";
import type { applicationSchema, challengeSchema, wishSchema } from "@/lib/validation";
import type { UserRole } from "@/types/domain";

export type Actor = { id: string; role: UserRole };
export type WishInput = z.infer<typeof wishSchema>;
export type ChallengeInput = z.infer<typeof challengeSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;

export interface WorkflowGateway {
  createWish(ownerId: string, input: WishInput): Promise<string>;
  createChallenge(input: ChallengeInput): Promise<string>;
  markWishChallengeCreated(wishId: string): Promise<void>;
  isChallengeOpen(challengeId: string): Promise<boolean>;
  createApplication(studentId: string, input: ApplicationInput): Promise<string>;
}

export async function submitWish(
  actor: Actor,
  input: WishInput,
  gateway: WorkflowGateway,
) {
  assertPermission(actor.role, "wish:create");
  return gateway.createWish(actor.id, input);
}

export async function publishChallenge(
  actor: Actor,
  input: ChallengeInput,
  gateway: WorkflowGateway,
) {
  assertPermission(actor.role, "challenge:publish");
  const challengeId = await gateway.createChallenge(input);
  await gateway.markWishChallengeCreated(input.wishId);
  return challengeId;
}

export async function submitApplication(
  actor: Actor,
  input: ApplicationInput,
  gateway: WorkflowGateway,
) {
  assertPermission(actor.role, "application:create");

  if (!(await gateway.isChallengeOpen(input.challengeId))) {
    throw new Error("CHALLENGE_NOT_OPEN");
  }

  return gateway.createApplication(actor.id, input);
}

export function createSupabaseWorkflowGateway(
  supabase: SupabaseClient,
): WorkflowGateway {
  return {
    async createWish(ownerId, input) {
      const { data, error } = await supabase
        .from("wishes")
        .insert({
          owner_id: ownerId,
          shop_name: input.shopName,
          contact_name: input.contactName,
          contact_email: input.contactEmail,
          industry: input.industry,
          website_url: input.websiteUrl,
          sns_url: input.snsUrl,
          address: input.address,
          problem: input.problem,
          desired_outcome: input.desiredOutcome,
          experiment_idea: input.experimentIdea,
          preferred_period: input.preferredPeriod,
          notes: input.notes,
          status: "submitted",
        })
        .select("id")
        .single();

      if (error || !data) throw new Error("WISH_CREATE_FAILED");
      return data.id as string;
    },

    async createChallenge(input) {
      const { data, error } = await supabase
        .from("challenges")
        .insert({
          wish_id: input.wishId,
          title: input.title,
          summary: input.summary,
          background: input.background,
          problem: input.problem,
          desired_outcome: input.desiredOutcome,
          shop_display_name: input.shopDisplayName,
          category: input.category,
          skills: input.skills,
          period: input.period,
          workload: input.workload,
          area: input.area,
          capacity: input.capacity,
          deadline: input.deadline,
          status: input.status,
          published_at: input.status === "published" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();

      if (error || !data) throw new Error("CHALLENGE_CREATE_FAILED");
      return data.id as string;
    },

    async markWishChallengeCreated(wishId) {
      const { error } = await supabase
        .from("wishes")
        .update({ status: "challenge_created" })
        .eq("id", wishId);

      if (error) throw new Error("WISH_UPDATE_FAILED");
    },

    async isChallengeOpen(challengeId) {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, status, deadline")
        .eq("id", challengeId)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) return false;
      return !data.deadline || new Date(data.deadline) >= new Date(new Date().toDateString());
    },

    async createApplication(studentId, input) {
      const { data, error } = await supabase
        .from("applications")
        .insert({
          challenge_id: input.challengeId,
          student_id: studentId,
          motivation: input.motivation,
          interest_reason: input.interestReason,
          skills_experience: input.skillsExperience,
          availability: input.availability,
          notes: input.notes,
          status: "applied",
          privacy_agreed_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error?.code === "23505") throw new Error("ALREADY_APPLIED");
      if (error || !data) throw new Error("APPLICATION_CREATE_FAILED");
      return data.id as string;
    },
  };
}
