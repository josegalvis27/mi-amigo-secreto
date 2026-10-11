import { Suspense } from "react";
import CrearForm from "./CrearForm";

export default function CrearPage() {
  return (
    <Suspense>
      <CrearForm />
    </Suspense>
  );
}
