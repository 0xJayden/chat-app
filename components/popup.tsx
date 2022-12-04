interface PopupInterface {
  triggerPopup: () => JSX.Element[] | undefined;
}

export default function Popup({ triggerPopup }: PopupInterface) {
  return (
    <div className="absolute bottom-0 left-[50%] transform translate-x-[-50%] space-y-2 z-50">
      {triggerPopup()}
    </div>
  );
}
