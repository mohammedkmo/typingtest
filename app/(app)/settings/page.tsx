import SettingsPageClient from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings",
  description: "Settings for the Halfaya Typing Contest",
}

export default function SettingsPage() {
  return <SettingsPageClient />
}