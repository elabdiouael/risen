import React from 'react';
import TextArea from '@/components/TextArea/TextArea';
import Select from '@/components/Select/Select';
import { SlideProps } from '@/types/form';

export default function Slide3Vision({ formData, handleChange }: SlideProps) {
  return (
    <>
      <TextArea
        label="7. Quel est votre principal objectif pour cette formation ?"
        id="objectif"
        name="objectif"
        placeholder="Partagez vos objectifs..."
        required
        value={formData.objectif}
        onChange={handleChange}
      />

      <TextArea
        label="8. Questions spécifiques ou points précis à aborder ? (Optionnel)"
        id="questions"
        name="questions"
        placeholder="Vos questions..."
        value={formData.questions}
        onChange={handleChange}
      />

      <Select
        label="9. Je m'engage à être présent le 01/novembre à 17h :"
        id="engagement"
        name="engagement"
        required
        themeVariant={3}
        value={formData.engagement}
        onChange={handleChange}
        options={[
          { value: "oui", label: "Oui, je serai présent" },
          { value: "peut être", label: "Peut-être" },
        ]}
      />
    </>
  );
}