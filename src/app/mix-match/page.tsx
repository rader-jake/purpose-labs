import type { Metadata } from "next";
import { MixMatchPage } from "@/components/MixMatchPage";

export const metadata: Metadata = {
  title: "Mix & Match BOGO | Purpose Labs",
  description:
    "Buy one peptide, get one free — mix and match within any tier. Limited time promotion from Purpose Labs.",
};

export default function MixMatchRoute() {
  return <MixMatchPage />;
}
