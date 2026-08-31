import Footer from "@/components/luxcomp/footer";
import Header from "@/components/luxcomp/header";
import CheckOutForm from "@/components/forms/CheckOutForm";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/10 py-10 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Express Checkout
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review your cart, provide shipping details, and complete your purchase.
            </p>
          </div>
          <CheckOutForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}