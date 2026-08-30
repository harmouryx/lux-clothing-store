import Image from "next/image";
import Link from "next/link";
import { FiSearch, FiUser, FiShoppingBag } from "react-icons/fi";

import luxLogo from "@/public/lux_assets/lux_logo_1.png";

export default function Header() {
    return (
        <header className="flex flex-row gap-4 border border-gray-300 rounded-md p-4">
            <FiSearch></FiSearch>
            <Link href="/">
                <Image src={luxLogo} alt="LUX logo" height={100} width={100} />
            </Link>
            <FiUser></FiUser>
            <FiShoppingBag></FiShoppingBag>
        </header>
    );
}