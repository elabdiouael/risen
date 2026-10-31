export interface FormDataType {
  nomComplet: string;
  email: string;
  telephone: string;
  filiere: string;
  experience: string;
  utilisationIA: string;
  objectif: string;
  questions: string;
  engagement: string;
}

export interface SlideProps {
  formData: FormDataType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}