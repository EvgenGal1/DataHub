import MenuIcon from "../icons/MenuIcon";
import Navbar from "./Navbar";

const Headerbar: React.FC<{
  isOpen: boolean;
  handleDrawerOpen: () => void;
}> = ({ isOpen, handleDrawerOpen }) => {
  return (
    <header className={`header ${isOpen ? "isOpen" : ""}`}>
      <div className="header-wrapper">
        {/* кнп.Sidebar */}
        <button
          onClick={handleDrawerOpen}
          style={{ display: isOpen ? "none" : "flex" }}
          data-open={isOpen ? "true" : "false"}
        >
          <MenuIcon />
        </button>
        {/* назв.сайта */}
        <div className="name-site">
          <span>Центр Данных</span>
          <span>Data Hub</span>
        </div>
        {/* меню гл.ссылок */}
        <Navbar />
      </div>
    </header>
  );
};

export default Headerbar;
