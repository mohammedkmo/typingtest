import LeaderboardClient from "./client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Leaderboard for the Halfaya Typing Contest",
}

export default function Leaderboard() {
  return <LeaderboardClient />
}