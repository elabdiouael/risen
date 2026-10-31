import React from 'react';
import Select from '@/components/Select/Select';
import { SlideProps } from '@/types/form';

export default function Slide2Tech({ formData, handleChange }: SlideProps) {
  return (
    <>
      <Select
        label="5. Avez-vous déjà de l'expérience en programmation (Coding) ?"
        id="experience"
        name="experience"
        required
        themeVariant={2}
        value={formData.experience}
        onChange={handleChange}
        options={[
          { value: "Débutant total", label: "Débutant total (Aucune expérience)" },
          { value: "Notions de base", label: "Notions de base (HTML/CSS ou bases d'un langage)" },
          { value: "Intermédiaire / Avancé", label: "Intermédiaire / Avancé (Je réalise déjà des projets)" },
        ]}
      />

      <Select
        label="6. Avez-vous déjà utilisé des outils d'IA pour coder (ChatGPT, Claude, Copilot) ?"
        id="utilisationIA"
        name="utilisationIA"
        required
        themeVariant={2}
        value={formData.utilisationIA}
        onChange={handleChange}
        options={[
          { value: "Oui, régulièrement", label: "Oui, régulièrement" },
          { value: "Oui, occasionnellement", label: "Oui, occasionnellement" },
          { value: "Non, c'est la première fois", label: "Non, c'est la première fois" },
        ]}
      />
    </>
  );
}