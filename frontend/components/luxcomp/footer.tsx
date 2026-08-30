import luxLogo from "@/public/lux_assets/lux_logo_1.png";
import Image from "next/image";
import Link from 'next/link';


export default function Footer() {
    return (
        <footer className="flex flex-row gap-6">

            <Image src={luxLogo} alt="LUX logo" className="h-8 w-auto object-contain" />


            <div className="flex flex-col ">
                <h3>PRODUCTS</h3>
                <Link href="/"> Clothes </Link>
                <Link href="/"> Merchandising </Link>
                <Link href="/"> Shop all </Link>
            </div>

            <div className="flex flex-col ">
                <h3>SUPPORT</h3>
                <Link href="/"> FAQs </Link>
                <Link href="/"> Return policy </Link>
                <Link href="/"> Shipping policy </Link>
                <Link href="/"> Start a return </Link>
            </div>

            <div className="flex flex-col ">
                <h3>COMPANY</h3>
                <Link href="/"> About us </Link>
                <Link href="/"> Contact us </Link>
            </div>

        </footer>
    );
}