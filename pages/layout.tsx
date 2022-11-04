interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-600 h-full min-h-screen text-gray-100">
      {children}
    </div>
  );
};

export default Layout;
