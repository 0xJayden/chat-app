interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-gray-100 h-screen font-light">
      {children}
    </div>
  );
};

export default Layout;
