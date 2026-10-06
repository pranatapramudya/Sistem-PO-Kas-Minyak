import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | Sim Trading",
  description: "Masuk ke sistem manajemen Purchase Order Anda",
};

export default function LoginPage() {
  return <LoginClient />;
}
