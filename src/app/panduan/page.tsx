import { Metadata } from "next";
import PanduanClient from "./PanduanClient";

export const metadata: Metadata = {
  title: "Panduan Pengguna | Sim Trading",
  description: "Buku panduan penggunaan sistem Sim Trading",
};

export default function PanduanPage() {
  return <PanduanClient />;
}
