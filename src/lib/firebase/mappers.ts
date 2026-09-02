import type {
  ApplicationStatus,
  ApplicationWithContext,
  Challenge,
  ChallengeStatus,
  Profile,
  UserRole,
  Wish,
  WishStatus,
} from "@/types/domain";

export type DataRecord = Record<string, unknown>;

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function timestamp(value: unknown) {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && "seconds" in value) {
    const seconds = Number((value as { seconds: unknown }).seconds);
    if (Number.isFinite(seconds)) return new Date(seconds * 1000).toISOString();
  }
  return new Date(0).toISOString();
}

function nullableTimestamp(value: unknown) {
  return value == null ? null : timestamp(value);
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function record(value: unknown): DataRecord | null {
  return value && typeof value === "object" ? (value as DataRecord) : null;
}

export function mapProfile(row: DataRecord): Profile {
  return {
    id: stringValue(row.id),
    role: stringValue(row.role) as UserRole,
    display_name: stringValue(row.displayName),
    email: stringValue(row.email),
    university: nullableString(row.university),
    faculty: nullableString(row.faculty),
    grade: nullableString(row.grade),
    bio: nullableString(row.bio),
    skills: stringArray(row.skills),
    privacy_agreed_at: timestamp(row.privacyAgreedAt),
    created_at: timestamp(row.createdAt),
    updated_at: timestamp(row.updatedAt),
  };
}

export function mapWish(row: DataRecord): Wish {
  return {
    id: stringValue(row.id),
    owner_id: stringValue(row.ownerId),
    shop_name: stringValue(row.shopName),
    contact_name: stringValue(row.contactName),
    contact_email: stringValue(row.contactEmail),
    industry: stringValue(row.industry),
    website_url: nullableString(row.websiteUrl),
    sns_url: nullableString(row.snsUrl),
    address: nullableString(row.address),
    problem: stringValue(row.problem),
    desired_outcome: stringValue(row.desiredOutcome),
    experiment_idea: nullableString(row.experimentIdea),
    preferred_period: nullableString(row.preferredPeriod),
    notes: nullableString(row.notes),
    status: stringValue(row.status) as WishStatus,
    created_at: timestamp(row.createdAt),
    updated_at: timestamp(row.updatedAt),
  };
}

export function mapChallenge(row: DataRecord): Challenge {
  return {
    id: stringValue(row.id),
    wish_id: nullableString(row.wishId),
    title: stringValue(row.title),
    summary: stringValue(row.summary),
    background: stringValue(row.background),
    problem: stringValue(row.problem),
    desired_outcome: stringValue(row.desiredOutcome),
    shop_display_name: stringValue(row.shopDisplayName),
    category: stringValue(row.category),
    skills: stringArray(row.skills),
    period: nullableString(row.period),
    workload: nullableString(row.workload),
    area: stringValue(row.area),
    capacity: typeof row.capacity === "number" ? row.capacity : Number(row.capacity),
    deadline: nullableTimestamp(row.deadline),
    status: stringValue(row.status) as ChallengeStatus,
    is_sample: row.isSample === true,
    published_at: nullableTimestamp(row.publishedAt),
    created_at: timestamp(row.createdAt),
    updated_at: timestamp(row.updatedAt),
  };
}

export function mapApplicationWithContext(row: DataRecord): ApplicationWithContext {
  const challenge = record(row.challenge);
  const student = record(row.student);
  return {
    id: stringValue(row.id),
    challenge_id: stringValue(row.challengeId),
    student_id: stringValue(row.studentId),
    motivation: stringValue(row.motivation),
    interest_reason: stringValue(row.interestReason),
    skills_experience: stringValue(row.skillsExperience),
    availability: stringValue(row.availability),
    notes: nullableString(row.notes),
    status: stringValue(row.status) as ApplicationStatus,
    privacy_agreed_at: timestamp(row.privacyAgreedAt),
    created_at: timestamp(row.createdAt),
    updated_at: timestamp(row.updatedAt),
    challenges: challenge
      ? {
          id: stringValue(challenge.id),
          title: stringValue(challenge.title),
          shop_display_name: stringValue(challenge.shopDisplayName),
        }
      : null,
    profiles: student
      ? {
          display_name: stringValue(student.displayName),
          university: nullableString(student.university),
          faculty: nullableString(student.faculty),
          grade: nullableString(student.grade),
          skills: stringArray(student.skills),
        }
      : undefined,
  };
}
