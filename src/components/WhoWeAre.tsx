/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, Star, Music, UserCheck, Shield, ChevronRight, Award, Flame, Quote, Volume2, ShieldAlert
} from "lucide-react";
import { 
  OFFICIAL_PRAYER, OFFICIAL_HYMN,  OFFICIAL_COUTUMES, OFFICIAL_PRINCIPLES 
} from "../data";

export default function WhoWeAre() {
  const [activeTab, setActiveTab] = useState<"principles" | "coutumes" | "prayer" | "hymn">("principles");

  const responsibles = [
    {
      name: "Père Hermann Angora",
      role: "Père Aumônier",
      photo: "/assets/aumonier.jpg",
    },
    {
      name: "AC Olivia Bini ",
      role: "Responsable de Section",
      photo: "/assets/olivia.jpg",
    },
    {
      name: "AC Ginette Ekra",
      role: "Conseillère",
      photo: "/assets/ginette.png",
    },
    {
      name: "AP Franck Tete",
      role: "Conseiller",
      photo: "/assets/tete.png",
    }
  ];

  return (
    <div className="space-y-16 relative">
{/* HERO PREMIUM */}
<section className="relative overflow-hidden">

  {/* Background */}
  <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFD] via-white to-white" />

  {/* Logo background */}
  <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-center bg-contain bg-no-repeat"
      style={{ backgroundImage: "url('/assets/logo.png')" }}
    />
  </div>

  <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-28">

    {/* Label */}
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .7 }}
      className="mb-8"
    >
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C62828] text-white text-[10px] font-black uppercase tracking-[0.3em]">
        notre identité
      </span>
    </motion.div>

    {/* Title */}
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .8 }}
      className="space-y-6"
    >

      <h1 className="leading-none">

        <span className="block font-serif italic font-light text-[#C62828]
        text-6xl md:text-8xl xl:text-[8rem]">
          cœurs vaillants
        </span>

        <span className="block font-serif italic font-light text-black
        text-5xl md:text-7xl xl:text-[7rem] -mt-2">
          âmes vaillantes
        </span>

      </h1>

      <div className="w-24 h-[2px] bg-[#C62828]" />

      <p className="max-w-3xl text-black/70 leading-relaxed text-lg">
       Mouvement d'Action Catholique de la Paroisse Saint Jean-Paul II .
       Nous avons pour mission d'accompagner les enfants dans leur croissance humaine et spirituelle, afin de les aider à vivre plus chrétiennement dans leur milieu de vie et à devenir des bâtisseurs de fraternité, de paix et d'espérance.
      </p>

      <div className="flex flex-wrap gap-4 pt-3">

        <div className="border border-black/10 px-5 py-3 bg-white shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
            paroisse
          </p>

          <h3 className="font-semibold text-black mt-1">
            Saint Jean-Paul II
          </h3>
        </div>

        <div className="border border-black/10 px-5 py-3 bg-white shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
            localisation
          </p>

          <h3 className="font-semibold text-black mt-1">
            Angré 8ᵉ tranche
          </h3>
        </div>

        <div className="border border-black/10 px-5 py-3 bg-white shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
            archidiocèse
          </p>

          <h3 className="font-semibold text-black mt-1">
            Abidjan
          </h3>
        </div>

      </div>

    </motion.div>

  </div>
</section>


{/* =========================
  CHARTE + SPIRITUALITÉ PREMIUM
========================= */}

<section className="max-w-7xl mx-auto px-6 py-28">

  {/* HEADER SECTION */}
  <div className="mb-16 space-y-4">

    <span className="text-[11px] uppercase tracking-[0.35em] text-[#C62828] font-bold">
      charte & spiritualité
    </span>

    <h2 className="font-serif text-5xl leading-none">
      Les fondements
      <br />
      de notre engagement
    </h2>

    <p className="text-black/60 max-w-2xl leading-relaxed">
      Les principes, coutumes et prières qui structurent la vie spirituelle
      des Cœurs Vaillants et Âmes Vaillantes.
    </p>

  </div>

  {/* GRID PRINCIPES (NO TAB - EDITORIAL STYLE) */}
  <div className="grid lg:grid-cols-2 gap-6 mb-24">

    {OFFICIAL_PRINCIPLES.map((p, i) => (
      <motion.div
        key={i}
        whileHover={{ y: -4 }}
        className="flex gap-5 p-6 border border-black/10 bg-[#F8FAFD] relative overflow-hidden"
      >

        <span className="absolute -top-10 right-4 text-9xl font-serif text-black/5">
          {String(i + 1).padStart(2, "0")}
        </span>

        <div className="w-10 h-10 flex items-center justify-center bg-white border border-black/10">
          <Shield className="w-4 h-4 text-[#C62828]" />
        </div>

        <p className="text-black/80 font-semibold leading-relaxed text-sm">
          {p}
        </p>

      </motion.div>
    ))}

  </div>

  {/* PRIERES SECTION */}
  <div className="grid lg:grid-cols-2 gap-10 items-start">

    {/* PRAYER CARD */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative p-10 bg-[#1B2E8A] text-white overflow-hidden"
    >

      <div className="absolute inset-0 opacity-10 text-[12rem] font-serif">
        ✝
      </div>

      <h3 className="font-serif text-3xl italic mb-6">
        Notre prière
      </h3>

      <p className="text-white/90 leading-relaxed whitespace-pre-line text-sm">
        {OFFICIAL_PRAYER}
      </p>

      <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-white/60">
        prière officielle du mouvement
      </p>

    </motion.div>

    {/* COUTUMES */}
    <div className="space-y-4">

      <h3 className="font-serif text-3xl mb-4">
        Nos coutumes
      </h3>

      {OFFICIAL_COUTUMES.map((c, i) => (
        <motion.div
          key={i}
          whileHover={{ x: 6 }}
          className="p-5 border border-black/10 bg-white flex justify-between items-start gap-4"
        >

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C62828] font-bold">
              {c.question}
            </p>

            <p className="text-black/80 font-semibold mt-2">
              {c.answer}
            </p>
          </div>

          <ChevronRight className="w-4 h-4 text-black/40 mt-1" />

        </motion.div>
      ))}

    </div>

  </div>

</section>

{/* =========================
  ÉQUIPE D'ENCADREMENT PREMIUM
========================= */}

<section className="max-w-7xl mx-auto px-6 py-28">

  {/* HEADER */}
  <div className="mb-14 space-y-4">

    <span className="text-[11px] uppercase tracking-[0.35em] text-[#C62828] font-bold">
Responsables    </span>

    <h2 className="font-serif text-5xl leading-none">
      Bureau des 
      <br />
CVAV    </h2>

    <p className="text-black/60 max-w-2xl leading-relaxed">
      Une équipe engagée dans la formation humaine,
      spirituelle et organisationnelle des enfants du mouvement.
    </p>

  </div>

  {/* GRID PORTRAIT LUXE */}
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

    {responsibles.map((person, i) => (
      <motion.div
        key={i}
        whileHover={{ y: -8 }}
        className="group relative bg-white border rounded-2xl border-black/10 overflow-hidden"
      >

        {/* IMAGE */}
        <div className="relative h-80 overflow-hidden">

          <img
            src={person.photo}
            alt={person.name}
            className="w-full h-full object-cover  transition duration-700 group-hover:scale-105"
          />

          {/* overlay luxe */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

          {/* role badge */}
          <div className="absolute top-4 left-4">
            <span className="text-[9px] uppercase tracking-[0.3em] bg-white/90 text-black px-2 py-1 font-bold">
              {person.role}
            </span>
          </div>

        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">

          <div>

            <h3 className="font-serif text-xl leading-snug group-hover:text-[#C62828] transition-colors">
              {person.name}
            </h3>

          </div>

        </div>

      </motion.div>
    ))}

  </div>

</section>
      {/* =========================
        CITATION BIBLIQUE PREMIUM
      ========================= */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="relative border-y border-black/10 py-28 text-center">

          {/* decorative cross */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] text-[18rem] font-serif">
            ✝
          </div>

          <div className="relative max-w-3xl mx-auto">

            <p className="text-[11px] uppercase tracking-[0.35em] text-[#C62828] font-bold mb-6">
              parole d'évangile
            </p>

            <h2 className="font-serif italic text-5xl md:text-6xl leading-tight text-[#1B2E8A]">
              Laissez venir à moi
              <br />
              les petits enfants.
            </h2>

            <p className="mt-8 text-black/60">
              Matthieu 19:14 — Une invitation à accueillir, former et protéger
              la jeunesse dans la lumière du Christ.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}