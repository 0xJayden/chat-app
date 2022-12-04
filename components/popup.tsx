import { Dispatch, SetStateAction, useEffect } from "react";

interface PopupInterface {
  name: string | undefined;
  setName: Dispatch<SetStateAction<string>>;
  ids: Array<number>;
  setIds: Dispatch<SetStateAction<Array<number>>>;
}

export default function Popup({ name, setName, ids, setIds }: PopupInterface) {
  const triggerPopup = () => {
    if (!ids) return;

    return ids.map((i) => (
      <div
        data-popupid={i}
        key={i}
        className="bg-green-500 text-center px-2 py-1 rounded animate-popup relative transition-all duration-1000 ease-out"
      >
        {i === 1 && <p>{`Hi ${name}`}</p>}
      </div>
    ));
  };

  useEffect(() => {
    if (ids.length === 0) return;

    const mostRecentId = ids[ids.length - 1];

    const popupElement = document.querySelector(
      `[data-popupid="${mostRecentId}"]`
    );

    if (!popupElement) return;

    setTimeout(() => {
      if (name) setName("");
      setIds((prevIds) => prevIds.filter((id) => id !== mostRecentId));
    }, 1900);
  }, [ids]);

  return (
    <div className="absolute bottom-0 left-[50%] transform translate-x-[-50%] space-y-2 z-50">
      {triggerPopup()}
    </div>
  );
}
