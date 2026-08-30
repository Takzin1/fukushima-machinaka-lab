import type {
  Application,
  Challenge,
  Profile,
  UserRole,
  Wish,
} from "@/types/domain";

type Insert<T> = Partial<T> & Pick<T, Extract<keyof T, "id">>;
type Update<T> = Partial<T>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insert<Profile>;
        Update: Update<Profile>;
        Relationships: [];
      };
      wishes: {
        Row: Wish;
        Insert: Insert<Wish>;
        Update: Update<Wish>;
        Relationships: [];
      };
      challenges: {
        Row: Challenge;
        Insert: Insert<Challenge>;
        Update: Update<Challenge>;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: Insert<Application>;
        Update: Update<Application>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: { Args: Record<PropertyKey, never>; Returns: UserRole | null };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
