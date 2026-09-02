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
