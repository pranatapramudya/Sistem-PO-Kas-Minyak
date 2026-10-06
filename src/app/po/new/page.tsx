import { Metadata } from "next";
import NewPOClient from "./NewPOClient";

export const metadata: Metadata = {
  title: "Buat PO Baru | Sim Trading",
  description: "Buat data Purchase Order baru",
};

export default function NewPOPage() {
  return <NewPOClient />;
}
