export type UserRole = "shop_owner" | "student" | "admin";

export type WishStatus =
  | "draft"
  | "submitted"
  | "reviewing"
  | "challenge_created"
  | "closed";

export type ChallengeStatus = "draft" | "published" | "closed" | "archived";

export type ApplicationStatus =
  | "applied"
  | "reviewing"
  | "interview"
  | "matched"
  | "not_selected"
  | "withdrawn";

export type Profile = {
  id: string;
  role: UserRole;
  display_name: string;
  email: string;
  university: string | null;
  faculty: string | null;
  grade: string | null;
  bio: string | null;
  skills: string[];
  privacy_agreed_at: string;
  created_at: string;
  updated_at: string;
};

export type Wish = {
  id: string;
  owner_id: string;
  shop_name: string;
  contact_name: string;
  contact_email: string;
  industry: string;
  website_url: string | null;
  sns_url: string | null;
  address: string | null;
  problem: string;
  desired_outcome: string;
  experiment_idea: string | null;
  preferred_period: string | null;
  notes: string | null;
  status: WishStatus;
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  id: string;
  wish_id: string | null;
  title: string;
  summary: string;
  background: string;
  problem: string;
  desired_outcome: string;
  shop_display_name: string;
  category: string;
  skills: string[];
  period: string | null;
  workload: string | null;
  area: string;
  capacity: number;
  deadline: string | null;
  status: ChallengeStatus;
  is_sample: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  challenge_id: string;
  student_id: string;
  motivation: string;
  interest_reason: string;
  skills_experience: string;
  availability: string;
  notes: string | null;
  status: ApplicationStatus;
  privacy_agreed_at: string;
  created_at: string;
  updated_at: string;
};

export type ApplicationWithContext = Application & {
  challenges: Pick<Challenge, "id" | "title" | "shop_display_name"> | null;
  profiles?: Pick<
    Profile,
    "display_name" | "university" | "faculty" | "grade" | "skills"
  > | null;
};

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialFormState: FormState = { status: "idle" };
