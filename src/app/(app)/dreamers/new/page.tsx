import { DreamerForm } from "@/components/dreamers/dreamer-form";

export default function NewDreamerPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-semibold">New Dreamer</h1>
        <p className="text-muted-foreground text-sm">
          Every Dreamer starts with their first Dream.
        </p>
      </div>
      <DreamerForm />
    </div>
  );
}
