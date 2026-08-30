import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { buttonClass } from "@/components/ui/button";
import { getUserContext } from "@/lib/auth/dal";

export async function UserNav() {
  const user = await getUserContext();
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className={buttonClass("ghost", "hidden sm:inline-flex")}>ログイン</Link>
        <Link href="/register" className={buttonClass("admin", "px-4")}>はじめる</Link>
      </div>
    );
  }
  const dashboard = user.profile.role === "admin" ? "/admin" : user.profile.role === "shop_owner" ? "/owner" : "/student";
  return (
    <div className="flex items-center gap-2">
      <Link href={dashboard} className={buttonClass("outline", "max-w-40 truncate px-4")}>{user.profile.display_name}</Link>
      <form action={logoutAction}>
        <button className={buttonClass("ghost", "size-11 px-0")} aria-label="ログアウト"><LogOut className="size-4" aria-hidden="true" /></button>
      </form>
    </div>
  );
}
