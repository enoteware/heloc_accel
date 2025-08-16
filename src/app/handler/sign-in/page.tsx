import { redirect } from "next/navigation";

export default function SignInRedirect() {
  redirect("/en/handler/sign-in");
}
