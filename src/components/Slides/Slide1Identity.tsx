import React from "react";
import Input from "@/components/Input/Input";
import { SlideProps } from "@/types/form";

export default function Slide1Identity({ formData, handleChange }: SlideProps) {
  return (
    <>
      <Input
        label="1. Nom et Prénom :"
        id="nomComplet"
        name="nomComplet"
        type="text"
        placeholder="Ex: Ouail Elabdi"
        required
        themeVariant={1}
        value={formData.nomComplet}
        onChange={handleChange}
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="next"
        maxLength={80}
      />
      <Input
        label="2. Adresse Email :"
        id="email"
        name="email"
        type="email"
        inputMode="email"
        placeholder="votre.email@exemple.com"
        required
        themeVariant={1}
        value={formData.email}
        onChange={handleChange}
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="next"
        maxLength={120}
      />
      <Input
        label="3. Numéro de Téléphone (WhatsApp) :"
        id="telephone"
        name="telephone"
        type="tel"
        inputMode="tel"
        placeholder="06XXXXXXXX"
        required
        themeVariant={1}
        value={formData.telephone}
        onChange={handleChange}
        autoComplete="tel"
        enterKeyHint="next"
        maxLength={20}
      />
      <Input
        label="4. Filière / Niveau d'études :"
        id="filiere"
        name="filiere"
        type="text"
        placeholder="Ex: Génie Logiciel / Bac+5"
        required
        themeVariant={1}
        value={formData.filiere}
        onChange={handleChange}
        autoComplete="off"
        enterKeyHint="go"
        maxLength={80}
      />
    </>
  );
}