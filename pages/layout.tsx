interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-600 inset-0 fixed overflow-scroll text-gray-100 font-light">
      {children}
    </div>
  );
};

export default Layout;
