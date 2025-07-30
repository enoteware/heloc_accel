"use server"

import { redirect } from "next/navigation"

export async function signOutAction() {
  // Redirect to a client-side sign-out page that will handle the actual logout
  redirect("/sign-out")
}