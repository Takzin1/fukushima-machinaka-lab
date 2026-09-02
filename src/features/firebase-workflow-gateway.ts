import "server-only";

import type { WorkflowGateway } from "@/features/workflows";
import {
  executePublicQuery,
  executeUserMutation,
  type FirebaseActor,
} from "@/lib/firebase/data-connect";
import type { DataRecord } from "@/lib/firebase/mappers";

function insertedId(value: DataRecord | null | undefined, code: string) {
  const id = value?.id;
  if (typeof id !== "string") throw new Error(code);
  return id;
}

export function createFirebaseWorkflowGateway(
  actor: FirebaseActor,
): WorkflowGateway {
  return {
    async createWish(_ownerId, input) {
      const response = await executeUserMutation<
        { wish_insert: DataRecord },
        Omit<typeof input, never>
      >("CreateWish", actor, input);
      return insertedId(response.data.wish_insert, "WISH_CREATE_FAILED");
    },

    async createChallenge(input) {
      const variables = {
        ...input,
        deadline: input.deadline
          ? new Date(`${input.deadline}T23:59:59+09:00`).toISOString()
          : null,
        publishedAt: input.status === "published" ? new Date().toISOString() : null,
      };
      const response = await executeUserMutation<
        { challenge_insert: DataRecord },
        typeof variables
      >("PublishChallenge", actor, variables);
      return insertedId(response.data.challenge_insert, "CHALLENGE_CREATE_FAILED");
    },

    async markWishChallengeCreated() {
      // PublishChallenge updates the WISH in the same SQL transaction.
    },

    async isChallengeOpen(challengeId) {
      const response = await executePublicQuery<
        { challenges: DataRecord[] },
        { id: string }
      >("GetPublishedChallenge", { id: challengeId });
      const challenge = response.data.challenges[0];
      if (!challenge) return false;
      return (
        challenge.deadline == null ||
        new Date(String(challenge.deadline)).getTime() >= Date.now()
      );
    },

    async createApplication(_studentId, input) {
      try {
        const variables = {
          challengeId: input.challengeId,
          motivation: input.motivation,
          interestReason: input.interestReason,
          skillsExperience: input.skillsExperience,
          availability: input.availability,
          notes: input.notes,
        };
        const response = await executeUserMutation<
          { application_insert: DataRecord },
          typeof variables
        >("CreateApplication", actor, variables);
        return insertedId(
          response.data.application_insert,
          "APPLICATION_CREATE_FAILED",
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (/unique|duplicate|already exists/i.test(message)) {
          throw new Error("ALREADY_APPLIED");
        }
        throw error;
      }
    },
  };
}
