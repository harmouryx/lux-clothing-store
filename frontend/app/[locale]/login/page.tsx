import AccessForm from "@/components/forms/AccessForm";
import Footer from "@/components/luxcomp/footer";
import Header from "@/components/luxcomp/header";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <AccessForm />
      </main>
      <Footer />
    </div>
  );
}