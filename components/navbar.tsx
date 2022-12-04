import { Bars3Icon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";

interface NavbarInterface {
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
  openMenu: boolean;
  setOpenUsers: Dispatch<SetStateAction<boolean>>;
  openUsers: boolean;
}

export default function Navbar({
  setOpenMenu,
  openMenu,
  setOpenUsers,
  openUsers,
}: NavbarInterface) {
  const router = useRouter();

  return (
    <div className="fixed z-10 justify-between sm:justify-center items-center px-2 w-full h-10 flex bg-gray-700 top-0 border-b border-gray-500">
      <Bars3Icon
        onClick={() => {
          setOpenMenu(!openMenu);
          setOpenUsers(false);
        }}
        className="h-7 cursor-pointer sm:hidden"
      />
      <button
        className="border px-2 rounded-full hover:bg-red-500 transition-all duration-300 ease-out"
        onClick={() => router.push("/auth/signOut")}
      >
        Sign out
      </button>
      <UserGroupIcon
        onClick={() => {
          setOpenUsers(!openUsers);
          setOpenMenu(false);
        }}
        className="h-7 cursor-pointer sm:hidden"
      />
    </div>
  );
}
