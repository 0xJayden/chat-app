import { Bars3Icon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction } from "react";

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
  return (
    <div className="flex z-10 justify-between items-center px-2 w-full h-10 absolute top-0 border-b">
      <Bars3Icon
        onClick={() => setOpenMenu(!openMenu)}
        className="h-7 cursor-pointer"
      />
      <UserGroupIcon onClick={() => setOpenUsers(!openUsers)} className="h-7" />
    </div>
  );
}
