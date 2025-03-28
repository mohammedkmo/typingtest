import RegisterForm from "./form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register",
  description: "Register for an account",
}



export default function Register() {


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-[length:20px_20px] opacity-20" />
      <div className="container relative flex flex-col items-center justify-center lg:px-0">
        <RegisterForm />
      </div>
    </div>
  )
} 