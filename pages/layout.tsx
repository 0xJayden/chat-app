interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-600 h-screen">
      {children}
    </div>
  );
};

export default Layout;
