import LogoImage from "../resources/pictures/logo_condensed.webp";

function Navbar() {
    function handleTitleClick() {
        const path = window.location.pathname;
        if (path === '/cars' || path.startsWith('/cars/')) {
            window.location.href = '/cars';
        } else {
            window.location.href = '/login';
        }
    }

    return (
        <div className="navbar flex items-center justify-start !bg-linear-to-t from-[var(--muted)] to-[var(--muted2)]">
            <img
                src={LogoImage}
                className="h-12 w-auto hover:cursor-pointer"
                onClick={handleTitleClick}
                alt="Logo"
            />
        </div>
    );
}

export default Navbar;
