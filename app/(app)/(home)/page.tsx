import HomeClient from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Halfaya Typing Contest",
  description: "Exclusive typing competition for PetroChina Halfaya employees. Test your typing speed and accuracy against your colleagues.",
}

export default function Home() {
  return <HomeClient />
}